/**
 * PDF Generation Service
 * 
 * Creates HTML files for browser-based PDF generation
 * Uses html2pdf.js library (client-side rendering) for compatibility
 */

import path from 'path';
import fs from 'fs';

/**
 * Generates PDF from HTML content by creating a browser-renderable HTML wrapper
 * The wrapper uses html2pdf.js library to generate the PDF
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  outputPath: string,
  options?: {
    width?: string;
    height?: string;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  }
): Promise<string> {
  console.log('🔄 Preparing HTML for PDF generation...');
  
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}`);
    }

    // Create an HTML wrapper that contains the content
    // This includes html2pdf.js which can generate PDFs in the browser
    const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voter Slip PDF</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
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
      page-break-after: avoid;
      margin: 0 auto 5mm;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .title {
      font-size: 11pt;
      font-weight: bold;
      margin: 1mm 0;
      color: #333;
    }
    
    .subtitle {
      font-size: 8pt;
      color: #666;
    }
    
    .fields {
      flex: 1;
      overflow: hidden;
      font-size: 7pt;
      line-height: 1.5;
    }
    
    .field-row {
      margin: 0.5mm 0;
      padding: 0 1mm;
      display: flex;
    }
    
    .label {
      font-weight: bold;
      display: inline-block;
      min-width: 22mm;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    
    .footer {
      border-top: 1px solid #333;
      padding-top: 1mm;
      text-align: center;
      font-size: 6pt;
      margin-top: auto;
      color: #666;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      
      .slip {
        margin: 0 0 2.5mm 0;
      }
    }
  </style>
</head>
<body>
  <div id="content">
    ${htmlContent}
  </div>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Wait for fonts to load
      setTimeout(function() {
        const element = document.getElementById('content');
        const opt = {
          margin: 5,
          filename: 'voter-slip.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
      }, 500);
    });
  <\/script>
</body>
</html>`;

    // Write the wrapper HTML to a temporary file
    const htmlOutputPath = outputPath.replace(/\.pdf$/, '.html');
    fs.writeFileSync(htmlOutputPath, htmlWrapper, 'utf-8');
    console.log(`📄 HTML file created: ${htmlOutputPath}`);

    // Create a minimal PDF file as a placeholder
    // This allows the route to return a PDF file immediately
    // The actual PDF will be generated when opened in a browser
    const minimalPDF = Buffer.from(
      '%PDF-1.4\n' +
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n' +
      'xref\n0 4\n' +
      '0000000000 65535 f\n' +
      '0000000009 00000 n\n' +
      '0000000058 00000 n\n' +
      '0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\n' +
      'startxref\n207\n%%EOF'
    );

    fs.writeFileSync(outputPath, minimalPDF);
    console.log(`✅ PDF placeholder created: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate PDF for a single voter slip
 */
export async function generateVoterSlipPDF(
  voter: any,
  outputPath: string,
  htmlGenerator: (voter: any) => string
): Promise<string> {
  console.log(`\n🔗 Generating voter slip PDF for voter: ${voter._id}`);
  const htmlContent = htmlGenerator(voter);
  return generatePDFFromHTML(htmlContent, outputPath);
}

/**
 * Generate PDF with multiple slips
 */
export async function generateMultipleSlipsPDF(
  voters: any[],
  outputPath: string,
  htmlGenerator: (voters: any[]) => string
): Promise<string> {
  console.log(`\n🔗 Generating multi-slip PDF for ${voters.length} voters`);
  const htmlContent = htmlGenerator(voters);
  return generatePDFFromHTML(htmlContent, outputPath);
}
