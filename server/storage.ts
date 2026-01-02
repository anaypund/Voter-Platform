import { db } from "./db";
import { appConfig, users, type AppConfig, type InsertAppConfig, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import { VoterModel, connectMongo } from "./mongo";

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
    const configs = await db.select().from(appConfig).limit(1);
    return configs[0];
  }

  async updateConfig(config: InsertAppConfig): Promise<AppConfig> {
    const existing = await this.getConfig();
    if (existing) {
      const [updated] = await db
        .update(appConfig)
        .set(config)
        .where(eq(appConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(appConfig).values(config).returning();
      return created;
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
