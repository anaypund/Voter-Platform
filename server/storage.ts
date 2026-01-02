import { VoterModel, connectMongo } from "./mongo";
import mongoose from "mongoose";
import type { AppConfig, InsertAppConfig } from "@shared/schema";
import { translateToMarathi } from "./translator";

// Define Config schema
const configSchema = new mongoose.Schema({
  partyName: String,
  themeColor: String,
  logoUrl: String,
  headerBannerUrl: String,
  footerMessage: String,
  isPublicAccess: Boolean,
  printTemplate: String,
}, { timestamps: true });

// Create or get Config model
const getConfigModel = () => {
  try {
    return mongoose.model("Config");
  } catch {
    return mongoose.model("Config", configSchema);
  }
};

export interface IStorage {
  getConfig(): Promise<AppConfig | undefined>;
  updateConfig(config: InsertAppConfig): Promise<AppConfig>;
  searchVoters(type: "epic" | "name", query: string, subQuery?: string): Promise<any[]>;
  getVoter(id: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    connectMongo();
  }

  async getConfig(): Promise<AppConfig | undefined> {
    try {
      const configModel = getConfigModel();
      const config = await configModel.findOne();
      console.log("Config fetched from DB:", config);
      return config ? config.toObject() : undefined;
    } catch (error) {
      console.error("Error fetching config:", error);
      return undefined;
    }
  }

  async updateConfig(config: InsertAppConfig): Promise<AppConfig> {
    try {
      const configModel = getConfigModel();
      const existing = await configModel.findOne();
      
      if (existing && existing._id) {
        const updated = await configModel.findByIdAndUpdate(existing._id, config, { new: true });
        console.log("Config updated:", updated);
        return updated.toObject() as unknown as AppConfig;
      } else {
        const created = await configModel.create(config);
        console.log("Config created:", created);
        return created.toObject() as unknown as AppConfig;
      }
    } catch (error) {
      console.error("Error updating config:", error);
      throw error;
    }
  }

  async searchVoters(type: "epic" | "name", query: string, subQuery?: string): Promise<any[]> {
    if (type === "epic") {
      return await VoterModel.find({ epic_no: { $regex: new RegExp(`^${query.trim()}$`, 'i') } }).limit(1);
    } else {
      // Translate search query to Marathi for name search
      const translatedQuery = await translateToMarathi(query);
      console.log(`Translated query: "${query}" -> "${translatedQuery}"`);
      
      const regex = new RegExp(translatedQuery.trim(), 'i');
      const filter: any = { Name: { $regex: regex } };
      
      if (subQuery) {
        // Translate sub-query (Husband/Father Name) to Marathi
        const translatedSubQuery = await translateToMarathi(subQuery);
        console.log(`Translated subQuery: "${subQuery}" -> "${translatedSubQuery}"`);
        filter["Husband Name"] = { $regex: new RegExp(translatedSubQuery.trim(), 'i') };
      }
      
      return await VoterModel.find(filter).limit(50);
    }
  }

  async getVoter(id: string): Promise<any> {
    return await VoterModel.findById(id);
  }
}

export const storage = new DatabaseStorage();
