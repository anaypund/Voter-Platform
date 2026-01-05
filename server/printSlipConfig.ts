/**
 * Print Slip Configuration
 * 
 * This file contains all configurable settings for the voter slip printing.
 * Easy to modify: sizes, fonts, margins, fields, layout, etc.
 */

export interface PrintSlipConfig {
  // Page Settings (A4 Paper Size)
  page: {
    width: number;      // mm
    height: number;     // mm
    slipsPerPage: number;    // Number of slips per page
  };

  // Slip Dimensions (designed for 4 slips per A4 page)
  slip: {
    width: number;      // mm - 105mm (half of 210mm)
    height: number;     // mm - 148.5mm (half of 297mm)
    padding: number;    // mm - internal padding
    margin: number;     // mm - outer margin
    backgroundColor: string;
    borderColor: string;
    borderWidth: number; // px
  };

  // Header Section
  header: {
    showHeaderImage: boolean;
    logoHeight: number;  // mm
    logoWidth: number;   // mm
    logoPosition: {
      top: number;       // mm from top
      left: number;      // mm from left
    };
  };

  // Title Section (centered)
  title: {
    text: string;       // e.g., "VOTER SLIP"
    fontSize: number;   // pt
    fontWeight: 'bold' | 'normal' | 'lighter' | number;
    color: string;
    marginBottom: number; // mm
    textAlign: 'center' | 'left' | 'right';
  };

  // Subtitle (centered)
  subtitle: {
    text: string;       // e.g., "Election Commission of India"
    fontSize: number;   // pt
    fontWeight: 'normal' | 'bold';
    color: string;
    marginBottom: number; // mm
    textAlign?: 'center' | 'left' | 'right';
  };

  // Fields Configuration
  fields: PrintSlipField[];

  // Footer Section
  footer: {
    text: string;
    fontSize: number;   // pt
    fontWeight: 'normal' | 'bold';
    color: string;
    textAlign: 'center' | 'left' | 'right';
    marginTop: number;  // mm
    borderTop: boolean;
    borderTopColor: string;
  };

  // Font Settings
  font: {
    family: string;     // e.g., "Arial, sans-serif"
    baseSize: number;   // pt
  };

  // Print Settings
  print: {
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;      // mm
      right: number;
      bottom: number;
      left: number;
    };
  };
}

export interface PrintSlipField {
  label: string;                    // e.g., "Name"
  dataKey: string;                  // e.g., "Name" (voter field)
  fontSize: number;                 // pt
  fontWeight: 'normal' | 'bold';
  labelWidth: number;               // mm
  marginBottom: number;             // mm
  marginLeft: number;               // mm (indent from left)
  showLabel: boolean;
  // Layout: how many fields in a single line
  columnsInLine?: number;           // 1 or 2
  lineHeight?: number;              // mm
  textColor?: string;
}

/**
 * DEFAULT CONFIGURATION
 * 
 * This is the default slip layout. Customize below based on your needs.
 */
export const defaultPrintSlipConfig: PrintSlipConfig = {
  page: {
    width: 210,        // A4 width in mm
    height: 297,       // A4 height in mm
    slipsPerPage: 8,   // 8 blocks per page (4 rows x 2 columns)
  },

  slip: {
    width: 100,        // Slightly less than 105mm to fit in block
    height: 70,        // Slightly less than 74.25mm to fit in block
    padding: 4,
    margin: 1,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
  },

  header: {
    showHeaderImage: true,
    logoHeight: 18,
    logoWidth: 18,
    logoPosition: {
      top: 2,
      left: 2,
    },
  },

  title: {
    text: 'मतदार पत्र',  // VOTER SLIP in Marathi/Devanagari
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 1,
    textAlign: 'center',
  },

  subtitle: {
    text: 'निर्वाचन आयोग',  // Election Commission in Devanagari
    fontSize: 7,
    fontWeight: 'normal',
    color: '#333333',
    marginBottom: 1.5,
    textAlign: 'center',
  },

  fields: [
    {
      label: 'नाव',  // Name in Marathi
      dataKey: 'Name',
      fontSize: 8,
      fontWeight: 'bold',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: true,
    },
    {
      label: 'संबंध',  // Relation in Marathi
      dataKey: 'Father Name',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: true,
    },
    {
      label: 'वय',  // Age in Marathi
      dataKey: 'Age',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: true,
      columnsInLine: 2,
    },
    {
      label: 'लिंग',  // Gender in Marathi
      dataKey: 'Gender',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: true,
      columnsInLine: 2,
    },
    {
      label: 'EPIC नंबर',  // EPIC No in Marathi
      dataKey: 'epic_no',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: true,
    },
    {
      label: 'बूथ',  // Booth in Marathi
      dataKey: 'booth',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: false,  // Hide label, just show value
    },
    {
      label: 'वार्ड',  // Ward in Marathi
      dataKey: 'ward',
      fontSize: 7,
      fontWeight: 'normal',
      labelWidth: 18,
      marginBottom: 1,
      marginLeft: 2,
      showLabel: false,  // Hide label, just show value
    },
  ],

  footer: {
    text: 'कृपया आपले ओळखपत्र सोबत घ्या',  // "Please carry your Identity Card" in Marathi
    fontSize: 6,
    fontWeight: 'normal',
    color: '#666666',
    textAlign: 'center',
    marginTop: 1,
    borderTop: true,
    borderTopColor: '#cccccc',
  },

  font: {
    family: '"Noto Sans Devanagari", "Devanagari", Arial, sans-serif',
    baseSize: 9,
  },

  print: {
    orientation: 'portrait',
    margins: {
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
    },
  },
};

/**
 * Helper function to get field value from voter data
 */
export function getFieldValue(voter: any, dataKey: string): string {
  // Special handling for relation name
  if (dataKey === 'Father Name') {
    return voter['Father Name'] || voter['Husband Name'] || '';
  }
  return voter[dataKey]?.toString() || '';
}
