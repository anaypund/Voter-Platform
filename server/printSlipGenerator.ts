/**
 * Print Slip HTML Generator
 * 
 * Generates HTML for voter slips based on configuration.
 * Supports multiple slips per page with custom layouts.
 */

import {
  PrintSlipConfig,
  PrintSlipField,
  defaultPrintSlipConfig,
  getFieldValue,
} from './printSlipConfig';

export class PrintSlipGenerator {
  private config: PrintSlipConfig;

  constructor(config: PrintSlipConfig = defaultPrintSlipConfig) {
    this.config = config;
  }

  /**
   * Generate HTML for a single voter slip with proper design
   */
  generateSlipHTML(voter: any, logoDataUrl?: string): string {
    const { slip, header, title, subtitle, fields, footer, font } = this.config;

    const slipWidth = slip.width;
    const slipHeight = slip.height;
    const padding = slip.padding;

    let fieldsHTML = '';

    // Group fields by columnsInLine
    let currentLineFields: PrintSlipField[] = [];
    for (const field of fields) {
      const colsInLine = field.columnsInLine || 1;
      currentLineFields.push(field);

      if (currentLineFields.length === colsInLine) {
        fieldsHTML += this.renderFieldsLine(currentLineFields, voter);
        currentLineFields = [];
      }
    }

    // Render remaining fields
    if (currentLineFields.length > 0) {
      fieldsHTML += this.renderFieldsLine(currentLineFields, voter);
    }

    const logoHTML = header.showHeaderImage && logoDataUrl
      ? `<div style="text-align: center; margin-bottom: ${header.logoHeight + 1}mm; border-bottom: 1px solid #ddd; padding-bottom: 2mm;">
           <img src="${logoDataUrl}" style="height: ${header.logoHeight}mm; width: ${header.logoWidth}mm; object-fit: contain;" />
         </div>`
      : '';

    const html = `
    <div style="
      width: ${slipWidth}mm;
      height: ${slipHeight}mm;
      padding: ${padding}mm;
      background-color: ${slip.backgroundColor};
      border: ${slip.borderWidth}px solid ${slip.borderColor};
      font-family: ${font.family};
      font-size: ${font.baseSize}pt;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    ">
      <!-- Logo/Header Image -->
      ${logoHTML}

      <!-- Title -->
      <div style="
        text-align: ${title.textAlign};
        font-size: ${title.fontSize}pt;
        font-weight: ${title.fontWeight};
        color: ${title.color};
        margin-bottom: ${title.marginBottom}mm;
        flex-shrink: 0;
      ">
        ${title.text}
      </div>

      <!-- Subtitle -->
      <div style="
        text-align: ${subtitle.textAlign || 'center'};
        font-size: ${subtitle.fontSize}pt;
        font-weight: ${subtitle.fontWeight};
        color: ${subtitle.color};
        margin-bottom: ${subtitle.marginBottom}mm;
        flex-shrink: 0;
      ">
        ${subtitle.text}
      </div>

      <!-- Fields -->
      <div style="
        flex: 1;
        overflow: hidden;
        font-size: ${font.baseSize - 2}pt;
      ">
        ${fieldsHTML}
      </div>

      <!-- Footer -->
      <div style="
        margin-top: auto;
        padding-top: ${footer.marginTop}mm;
        border-top: ${footer.borderTop ? `0.5px solid ${footer.borderTopColor}` : 'none'};
        text-align: ${footer.textAlign};
        font-size: ${footer.fontSize}pt;
        font-weight: ${footer.fontWeight};
        color: ${footer.color};
        flex-shrink: 0;
      ">
        ${footer.text}
      </div>
    </div>
    `;

    return html;
  }

  /**
   * Render a line of fields (handles 1 or 2 column layout)
   */
  private renderFieldsLine(fieldsLine: PrintSlipField[], voter: any): string {
    if (fieldsLine.length === 2) {
      // Two columns
      return `
      <div style="display: flex; gap: 3mm; margin-bottom: ${fieldsLine[0].marginBottom}mm;">
        ${fieldsLine.map(f => this.renderField(f, voter, true)).join('')}
      </div>`;
    } else {
      // Single column (full width)
      return this.renderField(fieldsLine[0], voter, false);
    }
  }

  /**
   * Render a single field with label and value
   */
  private renderField(field: PrintSlipField, voter: any, isHalf: boolean = false): string {
    const value = getFieldValue(voter, field.dataKey);
    const width = isHalf ? '45%' : '100%';

    if (!field.showLabel) {
      return `
      <div style="
        width: ${width};
        margin-bottom: ${field.marginBottom}mm;
        margin-left: ${field.marginLeft}mm;
        font-size: ${field.fontSize}pt;
        font-weight: ${field.fontWeight};
      ">
        ${value || '-'}
      </div>`;
    }

    return `
    <div style="
      width: ${width};
      margin-bottom: ${field.marginBottom}mm;
      margin-left: ${field.marginLeft}mm;
    ">
      <span style="
        font-size: ${field.fontSize}pt;
        font-weight: bold;
        min-width: ${field.labelWidth}mm;
        display: inline-block;
      ">${field.label}:</span>
      <span style="
        font-size: ${field.fontSize}pt;
        font-weight: ${field.fontWeight};
      "> ${value || '-'}</span>
    </div>`;
  }

  /**
   * Generate complete HTML document for printing multiple slips
   * 8 blocks per A4 page (4 per side)
   */
  generatePrintHTML(voters: any[], logoDataUrl?: string): string {
    const { page, print } = this.config;

    // Group voters into pages (8 per page)
    const slipsPerPage = 8;
    const pages: any[][] = [];
    
    for (let i = 0; i < voters.length; i += slipsPerPage) {
      pages.push(voters.slice(i, i + slipsPerPage));
    }

    const pagesHTML = pages.map((pageVoters, pageIndex) => 
      this.generatePageHTML(pageVoters, logoDataUrl)
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Voter Slips</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: ${page.width}mm ${page.height}mm;
          margin: ${print.margins.top}mm ${print.margins.right}mm ${print.margins.bottom}mm ${print.margins.left}mm;
        }

        body {
          margin: 0;
          padding: 0;
          background: white;
          font-family: ${this.config.font.family};
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      ${pagesHTML}
    </body>
    </html>
    `;
  }

  /**
   * Generate HTML for a single page (8 blocks - 4 per side)
   * A4 layout: 2 columns x 4 rows
   */
  generatePageHTML(votersGroup: any[], logoDataUrl?: string): string {
    const { page, print, slip } = this.config;
    
    // Calculate dimensions for 8 blocks (2 columns x 4 rows)
    const blockWidth = page.width / 2;  // 105mm (half of 210mm)
    const blockHeight = page.height / 4; // 74.25mm (1/4 of 297mm)

    // Generate slip HTML for each voter in the group
    const slips = votersGroup.map(voter => {
      const slipHTML = this.generateSlipHTML(voter, logoDataUrl);
      // Wrap slip in a block with exact dimensions
      return `
      <div class="slip-block">
        ${slipHTML}
      </div>`;
    }).join('');

    // Pad with empty blocks if less than 8 slips
    const emptyBlocksCount = 8 - votersGroup.length;
    const emptyBlocks = Array(emptyBlocksCount)
      .fill(null)
      .map(() => '<div class="slip-block"></div>')
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Voter Slip Page</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: ${page.width}mm ${page.height}mm;
          margin: ${print.margins.top}mm ${print.margins.right}mm ${print.margins.bottom}mm ${print.margins.left}mm;
        }

        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: ${this.config.font.family};
          background: white;
        }

        .page {
          width: ${page.width}mm;
          height: ${page.height}mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: repeat(4, 1fr);
          gap: 0;
          page-break-after: always;
          overflow: hidden;
        }

        .slip-block {
          width: ${blockWidth}mm;
          height: ${blockHeight}mm;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2mm;
          overflow: hidden;
        }

        .slip-block > div {
          width: 100%;
          height: 100%;
          font-size: 9pt !important;
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          
          .page {
            page-break-after: always;
            margin: 0;
            padding: 0;
          }
          
          .slip-block {
            padding: 1mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        ${slips}
        ${emptyBlocks}
      </div>
    </body>
    </html>
    `;
  }
}

/**
 * Create a default generator instance
 */
export function createPrintSlipGenerator(
  config?: Partial<PrintSlipConfig>
): PrintSlipGenerator {
  const mergedConfig = config
    ? { ...defaultPrintSlipConfig, ...config }
    : defaultPrintSlipConfig;
  return new PrintSlipGenerator(mergedConfig);
}
