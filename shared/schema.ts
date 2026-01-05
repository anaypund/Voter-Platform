export * from "./models/auth";
import { z } from "zod";

// === VOTER SCHEMA ===
export const voterSchema = z.object({
  _id: z.string().optional(),
  Index: z.any().optional(),
  Name: z.string(),
  "Husband Name": z.string().optional(),
  "Father Name": z.string().optional(),
  "House Number": z.string().optional(),
  Age: z.any().optional(),
  Gender: z.string().optional(),
  Yaadi_bhaag_kr: z.any().optional(),
  booth: z.string().optional(),
  booth_no: z.any().optional(),
  ward: z.string().optional(),
  ward_no: z.any().optional(),
  corporation: z.string().optional(),
  Yaadi_bhaag_address: z.string().optional(),
  epic_no: z.string(),
  // Catch-all for any additional fields from MongoDB
}).passthrough();

export type Voter = z.infer<typeof voterSchema>;

// AppConfig type for MongoDB config
export interface AppConfig {
  _id?: string;
  partyName: string;
  themeColor: string;
  logoUrl?: string;
  headerBannerUrl?: string;
  footerMessage: string;
  isPublicAccess: boolean;
  printTemplate: string;
}

export type InsertAppConfig = Omit<AppConfig, '_id'>;

// Zod schema for form validation
export const insertConfigSchema = z.object({
  partyName: z.string().default(""),
  themeColor: z.string().default("#ff9933"),
  logoUrl: z.string().optional().default(""),
  headerBannerUrl: z.string().optional().default(""),
  footerMessage: z.string().default(""),
  isPublicAccess: z.boolean().default(false),
  printTemplate: z.string().optional().default("default"),
});

// User schema
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().optional(),
  passwordHash: z.string(),
  role: z.enum(["member", "admin"]).default("member"),
  isAdmin: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// User types exported from models/auth
