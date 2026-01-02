import { VoterModel, connectMongo } from "./mongo";
import mongoose from "mongoose";
import type { AppConfig, InsertAppConfig } from "@shared/schema";

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
      const configModel = mongoose.model("Config");
      const configs = await configModel.find().limit(1);
      return configs[0];
    } catch {
      // Config collection doesn't exist yet
      return undefined;
    }
  }

  async updateConfig(config: InsertAppConfig): Promise<AppConfig> {
    try {
      let configModel;
      try {
        configModel = mongoose.model("Config");
      } catch {
        // Model doesn't exist yet, create it with proper schema
        const configSchema = new mongoose.Schema({
          partyName: String,
          themeColor: String,
          logoUrl: String,
          headerBannerUrl: String,
          footerMessage: String,
          isPublicAccess: Boolean,
          printTemplate: String,
        }, { timestamps: true });
        configModel = mongoose.model("Config", configSchema);
      }

      const existing = await this.getConfig();
      if (existing && existing._id) {
        const updated = await configModel.findByIdAndUpdate(existing._id, config, { new: true });
        return updated.toObject() as unknown as AppConfig;
      } else {
        const created = await configModel.create(config);
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
      const regex = new RegExp(query.trim(), 'i');
      const filter: any = { Name: { $regex: regex } };
      if (subQuery) {
        filter["Husband Name"] = { $regex: new RegExp(subQuery.trim(), 'i') };
      }
      return await VoterModel.find(filter).limit(50);
    }
  }

  async getVoter(id: string): Promise<any> {
    return await VoterModel.findById(id);
  }
}

export const storage = new DatabaseStorage();
