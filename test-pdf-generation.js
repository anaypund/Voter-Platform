/**
 * Test PDF Generation
 * This script tests the PDF generation without authentication
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a mock generatePDFFromHTML for testing
// We'll manually test by importing the built version
import('file:///D:/Anay/Python/Voter-Slip-Platform/Voter-Slip-Platform/dist/index.cjs').then(module => {
  global.generatePDFFromHTML = module.generatePDFFromHTML;
}).catch(() => {
  // Fallback - we'll define it inline
});

// Sample voter data
const sampleVoter = {
  _id: '695a16a25bde9b077c04001f',
  Name: 'प्रकाश भाऊराव वडतकर',
  'Father Name': 'भाऊराव वडतकर',
  Age: '62',
  Gender: 'Male',
  epic_no: 'ABC1234567',
  booth: '123',
  ward: 'W-45',
  ward_address: 'Some Address, City',
  House_Number: '45/A',
  'Husband Name': 'N/A'
};

async function testPDFGeneration() {
  try {
    console.log('\n🧪 Testing PDF Generation...\n');
    
    // Create a simple HTML with the voter data
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Voter Slip</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: "Noto Sans Devanagari", Arial, sans-serif;
          background: #f5f5f5;
          padding: 10mm;
        }
        .slip {
          width: 100mm;
          height: 70mm;
          background: white;
          border: 2px solid #333;
          padding: 4mm;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 2mm;
          margin-bottom: 2mm;
        }
        .logo {
          width: 18mm;
          height: 18mm;
          margin: 0 auto 2mm;
          background: #ddd;
          border-radius: 4px;
        }
        .title {
          font-size: 11pt;
          font-weight: bold;
          margin: 1mm 0;
        }
        .subtitle {
          font-size: 8pt;
          color: #666;
        }
        .fields {
          flex: 1;
          overflow: hidden;
          font-size: 7pt;
          line-height: 1.4;
        }
        .field-row {
          margin: 0.5mm 0;
          padding: 0 1mm;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          min-width: 20mm;
          vertical-align: top;
        }
        .value {
          display: inline-block;
        }
        .footer {
          border-top: 1px solid #333;
          padding-top: 1mm;
          text-align: center;
          font-size: 6pt;
          margin-top: auto;
        }
      </style>
    </head>
    <body>
      <div class="slip">
        <div class="header">
          <div class="logo"></div>
          <div class="title">मतदार पत्र</div>
          <div class="subtitle">निर्वाचन आयोग</div>
        </div>
        
        <div class="fields">
          <div class="field-row">
            <span class="label">नाव:</span>
            <span class="value">${sampleVoter.Name}</span>
          </div>
          <div class="field-row">
            <span class="label">संबंध:</span>
            <span class="value">${sampleVoter['Father Name']}</span>
          </div>
          <div class="field-row">
            <span class="label">वय:</span>
            <span class="value">${sampleVoter.Age}</span>
          </div>
          <div class="field-row">
            <span class="label">लिंग:</span>
            <span class="value">${sampleVoter.Gender}</span>
          </div>
          <div class="field-row">
            <span class="label">EPIC:</span>
            <span class="value">${sampleVoter.epic_no}</span>
          </div>
          <div class="field-row">
            <span class="label">बूथ:</span>
            <span class="value">${sampleVoter.booth}</span>
          </div>
          <div class="field-row">
            <span class="label">वार्ड:</span>
            <span class="value">${sampleVoter.ward}</span>
          </div>
        </div>
        
        <div class="footer">
          कृपया आपले ओळखपत्र सोबत घ्या
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Create output directory
    const outputDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'test-voter-slip.pdf');
    
    console.log('📝 Generated HTML content');
    console.log('📤 Output path:', outputPath);
    
    // Try to generate PDF
    console.log('\n⏳ Generating PDF using Puppeteer...');
    await generatePDFFromHTML(html, outputPath);
    
    // Check if file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      console.log('\n✅ PDF Generated Successfully!');
      console.log('📊 File Size:', stats.size, `bytes (${sizeKB} KB)`);
      console.log('📍 File Location:', outputPath);
      
      // Check file header to verify it's a real PDF
      const buffer = Buffer.alloc(5);
      const fd = fs.openSync(outputPath, 'r');
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);
      
      const header = buffer.toString('utf-8', 0, 4);
      console.log('📋 PDF Header:', header.trim());
      
      if (header.trim() === '%PDF') {
        console.log('✨ Valid PDF signature detected!');
      }
      
    } else {
      console.log('❌ PDF file was not created');
    }
    
  } catch (error) {
    console.error('\n❌ Error during PDF generation:');
    console.error('Error type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run the test
testPDFGeneration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
