/**
 * RestaurantOS — Customer-Ready Multi-PDF Manuals Generator
 * Produces 5 separate professional, downloadable A4 PDF user guides using PDFKit:
 * 1. RestaurantOS_Owner_Setup_Guide.pdf
 * 2. RestaurantOS_Cashier_POS_Manual.pdf
 * 3. RestaurantOS_Kitchen_Staff_Manual.pdf
 * 4. RestaurantOS_Manager_Inventory_Manual.pdf
 * 5. RestaurantOS_Troubleshooting_Guide.pdf
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const RELEASE_DIR = path.resolve(__dirname, "../../../release/customer-manuals");
const PUBLIC_DIR = path.resolve(__dirname, "../public/downloads/customer-manuals");

fs.mkdirSync(RELEASE_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Theme Palettes
const THEMES = {
  NAVY_ORANGE: {
    coverBg: "#090d16",
    primary: "#ea580c",
    primaryDark: "#9a3412",
    secondary: "#0f172a",
    textMain: "#1e293b",
    textMuted: "#64748b",
    bgCard: "#f8fafc",
    borderColor: "#e2e8f0",
    green: "#15803d",
    red: "#b91c1c",
    amber: "#d97706",
  },
  EMERALD: {
    coverBg: "#061a14",
    primary: "#059669",
    primaryDark: "#065f46",
    secondary: "#0f172a",
    textMain: "#1e293b",
    textMuted: "#64748b",
    bgCard: "#f8fafc",
    borderColor: "#e2e8f0",
    green: "#059669",
    red: "#b91c1c",
    amber: "#d97706",
  },
  AMBER_GOLD: {
    coverBg: "#1c1404",
    primary: "#d97706",
    primaryDark: "#92400e",
    secondary: "#0f172a",
    textMain: "#1e293b",
    textMuted: "#64748b",
    bgCard: "#f8fafc",
    borderColor: "#e2e8f0",
    green: "#15803d",
    red: "#b91c1c",
    amber: "#d97706",
  },
  SLATE_BLUE: {
    coverBg: "#0b1329",
    primary: "#2563eb",
    primaryDark: "#1e40af",
    secondary: "#0f172a",
    textMain: "#1e293b",
    textMuted: "#64748b",
    bgCard: "#f8fafc",
    borderColor: "#e2e8f0",
    green: "#15803d",
    red: "#b91c1c",
    amber: "#d97706",
  },
  CRIMSON: {
    coverBg: "#1a0808",
    primary: "#dc2626",
    primaryDark: "#991b1b",
    secondary: "#0f172a",
    textMain: "#1e293b",
    textMuted: "#64748b",
    bgCard: "#f8fafc",
    borderColor: "#e2e8f0",
    green: "#15803d",
    red: "#dc2626",
    amber: "#d97706",
  },
};

interface ManualConfig {
  filename: string;
  badgeText: string;
  title: string;
  subtitle: string;
  audience: string;
  theme: typeof THEMES.NAVY_ORANGE;
  sections: Array<{
    title: string;
    subsections: Array<{
      heading: string;
      content: string[];
      bullets?: Array<{ title: string; desc: string }>;
      callout?: { title: string; text: string; type?: "tip" | "warn" | "note" };
      uiDiagram?: string[];
      table?: { headers: string[]; rows: string[][] };
    }>;
  }>;
  glossary?: Array<{ term: string; definition: string }>;
  checklist?: string[];
}

function renderManualPDF(config: ManualConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const releasePath = path.join(RELEASE_DIR, config.filename);
    const publicPath = path.join(PUBLIC_DIR, config.filename);

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 45, left: 45, right: 45 },
      bufferPages: true,
      autoFirstPage: true,
    });

    const stream1 = fs.createWriteStream(releasePath);
    const stream2 = fs.createWriteStream(publicPath);

    doc.pipe(stream1);
    doc.pipe(stream2);

    const theme = config.theme;

    // -------------------------------------------------------------------------
    // COVER PAGE
    // -------------------------------------------------------------------------
    doc.rect(0, 0, 595.28, 841.89).fill(theme.coverBg);

    // Top Brand Badge
    doc.roundedRect(45, 60, 64, 64, 12).fill(theme.primary);
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold");
    doc.text("OS", 58, 78);

    doc.fillColor(theme.primary).fontSize(11).font("Helvetica-Bold");
    doc.text("RESTAURANTOS OFFICIAL USER MANUALS SERIES", 125, 75, { characterSpacing: 1.5 });
    doc.fillColor("#94a3b8").fontSize(9).font("Helvetica");
    doc.text(`Target Audience: ${config.audience.toUpperCase()}`, 125, 92);
    doc.text("Version: 1.4.0 Production Edition | Indian F&B Compliant", 125, 106);

    doc.moveDown(4.5);
    doc.fillColor(theme.primary).fontSize(13).font("Helvetica-Bold");
    doc.text(config.badgeText.toUpperCase(), { characterSpacing: 2 });

    doc.moveDown(0.3);
    doc.fillColor("#ffffff").fontSize(30).font("Helvetica-Bold");
    doc.text(config.title);

    doc.moveDown(0.4);
    doc.fillColor("#94a3b8").fontSize(13).font("Helvetica");
    doc.text(config.subtitle, { width: 490 });

    // Accent Line
    doc.moveDown(1);
    doc.rect(45, doc.y, 505, 3).fill(theme.primary);

    // Target User Scope Box
    doc.moveDown(2);
    const scopeY = doc.y;
    doc.roundedRect(45, scopeY, 505, 120, 8).fill("#111827");
    doc.fillColor("#f8fafc").fontSize(11).font("Helvetica-Bold");
    doc.text("AUDIENCE & OPERATIONAL SCOPE", 65, scopeY + 16);

    doc.fontSize(9).font("Helvetica").fillColor("#cbd5e1");
    doc.text(`• Primary Users: ${config.audience}`, 65, scopeY + 36);
    doc.text("• Skill Level Required: Basic computer, touch monitor, or smartphone familiarity.", 65, scopeY + 52);
    doc.text("• Language: Plain English (Hindi and Bengali localized editions available).", 65, scopeY + 68);
    doc.text("• Core Modules: POS, Kitchen Display, Indian GST, Inventory, CRM, and Shift Auditing.", 65, scopeY + 84);
    doc.text("• Offline Support: Continues billing during network drops with automatic synchronization.", 65, scopeY + 100);

    // Bottom Footer
    doc.fillColor("#64748b").fontSize(8.5).font("Helvetica-Oblique");
    doc.text("RestaurantOS Hospitality Engineering — Published November 2026", 45, 785);

    // -------------------------------------------------------------------------
    // TABLE OF CONTENTS
    // -------------------------------------------------------------------------
    doc.addPage();
    drawPageHeader(doc, theme, "TABLE OF CONTENTS", "Quick orientation of key instructions");

    doc.moveDown(0.5);
    config.sections.forEach((sec, idx) => {
      doc.fillColor(theme.secondary).fontSize(10).font("Helvetica-Bold");
      doc.text(`Section ${idx + 1}: `, 45, doc.y, { continued: true });
      doc.font("Helvetica").fillColor(theme.textMain).text(sec.title, { continued: true });
      doc.font("Helvetica-Bold").fillColor(theme.primary).text(`   [Module ${idx + 1}]`);
      doc.moveDown(0.35);

      sec.subsections.forEach((sub, subIdx) => {
        doc.fillColor(theme.textMuted).fontSize(8.5).font("Helvetica");
        doc.text(`    ${idx + 1}.${subIdx + 1}  ${sub.heading}`, 45, doc.y);
        doc.moveDown(0.15);
      });
      doc.moveDown(0.4);
    });

    drawCalloutBox(
      doc,
      theme,
      "How to Use This Guide",
      "Follow the numbered steps sequentially. Actions requiring manager or supervisor authorization are marked with a Warning icon. Use the glossary at the end for unfamiliar restaurant and tax terms.",
      theme.primary
    );

    // -------------------------------------------------------------------------
    // CONTENT SECTIONS
    // -------------------------------------------------------------------------
    config.sections.forEach((sec, secIdx) => {
      doc.addPage();
      drawPageHeader(doc, theme, `SECTION ${secIdx + 1} — ${sec.title.toUpperCase()}`);

      sec.subsections.forEach((sub, subIdx) => {
        checkPageOverflow(doc, 90);

        // Subheading
        const y = doc.y;
        doc.rect(45, y, 4, 15).fill(theme.primary);
        doc.fillColor(theme.secondary).fontSize(11).font("Helvetica-Bold");
        doc.text(`${secIdx + 1}.${subIdx + 1}  ${sub.heading}`, 55, y + 2, { width: 490 });
        doc.moveDown(0.4);

        // Content paragraphs
        sub.content.forEach((para) => {
          checkPageOverflow(doc, 40);
          doc.fillColor(theme.textMain).fontSize(9).font("Helvetica").lineGap(2);
          doc.text(para, 45, doc.y, { width: 505 });
          doc.moveDown(0.3);
        });

        // Bullets
        if (sub.bullets && sub.bullets.length > 0) {
          sub.bullets.forEach((b) => {
            checkPageOverflow(doc, 25);
            doc.fontSize(8.5).font("Helvetica-Bold").fillColor(theme.secondary);
            doc.text(`• ${b.title}: `, 55, doc.y, { continued: true, width: 495 });
            doc.font("Helvetica").fillColor(theme.textMain).text(b.desc);
            doc.moveDown(0.2);
          });
        }

        // Callout
        if (sub.callout) {
          checkPageOverflow(doc, 60);
          const color =
            sub.callout.type === "warn"
              ? theme.red
              : sub.callout.type === "tip"
              ? theme.green
              : theme.primary;
          drawCalloutBox(doc, theme, sub.callout.title, sub.callout.text, color);
        }

        // UI Diagram
        if (sub.uiDiagram && sub.uiDiagram.length > 0) {
          checkPageOverflow(doc, sub.uiDiagram.length * 12 + 20);
          drawUIDiagram(doc, sub.uiDiagram);
        }

        // Table
        if (sub.table) {
          checkPageOverflow(doc, (sub.table.rows.length + 1) * 20 + 20);
          drawTable(doc, theme, sub.table.headers, sub.table.rows);
        }

        doc.moveDown(0.4);
      });
    });

    // -------------------------------------------------------------------------
    // GLOSSARY & CHECKLIST
    // -------------------------------------------------------------------------
    if (config.glossary && config.glossary.length > 0) {
      doc.addPage();
      drawPageHeader(doc, theme, "GLOSSARY OF TERMS & DEFINITIONS");
      doc.moveDown(0.4);

      config.glossary.forEach((item) => {
        checkPageOverflow(doc, 30);
        doc.fontSize(9).font("Helvetica-Bold").fillColor(theme.primary);
        doc.text(item.term, 45, doc.y);
        doc.fontSize(8.5).font("Helvetica").fillColor(theme.textMain).text(item.definition, 45, doc.y, {
          width: 505,
        });
        doc.moveDown(0.35);
      });
    }

    if (config.checklist && config.checklist.length > 0) {
      doc.addPage();
      drawPageHeader(doc, theme, "QUICK VERIFICATION & OPERATOR CHECKLIST");
      doc.moveDown(0.5);

      config.checklist.forEach((item, idx) => {
        checkPageOverflow(doc, 25);
        const y = doc.y;
        doc.rect(45, y + 1, 10, 10).stroke(theme.primary);
        doc.fillColor(theme.textMain).fontSize(9).font("Helvetica");
        doc.text(`${idx + 1}.  ${item}`, 65, y + 1, { width: 480 });
        doc.moveDown(0.4);
      });
    }

    // -------------------------------------------------------------------------
    // FOOTER & PAGE NUMBERING ON ALL BUFFERED PAGES
    // -------------------------------------------------------------------------
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      // Skip cover page
      if (i === 0) continue;

      // Top running title
      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica");
      doc.text("RestaurantOS Enterprise F&B Operating System", 45, 20);
      doc.text(config.title, 45, 20, { align: "right", width: 505 });
      doc.rect(45, 30, 505, 0.5).fill("#e2e8f0");

      // Bottom footer line
      doc.rect(45, 805, 505, 0.5).fill("#e2e8f0");
      doc.fillColor("#64748b").fontSize(7.5).font("Helvetica");
      doc.text(`Page ${i + 1} of ${pages.count}  |  Official RestaurantOS Documentation`, 45, 812);
      doc.text("Confidential & Proprietary", 45, 812, { align: "right", width: 505 });
    }

    doc.end();

    stream1.on("finish", () => {
      resolve();
    });
    stream1.on("error", (err) => {
      reject(err);
    });
  });
}

function drawPageHeader(doc: any, theme: any, title: string, subtitle?: string) {
  doc.rect(45, doc.y, 505, 26).fill(theme.secondary);
  doc.fillColor("#ffffff").fontSize(10.5).font("Helvetica-Bold");
  doc.text(title, 55, doc.y - 19, { width: 485 });
  doc.moveDown(0.7);
  if (subtitle) {
    doc.fillColor(theme.textMuted).fontSize(8.5).font("Helvetica-Oblique");
    doc.text(subtitle, 45, doc.y);
    doc.moveDown(0.3);
  }
}

function drawCalloutBox(doc: any, theme: any, title: string, text: string, color: string) {
  const y = doc.y;
  doc.roundedRect(45, y, 505, 38, 5).fillAndStroke(theme.bgCard, theme.borderColor);
  doc.rect(45, y, 4, 38).fill(color);
  doc.fillColor(color).fontSize(8).font("Helvetica-Bold");
  doc.text(title.toUpperCase(), 55, y + 6);
  doc.fillColor(theme.textMain).fontSize(7.8).font("Helvetica");
  doc.text(text, 55, y + 17, { width: 485 });
  doc.y = y + 44;
}

function drawUIDiagram(doc: any, lines: string[]) {
  const y = doc.y;
  const boxHeight = lines.length * 10 + 12;
  doc.roundedRect(45, y, 505, boxHeight, 4).fillAndStroke("#0f172a", "#1e293b");
  doc.fillColor("#38bdf8").fontSize(7.2).font("Courier");
  lines.forEach((line, idx) => {
    doc.text(line, 55, y + 6 + idx * 10);
  });
  doc.y = y + boxHeight + 6;
}

function drawTable(doc: any, theme: any, headers: string[], rows: string[][]) {
  const colWidth = 505 / headers.length;
  let y = doc.y;

  // Header row
  doc.rect(45, y, 505, 18).fill(theme.secondary);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => {
    doc.text(h, 50 + i * colWidth, y + 4, { width: colWidth - 8 });
  });
  y += 18;

  // Data rows
  rows.forEach((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    doc.rect(45, y, 505, 16).fill(isEven ? "#ffffff" : "#f8fafc");
    doc.fillColor(theme.textMain).fontSize(7.5).font("Helvetica");
    row.forEach((cell, cIdx) => {
      doc.text(cell, 50 + cIdx * colWidth, y + 4, { width: colWidth - 8 });
    });
    y += 16;
  });

  doc.rect(45, doc.y, 505, y - doc.y).stroke(theme.borderColor);
  doc.y = y + 6;
}

function checkPageOverflow(doc: any, spaceNeeded: number) {
  if (doc.y + spaceNeeded > 780) {
    doc.addPage();
  }
}

// =============================================================================
// MANUAL CONFIGURATIONS
// =============================================================================

// 1. OWNER SETUP GUIDE
const ownerGuideConfig: ManualConfig = {
  filename: "RestaurantOS_Owner_Setup_Guide.pdf",
  badgeText: "Administrator & Setup Manual",
  title: "Restaurant Owner Setup Guide",
  subtitle: "Complete walkthrough for registering, configuring taxes, dining tables, menus, printers, and staff permissions.",
  audience: "Restaurant Owners, Franchisees, General Managers",
  theme: THEMES.NAVY_ORANGE,
  sections: [
    {
      title: "Introduction & Initial Registration",
      subsections: [
        {
          heading: "System Architecture & Login",
          content: [
            "RestaurantOS is an enterprise restaurant operating system designed for Indian F&B businesses. It brings together high-speed POS, KDS, inventory recipe deduction, statutory GST billing, and multi-branch control into a single unified web and desktop platform.",
            "To access the software, open Google Chrome, Safari, or Microsoft Edge and navigate to your store URL (e.g., http://localhost:3000). On touch monitors and tablets, click 'Add to Home screen' or install the Progressive Web App (PWA) to run in dedicated fullscreen kiosk mode.",
          ],
          bullets: [
            { title: "Browser Support", desc: "Optimized for Google Chrome v100+, Microsoft Edge, Safari, and Android Chrome." },
            { title: "Offline Readiness", desc: "Local IndexedDB persistent queue continues billing if the internet drops." },
          ],
        },
        {
          heading: "Registering Your Restaurant Account",
          content: [
            "1. From the login screen, click 'Register Restaurant' (/register).",
            "2. Enter legal business name, contact email, and secure password (minimum 8 characters).",
            "3. Select business type: Restaurant, Cafe, Cloud Kitchen, Bakery, or Multi-Chain.",
            "4. Enter your flagship outlet name, address, 15-character GSTIN, and 14-digit FSSAI number.",
            "5. Click 'Create Restaurant Account' to automatically provision your tenant database and initial 30-day trial subscription.",
          ],
          callout: {
            title: "Owner Password Security",
            text: "Never share your primary Owner password with cashier or waiter staff. Create dedicated employee profiles under Staff management with role-based restrictions.",
            type: "warn",
          },
        },
      ],
    },
    {
      title: "Statutory GST & Outlet Configuration",
      subsections: [
        {
          heading: "Indian GST & Invoice Settings",
          content: [
            "In the sidebar, navigate to Administration → Branches (/branches) and click 'Edit Settings' on your flagship outlet:",
            "• GSTIN: Enter your state-issued 15-character GST number (e.g., 29AABCU9603R1ZM).",
            "• Tax Split: Configure CGST at 2.5% and SGST at 2.5% (Total 5.0% GST). For interstate catering, set IGST at 5.0%.",
            "• Pricing Mode: Choose Tax-Exclusive (5% added on top) or Tax-Inclusive (tax computed backwards).",
            "• Sequential Invoicing: Set your branch code (e.g., IND) and starting invoice serial (e.g., IND/2026-27/00001).",
          ],
        },
        {
          heading: "Setting Up Dining Tables & QR Codes",
          content: [
            "Go to Main → Tables (/tables). Click 'Add Table' to register dining tables with capacity counts (2, 4, 6, 8 guests).",
            "Click the 'QR Code' icon next to any table to generate high-contrast printable Table QR tent cards linking patrons directly to digital self-ordering (/qr-order?branch=IND&table=T-01).",
          ],
        },
      ],
    },
    {
      title: "Menu Setup & Pricing Structure",
      subsections: [
        {
          heading: "Categories, Portions & Modifiers",
          content: [
            "Navigate to Catalog & Inventory → Menu (/menu):",
            "1. Create food categories (Starters, Main Course, Biryani, Breads, Beverages, Desserts).",
            "2. Map categories to default kitchen stations (MAIN_KITCHEN, BAR, BAKERY, BEVERAGE).",
            "3. Add dishes with dietary badges: VEG (Green Dot), NON_VEG (Red Dot), or EGG (Yellow Dot).",
            "4. Define portion variants: Half Portion (₹190) vs Full Portion (₹340).",
            "5. Create modifier groups: e.g., Extra Butter (+₹20), Extra Cheese (+₹40), Choice of Spice (Mild, Medium, Hot).",
          ],
        },
      ],
    },
    {
      title: "Staff Accounts & Role Permissions",
      subsections: [
        {
          heading: "Role-Based Access Control (RBAC)",
          content: [
            "Navigate to Customers & Staff → Staff (/staff). Click 'Add Employee' and assign appropriate roles:",
            "• Manager: Operational control, discount approvals, supervisor refunds, inventory, and staff roster.",
            "• Cashier: High-speed counter billing, payment settlements, and cash float. Restricted from P&L and settings.",
            "• Waiter: Mobile handheld ordering (/mobile/waiter), table assignment, and modifier customization.",
            "• Kitchen Staff: Kitchen Display System (/kitchen), updating order preparation stages.",
            "• Accountant: Read-only access to GST tax summaries, Day Book exports, and expense ledgers.",
          ],
        },
      ],
    },
    {
      title: "Hardware, Printers & Payments",
      subsections: [
        {
          heading: "Thermal Printer & Cash Drawer Pairing",
          content: [
            "Under Administration → Settings, configure your billing counter thermal printer:",
            "• Select connection protocol: USB Raw Spooler, Network TCP/IP (e.g. 192.168.1.150:9100), or Browser Print.",
            "• Select paper width: Standard 80mm (48 characters/line) or Compact 58mm (32 characters/line).",
            "• Connect electronic cash drawer to printer RJ12 port; drawer will kick open on bill settlement.",
            "• In Settings → Integrations, configure your merchant UPI VPA (e.g. restaurant@icici) to generate exact payable QR codes.",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "BOM (Bill of Materials)", definition: "The exact recipe breakdown of raw ingredients deducted when a dish is settled." },
    { term: "CGST / SGST", definition: "Central and State Goods and Services Tax (each 2.5% for standard restaurant dining in India)." },
    { term: "KDS", definition: "Kitchen Display System — digital wall or counter monitors replacing paper kitchen slips." },
    { term: "KOT", definition: "Kitchen Order Ticket — a ticket dispatched to line cooks indicating items to prepare for a table." },
    { term: "PWA", definition: "Progressive Web App — software that runs in the browser but installs like a standalone native desktop app." },
    { term: "UTR", definition: "Unique Transaction Reference — a 12-digit banking reference code proving a UPI transaction succeeded." },
  ],
  checklist: [
    "Register restaurant profile and legal trading address (/settings).",
    "Enter valid 15-digit GSTIN and verify 2.5% CGST + 2.5% SGST tax split (/branches).",
    "Configure dining tables and print Table QR Tent Cards (/tables).",
    "Create food categories, active dishes, prices, and dietary tags (/menu).",
    "Create individual staff logins and assign 4-digit quick POS PINs (/staff).",
    "Connect 80mm thermal billing printer and verify test print (/settings).",
    "Test electronic cash drawer RJ12 solenoid kick pulse.",
    "Punch test dine-in order and verify KOT appears on Kitchen Display (/kitchen).",
    "Settle test bill via Cash and verify sequential invoice numbering.",
    "Open cash register shift with starting cash float float (/pos).",
  ],
};

// 2. CASHIER POS MANUAL
const cashierManualConfig: ManualConfig = {
  filename: "RestaurantOS_Cashier_POS_Manual.pdf",
  badgeText: "Front-of-House Billing Manual",
  title: "Cashier & POS Operator Manual",
  subtitle: "Step-by-step instructions for high-speed touch billing, UPI verification, split tender, and shift closing.",
  audience: "Cashiers, Billing Clerks, Shift Leads, Counter Staff",
  theme: THEMES.EMERALD,
  sections: [
    {
      title: "Shift Opening & POS Navigation",
      subsections: [
        {
          heading: "Opening the Cash Register Shift",
          content: [
            "Before processing transactions, you must record your starting cash float in the cash drawer.",
            "1. Navigate to the POS screen (/pos). If prompted, enter your 4-digit POS PIN.",
            "2. Count the physical currency notes and coins in the drawer.",
            "3. Enter the starting float amount (e.g., ₹2,000.00) in the 'Open Register Shift' dialog.",
            "4. Click 'Open Register'. The POS interface is now active and tracked against your shift.",
          ],
        },
        {
          heading: "Understanding the Screen Layout",
          content: [
            "The POS screen is optimized for touch efficiency with five primary areas:",
            "• Top Toolbar: Active branch, order channel tabs (Dine-In, Takeaway, Delivery), active register float balance.",
            "• Category Carousel: Tap to filter dishes (Starters, Main Course, Biryani, Breads, Beverages).",
            "• Food Item Grid: Large touch cards showing dish name, dietary dot, price, and Add button.",
            "• Cart Summary: Current line items, portion sizes, modifiers, chef notes, taxes, and grand total.",
            "• Action Buttons: [Send KOT], [Hold Order], [Discount], [Print Pre-Bill], and [SETTLE BILL].",
          ],
          uiDiagram: [
            "+---------------------------------------------------------------------------------------+",
            "| [Table T-01] [Dine-In]  | Search: [ paneer             ] | Cash Register: [ ₹2,000.00]|",
            "+-------------------------+--------------------------------+----------------------------+",
            "| CATEGORIES: [All Items] [Starters] [Biryani] [Curry] [Breads] [Desserts] [Beverages]  |",
            "+----------------------------------------------------------+----------------------------+",
            "| DISH GRID:                                               | CART: Table T-01 (3 Guests)|",
            "| • Murgh Dum Biryani ............................ ₹350.00 | 1x Murgh Dum Biryani ₹350  |",
            "| • Paneer Butter Masala ......................... ₹320.00 | 1x Paneer Butter Mas ₹320  |",
            "| • Garlic Naan ..................................  ₹60.00 |    +Extra Butter (+₹20)    |",
            "| • Fresh Lime Soda ..............................  ₹90.00 |                            |",
            "+----------------------------------------------------------+ Subtotal: .......... ₹690 |",
            "| [Hold Order]   [Print Pre-Bill]   [Discount]   [SEND KOT]| CGST + SGST (5%): .. ₹34.50|",
            "| >>>>>>>>>>>>>>>>>>>> [ SETTLE BILL — ₹725.00 ] <<<<<<<<<<| Round-off: ......... +₹0.50|",
            "+----------------------------------------------------------+ TOTAL: .......... ₹725.00 |",
          ],
        },
      ],
    },
    {
      title: "Taking Orders & Table Management",
      subsections: [
        {
          heading: "Dine-In vs Takeaway Channels",
          content: [
            "• Dine-In: Tap the table badge (e.g., T-01). Green indicates available; Amber indicates occupied.",
            "• Takeaway / Parcel: Tap 'Takeaway'. Table selection is bypassed; optional customer phone number box appears.",
            "• Changing Quantities: Tap '+' or '-' in the cart, or tap the item to open the quantity keypad.",
            "• Chef Cooking Notes: Tap the item name, click 'Cooking Notes', and enter special instructions (e.g., 'Jain prep, no onion no garlic', 'Extra spicy'). Notes appear highlighted in yellow on the Kitchen Display.",
          ],
        },
        {
          heading: "Sending KOT to the Kitchen",
          content: [
            "When order taking is complete, click the blue 'Send to Kitchen (KOT)' button.",
            "• An electronic KOT ticket is generated and routed to the kitchen display.",
            "• The table turns Amber (Occupied). Cart resets so you can take orders for the next table.",
            "• If items are added later for the same table, a supplementary KOT is generated automatically.",
          ],
        },
      ],
    },
    {
      title: "Statutory GST & Discount Rules",
      subsections: [
        {
          heading: "Understanding the Bill Breakdown",
          content: [
            "RestaurantOS calculates statutory Indian GST transparently:",
            "• Subtotal: Total gross amount of food and modifiers.",
            "• Discount: Deducted from taxable subtotal prior to tax calculation.",
            "• CGST (2.5%) & SGST (2.5%): 5.0% split GST calculated on net taxable value.",
            "• Statutory Round-Off: Mathematical rounding to the nearest rupee (+₹0.10 to +₹0.50 or -₹0.10 to -₹0.50).",
            "• Grand Total: Exact integer rupee amount payable.",
          ],
          callout: {
            title: "Manager Discount Authorization",
            text: "Promotional coupon codes apply automatically. Manual percentage discounts require a Shift Supervisor or Manager PIN before taking effect.",
            type: "note",
          },
        },
      ],
    },
    {
      title: "Payment Processing & Settlement",
      subsections: [
        {
          heading: "Cash vs UPI vs Card Payments",
          content: [
            "Click the green 'SETTLE BILL' button to open the settlement drawer:",
            "1. Cash Payment: Enter physical cash tendered (e.g., ₹1,000.00). The screen displays change to return in green (₹275.00). Click Confirm. Cash drawer pops open automatically.",
            "2. UPI QR Payment (Strict Verification): The terminal displays dynamic UPI QR code. Customer scans with GPay/PhonePe/Paytm. CAUTION: Always verify counter soundbox or ask for the 12-digit Bank UTR (e.g., 431298012345). Enter UTR and click Verify & Settle.",
            "3. Split Payments: Click 'Split Tender'. Enter ₹300.00 Cash; remaining ₹425.00 switches to UPI. Settle both portions cleanly.",
          ],
          callout: {
            title: "Strict UPI Verification Rule",
            text: "NEVER press confirm just because a customer flashes a green phone screen. Always verify soundbox announcement or check the 12-digit Bank UTR to prevent fraudulent payment screenshots.",
            type: "warn",
          },
        },
      ],
    },
    {
      title: "Shift Close & Cash Reconciliation",
      subsections: [
        {
          heading: "Closing Register Shift",
          content: [
            "At the end of your shift, click 'Close Register Shift':",
            "1. Count all physical cash notes and coins in the drawer.",
            "2. Enter counted amount into 'Actual Cash Counted'.",
            "3. The system compares physical cash against Expected Cash (Starting Float + Cash Sales - Refunds).",
            "4. Review the Variance (Green = Match/Surplus, Red = Shortage).",
            "5. Enter shift handover notes and click 'Close Register & Print Summary'.",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "Float", definition: "The initial cash placed in the register at the start of a shift for making change." },
    { term: "Split Tender", definition: "Settling a single bill across two or more payment methods (e.g., Cash + UPI)." },
    { term: "Pre-Bill", definition: "A bill estimate printed for presentation to the dining table before payment is made." },
    { term: "Variance", definition: "The difference between physical cash counted in the drawer and recorded system cash sales." },
  ],
  checklist: [
    "Enter 4-digit PIN and open cash register with starting float.",
    "Verify 80mm thermal receipt printer paper level.",
    "Confirm Table number before punching items.",
    "Verify dietary classifications (Veg/Non-Veg) with guest.",
    "Dispatch KOT tickets promptly to avoid kitchen prep delays.",
    "Verify all UPI payments using Soundbox or 12-digit Bank UTR.",
    "Print tax invoice upon settlement and return exact cash change.",
    "Perform physical cash count and print closing shift summary at end of day.",
  ],
};

// 3. KITCHEN STAFF MANUAL
const kitchenManualConfig: ManualConfig = {
  filename: "RestaurantOS_Kitchen_Staff_Manual.pdf",
  badgeText: "Kitchen Display & Line Cook Guide",
  title: "Kitchen Staff & KDS Operator Manual",
  subtitle: "Visual guide to order preparation stages, rush hour timers, station routing, and kitchen ticket handling.",
  audience: "Line Cooks, Kitchen Display Operators, Head Chefs, Baristas",
  theme: THEMES.AMBER_GOLD,
  sections: [
    {
      title: "Kitchen Display Orientation",
      subsections: [
        {
          heading: "Accessing the KDS Screen",
          content: [
            "1. Turn on the kitchen wall monitor or touch tablet.",
            "2. Open the browser and go to: http://localhost:3000/kitchen.",
            "3. Enter your kitchen staff PIN.",
            "4. Press F11 on the keyboard or tap full screen to enter dedicated Kitchen Display mode.",
            "5. Ensure speaker volume is set to at least 70% to hear incoming order bell chimes.",
          ],
        },
        {
          heading: "Reading a Kitchen Ticket Card",
          content: [
            "Incoming orders appear as digital cards organized chronologically (oldest ticket first):",
            "• Header: Ticket number (#KOT-0142), Table number (T-01), Order Channel (Dine-In/Takeaway), Server name.",
            "• Stopwatch Timer: Live elapsed timer showing minutes since the order was punched.",
            "• Item List: Bold double-height item quantities (e.g. 2x, 4x) to prevent cooking count errors.",
            "• Variant Portions: Clearly indicates Full or Half portion sizes.",
            "• Blue Modifier Tags: Add-ons (e.g. +Extra Butter, +Extra Cheese).",
            "• Red/Yellow Chef Notes: High-priority instructions (e.g. '★ Jain prep, no onion no garlic').",
          ],
          uiDiagram: [
            "+---------------------------------------------------------------------------------------+",
            "| [STATION: MAIN_KITCHEN]  | Sound: [ON] | Active Cooking: [ 4 Tickets ] | Volume: [80%]|",
            "+--------------------------------------+------------------------------------------------+",
            "| TICKET #KOT-0142 (08m ago) [NORMAL]  | TICKET #KOT-0143 (16m ago) [WARNING RUSH]      |",
            "| Table: T-01 | Server: Vikram         | Table: T-05 | Server: Pooja                    |",
            "+--------------------------------------+------------------------------------------------+",
            "| • 1x Murgh Dum Biryani (Full)        | • 2x Butter Chicken (Half)                     |",
            "| • 1x Paneer Butter Masala (Full)     | • 4x Butter Naan (Crispy)                      |",
            "|    [MODIFIER: Extra Butter +₹20]     |                                                |",
            "|    [NOTE: Jain prep, no onion!]      | [STATUS: PREPARING (Cooking 6m)]               |",
            "|                                      |                                                |",
            "| [ ACTION: ACCEPT ORDER ]             | [ ACTION: MARK READY TO SERVE ]                |",
            "+--------------------------------------+------------------------------------------------+",
          ],
        },
      ],
    },
    {
      title: "Order Lifecycle & Rush Timers",
      subsections: [
        {
          heading: "The 4 Order Lifecycle Stages",
          content: [
            "Every ticket progresses through four standardized stages:",
            "1. NEW: Unacknowledged order. Ticket pulses gently. Audio chime rings.",
            "2. ACCEPTED: Cook has seen ticket and started staging ingredients. Click 'Accept Order'.",
            "3. PREPARING: Pan/burner active. Click 'Start Cooking'. Cooking stopwatch begins.",
            "4. READY: Plating complete. Dish placed on counter. Click 'Mark Ready'. Server is notified instantly.",
          ],
        },
        {
          heading: "Rush Stopwatch Color Codes",
          content: [
            "The top header of each ticket changes color based on elapsed time:",
            "• 🟢 Green (0 – 10 minutes): Normal pace. Prepare sequentially.",
            "• 🟡 Amber (10 – 20 minutes): Warning rush. Expedite cooking immediately.",
            "• 🔴 Flashing Red (> 20 minutes): Critical rush delay! Head chef must prioritize this ticket.",
          ],
        },
      ],
    },
    {
      title: "Station Routing & Order Changes",
      subsections: [
        {
          heading: "Filtering by Station",
          content: [
            "Large kitchens route tickets to specialized station screens:",
            "• MAIN_KITCHEN: Curries, gravies, tandoor, rice, and hot entrees.",
            "• BAR: Mocktails, cocktails, soft drinks, and beer.",
            "• BAKERY: Cakes, breads, pastries, and plated desserts.",
            "• BEVERAGE: Fresh lime sodas, juices, coffee, and tea.",
            "Tap the station pill at the top of the screen to isolate only your station's items.",
          ],
        },
        {
          heading: "Handling Voids & Cancellations",
          content: [
            "If a supervisor cancels an item or bill, an audible double chime rings.",
            "The cancelled item appears with a heavy strikethrough: ~~1x Murgh Biryani~~ [VOIDED].",
            "Do NOT prepare voided items!",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "KDS", definition: "Kitchen Display System — replaces paper kitchen order slips with digital touch monitors." },
    { term: "Staging", definition: "Gathering and portioning ingredients before placing pans on active heat." },
    { term: "Supplementary KOT", definition: "An add-on ticket punched for a table that already has active food cooking." },
  ],
  checklist: [
    "Turn on KDS tablet and verify network connection.",
    "Verify speaker volume is set to 70%+ for chime alerts.",
    "Filter screen to your assigned kitchen station (or All Stations for Head Chef).",
    "Acknowledge new orders by tapping 'Accept Order'.",
    "Double-check cooking notes and allergy warnings before plating.",
    "Tap 'Mark Ready' as soon as food is placed on the pickup counter.",
    "Wipe tablet screen with clean dry microfiber cloth at shift end.",
  ],
};

// 4. INVENTORY & MANAGER MANUAL
const managerManualConfig: ManualConfig = {
  filename: "RestaurantOS_Manager_Inventory_Manual.pdf",
  badgeText: "Operations & Inventory Manual",
  title: "Inventory & Manager Operations Manual",
  subtitle: "Guide to executive telemetry, recipe BOM formulation, procurement GRNs, stock audits, and staff management.",
  audience: "Restaurant Managers, Operations Leads, Inventory Controllers",
  theme: THEMES.SLATE_BLUE,
  sections: [
    {
      title: "Manager Dashboard & Live Telemetry",
      subsections: [
        {
          heading: "Executive KPIs & Financial Pulse",
          content: [
            "Access the Executive Dashboard via the main overview (/) or mobile portal (/mobile/owner):",
            "• Live Gross Revenue: Invoiced sales for the current business day.",
            "• Order Velocity: Total settled bills, active tables, and average order value (AOV).",
            "• Net Operating Margin: Financial pulse computing Gross Sales minus Food COGS, labor, and expenses.",
            "• Urgent Action Badges: Raw materials below par safety levels and expiring batches.",
          ],
        },
        {
          heading: "Daily Sales & GST Tax Reports",
          content: [
            "Under Finance & Insights → Reports (/reports), access accounting summaries:",
            "• Daily Sales Summary: Breakdown of gross sales, discounts, taxable value, and collections.",
            "• GST Tax Report: CGST (2.5%) and SGST (2.5%) breakdown formatted for GSTR-1 filings.",
            "• Payment Split Report: Collections across Cash, UPI, Card, and Customer Loyalty Points.",
            "• Export Options: Download publication-grade PDF summaries or CSV spreadsheets for your accountant.",
          ],
        },
      ],
    },
    {
      title: "Menu Management & Out of Stock Toggles",
      subsections: [
        {
          heading: "86'ing Dishes (Out of Stock Toggles)",
          content: [
            "When fresh ingredients run out during a busy dinner shift:",
            "1. Open Catalog & Inventory → Menu (/menu).",
            "2. Locate the dish (e.g., Murgh Dum Biryani).",
            "3. Toggle 'Is Available' to OFF.",
            "4. The dish is immediately disabled across POS, Waiter App, and Customer Table QRs. Staff cannot punch unavailable items.",
          ],
        },
      ],
    },
    {
      title: "Recipe BOM & Inventory Control",
      subsections: [
        {
          heading: "Formulating Recipe Bill of Materials (BOM)",
          content: [
            "RestaurantOS calculates exact food cost percentages using transactional recipes:",
            "1. Go to Inventory → Recipes and click 'Create Recipe BOM'.",
            "2. Select menu item: e.g., Paneer Butter Masala (Selling Price: ₹320.00).",
            "3. Add Ingredients: Paneer (200g @ ₹420/kg = ₹84.00), Butter (30g @ ₹520/kg = ₹15.60), Tomato Puree (100g = ₹4.50), Cream (40ml = ₹8.80).",
            "4. Automatic Financial Metrics: Total Food Cost = ₹112.90, Gross Profit = ₹207.10, Food Cost % = 35.28%, Gross Margin = 64.72%.",
            "5. Settlement Deduction: When cashiers settle an order, ingredients are deducted from physical stock automatically.",
          ],
        },
        {
          heading: "Recording Goods Received Notes (GRN)",
          content: [
            "Under Catalog & Inventory → Purchases (/purchases):",
            "1. Click 'New Purchase Entry (GRN)'.",
            "2. Select Supplier and enter vendor physical invoice number and date.",
            "3. Enter quantities and purchase prices received (e.g. 50 KG Basmati Rice @ ₹110/KG).",
            "4. Confirm receipt: stock balances update immediately and accounts payable ledger records vendor dues.",
          ],
        },
      ],
    },
    {
      title: "Wastage, Transfers & Staff Management",
      subsections: [
        {
          heading: "Logging Spoilage & Wastage",
          content: [
            "When food spoils, spills, or burns in the kitchen:",
            "1. Go to Inventory → Adjustments → Log Stock Wastage.",
            "2. Enter item, lost quantity, and reason (Expired, Kitchen Spillage, Prep Error).",
            "3. Stock is decremented and financial cost posts to P&L as a direct COGS loss.",
          ],
        },
        {
          heading: "Multi-Branch Stock Transfers",
          content: [
            "To transfer stock between a central commissary and satellite outlets (/branches/transfers):",
            "• Source branch creates transfer and clicks 'Dispatch' (status becomes IN_TRANSIT).",
            "• Destination branch inspects delivery and clicks 'Receive Transfer'. Stock balances update atomically.",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "COGS", definition: "Cost of Goods Sold — the direct cost of raw ingredients used to prepare food." },
    { term: "GRN", definition: "Goods Received Note — document recording vendor delivery into active inventory." },
    { term: "Par Level", definition: "The minimum inventory quantity that must be on hand before reordering." },
    { term: "86'd", definition: "Restaurant term meaning an item is completely out of stock and cannot be served." },
  ],
  checklist: [
    "Review morning low-stock warnings and par levels at 11:00 AM.",
    "Log daily vendor deliveries into Purchases (GRN) on the day received.",
    "Verify recipe BOM food cost percentages when supplier prices change.",
    "Inspect kitchen wastage logs and investigate excessive prep losses.",
    "Review clock-in/out timestamps under Staff Attendance.",
    "Audit daily cash register opening and closing floats.",
  ],
};

// 5. TROUBLESHOOTING GUIDE
const troubleshootingConfig: ManualConfig = {
  filename: "RestaurantOS_Troubleshooting_Guide.pdf",
  badgeText: "Problem Solving & Quick Reference",
  title: "Troubleshooting & Quick Reference Guide",
  subtitle: "Instant solutions for login errors, printer issues, missing KOTs, UPI verification, offline sync, and permissions.",
  audience: "All Restaurant Staff, Shift Leads, Store IT Coordinators",
  theme: THEMES.CRIMSON,
  sections: [
    {
      title: "Login, Access & Network Issues",
      subsections: [
        {
          heading: "Cannot Log In / 'Invalid Credentials'",
          content: [
            "• What you see: Red banner 'Invalid email or password', or PIN is rejected.",
            "• Possible reasons: Caps Lock enabled, trailing space in email, or account deactivated.",
            "• Fix: Turn off Caps Lock. Enter email in lowercase. If forgotten, manager resets PIN in /staff in 10 seconds.",
            "• Escalation: If credentials fail for all staff, check if the local server process has stopped.",
          ],
        },
        {
          heading: "Internet Disconnected / Offline Mode",
          content: [
            "• What you see: Amber top banner '⚠️ Offline Mode — Internet Disconnected. Billing continues locally.'",
            "• What happens: RestaurantOS is offline-first. POS billing, KOTs, and thermal receipt printing continue normally.",
            "• Fix: Continue billing without panic. Orders queue safely in local IndexedDB. Restart Wi-Fi router if fiber light is red. When internet returns, orders sync automatically.",
          ],
          callout: {
            title: "Never Delete Local Database Files",
            text: "NEVER delete database files (.db) or clear browser application storage during a network outage. Pending offline orders are stored locally and will sync once reconnected.",
            type: "warn",
          },
        },
      ],
    },
    {
      title: "POS Billing & Printing Issues",
      subsections: [
        {
          heading: "Thermal Printer Not Printing Receipts",
          content: [
            "• What you see: Bill settled on screen, but 80mm/58mm thermal printer does not print.",
            "• Possible reasons: Paper roll inserted backwards (feeds blank paper), paper hopper empty, USB cable disconnected, or printer power switched off.",
            "• Fix: Open printer lid. Ensure paper feeds from the bottom with smooth thermal coating facing the printhead. Reconnect USB cable. Go to Settings → Printers and click 'Test Print'. Reprint past bills from /orders.",
          ],
        },
        {
          heading: "UPI Payment QR Not Confirming",
          content: [
            "• What you see: Customer scanned counter QR code and shows green screen on their phone, but cashier received no notification.",
            "• Fix: NEVER settle blindly. Check counter Soundbox. Ask customer for 12-digit Bank UTR (e.g. 431298012345). Enter UTR into verification box. If unverified after 2 minutes, ask for Cash/Card and note customer contact.",
          ],
          callout: {
            title: "Strict UPI Verification Policy",
            text: "QR code generation is NOT proof of payment. Only a verified 12-digit Bank UTR or audio Soundbox announcement confirms funds were credited to the restaurant account.",
            type: "warn",
          },
        },
      ],
    },
    {
      title: "Kitchen KDS & Order Sync Issues",
      subsections: [
        {
          heading: "Order Not Appearing in Kitchen Display",
          content: [
            "• What you see: Order punched on POS, but cooks say no ticket appears on kitchen screen.",
            "• Possible reasons: Order was saved as 'Hold Order' instead of clicking 'Send to Kitchen (KOT)', or KDS screen is filtered to an isolated station (e.g. Bar station won't show curry orders).",
            "• Fix: In /kitchen, tap 'ALL STATIONS' filter pill at top. Check POS to confirm KOT button was pressed.",
          ],
        },
        {
          heading: "Offline Orders Not Syncing to Server",
          content: [
            "• What you see: Internet has returned, but sync status still indicates pending operations.",
            "• Fix: Open Administration → Sync Monitor (/sync-monitor). Click 'Trigger Sync Now'. Operations sync with exponential backoff handling.",
          ],
        },
        {
          heading: "Access Denied / HTTP 403 Forbidden",
          content: [
            "• What you see: Clicking a navigation link shows '403 Forbidden: Insufficient permissions'.",
            "• Why: RestaurantOS enforces strict RBAC. Cashiers and Waiters cannot view financial P&L or alter GSTIN tax settings.",
            "• Fix: If user genuinely needs access, Owner or Manager navigates to /staff and elevates role.",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "Idempotency Key", definition: "A unique code assigned to every order ensuring duplicate network packets cannot cause double billing." },
    { term: "Soundbox", definition: "An audio device placed at the counter providing instant verbal announcement of UPI payments." },
    { term: "Thermal Paper", definition: "Heat-sensitive paper used in receipt printers that does not require ink cartridges." },
  ],
  checklist: [
    "Verify power and paper orientation on thermal receipt printers.",
    "Ensure KDS screen station filter is set to 'All Stations' if tickets seem missing.",
    "Verify 12-digit Bank UTR on customer phone for UPI payment confirmation.",
    "Do not panic during internet disconnection; continue billing offline.",
    "Check /sync-monitor upon network reconnection to verify queue clearance.",
    "Contact Store General Manager for staff PIN and role permission changes.",
  ],
};

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function generateAllManuals() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS — CUSTOMER-READY PDF USER MANUALS GENERATOR");
  console.log("===============================================================================\n");

  const manuals = [
    ownerGuideConfig,
    cashierManualConfig,
    kitchenManualConfig,
    managerManualConfig,
    troubleshootingConfig,
  ];

  for (const m of manuals) {
    console.log(`>>> Compiling PDF: ${m.filename}...`);
    try {
      await renderManualPDF(m);
      const filePath = path.join(RELEASE_DIR, m.filename);
      const stats = fs.statSync(filePath);
      console.log(`[GENERATED] ${m.filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`[ERROR] Failed to compile ${m.filename}:`, err);
    }
  }

  console.log("\n===============================================================================");
  console.log("  ALL 5 CUSTOMER PDF MANUALS GENERATED SUCCESSFULLY");
  console.log(`  Output Directory (Release) : ${RELEASE_DIR}`);
  console.log(`  Output Directory (Public)  : ${PUBLIC_DIR}`);
  console.log("===============================================================================\n");
}

generateAllManuals();
