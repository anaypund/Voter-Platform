import express, { type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { adminMiddleware } from "./auth";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export const uploadRouter = express.Router();

// Upload logo
uploadRouter.post(
  "/logo",
  adminMiddleware,
  upload.single("logo"),
  (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      url: `/public/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  }
);

// Upload header banner
uploadRouter.post(
  "/banner",
  adminMiddleware,
  upload.single("banner"),
  (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      url: `/public/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  }
);
