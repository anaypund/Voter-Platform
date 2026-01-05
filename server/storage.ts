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
      // console.log("Config fetched from DB:", config);
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
        // console.log("Config updated:", updated);
        return updated.toObject() as unknown as AppConfig;
      } else {
        const created = await configModel.create(config);
        // console.log("Config created:", created);
        return created.toObject() as unknown as AppConfig;
      }
    } catch (error) {
      console.error("Error updating config:", error);
      throw error;
    }
  }

  async searchVoters(type: "epic" | "name", query: string, subQuery?: string): Promise<any[]> {
    if (type === "epic") {
      const results = await VoterModel.find({ epic_no: { $regex: new RegExp(`^${query.trim()}$`, 'i') } }).limit(1);
      console.log("Epic search results:", JSON.stringify(results, null, 2));
      return results;
    } else {
      // For name search, we'll use a more flexible word-by-word matching approach
      const translatedQuery = await translateToMarathi(query);
      console.log(`Translated query: "${query}" -> "${translatedQuery}"`);
      
      // Split the translated query into individual words and create regex for each
      const queryWords = translatedQuery.trim().split(/\s+/).filter(word => word.length > 0);
      console.log("Query words:", queryWords);
      
      // Build filter: ALL words must be present in Name field (case-insensitive, anywhere)
      // Create an $and condition where each word must match in the Name field
      const filter: any = {
        $and: queryWords.map(word => ({
          Name: { $regex: word, $options: 'i' }
        }))
      };
      
      console.log("Name filter (simplified):", JSON.stringify(filter, null, 2));

      // Now handle the relative name filter (Husband Name OR Father Name)
      if (subQuery && subQuery.trim()) {
        const translatedSubQuery = await translateToMarathi(subQuery);
        console.log(`Translated subQuery: "${subQuery}" -> "${translatedSubQuery}"`);
        
        // Split subQuery into words too
        const subQueryWords = translatedSubQuery.trim().split(/\s+/).filter(word => word.length > 0);
        console.log("SubQuery words:", subQueryWords);
        
        // Build conditions for Husband Name: all words must match
        const husbandConditions = subQueryWords.length > 0
          ? {
              $and: subQueryWords.map(word => ({
                "Husband Name": { $regex: word, $options: 'i' }
              }))
            }
          : { "Husband Name": { $ne: "" } };
        
        // Build conditions for Father Name: all words must match
        const fatherConditions = subQueryWords.length > 0
          ? {
              $and: subQueryWords.map(word => ({
                "Father Name": { $regex: word, $options: 'i' }
              }))
            }
          : { "Father Name": { $ne: "" } };
        
        // Add the OR condition for relative name matching
        filter.$and.push({
          $or: [husbandConditions, fatherConditions]
        });
        
        console.log("Relative name filter (simplified):", JSON.stringify({ $or: [husbandConditions, fatherConditions] }, null, 2));
      }

      console.log("Final filter structure:", JSON.stringify(filter, null, 2));
      
      const results = await VoterModel.find(filter).limit(50);
      console.log(`Name search found ${results.length} results`);
      return results;
    }
  }

  async getVoter(id: string): Promise<any> {
    return await VoterModel.findById(id);
  }
}

export const storage = new DatabaseStorage();
