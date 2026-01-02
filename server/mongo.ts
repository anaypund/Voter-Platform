import mongoose from "mongoose";

// Connection String from User
const MONGODB_URI = "mongodb+srv://anaypund123_db_user:JRzPyxzoxaLIyyWU@cluster0.omhtcr7.mongodb.net/data_2026";

export async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
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
  Age: mongoose.Schema.Types.Mixed,
  Gender: String,
  Yaadi_bhaag_kr: mongoose.Schema.Types.Mixed,
  booth: String,
  ward: String,
  ward_address: String,
  epic_no: String
}, { collection: "Amravati" }); // Explicit collection name

// Text index for fuzzy search (if not already created, we can try, but Atlas might need manual creation)
// voterMongoSchema.index({ Name: "text", epic_no: "text" });

export const VoterModel = mongoose.model("Voter", voterMongoSchema);
