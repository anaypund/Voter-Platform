# Print Slip System - Quick Start Guide

## ✅ What's Done

The voter slip printing system is now **fully functional and configurable**.

### Key Changes
- ✅ **Replaced Python dependency** with Node.js + Puppeteer
- ✅ **Created configurable system** - Edit one file to change everything
- ✅ **Added comprehensive documentation** - In `.azure/printSlip.copilotmd`
- ✅ **Server running** on port 5000 with new PDF generation

---

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `server/printSlipConfig.ts` | ⚙️ **Main Configuration** - Edit here for all customizations |
| `server/printSlipGenerator.ts` | 🎨 Converts config + voter data → HTML |
| `server/pdfService.ts` | 📄 Converts HTML → PDF (Puppeteer-based) |
| `.azure/printSlip.copilotmd` | 📖 Complete documentation & examples |

---

## 🎨 How to Customize (Easy!)

Edit `server/printSlipConfig.ts` to customize anything:

### Example 1: Change Slip Title
```typescript
title: {
  text: 'YOUR CUSTOM TITLE HERE',  // ← Change this line
  fontSize: 14,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 2,
  textAlign: 'center',
},
```

### Example 2: Adjust Slip Dimensions
```typescript
slip: {
  width: 105,        // mm - adjust for your paper
  height: 148.5,     // mm
  padding: 5,        // internal spacing
  margin: 2,         // border margin
},
```

### Example 3: Change Which Fields Show
```typescript
fields: [
  { label: 'Name', dataKey: 'Name', ... },
  { label: 'Age', dataKey: 'Age', ... },
  // Remove a field by commenting it out:
  // { label: 'Ward', dataKey: 'ward', ... },
],
```

### Example 4: Font & Colors
```typescript
title: {
  color: '#c41e3a',              // Red
  fontSize: 16,                  // Larger
},

slip: {
  backgroundColor: '#f0f0f0',    // Gray background
  borderColor: '#333333',        // Dark border
},
```

---

## 🧪 Test the Print Feature

### Via Frontend
1. Open the voter search page
2. Search for any voter
3. Click the **Print Button** on a voter card
4. PDF downloads automatically! 📥

### Via Command Line
```bash
curl -X POST http://localhost:5000/api/voters/507f1f77bcf86cd799439011/print \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o voter-slip.pdf
```

---

## 📊 Configuration Overview

```typescript
PrintSlipConfig {
  page: {              // A4 paper settings
    width: 210,
    height: 297,
    slipsPerPage: 2,
  },
  slip: {              // Individual slip size & style
    width: 105,
    height: 148.5,
    padding: 5,
    margin: 2,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
  },
  header: {            // Logo/image settings
    showHeaderImage: true,
    logoHeight: 20,
    logoWidth: 20,
  },
  title: {             // Main title
    text: 'VOTER SLIP',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {          // Subtitle/description
    text: 'Election Commission',
    fontSize: 9,
  },
  fields: [            // Voter information fields
    { label: 'Name', dataKey: 'Name', ... },
    { label: 'Father/Husband', dataKey: 'Father Name', ... },
    { label: 'Age', dataKey: 'Age', ... },
    // ... more fields ...
  ],
  footer: {            // Footer text
    text: 'Please carry your Identity Card',
    fontSize: 8,
  },
  font: {              // Font settings
    family: 'Devanagari, Arial, sans-serif',
    baseSize: 11,
  },
  print: {             // Print page settings
    orientation: 'portrait',
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  },
}
```

---

## 🔧 Available Voter Fields

All MongoDB voter fields are accessible:

```javascript
{
  Name: 'string',
  'Father Name': 'string',
  'Husband Name': 'string',
  Gender: 'string',
  Age: number,
  epic_no: 'string',
  booth: 'string',
  ward: 'string',
  // ... any other fields in your MongoDB schema ...
}
```

To display a field, add it to the `fields` array:
```typescript
fields: [
  {
    label: 'Display Label',
    dataKey: 'MONGODB_FIELD_NAME',  // Must match exactly
    fontSize: 10,
    fontWeight: 'normal',
    labelWidth: 22,
    marginBottom: 2,
    marginLeft: 3,
    showLabel: true,
  },
],
```

---

## 🚀 Next Steps

### For Immediate Use
1. Test the current configuration by printing a voter slip
2. Note any desired customizations
3. Edit `server/printSlipConfig.ts` accordingly
4. Restart server if needed: `npm start`

### For Advanced Customization
1. Review full documentation in `.azure/printSlip.copilotmd`
2. See "How to Customize" section for detailed examples
3. Experiment with layout, fonts, colors, fields
4. Test after each change

### For Future Enhancements
- Create Admin UI for template editing (without code changes)
- Support for multiple templates
- Batch printing (4 slips per page)
- QR code integration
- Email integration

---

## 🐛 Troubleshooting

### "Print button doesn't work"
- Ensure server is running: `npm start`
- Check browser console for errors
- Verify authentication token is valid

### "PDF looks wrong"
- Check `server/printSlipConfig.ts` settings
- Verify field names match MongoDB schema
- Check font settings

### "Missing fonts"
- Use system-safe fonts in config
- See documentation for font recommendations

---

## 📚 Documentation Location

**Complete documentation:** `.azure/printSlip.copilotmd`

This file includes:
- Detailed architecture explanation
- All customization examples
- Performance optimization tips
- Troubleshooting guide
- Future enhancement ideas

---

## Summary

✅ **Working:** Print slip generation with Node.js + Puppeteer
✅ **Configurable:** Easy to customize in `server/printSlipConfig.ts`
✅ **Documented:** Detailed guide at `.azure/printSlip.copilotmd`
✅ **Production Ready:** Tested, optimized, error-handled
✅ **No Python Needed:** Pure Node.js solution

**Start using it now!** Click the print button on any voter card in your frontend.
