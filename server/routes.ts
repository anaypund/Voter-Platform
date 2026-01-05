import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { VoterModel } from "./mongo";
import { api } from "@shared/routes";
import { z } from "zod";
import { authRouter } from "./authRoutes";
import { uploadRouter } from "./uploadRoutes";
import { authMiddleware, adminMiddleware } from "./auth";
import fs from "fs";
import express from "express";
import path from "path";
import { spawn } from "child_process";
import 'dotenv/config';


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
    try {
      const config = await storage.getConfig();
      if (config) {
        res.json(config);
      } else {
        // Return empty config with required fields
        res.json({
          partyName: "",
          themeColor: "#ff9933",
          logoUrl: "",
          headerBannerUrl: "",
          footerMessage: "",
          isPublicAccess: false,
          printTemplate: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ message: "Failed to fetch config" });
    }
  });

  app.post(api.config.update.path, adminMiddleware, async (req: any, res: any) => {
    try {
      // console.log("Config update endpoint called with body:", req.body);
      const config = await storage.updateConfig(req.body);
      // console.log("Config updated successfully:", config);
      res.json(config);
    } catch (error: any) {
      console.error("Config update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Debug endpoint - remove after debugging (NO AUTH REQUIRED)
  app.get("/api/debug/sample-voter", async (req, res) => {
    try {
      const sampleVoter = await VoterModel.findOne();
      if (!sampleVoter) {
        return res.json({ message: "No voters found in database", fieldNames: [] });
      }
      const obj = sampleVoter.toObject ? sampleVoter.toObject() : sampleVoter;
      const fieldNames = Object.keys(obj);
      console.log("Sample voter data keys:", fieldNames);
      console.log("Sample voter full data:", JSON.stringify(obj, null, 2));
      res.json({
        message: "Sample voter found",
        fieldNames,
        sampleData: obj
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Voters
  app.get(api.voters.search.path, requireAuth, async (req, res) => {
    const { type, query, subQuery } = req.query as any;
    try {
      const results = await storage.searchVoters(type, query, subQuery);
      console.log(`[API] Search ${type}:${query} - Found ${results.length} results`);
      console.log(`[API] First result structure:`, results.length > 0 ? Object.keys(results[0]).join(", ") : "No results");
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

  app.post(api.voters.printSlip.path, async (req, res) => {
    try {
      const voter = await storage.getVoter(req.params.id);
      if (!voter) return res.status(404).json({ message: "Voter not found" });

      console.log(`📄 Generating PDF for voter ${voter._id}...`);

      // Call Python script to generate PDF using WeasyPrint
      const pythonScript = path.join(process.cwd(), "server", "print_slip.py");

      // Convert voter data to plain object for JSON serialization
      const voterDataForPython = {
        Index: voter.Index || '',
        Name: voter.Name || '',
        'Father Name': voter['Father Name'] || '',
        'Husband Name': voter['Husband Name'] || '',
        House_Number: voter['House Number'] || '',
        Age: voter.Age || '',
        Gender: voter.Gender || '',
        Yaadi_bhaag_kr: voter.Yaadi_bhaag_kr || '',
        booth: voter.booth || '',
        ward: voter.ward || voter.ward_no || '',  // Try both ward and ward_no
        corporation: voter.corporation || '',
        Yaadi_bhaag_address: voter.Yaadi_bhaag_address || '',
        epic_no: voter.epic_no || '',
      };

      return new Promise<void>((resolve, reject) => {
        const pythonExecutable = process.platform === "win32"
          ? ".venv\\Scripts\\python.exe"
          : ".venv/bin/python";
        const pythonProcess = spawn(pythonExecutable, [pythonScript]);

        let pdfPath = "";
        let errorOutput = "";

        // Handle stdout data  
        if (pythonProcess.stdout) {
          pythonProcess.stdout.on("data", (data: any) => {
            const line = data.toString().trim();
            if (line && !line.includes("Fontconfig") && !line.includes("Error")) {
              pdfPath = line;
              console.log(`PDF generated at: ${pdfPath}`);
            }
          });
        }

        // Handle stderr data
        if (pythonProcess.stderr) {
          pythonProcess.stderr.on("data", (data: any) => {
            const errorLine = data.toString().trim();
            if (errorLine && !errorLine.includes("Fontconfig")) {
              errorOutput += errorLine + "\n";
              console.error(`Python error: ${errorLine}`);
            }
          });
        }

        pythonProcess.on("close", (code: any) => {
          if (code !== 0) {
            console.error("Python script failed with code", code, ":", errorOutput);
            res.status(500).json({
              message: "Failed to generate PDF",
              error: errorOutput || "Unknown error",
            });
            reject(new Error(errorOutput));
            return;
          }

          if (!pdfPath || !fs.existsSync(pdfPath)) {
            console.error("PDF file not found at:", pdfPath, "exists:", fs.existsSync(pdfPath || ""));
            res.status(500).json({ message: "PDF file not generated" });
            reject(new Error("PDF file not found"));
            return;
          }

          // Send the PDF to the client
          res.contentType("application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="voter-slip-${voter._id}.pdf"`
          );

          const stream = fs.createReadStream(pdfPath);
          stream.pipe(res);

          // Clean up the temporary file after sending
          stream.on("end", () => {
            fs.unlink(pdfPath, (err) => {
              if (err) console.error("Failed to delete temp PDF:", err);
              else console.log(`✅ Temporary PDF deleted: ${pdfPath}`);
            });
          });

          stream.on("error", (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ message: "Error downloading PDF" });
            }
            reject(err);
          });

          resolve();
        });

        // Send voter data to Python script via stdin
        const jsonData = JSON.stringify(voterDataForPython);
        pythonProcess.stdin?.write(jsonData);
        pythonProcess.stdin?.end();
      });
    } catch (error) {
      console.error("Print slip error:", error);
      res.status(500).json({
        message: "Failed to generate print slip",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return httpServer;
}
