export * from "./models/auth";
import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === APP CONFIG ===
export const appConfig = pgTable("app_config", {
  id: serial("id").primaryKey(),
  partyName: text("party_name").default("My Party"),
  themeColor: text("theme_color").default("#ff9933"),
  logoUrl: text("logo_url"),
  headerBannerUrl: text("header_banner_url"),
  footerMessage: text("footer_message").default("Vote for Progress!"),
  isPublicAccess: boolean("is_public_access").default(false),
  printTemplate: text("print_template").default("default"),
});

export const insertConfigSchema = createInsertSchema(appConfig);

// === VOTER SCHEMA ===
export const voterSchema = z.object({
  _id: z.string().optional(),
  Index: z.any().optional(),
  Name: z.string(),
  "Husband Name": z.string().optional(),
  Age: z.any().optional(),
  Gender: z.string().optional(),
  Yaadi_bhaag_kr: z.any().optional(),
  booth: z.string().optional(),
  ward: z.string().optional(),
  ward_address: z.string().optional(),
  epic_no: z.string(),
});

export type Voter = z.infer<typeof voterSchema>;
export type AppConfig = typeof appConfig.$inferSelect;
export type InsertAppConfig = z.infer<typeof insertConfigSchema>;
// User types exported from models/auth
