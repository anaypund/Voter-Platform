import mongoose from "mongoose";
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env file");
}
const DB_URI: string = MONGODB_URI;

export async function connectMongo() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// Define Schema matching the existing data
// Collection: Amravati
const voterMongoSchema = new mongoose.Schema({
  Index: mongoose.Schema.Types.Mixed,
  Name: String,
  "Husband Name": String,
  "Father Name": String,
  Age: mongoose.Schema.Types.Mixed,
  Gender: String,
  Yaadi_bhaag_kr: mongoose.Schema.Types.Mixed,
  ward_no: mongoose.Schema.Types.Mixed,
  booth_no: mongoose.Schema.Types.Mixed,
  booth: String,
  ward: String,
  "House Number": String,
  corporation: String,
  Yaadi_bhaag_address: String,
  epic_no: String
}, { collection: "Amravati" }); // Explicit collection name

// Text index for fuzzy search (if not already created, we can try, but Atlas might need manual creation)
// voterMongoSchema.index({ Name: "text", epic_no: "text" });

export const VoterModel = mongoose.model("Voter", voterMongoSchema);
