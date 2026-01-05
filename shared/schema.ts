import { z } from "zod";
export * from "./models/auth";

/* ============================
   VOTER
============================ */

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
}).passthrough();

export type Voter = z.infer<typeof voterSchema>;

/* ============================
   SEARCH REQUEST (FIXES ERROR)
============================ */
export interface SearchVotersRequest {
  type: "epic" | "name" | "booth" | "ward";
  query: string;
  subQuery?: string;
}


/* ============================
   APP CONFIG
============================ */
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

export type InsertAppConfig = Omit<AppConfig, "_id">;
