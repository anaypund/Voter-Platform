import express, { type Request, Response } from "express";
import { z } from "zod";
import { UserModel, hashPassword, verifyPassword } from "./models/User";
import { generateToken, authMiddleware } from "./auth";

export const authRouter = express.Router();

// Validation schemas
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Sign up
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new UserModel({
      username,
      passwordHash,
      isAdmin: false,
      role: "member",
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Set secure cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: "Failed to create account" });
    }
  }
});

// Login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find user
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Set secure cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(401).json({ message: "Failed to login" });
    }
  }
});

// Get current user
authRouter.get("/user", authMiddleware, (req: Request, res: Response) => {
  res.json({
    _id: req.user?.userId,
    username: req.user?.username,
    isAdmin: req.user?.isAdmin,
  });
});

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("authToken");
  res.json({ message: "Logged out successfully" });
});
