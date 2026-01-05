# 🎨 Print Slip System - Visual Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │   Voter Search   │  ──┐                                     │
│  │    & Display     │    │                                     │
│  └──────────────────┘    │                                     │
│                          │                                     │
│  ┌──────────────────┐    │                                     │
│  │  Voter Card      │    │ User searches & finds voter        │
│  │  ┌────────────┐  │    │                                     │
│  │  │   Print    │  │ ◄──┘                                     │
│  │  │   Button   │  │                                          │
│  │  └────────────┘  │                                          │
│  └──────────────────┘                                          │
│         │                                                      │
│         │ Click Print                                          │
│         ▼                                                      │
└─────────────────────────────────────────────────────────────────┘
          │
          │ POST /api/voters/:id/print
          │
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 1️⃣  routes.ts (API Handler)                            │  │
│  │                                                         │  │
│  │  • Receive request with voter ID                       │  │
│  │  • Check authentication (JWT)                          │  │
│  │  • Get voter from MongoDB                              │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ voter object                           │
│                       ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 2️⃣  printSlipGenerator.ts (HTML Generator)             │  │
│  │                                                         │  │
│  │  • Read config from printSlipConfig.ts                 │  │
│  │  • Generate HTML with voter data                       │  │
│  │  • Insert fields, fonts, colors from config            │  │
│  │  • Return formatted HTML                               │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ HTML string                            │
│                       ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 3️⃣  pdfService.ts (PDF Generator)                      │  │
│  │                                                         │  │
│  │  • Launch Puppeteer (headless Chromium)                │  │
│  │  • Convert HTML to PDF                                 │  │
│  │  • Save to /public/uploads/slip-*.pdf                  │  │
│  │  • Return file path                                    │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ PDF file created                       │
│                       ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 4️⃣  File Response                                      │  │
│  │                                                         │  │
│  │  • Stream PDF file to response                         │  │
│  │  • Auto-delete temp file after download                │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ PDF file download                      │
└─────────────────────────────────────────────────────────────────┘
          │
          │ PDF file
          │
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           PDF Downloaded! 📥                            │  │
│  │                                                          │  │
│  │  Voter can print or save PDF                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Customization Flow

```
┌──────────────────────────────────────┐
│  server/printSlipConfig.ts           │
│  (ONE FILE TO CUSTOMIZE)             │
│                                      │
│  printSlipConfig {                   │
│    page: { ... }                     │
│    slip: { ... }                     │
│    header: { ... }                   │
│    title: { ... }                    │
│    subtitle: { ... }                 │
│    fields: [ ... ]                   │
│    footer: { ... }                   │
│    font: { ... }                     │
│    print: { ... }                    │
│  }                                   │
└────────────┬─────────────────────────┘
             │
      Edit & Save
             │
             ▼
┌──────────────────────────────────────┐
│  npm start                           │
│  (Restart Server)                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Print Slip Generated with           │
│  New Configuration                   │
│                                      │
│  ✓ New title                         │
│  ✓ New colors                        │
│  ✓ New field layout                  │
│  ✓ New fonts                         │
│  ✓ New sizing                        │
└──────────────────────────────────────┘
```

---

## Data Flow: Voter → PDF

```
┌────────────────────────────┐
│   MongoDB                  │
│   ┌────────────────────┐   │
│   │ Voter Document     │   │
│   │ {                  │   │
│   │   _id: 507f...,    │   │
│   │   Name: 'John',    │   │
│   │   'Father Name': 'Ram',
│   │   Age: 45,         │   │
│   │   epic_no: '1234', │   │
│   │   ...              │   │
│   │ }                  │   │
│   └────────────────────┘   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  printSlipConfig.ts        │
│  { fields: [              │
│    { label: 'Name',       │
│      dataKey: 'Name',     │
│      fontSize: 10,        │
│      ...                  │
│    },                      │
│    ...                     │
│  ]}                        │
└────────────┬───────────────┘
             │
      Merge Data + Config
             │
             ▼
┌────────────────────────────┐
│  HTML (Generated)          │
│                            │
│  <div style="...">         │
│    <div>Name</div>         │
│    <div>John</div>         │
│    <div>Father: Ram</div>  │
│    <div>Age: 45</div>      │
│    ...                     │
│  </div>                    │
└────────────┬───────────────┘
             │
      Puppeteer: HTML→PDF
             │
             ▼
┌────────────────────────────┐
│  PDF File Generated        │
│                            │
│  [Professional PDF]        │
│                            │
│  ┌────────────────────┐   │
│  │  VOTER SLIP        │   │
│  │                    │   │
│  │  Name: John        │   │
│  │  Father: Ram       │   │
│  │  Age: 45           │   │
│  │  Epic: 1234        │   │
│  │                    │   │
│  │  [Professional]    │   │
│  └────────────────────┘   │
│                            │
│  slip-507f...-1234.pdf     │
└────────────────────────────┘
```

---

## File Dependencies

```
routes.ts (API endpoint)
   │
   ├─ printSlipGenerator.ts (HTML generation)
   │   │
   │   └─ printSlipConfig.ts (configuration)
   │
   └─ pdfService.ts (PDF generation)
       │
       └─ puppeteer (npm package)
           │
           └─ Chromium (auto-installed)
```

---

## Configuration Structure Visualization

```
PrintSlipConfig
│
├─ PAGE (A4 Paper)
│  ├─ width: 210mm
│  ├─ height: 297mm
│  └─ slipsPerPage: 2
│
├─ SLIP (Individual Slip)
│  ├─ width: 105mm
│  ├─ height: 148.5mm
│  ├─ padding: 5mm
│  ├─ margin: 2mm
│  ├─ backgroundColor: #ffffff
│  ├─ borderColor: #000000
│  └─ borderWidth: 1px
│
├─ HEADER (Logo/Image)
│  ├─ showHeaderImage: true
│  ├─ logoHeight: 20mm
│  ├─ logoWidth: 20mm
│  └─ logoPosition: {top: 3mm, left: 3mm}
│
├─ TITLE
│  ├─ text: "VOTER SLIP"
│  ├─ fontSize: 14pt
│  ├─ fontWeight: bold
│  ├─ color: #000000
│  ├─ marginBottom: 2mm
│  └─ textAlign: center
│
├─ SUBTITLE
│  ├─ text: "Election Commission"
│  ├─ fontSize: 9pt
│  ├─ fontWeight: normal
│  ├─ color: #333333
│  ├─ marginBottom: 3mm
│  └─ textAlign: center
│
├─ FIELDS (Voter Information)
│  ├─ Field 1: {label: "Name", dataKey: "Name", ...}
│  ├─ Field 2: {label: "Relation", dataKey: "Father Name", ...}
│  ├─ Field 3: {label: "Age", dataKey: "Age", ...}
│  ├─ Field 4: {label: "Gender", dataKey: "Gender", ...}
│  ├─ Field 5: {label: "EPIC No", dataKey: "epic_no", ...}
│  ├─ Field 6: {label: "Booth", dataKey: "booth", ...}
│  └─ Field 7: {label: "Ward", dataKey: "ward", ...}
│
├─ FOOTER
│  ├─ text: "Please carry your Identity Card"
│  ├─ fontSize: 8pt
│  ├─ fontWeight: normal
│  ├─ color: #666666
│  ├─ textAlign: center
│  ├─ marginTop: 2mm
│  ├─ borderTop: true
│  └─ borderTopColor: #cccccc
│
├─ FONT
│  ├─ family: "Devanagari, Arial, sans-serif"
│  └─ baseSize: 11pt
│
└─ PRINT
   ├─ orientation: portrait
   └─ margins: {top: 5mm, right: 5mm, bottom: 5mm, left: 5mm}
```

---

## Customization Path

```
Want to customize?
       │
       ▼
┌──────────────────────────┐
│ Edit ONE file:           │
│ server/printSlipConfig.ts
└──────────────────────────┘
       │
       ├─ Change title text?        → Edit: title.text
       │
       ├─ Change slip size?         → Edit: slip.width/height
       │
       ├─ Change colors?            → Edit: *.color properties
       │
       ├─ Change fonts?             → Edit: font.family
       │
       ├─ Add/remove fields?        → Edit: fields array
       │
       ├─ Change padding/margin?    → Edit: padding/margin values
       │
       └─ Change field order?       → Edit: fields array order
       │
       ▼
┌──────────────────────────┐
│ Save file                │
└──────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Restart: npm start       │
└──────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Changes applied!         │
│ Try print button again   │
└──────────────────────────┘
```

---

## Browser Instance Management

```
First PDF Request
    │
    ├─ Launch Puppeteer
    ├─ Initialize Chromium
    ├─ Create browser instance
    └─ Store in memory (reuse)
                  │
                  ▼
       Second PDF Request
                  │
                  ├─ Reuse existing browser (NO restart)
                  ├─ Create new page
                  ├─ Generate PDF
                  └─ Close page (keep browser open)
                  │
                  ▼
       Third PDF Request
                  │
                  ├─ Reuse existing browser (FAST!)
                  ├─ Create new page
                  ├─ Generate PDF
                  └─ Close page
                  │
                  ▼
           Process Exit
                  │
                  └─ Close browser (cleanup)
```

**Result:** First PDF takes 2-5s, subsequent PDFs take 1-2s! ⚡

---

## Technology Stack

```
Frontend
├─ React 18
├─ TypeScript
├─ React Query (data fetching)
├─ Tailwind CSS (styling)
└─ shadcn/ui (components)

Server
├─ Node.js
├─ Express.js
├─ TypeScript
└─ Puppeteer (PDF generation)

Database
├─ MongoDB Atlas
├─ Mongoose (ODM)
└─ Zod (validation)

Build & Deploy
├─ Vite (frontend bundler)
├─ esbuild (server bundler)
├─ npm (package management)
└─ Docker-ready (no Python needed)
```

---

This visual guide helps you understand:
- How the system works end-to-end
- Where configuration happens
- How data flows from voter to PDF
- Why it's fast (browser reuse)
- How to customize it

**Reference this when you need clarity on how components interact!** 📊
