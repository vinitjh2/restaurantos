/**
 * RestaurantOS Official User Manual & Tutorial PDF Generator
 * Uses PDFKit to produce a publication-grade, multi-page downloadable tutorial.
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT_PUBLIC_PATH = path.join(
  __dirname,
  '../public/downloads/RestaurantOS-User-Tutorial.pdf'
);
const OUTPUT_DOCS_PATH = path.join(
  __dirname,
  '../../../docs/RestaurantOS-User-Tutorial.pdf'
);

// Ensure directories exist
fs.mkdirSync(path.dirname(OUTPUT_PUBLIC_PATH), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_DOCS_PATH), { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStreamPublic = fs.createWriteStream(OUTPUT_PUBLIC_PATH);
const writeStreamDocs = fs.createWriteStream(OUTPUT_DOCS_PATH);

doc.pipe(writeStreamPublic);
doc.pipe(writeStreamDocs);

// Colors
const PRIMARY = '#ea580c'; // Orange-600
const PRIMARY_DARK = '#9a3412'; // Orange-800
const SECONDARY = '#0f172a'; // Slate-900
const TEXT_MAIN = '#1e293b'; // Slate-800
const TEXT_MUTED = '#64748b'; // Slate-500
const BG_CARD = '#f8fafc'; // Slate-50
const BORDER_COLOR = '#e2e8f0'; // Slate-200
const ACCENT_GREEN = '#15803d'; // Green-700
const ACCENT_RED = '#b91c1c'; // Red-700

// Helper functions
function drawHeader(title: string, subtitle?: string) {
  doc.rect(45, doc.y, 505, 30).fill(SECONDARY);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
  doc.text(title.toUpperCase(), 55, doc.y - 22, { width: 485 });
  doc.moveDown(0.8);
  if (subtitle) {
    doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica-Oblique');
    doc.text(subtitle);
    doc.moveDown(0.4);
  }
}

function drawSectionHeading(num: string, text: string) {
  doc.moveDown(0.6);
  const y = doc.y;
  doc.rect(45, y, 5, 18).fill(PRIMARY);
  doc.fillColor(SECONDARY).fontSize(13).font('Helvetica-Bold');
  doc.text(`${num}. ${text}`, 56, y + 2, { width: 480 });
  doc.moveDown(0.5);
}

function drawSubHeading(text: string) {
  doc.fillColor(PRIMARY_DARK).fontSize(10.5).font('Helvetica-Bold');
  doc.text(text);
  doc.moveDown(0.3);
}

function drawParagraph(text: string) {
  doc.fillColor(TEXT_MAIN).fontSize(9).font('Helvetica').lineGap(2);
  doc.text(text);
  doc.moveDown(0.4);
}

function drawBullet(title: string, desc: string) {
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(SECONDARY);
  doc.text(`• ${title}: `, { continued: true, lineGap: 1.5 });
  doc.font('Helvetica').fillColor(TEXT_MAIN).text(desc);
  doc.moveDown(0.2);
}

function drawCalloutBox(title: string, text: string, color = PRIMARY) {
  const y = doc.y;
  doc.roundedRect(45, y, 505, 42, 6).fillAndStroke(BG_CARD, BORDER_COLOR);
  doc.rect(45, y, 4, 42).fill(color);
  doc.fillColor(color).fontSize(8.5).font('Helvetica-Bold');
  doc.text(title.toUpperCase(), 55, y + 6);
  doc.fillColor(TEXT_MAIN).fontSize(8).font('Helvetica');
  doc.text(text, 55, y + 18, { width: 485 });
  doc.y = y + 48;
}

// =============================================================================
// COVER PAGE
// =============================================================================
doc.rect(0, 0, 595.28, 841.89).fill('#090d16'); // Dark luxury background

// Brand Badge
doc.rect(50, 80, 70, 70).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold');
doc.text('OS', 64, 100);

doc.moveDown(4);
doc.fillColor('#f97316').fontSize(14).font('Helvetica-Bold');
doc.text('OFFICIAL OPERATOR HANDBOOK & TUTORIAL', { characterSpacing: 2 });

doc.moveDown(0.5);
doc.fillColor('#ffffff').fontSize(34).font('Helvetica-Bold');
doc.text('RestaurantOS');

doc.moveDown(0.3);
doc.fillColor('#94a3b8').fontSize(14).font('Helvetica');
doc.text('Next-Generation Restaurant Management & Cloud POS System');

// Accent Line
doc.moveDown(1);
doc.rect(50, doc.y, 495, 3).fill(PRIMARY);
doc.moveDown(1.5);

doc.fillColor('#cbd5e1').fontSize(10.5).font('Helvetica').lineGap(4);
doc.text(
  'A complete operational walkthrough engineered for independent restaurants, cafes, fine dining establishments, bakeries, cloud kitchens, and multi-branch food chains.'
);

doc.moveDown(4);
// Specs Grid
doc.roundedRect(50, 480, 495, 180, 8).fill('#111827');
doc.fillColor('#f8fafc').fontSize(11).font('Helvetica-Bold');
doc.text('SYSTEM SPECIFICATIONS & COMPLIANCE', 70, 500);

doc.fontSize(9).font('Helvetica').fillColor('#94a3b8');
doc.text('• Version: 1.0 Production Edition', 70, 525);
doc.text('• Market Jurisdiction: India (Central & State GST 5.0% Compliant)', 70, 542);
doc.text('• Architecture: Offline-First Local Persistent Sync Engine', 70, 559);
doc.text('• Hardware Standard: ESC/POS 58mm & 80mm Thermal Printers / RJ12 Drawers', 70, 576);
doc.text('• Real-Time Display: Web Audio & Server-Sent Events / Socket.IO KDS', 70, 593);
doc.text('• Supported Terminals: Touch PC, Tablet (iPad / Android), Mobile Handhelds', 70, 610);
doc.text('• Central Database: PostgreSQL 16 Enterprise / SQLite Embedded Fallback', 70, 627);

doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748b');
doc.text('Issued by RestaurantOS Engineering & Hospitality Solutions Team — 2026', 50, 780);

// =============================================================================
// PAGE 2: TABLE OF CONTENTS & QUICK START
// =============================================================================
doc.addPage();
drawHeader('TABLE OF CONTENTS & SYSTEM OVERVIEW', 'Quick orientation of core software workflows');

doc.moveDown(0.5);
const toc = [
  { num: '1', title: 'System Architecture & Sidebar Navigation', page: '3' },
  { num: '2', title: 'Point of Sale (POS) Billing & Order Channels', page: '4' },
  { num: '3', title: 'Table Management, Modifiers & Bill Splitting', page: '5' },
  { num: '4', title: 'Kitchen Display System (KDS) & Multi-Station Routing', page: '6' },
  { num: '5', title: 'Recipe Management & BOM Stock Deduction', page: '7' },
  { num: '6', title: 'Procurement, Purchase Orders & Goods Received (GRN)', page: '8' },
  { num: '7', title: 'Customer CRM, Loyalty Points & Promotional Coupons', page: '9' },
  { num: '8', title: 'Staff Roles, Granular Permissions & 4-Digit PIN Security', page: '10' },
  { num: '9', title: 'Workforce Shift Scheduling, Attendance & Payroll', page: '11' },
  { num: '10', title: 'Cash Register Shifts, Float Reconciliation & Expenses', page: '12' },
  { num: '11', title: 'Multi-Branch Tenant Isolation & Stock Transfers', page: '13' },
  { num: '12', title: 'Offline-First Mode, Hardware Drivers & Daily Shift Close', page: '14' },
];

for (const item of toc) {
  doc.fillColor(SECONDARY).fontSize(9.5).font('Helvetica-Bold');
  doc.text(`Module ${item.num}: `, 50, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(TEXT_MAIN).text(item.title, { continued: true });
  doc.font('Helvetica-Bold').fillColor(PRIMARY).text(` ... Page ${item.page}`);
  doc.moveDown(0.3);
}

doc.moveDown(0.8);
drawCalloutBox(
  'Quick Launch Tip',
  'RestaurantOS runs directly in modern web browsers (Chrome, Edge, Safari). Bookmark http://localhost:3000/pos on cashier touchscreens for one-click access. On tablets, add the app to the home screen for an immersive fullscreen POS kiosk.',
  ACCENT_GREEN
);

// =============================================================================
// PAGE 3: MODULE 1 — ARCHITECTURE & NAVIGATION
// =============================================================================
doc.addPage();
drawHeader('MODULE 1 — SYSTEM NAVIGATION & EXECUTIVE DASHBOARD');

drawSectionHeading('1.1', 'Understanding the Global Interface Layout');
drawParagraph(
  'RestaurantOS features an enterprise SaaS layout divided into three persistent operational zones: the Left Navigation Sidebar, the Top Context Bar, and the Main Workspace.'
);

drawBullet('Left Navigation Sidebar', 'Direct access to all 16 modules (Dashboard, POS, Orders, Tables, Kitchen Display, Menu, Inventory, Purchases, Suppliers, Customers, Staff, Attendance, Expenses, Reports, Branches, Settings). Collapse to icon-only mode on smaller screens to maximize POS billing space.');
drawBullet('Top Context Bar', 'Shows active Restaurant Legal Entity, Branch Outlet Switcher (IND Indiranagar, KOR Koramangala, HSR Layout), Global Universal Search, Real-Time Online/Offline Indicator, and Operator Profile.');
drawBullet('Executive KPI Cards', 'At-a-glance financial intelligence tracking Today’s Gross Sales, Net Sales, Total Orders, Average Order Value (AOV), Pending Table Bills, Cancelled Items, Total Operational Expenses, and Estimated Net Profit.');

drawSectionHeading('1.2', 'Interactive Financial Charts & Sales Rush Tracking');
drawBullet('Sales by Hour Chart', 'Visualizes order volume across 24 hourly buckets. Critical for identifying Lunch Rush (12:30 PM - 3:30 PM) and Dinner Rush (7:30 PM - 11:00 PM) to allocate cook staff and table runners.');
drawBullet('Weekly & Monthly Revenue Trends', 'Recharts dual-line financial graph plotting daily revenue against rolling targets.');
drawBullet('Top Selling Dishes', 'Ranked list of best-selling menu items by revenue and quantity sold.');
drawBullet('Payment Method Breakdown', 'Interactive pie chart detailing cash, UPI, credit card, and split-tender payment distributions.');

// =============================================================================
// PAGE 4: MODULE 2 — POS BILLING ENGINE
// =============================================================================
doc.addPage();
drawHeader('MODULE 2 — POINT OF SALE (POS) BILLING WORKFLOW');

drawSectionHeading('2.1', 'Order Types & Channels');
drawParagraph('RestaurantOS handles four distinct order channels, each with specialized tax and charge rules:');
drawBullet('Dine-In', 'Requires selecting an active dining table. Generates KOTs for servers, supports table transfers, bill merges, and post-meal payments.');
drawBullet('Takeaway', 'Quick counter pickup. Automatically applies configured packaging charges (e.g. ₹20/box) and generates customer token receipts.');
drawBullet('Delivery', 'Captures customer delivery address, contact phone, and applies distance delivery fees.');
drawBullet('Pickup', 'Pre-ordered guest pickups scheduled for a specific collection time.');

drawSectionHeading('2.2', 'Step-by-Step Order Taking & Item Customization');
drawBullet('Step 1 — Filter or Search', 'Tap category tabs (Starters, Curries, Biryanis, Breads, Beverages, Desserts) or type item shortcode in the search bar (e.g. "PBM" for Paneer Butter Masala). Or scan item barcode using any USB HID scanner.');
drawBullet('Step 2 — Select Item & Variants', 'Tapping an item opens the Customization Drawer if portion sizes (Half, Full, Large) or modifier groups (Spice Level, Extra Butter, Add Cheese) exist. Select variants and add cooking notes (e.g. "No onions, make mild").');
drawBullet('Step 3 — Review Cart Line Items', 'Right panel displays quantity increment/decrement controls, item-level discounts, modifier add-ons, and calculated taxes in real time.');
drawBullet('Step 4 — Send KOT', 'Click "Send KOT" to dispatch tickets to the kitchen. The table status switches from AVAILABLE (Green) to OCCUPIED (Blue).');

drawCalloutBox(
  'Speed Billing Pro Tip',
  'Cashiers can type dish shortcodes directly into the search bar and press Enter to instantly add items without touching the screen. Double-clicking an item in the cart allows rapid quantity overrides.',
  PRIMARY
);

// =============================================================================
// PAGE 5: MODULE 3 — TABLE ACTIONS, DISCOUNTS & BILL SPLITS
// =============================================================================
doc.addPage();
drawHeader('MODULE 3 — TABLE ACTIONS, DISCOUNTS & SETTLEMENT');

drawSectionHeading('3.1', 'Table Floor Plan & Session Actions');
drawBullet('Table Transfer', 'When guests change seating from T-01 to Patio-04, tap "Transfer Table", pick destination table, and confirm. All open items, KOT history, and running totals migrate seamlessly.');
drawBullet('Hold Order', 'Allows a cashier to pause the current order to bill another fast counter customer. Tap "Hold Order". Order is stored in held queue and can be resumed anytime.');
drawBullet('Split Bill', 'Divides total bill into equal halves or custom item assignments across multiple payers.');

drawSectionHeading('3.2', 'Discounts & Supervisor Overrides');
drawBullet('Item Discount', 'Applied directly to an individual line item for kitchen errors or promotional offers.');
drawBullet('Bill Discount', 'Percentage (e.g. 10%, 15%) or flat rupee discount applied to the entire bill before GST.');
drawBullet('Strict Supervisor PIN Gate', 'Discounts exceeding 10% or order cancellations require a 4-digit manager authorization PIN and mandatory audit reason.');

drawSectionHeading('3.3', 'Payment Settlement & Strict UPI Verification');
drawParagraph(
  'RestaurantOS supports multiple payment modes with authoritative server calculation: Cash, UPI QR, Credit Card, and Split Tender.'
);
drawBullet('Cash Settlement', 'Enter cash tendered. The system calculates exact customer change and pulses the electronic cash drawer solenoid via ESC/POS command.');
drawBullet('Dynamic UPI QR Generation', 'Displays dynamic UPI QR code encoded with restaurant VPA, invoice reference, and exact payable amount down to the rupee.');
drawBullet('Strict UPI Verification Rule', 'Generating a QR code is NEVER treated as proof of payment. Cashiers must physically confirm soundbox audio notification or inspect the customer’s phone success screen, then record the 12-digit bank UTR.');

// =============================================================================
// PAGE 6: MODULE 4 — KITCHEN DISPLAY SYSTEM (KDS)
// =============================================================================
doc.addPage();
drawHeader('MODULE 4 — REAL-TIME KITCHEN DISPLAY SYSTEM (KDS)');

drawSectionHeading('4.1', 'Dedicated Kitchen Touchscreen Interface');
drawParagraph(
  'The Kitchen Display System replaces noisy, easily misplaced paper tickets with clean, touch-friendly digital cards running on wall-mounted monitors or tablets in the kitchen.'
);

drawSectionHeading('4.2', 'Multi-Station Routing');
drawParagraph('Items on a single order automatically split and route to designated kitchen stations:');
drawBullet('Main Kitchen', 'Tandoor, curries, biryanis, and hot main courses.');
drawBullet('Bar', 'Cocktails, mocktails, beers, and spirits.');
drawBullet('Bakery', 'Desserts, pastries, and artisanal breads.');
drawBullet('Beverage Counter', 'Chai, coffee, shakes, and soft drinks.');
drawBullet('Expo / Dispatch', 'Master consolidation view where runners package and plate complete orders.');

drawSectionHeading('4.3', 'Real-Time Order Lifecycle & Visual Timers');
drawBullet('1. NEW (Yellow Flash + Audio Chime)', 'Ticket arrives from POS. Web Audio chime alerts kitchen staff.');
drawBullet('2. ACCEPTED (Blue)', 'Head cook taps "Accept Order" to acknowledge ticket. Prep timer starts ticking.');
drawBullet('3. PREPARING (Purple)', 'Cook marks "Start Cooking" when dishes enter the pan/tandoor.');
drawBullet('4. READY (Green)', 'Cook marks "Ready". Notifies server or expo runner that food is plated.');
drawBullet('5. SERVED (Grey)', 'Runner marks ticket "Served" once delivered to the dining table.');

drawSectionHeading('4.4', 'Urgency Escalation Tiers');
drawBullet('Normal (Green Badge)', 'Order duration under 10 minutes.');
drawBullet('Warning (Orange Badge)', 'Order duration between 10 and 20 minutes.');
drawBullet('Critical Rush (Red Flashing)', 'Order duration exceeding 20 minutes. Escalates to chef manager.');

// =============================================================================
// PAGE 7: MODULE 5 — RECIPE ERP & STOCK DEDUCTION (BOM)
// =============================================================================
doc.addPage();
drawHeader('MODULE 5 — RECIPES & AUTOMATIC STOCK DEDUCTION');

drawSectionHeading('5.1', 'Bill of Materials (BOM) Recipe Engine');
drawParagraph(
  'RestaurantOS links menu items directly to raw ingredient consumption. Restaurant managers configure precise ingredient quantities required per serving.'
);

drawBullet('Recipe Configuration Example — Paneer Butter Masala', 'Portion size: 1 Plate | Raw Paneer: 200g, Amul Butter: 30g, Fresh Cream: 40ml, Tomato Puree: 100g, Spices: Configured batch cost.');
drawBullet('Automatic Cost per Serving', 'Calculated by summing ingredient unit purchase costs. Updates in real time when ingredient purchase prices fluctuate.');
drawBullet('Gross Margin & Markup', 'Reports selling price (e.g. ₹340), recipe cost (e.g. ₹92.50), gross profit (₹247.50), and margin percentage (72.8%).');

drawSectionHeading('5.2', 'Transactional Stock Deduction');
drawParagraph(
  'When an order is settled at the POS, RestaurantOS executes an atomic database transaction that decrements raw inventory stocks according to the recipe Bill of Materials.'
);
drawBullet('Zero Inventory Leakage', 'Prevents kitchen staff from using unrecorded materials and identifies discrepancies during physical stock takes.');
drawBullet('Stock Adjustment & Wastage', 'Log spoiled, expired, or dropped food in "Inventory Adjustments" with supervisor authorization to keep balance sheet accurate.');
drawBullet('Low-Stock Reorder Alerts', 'Automated red warning pills appear when current stock falls below configured minimum reorder thresholds.');

// =============================================================================
// PAGE 8: MODULE 6 — PROCUREMENT & GOODS RECEIVED (GRN)
// =============================================================================
doc.addPage();
drawHeader('MODULE 6 — PROCUREMENT & GOODS RECEIVED (GRN)');

drawSectionHeading('6.1', 'Supplier Directory & Credit Balance Management');
drawBullet('Vendor Profiles', 'Maintain contact details, payment terms (Net 15, Net 30), GSTIN, and credit balances for poultry vendors, dairy farms, vegetable markets, and dry packaging distributors.');
drawBullet('Outstanding Dues Tracking', 'Live ledger showing total balance due per vendor with historical payment vouchers.');

drawSectionHeading('6.2', 'Purchase Order (PO) Lifecycle');
drawBullet('1. Draft PO', 'Inventory manager selects supplier, adds ingredients with target purchase prices and delivery dates.');
drawBullet('2. Issue PO', 'Generates official numbered PO (e.g. "PO-IND-2026-0882") and dispatches to vendor.');
drawBullet('3. Goods Received Note (GRN)', 'When vendor delivery truck arrives at restaurant back door, receiving manager inspects goods.');
drawBullet('4. Quality Inspection & Rejection', 'Record accepted quantity vs rejected quantity (e.g. bruised tomatoes or blown milk packets). Unit costs auto-update ingredient inventory valuation.');
drawBullet('5. Vendor Invoice & Payment Voucher', 'Link vendor tax invoice and record payments via Bank Transfer, UPI, Cheque, or Cash.');

// =============================================================================
// PAGE 9: MODULE 7 — CUSTOMER CRM & LOYALTY PROGRAM
// =============================================================================
doc.addPage();
drawHeader('MODULE 7 — CUSTOMER CRM, LOYALTY & REWARDS');

drawSectionHeading('7.1', 'Customer Registration & Quick POS Lookup');
drawParagraph(
  'During billing, enter customer phone number (10 digits). The system auto-fetches name, loyalty points, visit count, favorite dishes, and corporate GSTIN for B2B tax invoicing.'
);

drawSectionHeading('7.2', 'Tiered Loyalty Rewards System');
drawBullet('Bronze Tier', 'Default for new guests. Earn 1 point per ₹100 spent.');
drawBullet('Silver Tier', 'Unlocked after ₹10,000 lifetime spend. Earn 1.5 points per ₹100 spent.');
drawBullet('Gold Tier', 'Unlocked after ₹25,000 lifetime spend. Earn 2 points per ₹100 spent.');
drawBullet('Platinum VIP', 'Unlocked after ₹50,000 lifetime spend. Earn 3 points per ₹100 spent + complimentary priority reservations.');

drawSectionHeading('7.3', 'Points Redemption & Promotional Coupons');
drawBullet('Redeeming Points', 'Points convert to cash discounts (1 Point = ₹1.00 INR). Cashier applies redemption with one tap.');
drawBullet('Promotional Coupons', 'Create flat (₹100 OFF) or percentage (20% OFF) discount codes with minimum order values and expiry dates.');
drawBullet('Digital Gift Vouchers', 'Prepaid voucher codes with balance tracking for corporate gifting and festive promotions.');

// =============================================================================
// PAGE 10: MODULE 8 — STAFF MANAGEMENT & RBAC
// =============================================================================
doc.addPage();
drawHeader('MODULE 8 — STAFF ROLES, RBAC & PIN SECURITY');

drawSectionHeading('8.1', 'Eight Enterprise System Roles');
drawParagraph('RestaurantOS enforces granular role-based access control across 8 operational roles:');
drawBullet('1. OWNER', 'Unrestricted administrative access to all branches, profit & loss statements, staff compensation, and system settings.');
drawBullet('2. ADMINISTRATOR', 'Full technical and branch management configuration access.');
drawBullet('3. MANAGER', 'Floor supervision, staff scheduling, table transfers, discount overrides, refunds, and cash shift closing.');
drawBullet('4. CASHIER', 'POS billing, order taking, table settlement, UPI verification, and cash drawer management.');
drawBullet('5. WAITER / CAPTAIN', 'Dine-in order entry, guest seating, KOT firing, and table status monitoring.');
drawBullet('6. KITCHEN STAFF', 'KDS station interface, order acceptance, preparation timers, and KOT reprints.');
drawBullet('7. INVENTORY MANAGER', 'Raw material audits, recipe editing, PO generation, and GRN receipts.');
drawBullet('8. ACCOUNTANT', 'Financial statements, expense tracking, supplier ledgers, and GSTR-1 tax export.');

drawSectionHeading('8.2', '4-Digit Supervisor PIN Overrides & Audit Trail');
drawParagraph(
  'High-risk operational actions cannot be executed by unauthorized staff. When an override occurs, the system prompts for a 4-digit PIN and records an immutable entry in the AuditLog database table.'
);

// =============================================================================
// PAGE 11: MODULE 9 — ATTENDANCE & PAYROLL
// =============================================================================
doc.addPage();
drawHeader('MODULE 9 — ATTENDANCE, SHIFTS & PAYROLL');

drawSectionHeading('9.1', 'Shift Scheduling & Biometric / PIN Clock-In');
drawBullet('Shift Rosters', 'Configure standard shifts (Morning Prep: 08:00–16:00, Lunch Rush: 11:00–19:00, Dinner Service: 16:00–00:00).');
drawBullet('Clock-In / Clock-Out', 'Staff clock in via PIN at the POS terminal. The system flags late check-ins if operator arrives past the 15-minute grace threshold.');
drawBullet('Leave Management', 'Staff submit casual, sick, or paid leave requests; managers review and approve with one click.');

drawSectionHeading('9.2', 'Automated Attendance Pro-Rated Payroll');
drawBullet('Base Calculation', 'Supports monthly fixed salary or hourly wage rates.');
drawBullet('Automatic Deductions', 'Pro-rates salary based on actual days worked, unapproved absences, and half-days.');
drawBullet('Overtime Calculation', 'Automatically tracks overtime hours worked past shift schedule and calculates overtime bonuses.');
drawBullet('Salary Payout Register', 'Generates monthly payroll runs with payment reference tracking for bank NEFT transfers or cash payouts.');

// =============================================================================
// PAGE 12: MODULE 10 — CASH REGISTER & EXPENSES
// =============================================================================
doc.addPage();
drawHeader('MODULE 10 — CASH REGISTER SHIFTS & EXPENSES');

drawSectionHeading('10.1', 'Daily Cash Register Shift Management');
drawBullet('Opening Shift Float', 'Cashier counts physical opening cash float (e.g. ₹2,000 in change) and records shift open in Expenses -> Cash Register.');
drawBullet('System Cash Tracking', 'During shift, every cash settlement automatically increments tracked cash sales.');
drawBullet('Cash Drops', 'Transferring excess cash from till to main restaurant safe is recorded as a "Cash Drop" to minimize counter robbery risk.');
drawBullet('Closing Shift Count & Variance Reconciliation', 'At shift end, cashier physically counts the drawer and enters the actual cash amount. The system calculates Cash Variance (Surplus or Shortage). Any discrepancy requires an explanation note.');

drawSectionHeading('10.2', 'Operational Expense Tracking');
drawBullet('Expense Categories', 'Track Kitchen LPG Cylinders, Utilities, Store Rent, Equipment Repairs, Packaging Supplies, and Daily Petty Cash.');
drawBullet('Vendor Receipts', 'Attach vendor receipt references and payment modes (Cash, Bank Transfer, Petty Cash).');

// =============================================================================
// PAGE 13: MODULE 11 — MULTI-BRANCH OPERATIONS
// =============================================================================
doc.addPage();
drawHeader('MODULE 11 — MULTI-BRANCH OUTLETS & TRANSFERS');

drawSectionHeading('11.1', 'Multi-Outlet Provisioning & Isolation');
drawParagraph(
  'RestaurantOS securely isolates business data between branch locations while providing owners with a unified enterprise overview.'
);
drawBullet('Branch Profiles', 'Indiranagar Flagship (IND), Koramangala Cafe (KOR), HSR Cloud Kitchen (HSR). Each outlet maintains its own tables, menus, staff, inventory balances, and separate GST registration settings.');
drawBullet('Zero Data Leakage', 'Cashiers and kitchen screens in Koramangala can never view or modify Indiranagar orders or cash drawers.');
drawBullet('Consolidated Owner Overview', 'Chain owners view combined sales, comparative branch profitability, and chain-wide inventory valuations from a single login.');

drawSectionHeading('11.2', 'Cross-Branch Stock Transfers');
drawBullet('Transfer Workflow', 'Initiate stock movement from Central Base Kitchen (IND) to Satellite Cloud Kitchen (HSR). Inventory is marked IN_TRANSIT, deducted from source, and added to destination upon verified Goods Received Note.');

// =============================================================================
// PAGE 14: MODULE 12 — OFFLINE-FIRST & DAILY CLOSING
// =============================================================================
doc.addPage();
drawHeader('MODULE 12 — OFFLINE-FIRST MODE & DAILY CLOSING');

drawSectionHeading('12.1', 'Offline-First POS Architecture');
drawBullet('Zero Downtime During Internet Outages', 'If broadband drops, the POS displays "Offline (X Queued)". Billing, order taking, and local thermal receipt printing CONTINUE uninterrupted.');
drawBullet('Local Persistent Storage', 'Orders are securely stored in browser IndexedDB with unique UUID idempotency keys (offlineSyncId).');
drawBullet('Automatic Background Reconciliation', 'When internet connection restores, the background sync queue automatically reconciles queued orders with the server with zero double-billing risk.');

drawSectionHeading('12.2', 'End-of-Day Shift Close & Z-Report Checklist');
drawBullet('1. Verify All Tables Settled', 'Ensure no open dine-in tables or uncompleted KOTs remain.');
drawBullet('2. Close Cash Register Shift', 'Count cash float, record cash drops to safe, and reconcile variances.');
drawBullet('3. Print Shift Z-Report', 'Print end-of-day summary on 80mm thermal printer detailing gross sales, net sales, category totals, and payment breakdown.');
drawBullet('4. Export GSTR-1 Tax Register', 'Download CSV tax register from Reports for accountant filing.');
drawBullet('5. Automated Nightly Database Backup', 'The automated backup cron script (db-backup.sh) runs at 02:00 AM, creating encrypted, compressed database dumps with 30-day retention.');

// =============================================================================
// PAGE NUMBERING AND RUNNING FOOTERS
// =============================================================================
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // Skip cover page

  // Top Running Header
  doc.rect(45, 25, 505, 1).fill(BORDER_COLOR);
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica');
  doc.text('RestaurantOS — Official Operator Handbook & Technical Tutorial', 45, 15);
  doc.text('Production Edition', 480, 15, { align: 'right' });

  // Bottom Running Footer
  doc.rect(45, 800, 505, 1).fill(BORDER_COLOR);
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica');
  doc.text('Bawarchi Royale Hospitality Systems • Confidential & Proprietary', 45, 808);
  doc.text(`Page ${i + 1} of ${range.count}`, 480, 808, { align: 'right' });
}

doc.end();

writeStreamPublic.on('finish', () => {
  console.log(`✅ Tutorial PDF generated successfully at:`);
  console.log(`   Public: ${OUTPUT_PUBLIC_PATH}`);
  console.log(`   Docs:   ${OUTPUT_DOCS_PATH}`);
});
