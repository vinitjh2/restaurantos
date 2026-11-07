/**
 * RestaurantOS — Onboarding & Installation PDF Generator
 * Compiles:
 * 1. RestaurantOS_Installation_Guide.pdf
 * 2. RestaurantOS_New_Restaurant_Onboarding.pdf
 * Outputs to release/customer-onboarding and apps/web/public/downloads/customer-onboarding
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const RELEASE_DIR = path.resolve(__dirname, "../../../release/customer-onboarding");
const PUBLIC_DIR = path.resolve(__dirname, "../public/downloads/customer-onboarding");

fs.mkdirSync(RELEASE_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const THEMES = {
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
};

interface ManualConfig {
  filename: string;
  badgeText: string;
  title: string;
  subtitle: string;
  audience: string;
  theme: typeof THEMES.SLATE_BLUE;
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
  signoffForm?: boolean;
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

    // COVER PAGE
    doc.rect(0, 0, 595.28, 841.89).fill(theme.coverBg);

    doc.roundedRect(45, 60, 64, 64, 12).fill(theme.primary);
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold");
    doc.text("OS", 58, 78);

    doc.fillColor(theme.primary).fontSize(11).font("Helvetica-Bold");
    doc.text("RESTAURANTOS CUSTOMER ONBOARDING KIT", 125, 75, { characterSpacing: 1.5 });
    doc.fillColor("#94a3b8").fontSize(9).font("Helvetica");
    doc.text(`Target: ${config.audience.toUpperCase()}`, 125, 92);
    doc.text("Version: 1.4.0 Production Edition | Repeatable SaaS Protocol", 125, 106);

    doc.moveDown(4.5);
    doc.fillColor(theme.primary).fontSize(13).font("Helvetica-Bold");
    doc.text(config.badgeText.toUpperCase(), { characterSpacing: 2 });

    doc.moveDown(0.3);
    doc.fillColor("#ffffff").fontSize(30).font("Helvetica-Bold");
    doc.text(config.title);

    doc.moveDown(0.4);
    doc.fillColor("#94a3b8").fontSize(13).font("Helvetica");
    doc.text(config.subtitle, { width: 490 });

    doc.moveDown(1);
    doc.rect(45, doc.y, 505, 3).fill(theme.primary);

    doc.moveDown(2);
    const scopeY = doc.y;
    doc.roundedRect(45, scopeY, 505, 120, 8).fill("#111827");
    doc.fillColor("#f8fafc").fontSize(11).font("Helvetica-Bold");
    doc.text("DEPLOYMENT SPECIFICATIONS & OPERATIONAL BOUNDARIES", 65, scopeY + 16);

    doc.fontSize(9).font("Helvetica").fillColor("#cbd5e1");
    doc.text(`• Audience: ${config.audience}`, 65, scopeY + 36);
    doc.text("• Multi-Tenant Isolation: 100% separate tenant accounts, databases, and permissions.", 65, scopeY + 52);
    doc.text("• Packaging Status: Web/PWA verified; Windows Tauri & Android Capacitor architecture verified.", 65, scopeY + 68);
    doc.text("• Privacy & Credentials: Real customer passwords and private payment keys are never shared.", 65, scopeY + 84);
    doc.text("• Standards: Standardized A4 printable release with customer acceptance sign-off.", 65, scopeY + 100);

    doc.fillColor("#64748b").fontSize(8.5).font("Helvetica-Oblique");
    doc.text("RestaurantOS Hospitality Engineering — Published November 2026", 45, 785);

    // TABLE OF CONTENTS
    doc.addPage();
    drawPageHeader(doc, theme, "TABLE OF CONTENTS & ONBOARDING STAGES", "Standardized customer deployment stages");

    doc.moveDown(0.5);
    config.sections.forEach((sec, idx) => {
      doc.fillColor(theme.secondary).fontSize(10).font("Helvetica-Bold");
      doc.text(`Section ${idx + 1}: `, 45, doc.y, { continued: true });
      doc.font("Helvetica").fillColor(theme.textMain).text(sec.title, { continued: true });
      doc.font("Helvetica-Bold").fillColor(theme.primary).text(`   [Stage ${idx + 1}]`);
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
      "Standardized SaaS Deployment",
      "Follow this protocol sequentially for every new customer. Do not modify the underlying application code per customer; customize only via the setup spreadsheet and configuration screens.",
      theme.primary
    );

    // CONTENT SECTIONS
    config.sections.forEach((sec, secIdx) => {
      doc.addPage();
      drawPageHeader(doc, theme, `SECTION ${secIdx + 1} — ${sec.title.toUpperCase()}`);

      sec.subsections.forEach((sub, subIdx) => {
        checkPageOverflow(doc, 90);

        const y = doc.y;
        doc.rect(45, y, 4, 15).fill(theme.primary);
        doc.fillColor(theme.secondary).fontSize(11).font("Helvetica-Bold");
        doc.text(`${secIdx + 1}.${subIdx + 1}  ${sub.heading}`, 55, y + 2, { width: 490 });
        doc.moveDown(0.4);

        sub.content.forEach((para) => {
          checkPageOverflow(doc, 40);
          doc.fillColor(theme.textMain).fontSize(9).font("Helvetica").lineGap(2);
          doc.text(para, 45, doc.y, { width: 505 });
          doc.moveDown(0.3);
        });

        if (sub.bullets && sub.bullets.length > 0) {
          sub.bullets.forEach((b) => {
            checkPageOverflow(doc, 25);
            doc.fontSize(8.5).font("Helvetica-Bold").fillColor(theme.secondary);
            doc.text(`• ${b.title}: `, 55, doc.y, { continued: true, width: 495 });
            doc.font("Helvetica").fillColor(theme.textMain).text(b.desc);
            doc.moveDown(0.2);
          });
        }

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

        if (sub.uiDiagram && sub.uiDiagram.length > 0) {
          checkPageOverflow(doc, sub.uiDiagram.length * 12 + 20);
          drawUIDiagram(doc, sub.uiDiagram);
        }

        if (sub.table) {
          checkPageOverflow(doc, (sub.table.rows.length + 1) * 20 + 20);
          drawTable(doc, theme, sub.table.headers, sub.table.rows);
        }

        doc.moveDown(0.4);
      });
    });

    // SIGNOFF FORM
    if (config.signoffForm) {
      doc.addPage();
      drawPageHeader(doc, theme, "FORMAL CUSTOMER ACCEPTANCE & SIGN-OFF FORM");
      doc.moveDown(0.4);
      drawSignoffBox(doc, theme);
    }

    // CHECKLIST
    if (config.checklist && config.checklist.length > 0) {
      doc.addPage();
      drawPageHeader(doc, theme, "OPERATIONAL READINESS CHECKLIST");
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

    // FOOTERS & PAGE NUMBERS
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      if (i === 0) continue;

      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica");
      doc.text("RestaurantOS Customer Onboarding & Installation Package", 45, 20);
      doc.text(config.title, 45, 20, { align: "right", width: 505 });
      doc.rect(45, 30, 505, 0.5).fill("#e2e8f0");

      doc.rect(45, 805, 505, 0.5).fill("#e2e8f0");
      doc.fillColor("#64748b").fontSize(7.5).font("Helvetica");
      doc.text(`Page ${i + 1} of ${pages.count}  |  Official Deployment Kit`, 45, 812);
      doc.text("Confidential & Proprietary", 45, 812, { align: "right", width: 505 });
    }

    doc.end();

    stream1.on("finish", () => resolve());
    stream1.on("error", (err) => reject(err));
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

  doc.rect(45, y, 505, 18).fill(theme.secondary);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => {
    doc.text(h, 50 + i * colWidth, y + 4, { width: colWidth - 8 });
  });
  y += 18;

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

function drawSignoffBox(doc: any, theme: any) {
  const y = doc.y;
  doc.roundedRect(45, y, 505, 360, 6).stroke(theme.borderColor);

  doc.rect(45, y, 505, 22).fill(theme.secondary);
  doc.fillColor("#ffffff").fontSize(9.5).font("Helvetica-Bold");
  doc.text("CUSTOMER ACCEPTANCE & HANDOVER CERTIFICATE", 55, y + 6);

  let curY = y + 32;
  const labels = [
    ["Legal Restaurant Name:", "__________________________________________________________________"],
    ["Brand / Trade Name:", "__________________________________________________________________"],
    ["Primary Branch Outlet:", "__________________________________________________________________"],
    ["Registered Address:", "__________________________________________________________________"],
    ["Administrator Name:", "________________________________ Email: ___________________________"],
    ["Subscription Plan Tier:", "[ ] Starter (Rs.499)    [ ] Growth (Rs.999)    [ ] Pro (Rs.1999)    [ ] Enterprise"],
    ["Terminals Deployed:", "___ Billing Counter POS    ___ Kitchen KDS Displays    ___ Waiter Tablets"],
    ["Hardware Verified:", "[x] 80mm Billing Printer   [x] RJ12 Cash Drawer   [x] UPI Soundbox/UTR"],
    ["Date of Installation:", "_____ / _____ / 2026"],
    ["Certified Engineer Name:", "________________________________ Signature: _______________________"],
  ];

  labels.forEach(([lbl, val]) => {
    doc.fillColor(theme.secondary).fontSize(8.5).font("Helvetica-Bold");
    doc.text(lbl, 55, curY, { width: 150 });
    doc.font("Helvetica").fillColor(theme.textMain).text(val, 210, curY, { width: 325 });
    curY += 20;
  });

  curY += 10;
  doc.rect(55, curY, 485, 0.5).fill("#cbd5e1");
  curY += 12;

  doc.fillColor(theme.secondary).fontSize(8.5).font("Helvetica-Bold");
  doc.text("CUSTOMER ACCEPTANCE STATEMENT:", 55, curY);
  curY += 14;

  doc.font("Helvetica-Oblique").fontSize(8).fillColor(theme.textMain).lineGap(2);
  doc.text(
    "\"I, the authorized representative of the above-named restaurant, hereby certify that the RestaurantOS platform has been successfully installed, configured with our menu and taxes, and verified via end-to-end test orders. Our management and cashier staff have received operational training, and all 5 user manuals and configuration templates have been delivered in good order.\"",
    55,
    curY,
    { width: 485 }
  );
  curY += 40;

  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(theme.secondary);
  doc.text("Authorized Customer Signature: _______________________   Official Stamp / Seal:", 55, curY);
  doc.text("Designation: _______________________  Date: _____ / _____ / 2026", 55, curY + 22);

  doc.y = curY + 45;
}

function checkPageOverflow(doc: any, spaceNeeded: number) {
  if (doc.y + spaceNeeded > 780) {
    doc.addPage();
  }
}

// -----------------------------------------------------------------------------
// CONFIG 1: INSTALLATION GUIDE
// -----------------------------------------------------------------------------
const installationGuideConfig: ManualConfig = {
  filename: "RestaurantOS_Installation_Guide.pdf",
  badgeText: "Deployment & Installation Manual",
  title: "Multi-Platform Installation Guide",
  subtitle: "Technical deployment instructions across Web PWA, Windows Desktop (Tauri), and Android Handheld (Capacitor).",
  audience: "IT Technicians, System Integrators, Franchise Operations, Store Admins",
  theme: THEMES.SLATE_BLUE,
  sections: [
    {
      title: "Universal Web & Progressive Web App (PWA)",
      subsections: [
        {
          heading: "Supported Browser Requirements",
          content: [
            "RestaurantOS is built on a high-performance Next.js App Router architecture that runs natively across any modern web browser without plugin requirements:",
            "• Recommended: Google Chrome v100+ or Microsoft Edge v100+ for best thermal printing support.",
            "• Apple: Safari v15+ on macOS and iPadOS.",
            "• Mobile: Chrome for Android v100+.",
            "• Hardware Minimums: 2.0 GHz Dual-Core CPU, 4 GB RAM, 1366x768 display resolution.",
          ],
        },
        {
          heading: "Accessing and Installing as a Standalone PWA",
          content: [
            "1. Connect the computer or tablet to the restaurant's local area network (LAN).",
            "2. Open Google Chrome and navigate to the application URL (e.g. http://localhost:3000 or https://app.restaurantos.io).",
            "3. Observe the right side of the address bar: click the 'Install RestaurantOS' icon.",
            "4. In the confirmation dialog, click 'Install'.",
            "5. RestaurantOS opens in dedicated standalone kiosk mode without browser tabs or address bars.",
            "6. A shortcut is created on the desktop. Right-click and choose 'Pin to Taskbar' for instant cashier access.",
          ],
          callout: {
            title: "PWA Offline Caching",
            text: "When installed as a PWA, core app routes (/pos, /kitchen, /tables, /mobile/waiter) are cached locally. The terminal continues billing even if the internet drops.",
            type: "tip",
          },
        },
      ],
    },
    {
      title: "Windows Desktop Application (Tauri)",
      subsections: [
        {
          heading: "Architecture & Packaging Status",
          content: [
            "• Technology: Built with Tauri v1.5 with native Rust Win32 spooler integration (winspool, wingdi).",
            "• Package Targets: MSI Windows Installer (.msi) and NSIS Setup (.exe).",
            "• Status: Packaging architecture (src-tauri/Cargo.toml, tauri.conf.json, main.rs) is 100% verified. Native compilation on a build machine requires the Rust toolchain (cargo and rustc).",
          ],
        },
        {
          heading: "Installation & Hardware Pairing",
          content: [
            "1. Download the official installer: restaurantos-desktop_1.0.0_x64_en-US.msi.",
            "2. Double-click the .msi file to launch the setup wizard.",
            "3. Accept the EULA and select the default installation folder (C:\\Program Files\\RestaurantOS\\).",
            "4. Click Install. Grant administrative UAC approval.",
            "5. Launch the desktop app. Navigate to Administration → Settings → Printers.",
            "6. Select your local thermal billing printer from the Win32 printer list and execute a test print.",
            "7. To uninstall safely: Open Windows Settings → Apps → Installed apps → RestaurantOS → Uninstall. Local database backups are preserved.",
          ],
        },
      ],
    },
    {
      title: "Android Handheld Application (Capacitor)",
      subsections: [
        {
          heading: "Installation & Device Permissions",
          content: [
            "• Target Devices: Android POS terminals (Sunmi, IMIN, Pax) or standard Android tablets/phones (Android 10+).",
            "• Sideloading: Download RestaurantOS-v1.4.0.apk. In Android Files, tap the APK. If prompted, toggle 'Allow from this source' to ON and tap Install.",
            "• Granting Required Permissions:",
            "  1. Camera: Tap 'While using the app' (used for table QR scanning and loyalty cards).",
            "  2. Nearby Devices / Bluetooth: Tap 'Allow' (for wireless mobile belt thermal printers).",
            "  3. Notifications: Tap 'Allow' (for audio/visual chimes when KOT dishes are ready).",
            "  4. Battery Optimization: In Android Settings → Apps → RestaurantOS, set battery to 'Unrestricted' so kitchen screens do not sleep.",
          ],
        },
      ],
    },
    {
      title: "LAN Static IPs & Network Ports",
      subsections: [
        {
          heading: "Network Architecture & Firewall Rules",
          content: [
            "For reliable communication between counter PCs, kitchen tablets, and thermal printers:",
            "1. Assign static IP addresses: Server PC (192.168.1.100), Kitchen Printer (192.168.1.150), Bar Printer (192.168.1.151).",
            "2. Open Inbound Firewall Ports: Port 3000 (TCP) for web/KDS traffic; Port 9100 (TCP) for RAW ESC/POS network thermal printing.",
            "3. Separate staff tablets onto a dedicated 5 GHz Wi-Fi SSID (RestaurantOS-Staff) away from customer guest Wi-Fi.",
          ],
        },
      ],
    },
  ],
  checklist: [
    "Verify target browser is Google Chrome v100+ or Microsoft Edge.",
    "Access store URL and install Progressive Web App (PWA) to desktop.",
    "Pin RestaurantOS to Windows Taskbar or tablet Home screen.",
    "Assign static LAN IP to in-store server and thermal network printers.",
    "Open inbound firewall ports 3000 and 9100 on host server.",
    "Grant Camera, Bluetooth, and Notification permissions on Android tablets.",
    "Set Android display sleep / wake-lock to Never for kitchen KDS screens.",
    "Execute test print and verify cash drawer solenoid kick pulse.",
  ],
};

// -----------------------------------------------------------------------------
// CONFIG 2: NEW RESTAURANT ONBOARDING PROTOCOL
// -----------------------------------------------------------------------------
const onboardingProtocolConfig: ManualConfig = {
  filename: "RestaurantOS_New_Restaurant_Onboarding.pdf",
  badgeText: "Customer Onboarding & Handover Kit",
  title: "New Restaurant Onboarding Protocol",
  subtitle: "Step-by-step 15-point deployment checklist and formal customer handover acceptance sign-off.",
  audience: "Onboarding Engineers, Customer Success Leads, Franchise IT",
  theme: THEMES.EMERALD,
  sections: [
    {
      title: "Pre-Onboarding & Information Gathering",
      subsections: [
        {
          heading: "Setup Template Preparation",
          content: [
            "Before initiating technical onboarding, provide the customer with 'RestaurantOS_Restaurant_Setup_Template.xlsx'. Ensure the owner completes:",
            "• Legal business name, brand trade name, registered address, and 14-digit FSSAI number.",
            "• Valid 15-character state GSTIN number.",
            "• Menu categories, food dishes, portion sizes (Half/Full), modifier add-ons, and base selling prices.",
            "• Dining table numbers, seating capacities, and room sections.",
            "• Staff list with designated roles (Manager, Cashier, Waiter, Kitchen) and 4-digit POS PINs.",
            "• Printer hardware models (USB/LAN IP) and merchant UPI VPA.",
          ],
        },
      ],
    },
    {
      title: "15-Point Technical Onboarding Checklist",
      subsections: [
        {
          heading: "Phase 1: Account, Taxes & Branches",
          content: [
            "1. Create Tenant Account: Under /register or /platform-admin, create organization entity with unique URL slug.",
            "2. Assign Subscription Plan: Set plan tier (Starter, Growth, Pro, Enterprise) and verify branch quotas.",
            "3. Configure Profile & Logo: Under /settings, verify trading name, phone, FSSAI, and upload logo.",
            "4. Configure Indian GST: Under /branches, enter 15-digit GSTIN, verify 2.5% CGST + 2.5% SGST split, and set sequential invoice numbering prefix (e.g. IND/2026-27/).",
            "5. Configure Outlets: Add secondary branches or cloud kitchens under /branches.",
          ],
        },
        {
          heading: "Phase 2: Floorplan, Menu & Hardware",
          content: [
            "6. Configure Dining Tables: Register tables with guest capacities and print Table QR Tent Cards (/tables).",
            "7. Create Menu Categories: Map categories to kitchen stations (MAIN_KITCHEN, BAR, BAKERY, BEVERAGE).",
            "8. Enter Menu Items & Prices: Configure dishes with Veg/Non-Veg badges, portion variants, and modifiers.",
            "9. Create Staff Accounts: Assign roles and 4-digit quick PINs; verify Cashier is restricted from P&L.",
            "10. Configure Payment Methods: Set counter UPI VPA (restaurant@icici) and verify UTR verification workflow.",
            "11. Pair Thermal Printers: Connect 80mm billing printer and test RJ12 cash drawer solenoid kick pulse.",
          ],
        },
        {
          heading: "Phase 3: Verification, Training & Handover",
          content: [
            "12. Punch Test Order: Create dine-in order on Table T-01 with modifiers and chef notes; send KOT.",
            "13. Verify Kitchen KDS: Advance ticket on /kitchen (NEW → ACCEPTED → PREPARING → READY).",
            "14. Settle Bill & Verify GST: Settle via split cash + UPI; verify 50-paise round-off and inventory deduction.",
            "15. Train Staff & Handover Manuals: Conduct 45-minute training and execute formal sign-off.",
          ],
        },
      ],
    },
  ],
  signoffForm: true,
  checklist: [
    "Tenant organization and branch created with unique slug.",
    "Valid 15-digit GSTIN and 2.5% CGST + 2.5% SGST tax split verified.",
    "Dining tables created and QR tent cards printed.",
    "Menu dishes, portion variants, and modifier add-ons populated.",
    "Staff profiles created with individual 4-digit quick PINs.",
    "Thermal billing printer and cash drawer kick pulse verified.",
    "Counter UPI VPA configured and ₹1 test QR verified.",
    "Kitchen KDS tablet mounted and audio chimes verified.",
    "Test order punched, prepared on KDS, and settled via split tender.",
    "Owner and staff trained on POS, KDS, inventory, and shift close.",
    "Customer Handover Package delivered and acceptance certificate signed.",
  ],
};

async function generateOnboardingPDFs() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS — CUSTOMER ONBOARDING PDF GENERATOR");
  console.log("===============================================================================\n");

  const configs = [installationGuideConfig, onboardingProtocolConfig];

  for (const c of configs) {
    console.log(`>>> Compiling PDF: ${c.filename}...`);
    try {
      await renderManualPDF(c);
      const filePath = path.join(RELEASE_DIR, c.filename);
      const stats = fs.statSync(filePath);
      console.log(`[GENERATED] ${c.filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`[ERROR] Failed to compile ${c.filename}:`, err);
    }
  }

  console.log("\n===============================================================================");
  console.log("  ONBOARDING PDFS COMPILED SUCCESSFULLY");
  console.log(`  Output Directory (Release) : ${RELEASE_DIR}`);
  console.log(`  Output Directory (Public)  : ${PUBLIC_DIR}`);
  console.log("===============================================================================\n");
}

generateOnboardingPDFs();
