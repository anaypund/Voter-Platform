import mongoose from 'mongoose';
import 'dotenv/config';

async function checkMongoDB() {
try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected Successfully");
    
    const db = mongoose.connection.db;
    const collection = db.collection('Amravati');
    
    // Get total count
    const count = await collection.countDocuments();
    console.log(`Total documents: ${count}\n`);
    
    // Get one sample document
    const sample = await collection.findOne();
    if (!sample) {
      console.log("No documents found in Amravati collection!");
      process.exit(1);
    }
    
    console.log("Sample document keys:");
    const keys = Object.keys(sample);
    keys.forEach(key => {
      const value = sample[key];
      const isEmpty = value === null || value === undefined || value === '';
      const status = isEmpty ? '(empty)' : '✓';
      console.log(`  ${status} ${key}: ${typeof value} = "${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}"`);
    });
    
    console.log("\n🔍 Checking specific fields:");
    console.log(`  ward: ${sample.ward || 'MISSING/EMPTY'}`);
    console.log(`  Husband Name: ${sample['Husband Name'] || 'MISSING/EMPTY'}`);
    console.log(`  Father Name: ${sample['Father Name'] || 'MISSING/EMPTY'}`);
    
    // Check how many documents have these fields populated
    const withWard = await collection.countDocuments({ ward: { $exists: true, $ne: null, $ne: "" } });
    const withHusbandName = await collection.countDocuments({ "Husband Name": { $exists: true, $ne: null, $ne: "" } });
    const withFatherName = await collection.countDocuments({ "Father Name": { $exists: true, $ne: null, $ne: "" } });
    
    console.log(`\n📊 Field population stats:`);
    console.log(`  Documents with 'ward' populated: ${withWard}/${count}`);
    console.log(`  Documents with 'Husband Name' populated: ${withHusbandName}/${count}`);
    console.log(`  Documents with 'Father Name' populated: ${withFatherName}/${count}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkMongoDB();
