import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { authRouter } from "./authRoutes";
import { uploadRouter } from "./uploadRoutes";
import { authMiddleware, adminMiddleware } from "./auth";
import { spawn } from "child_process";
import fs from "fs";
import express from "express";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files as static
  const uploadsDir = path.resolve(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/public/uploads", express.static(uploadsDir));

  // Auth routes
  app.use("/api/auth", authRouter);
  app.use("/api/upload", uploadRouter);

  // Protected routes middleware - apply to routes that need authentication
  const requireAuth = authMiddleware;

  // Config
  app.get(api.config.get.path, async (req, res) => {
    const config = await storage.getConfig();
    res.json(config || {}); 
  });

  app.post(api.config.update.path, adminMiddleware, async (req: any, res: any) => {
    try {
      console.log("Config update endpoint called with body:", req.body);
      const config = await storage.updateConfig(req.body);
      console.log("Config updated successfully:", config);
      res.json(config);
    } catch (error: any) {
      console.error("Config update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Voters
  app.get(api.voters.search.path, requireAuth, async (req, res) => {
    const { type, query, subQuery } = req.query as any;
    try {
        const results = await storage.searchVoters(type, query, subQuery);
        res.json(results);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
  });

  app.get(api.voters.get.path, requireAuth, async (req, res) => {
    const voter = await storage.getVoter(req.params.id);
    if (!voter) return res.status(404).json({ message: "Not found" });
    res.json(voter);
  });

  app.post(api.voters.printSlip.path, requireAuth, async (req, res) => {
     const voter = await storage.getVoter(req.params.id);
     if (!voter) return res.status(404).json({ message: "Voter not found" });

     const pythonProcess = spawn('python3', ['server/print_slip.py']);
     
     pythonProcess.stdin.write(JSON.stringify(voter));
     pythonProcess.stdin.end();

     let outputData = "";
     let errorData = "";

     pythonProcess.stdout.on('data', (data) => {
         outputData += data.toString();
     });
     
     pythonProcess.stderr.on('data', (data) => {
         errorData += data.toString();
     });

     pythonProcess.on('close', (code) => {
         if (code !== 0) {
             console.error("PDF Gen Error:", errorData);
             return res.status(500).json({ message: "PDF generation failed" });
         }
         const pdfPath = outputData.trim();
         if (fs.existsSync(pdfPath)) {
             res.contentType("application/pdf");
             const stream = fs.createReadStream(pdfPath);
             stream.pipe(res);
             stream.on('end', () => {
                 fs.unlink(pdfPath, (err) => {
                     if (err) console.error("Failed to delete temp PDF:", err);
                 });
             });
         } else {
             res.status(500).json({ message: "PDF file not found" });
         }
     });
  });

  return httpServer;
}
