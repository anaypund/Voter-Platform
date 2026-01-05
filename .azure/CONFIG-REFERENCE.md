# 📋 Print Slip Configuration Reference

## Quick Config Guide

All customization happens in ONE file: **`server/printSlipConfig.ts`**

---

## Configuration Structure

```typescript
const defaultPrintSlipConfig: PrintSlipConfig = {
  // 📄 Paper settings
  page: { width, height, slipsPerPage },
  
  // 🎯 Individual slip appearance
  slip: { width, height, padding, margin, colors, border },
  
  // 🖼️ Header/logo
  header: { showHeaderImage, logoHeight, logoWidth, logoPosition },
  
  // 📝 Main title
  title: { text, fontSize, fontWeight, color, marginBottom, textAlign },
  
  // 📝 Subtitle
  subtitle: { text, fontSize, fontWeight, color, marginBottom, textAlign },
  
  // 📋 Voter information fields
  fields: [
    { label, dataKey, fontSize, fontWeight, labelWidth, marginBottom, marginLeft, showLabel, columnsInLine },
    // ... more fields ...
  ],
  
  // 📝 Footer text
  footer: { text, fontSize, fontWeight, color, textAlign, marginTop, borderTop, borderTopColor },
  
  // 🔤 Font defaults
  font: { family, baseSize },
  
  // 🖨️ Print settings
  print: { orientation, margins }
};
```

---

## Fields Reference

### `page` - Paper Size
```typescript
page: {
  width: 210,          // mm (A4 = 210mm)
  height: 297,         // mm (A4 = 297mm)
  slipsPerPage: 2,     // 2 = each slip is 1/2 of page
}
```

**Common sizes:**
- A4: 210×297mm (default)
- Letter: 215.9×279.4mm
- A5: 148×210mm

---

### `slip` - Slip Appearance
```typescript
slip: {
  width: 105,              // mm (half of 210mm)
  height: 148.5,           // mm (half of 297mm)
  padding: 5,              // mm (internal space from border)
  margin: 2,               // mm (external spacing)
  backgroundColor: '#ffffff',  // hex color
  borderColor: '#000000',      // hex color
  borderWidth: 1,              // px
}
```

**Adjust for:**
- Smaller slips: width: 80, height: 120
- Larger slips: width: 140, height: 200
- No border: borderWidth: 0
- Different colors: hex values (#FF0000, #00FF00, etc.)

---

### `header` - Logo/Image
```typescript
header: {
  showHeaderImage: true,      // true/false - show/hide image
  logoHeight: 20,             // mm
  logoWidth: 20,              // mm
  logoPosition: {
    top: 3,                   // mm from top
    left: 3,                  // mm from left
  },
}
```

**Enable/disable:** `showHeaderImage: true/false`
**Size:** Adjust `logoHeight` and `logoWidth`

---

### `title` - Main Title
```typescript
title: {
  text: 'VOTER SLIP',              // What to display
  fontSize: 14,                    // pt
  fontWeight: 'bold',              // 'bold', 'normal', 'lighter'
  color: '#000000',                // hex color
  marginBottom: 2,                 // mm space below title
  textAlign: 'center',             // 'center', 'left', 'right'
}
```

**Example customizations:**
```typescript
// Large red title
title: { text: 'ELECTION SLIP', fontSize: 18, color: '#c41e3a', ... }

// Small left-aligned title
title: { text: 'Voter Info', fontSize: 10, textAlign: 'left', ... }
```

---

### `subtitle` - Subtitle
```typescript
subtitle: {
  text: 'Election Commission',     // Displayed below title
  fontSize: 9,                     // pt
  fontWeight: 'normal',            // 'normal', 'bold'
  color: '#333333',                // hex color
  marginBottom: 3,                 // mm space below
  textAlign: 'center',             // 'center', 'left', 'right'
}
```

---

### `fields` - Voter Information
```typescript
fields: [
  {
    label: 'Name',                 // Display label
    dataKey: 'Name',               // MongoDB field name
    fontSize: 10,                  // pt
    fontWeight: 'bold',            // 'bold' or 'normal'
    labelWidth: 22,                // mm (width of label column)
    marginBottom: 2,               // mm space below field
    marginLeft: 3,                 // mm indent from left
    showLabel: true,               // true/false - show label
    columnsInLine: 1,              // 1 or 2 fields per line (optional)
  },
  // ... more fields ...
]
```

**Available voter fields from MongoDB:**
```javascript
Name, Father Name, Husband Name, Gender, Age, epic_no, booth, 
ward, house_no, and any other field in your schema
```

**Field layout examples:**

Single column (full width):
```typescript
{ label: 'Name', dataKey: 'Name', columnsInLine: 1, ... }
{ label: 'Address', dataKey: 'address', columnsInLine: 1, ... }
```

Two columns (half width each):
```typescript
{ label: 'Age', dataKey: 'Age', columnsInLine: 2, ... }
{ label: 'Gender', dataKey: 'Gender', columnsInLine: 2, ... }
```

No label (just show data):
```typescript
{ label: 'Name', dataKey: 'Name', showLabel: false, ... }
```

---

### `footer` - Footer Text
```typescript
footer: {
  text: 'Please carry your Identity Card',  // Footer text
  fontSize: 8,                             // pt
  fontWeight: 'normal',                    // 'normal', 'bold'
  color: '#666666',                        // hex color
  textAlign: 'center',                     // 'center', 'left', 'right'
  marginTop: 2,                            // mm space above footer
  borderTop: true,                         // true/false - show line
  borderTopColor: '#cccccc',               // hex color of border
}
```

---

### `font` - Font Settings
```typescript
font: {
  family: 'Devanagari, Arial, sans-serif',  // Fallback fonts
  baseSize: 11,                              // pt (base font size)
}
```

**Font families (with fallbacks):**
```typescript
// English
family: 'Arial, Helvetica, sans-serif'

// With Devanagari support (Indian languages)
family: 'Devanagari, Arial, sans-serif'

// Multiple options
family: 'Georgia, Times, serif'

// Monospace
family: 'Courier New, monospace'
```

---

### `print` - Print Settings
```typescript
print: {
  orientation: 'portrait',        // 'portrait' or 'landscape'
  margins: {
    top: 5,                        // mm
    right: 5,                      // mm
    bottom: 5,                     // mm
    left: 5,                       // mm
  },
}
```

---

## Copy-Paste Examples

### Example 1: Minimal (Compact)
```typescript
slip: {
  width: 80,
  height: 120,
  padding: 3,
  margin: 1,
  backgroundColor: '#ffffff',
  borderColor: '#333333',
  borderWidth: 1,
},

title: {
  text: 'VOTER SLIP',
  fontSize: 12,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 1,
  textAlign: 'center',
},

fields: [
  {
    label: 'Name',
    dataKey: 'Name',
    fontSize: 8,
    fontWeight: 'bold',
    labelWidth: 18,
    marginBottom: 1,
    marginLeft: 2,
    showLabel: true,
  },
  {
    label: 'EPIC No',
    dataKey: 'epic_no',
    fontSize: 8,
    fontWeight: 'normal',
    labelWidth: 18,
    marginBottom: 1,
    marginLeft: 2,
    showLabel: true,
  },
],
```

### Example 2: Professional (Large)
```typescript
slip: {
  width: 120,
  height: 170,
  padding: 6,
  margin: 2,
  backgroundColor: '#f9f9f9',
  borderColor: '#0066cc',
  borderWidth: 2,
},

title: {
  text: 'OFFICIAL VOTER IDENTIFICATION',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#0066cc',
  marginBottom: 3,
  textAlign: 'center',
},

fields: [
  {
    label: 'Voter Name',
    dataKey: 'Name',
    fontSize: 11,
    fontWeight: 'bold',
    labelWidth: 26,
    marginBottom: 3,
    marginLeft: 4,
    showLabel: true,
  },
  // ... more fields ...
],
```

### Example 3: Minimal (No Labels)
```typescript
fields: [
  {
    label: 'Name',
    dataKey: 'Name',
    fontSize: 10,
    fontWeight: 'bold',
    labelWidth: 0,
    marginBottom: 1,
    marginLeft: 2,
    showLabel: false,  // ← No labels, just values
  },
  {
    label: 'EPIC No',
    dataKey: 'epic_no',
    fontSize: 9,
    fontWeight: 'normal',
    labelWidth: 0,
    marginBottom: 1,
    marginLeft: 2,
    showLabel: false,
  },
],
```

### Example 4: Two-Column Layout
```typescript
fields: [
  {
    label: 'Name',
    dataKey: 'Name',
    fontSize: 10,
    fontWeight: 'bold',
    labelWidth: 22,
    marginBottom: 2,
    marginLeft: 3,
    showLabel: true,
    columnsInLine: 1,  // Full width
  },
  {
    label: 'Age',
    dataKey: 'Age',
    fontSize: 9,
    fontWeight: 'normal',
    labelWidth: 22,
    marginBottom: 2,
    marginLeft: 3,
    showLabel: true,
    columnsInLine: 2,  // Half width (left)
  },
  {
    label: 'Gender',
    dataKey: 'Gender',
    fontSize: 9,
    fontWeight: 'normal',
    labelWidth: 22,
    marginBottom: 2,
    marginLeft: 3,
    showLabel: true,
    columnsInLine: 2,  // Half width (right)
  },
],
```

---

## Color Codes (Hex)

```
#000000 - Black
#FFFFFF - White
#F0F0F0 - Light Gray
#CCCCCC - Medium Gray
#666666 - Dark Gray

#0066CC - Blue
#FF0000 - Red
#00CC00 - Green
#FF9900 - Orange
#9900FF - Purple

#C41E3A - Indian Red
#FF6E1A - Indian Orange
#FFC000 - Gold
```

---

## Units

| Unit | What It Means | Example |
|------|--------------|---------|
| mm | Millimeters (paper size) | width: 105 |
| pt | Points (font size) | fontSize: 14 |
| px | Pixels (border) | borderWidth: 1 |
| hex | Color code | color: '#0066CC' |

---

## How to Apply Changes

1. **Edit** `server/printSlipConfig.ts`
2. **Save** the file
3. **Restart** server: `npm start`
4. **Test** by printing a voter slip
5. **Adjust** if needed and go to step 1

---

## Validation

**Field name must match MongoDB schema:**
```typescript
// ✅ CORRECT (field exists in MongoDB)
dataKey: 'Name'
dataKey: 'Father Name'
dataKey: 'epic_no'

// ❌ WRONG (field doesn't exist)
dataKey: 'name'           // Case mismatch
dataKey: 'full_name'      // Wrong field name
dataKey: 'voter_name'     // Doesn't exist
```

---

## Performance Tips

1. **Use fewer fields** for smaller slips
2. **Smaller fonts** for compact layouts
3. **Less padding/margin** to save space
4. **2-column layout** for dense information

---

## Support & Help

- **Quick Start:** `.azure/printSlip-QuickStart.md`
- **Full Guide:** `.azure/printSlip.copilotmd`
- **Examples:** This file
- **Troubleshooting:** `.azure/printSlip-QuickStart.md` section

---

**Happy customizing! 🎉**
