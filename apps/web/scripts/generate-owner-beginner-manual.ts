/**
 * RestaurantOS  -  The Complete Beginner's Guide for Restaurant Owners
 * Publication-Grade PDF Generator using PDFKit
 * Tailored specifically for non-technical restaurant owners with zero computer experience.
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT_PUBLIC_PATH = path.join(
  __dirname,
  '../public/downloads/RestaurantOS_Owner_Beginner_Manual.pdf'
);
const OUTPUT_DOCS_PATH = path.join(
  __dirname,
  '../../../docs/RestaurantOS_Owner_Beginner_Manual.pdf'
);
const OUTPUT_ARTIFACT_PATH = 'C:/Users/vinee/.gemini/antigravity/brain/5b63f706-50f4-4a3d-9b73-ba22646c97ac/RestaurantOS_Owner_Beginner_Manual.pdf';

// Ensure output directories exist
fs.mkdirSync(path.dirname(OUTPUT_PUBLIC_PATH), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_DOCS_PATH), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_ARTIFACT_PATH), { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStreamPublic = fs.createWriteStream(OUTPUT_PUBLIC_PATH);
const writeStreamDocs = fs.createWriteStream(OUTPUT_DOCS_PATH);
const writeStreamArtifact = fs.createWriteStream(OUTPUT_ARTIFACT_PATH);

doc.pipe(writeStreamPublic);
doc.pipe(writeStreamDocs);
doc.pipe(writeStreamArtifact);

// Palette: Warm hospitality theme (Amber/Orange, Deep Slate, Forest Green, Coral Red)
const COLOR_PRIMARY = '#ea580c'; // Vibrant Orange
const COLOR_PRIMARY_DARK = '#9a3412'; // Rust Orange
const COLOR_SECONDARY = '#0f172a'; // Deep Navy / Slate-900
const COLOR_TEXT_MAIN = '#1e293b'; // Slate-800
const COLOR_TEXT_MUTED = '#64748b'; // Slate-500
const COLOR_BG_LIGHT = '#f8fafc'; // Slate-50
const COLOR_BORDER = '#e2e8f0'; // Slate-200
const COLOR_GREEN = '#15803d'; // Emerald-700
const COLOR_RED = '#b91c1c'; // Rose-700
const COLOR_BLUE = '#1d4ed8'; // Blue-700

// Reusable drawing helpers
function drawHeader(chapterNumber: string, title: string, subtitle?: string) {
  const startY = doc.y;
  const headerHeight = 32;
  doc.rect(45, startY, 505, headerHeight).fill(COLOR_SECONDARY);
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold');
  const headerLabel = /^\d+$/.test(chapterNumber)
    ? `CHAPTER ${chapterNumber}: ${title.toUpperCase()}`
    : title.toUpperCase();
  doc.text(headerLabel, 58, startY + 10, { width: 480 });
  doc.y = startY + headerHeight + 10;

  if (subtitle) {
    doc.fillColor(COLOR_TEXT_MUTED).fontSize(8.5).font('Helvetica-Oblique');
    doc.text(subtitle, 45, doc.y, { width: 505 });
    doc.y = doc.y + 6;
  }
}

function drawSectionHeading(num: string, text: string) {
  doc.moveDown(0.3);
  const startY = doc.y;
  doc.rect(45, startY, 4, 16).fill(COLOR_PRIMARY);
  doc.fillColor(COLOR_SECONDARY).fontSize(11.5).font('Helvetica-Bold');
  doc.text(`${num} ${text}`, 56, startY + 2, { width: 480 });
  const headingH = doc.heightOfString(`${num} ${text}`, { width: 480 });
  doc.y = startY + Math.max(20, headingH + 5);
}

function drawParagraph(text: string) {
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(9).font('Helvetica').lineGap(2.5);
  doc.text(text, { width: 505 });
  doc.moveDown(0.4);
}

function drawBullet(title: string, desc: string) {
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR_SECONDARY);
  doc.text(`• ${title}: `, { continued: true, lineGap: 1.5 });
  doc.font('Helvetica').fillColor(COLOR_TEXT_MAIN).text(desc);
  doc.moveDown(0.2);
}

function drawStepBox(stepNum: number, title: string, instruction: string, tip?: string) {
  // Set font properties and calculate dynamic heights
  doc.fontSize(9.5).font('Helvetica-Bold');
  const titleH = doc.heightOfString(title, { width: 440 });

  doc.fontSize(8.5).font('Helvetica').lineGap(2);
  const instrH = doc.heightOfString(instruction, { width: 440, lineGap: 2 });

  let tipH = 0;
  if (tip) {
    doc.fontSize(7.5).font('Helvetica-Bold');
    tipH = doc.heightOfString(`TIP: ${tip}`, { width: 440 });
  }

  const topPad = 8;
  const bottomPad = 8;
  const titleGap = 3;
  const tipGap = tip ? 6 : 0;
  const totalContentH = titleH + titleGap + instrH + (tip ? (tipGap + tipH) : 0);
  const boxHeight = Math.max(38, topPad + totalContentH + bottomPad);

  // Ensure box fits on current page
  if (doc.y + boxHeight > 790) {
    doc.addPage();
  }

  const y = doc.y;
  doc.roundedRect(45, y, 505, boxHeight, 5).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);

  // Step Number Badge (pinned to top-left of box)
  doc.roundedRect(52, y + 8, 24, 24, 4).fill(COLOR_PRIMARY);
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold');
  doc.text(stepNum.toString(), 52, y + 14, { width: 24, align: 'center' });

  // Sequential rendering of text blocks to guarantee ZERO overlap
  let textY = y + topPad;

  // Title
  doc.fillColor(COLOR_SECONDARY).fontSize(9.5).font('Helvetica-Bold');
  doc.text(title, 84, textY, { width: 440 });
  textY += titleH + titleGap;

  // Instruction
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8.5).font('Helvetica').lineGap(2);
  doc.text(instruction, 84, textY, { width: 440, lineGap: 2 });
  textY += instrH;

  // Tip (Guaranteed to be strictly below instruction)
  if (tip) {
    textY += tipGap;
    doc.fillColor(COLOR_GREEN).fontSize(7.5).font('Helvetica-Bold');
    doc.text(`TIP: ${tip}`, 84, textY, { width: 440 });
  }

  doc.y = y + boxHeight + 6;
}

function drawButtonCallout(buttonName: string, iconDescription: string, whatItDoes: string) {
  const line1 = `BUTTON TO LOOK FOR: [ ${buttonName} ]`;
  const line2 = `Symbol: ${iconDescription}  |  Action: ${whatItDoes}`;
  doc.fontSize(8.5).font('Helvetica-Bold');
  const h1 = doc.heightOfString(line1, { width: 480 });
  doc.fontSize(8).font('Helvetica');
  const h2 = doc.heightOfString(line2, { width: 480 });

  const boxHeight = Math.max(30, 6 + h1 + 3 + h2 + 6);

  if (doc.y + boxHeight > 790) {
    doc.addPage();
  }

  const y = doc.y;
  doc.roundedRect(45, y, 505, boxHeight, 4).fillAndStroke('#fff7ed', '#fed7aa');
  let curY = y + 6;
  doc.fillColor(COLOR_PRIMARY_DARK).fontSize(8.5).font('Helvetica-Bold');
  doc.text(line1, 55, curY, { width: 480 });
  curY += h1 + 3;
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8).font('Helvetica');
  doc.text(line2, 55, curY, { width: 480 });

  doc.y = y + boxHeight + 6;
}

function drawImportantBox(title: string, message: string, color = COLOR_PRIMARY) {
  doc.fontSize(8.5).font('Helvetica-Bold');
  const titleH = doc.heightOfString(title.toUpperCase(), { width: 475 });
  doc.fontSize(8).font('Helvetica').lineGap(2);
  const msgH = doc.heightOfString(message, { width: 475, lineGap: 2 });

  const boxHeight = Math.max(36, 7 + titleH + 3 + msgH + 7);

  if (doc.y + boxHeight > 790) {
    doc.addPage();
  }

  const y = doc.y;
  doc.roundedRect(45, y, 505, boxHeight, 5).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);
  doc.rect(45, y, 4, boxHeight).fill(color);

  let curY = y + 7;
  doc.fillColor(color).fontSize(8.5).font('Helvetica-Bold');
  doc.text(title.toUpperCase(), 56, curY, { width: 475 });
  curY += titleH + 3;

  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8).font('Helvetica').lineGap(2);
  doc.text(message, 56, curY, { width: 475, lineGap: 2 });

  doc.y = y + boxHeight + 6;
}

function drawScreenMockup(
  title: string,
  route: string,
  height: number,
  renderContent: (x: number, y: number, w: number, h: number) => void
) {
  const y = doc.y;
  const w = 505;
  const headerH = 18;

  // Window Container
  doc.roundedRect(45, y, w, height, 5).fillAndStroke('#ffffff', '#cbd5e1');

  // Header Bar (Dark Slate)
  doc.roundedRect(45, y, w, headerH, 5).fill('#0f172a');
  doc.rect(45, y + 12, w, 6).fill('#0f172a');

  // Window dots
  doc.circle(55, y + 9, 3).fill('#ef4444');
  doc.circle(64, y + 9, 3).fill('#f59e0b');
  doc.circle(73, y + 9, 3).fill('#10b981');

  // Title & Route
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
  doc.text(`[ SCREEN PREVIEW ]: ${title}`, 85, y + 5);
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica');
  doc.text(route, 320, y + 5, { width: 220, align: 'right' });

  // Render Inner Content
  renderContent(47, y + headerH + 2, w - 4, height - headerH - 4);

  doc.y = y + height + 8;
}

// =============================================================================
// PAGE 1: LUXURY COVER PAGE
// =============================================================================
doc.rect(0, 0, 595.28, 841.89).fill('#090d16'); // Dark luxury background

// Brand Badge
doc.rect(50, 75, 75, 75).fill(COLOR_PRIMARY);
doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold');
doc.text('OS', 66, 95);

doc.moveDown(4.5);
doc.fillColor('#fb923c').fontSize(13).font('Helvetica-Bold');
doc.text('STEP-BY-STEP OWNER TUTORIAL & HANDBOOK', { characterSpacing: 2 });

doc.moveDown(0.5);
doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold');
doc.text('RestaurantOS');

doc.moveDown(0.3);
doc.fillColor('#f8fafc').fontSize(16).font('Helvetica-Bold');
doc.text("The Complete Beginner's Guide for Restaurant Owners");

doc.moveDown(0.2);
doc.fillColor('#94a3b8').fontSize(12).font('Helvetica-Oblique');
doc.text('How to upload food, run billing, manage kitchen & see daily profit with ZERO computer experience.');

// Divider Line
doc.moveDown(1);
doc.rect(50, doc.y, 495, 3).fill(COLOR_PRIMARY);
doc.moveDown(1.5);

doc.fillColor('#cbd5e1').fontSize(10).font('Helvetica').lineGap(3.5);
doc.text(
  'Written in friendly, plain English for restaurant founders, dhaba owners, cafe proprietors, sweet shops, and cloud kitchens. If you can use WhatsApp on a smartphone, you can master RestaurantOS in less than 30 minutes.'
);

// Highlights Card
doc.roundedRect(50, 470, 495, 205, 8).fill('#111827');
doc.fillColor('#f8fafc').fontSize(11).font('Helvetica-Bold');
doc.text('WHAT THIS SIMPLE MANUAL TEACHES YOU:', 70, 490);

const highlights = [
  '• Chapter 1: Where everything is on your screen (Buttons, Icons & Menus)',
  '• Chapter 2: How to upload your Menu, Categories, Food Dishes & Prices',
  '• Chapter 3: Taking orders & billing in 10 seconds at the cash counter (POS)',
  '• Chapter 4: Accepting Cash, UPI QR code & Card payments with printed GST bills',
  '• Chapter 5: Managing Tables (Green = Clean, Red = Eating, Yellow = Bill Ready)',
  '• Chapter 6: Kitchen Display & Kitchen Order Tickets (KOT) for your cooks',
  '• Chapter 7: Managing Storeroom & Ingredients (Rice, Oil, Paneer, Chicken)',
  '• Chapter 8: Staff management & giving employees simple 4-digit PIN passwords',
  '• Chapter 9: The Daily Routine: Morning opening, lunch rush & night Z-Report closing',
  '• Chapter 10: "Don\'t Panic" answers to common questions (printer, offline, mistakes)',
];

let hy = 512;
for (const h of highlights) {
  doc.fontSize(8.5).font('Helvetica').fillColor('#94a3b8');
  doc.text(h, 70, hy);
  hy += 15;
}

doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748b');
doc.text('Official RestaurantOS Customer Onboarding Kit  -  Version 2026 Edition', 50, 785);

// =============================================================================
// PAGE 2: WELCOME LETTER & THE GOLDEN RULES
// =============================================================================
doc.addPage();
drawHeader('WELCOME', "A Friendly Message to the Restaurant Owner", "Take a deep breath  -  this software was built for you");

drawSectionHeading('1.', 'Running a Restaurant is Hard. Software Should Be Easy.');
drawParagraph(
  'Dear Restaurant Owner, congratulations on using RestaurantOS! We know that running a food business is one of the hardest jobs in the world. You manage cooks, buy fresh vegetables at 6 AM, greet customers, and make sure the food tastes delicious every single day.'
);
drawParagraph(
  'You do NOT need to be a computer engineer or a technical genius to operate this software. If you can send a message on WhatsApp or make a call on your mobile phone, you already know 90% of what is required. This guide is written with zero confusing computer words. Every step has exact pictures and buttons to look for.'
);

drawSectionHeading('2.', 'The 3 Golden Rules for Beginners');

drawStepBox(
  1,
  'Rule #1: You Cannot Break The Software',
  'Feel free to click buttons and explore! Nothing will explode, no data will be lost, and you cannot ruin the system by clicking. If you ever feel lost, just click the "Home / Overview" button on the left to return to safety.',
  'If a popup appears that you do not understand, simply click the "X" button on the top right of the box.'
);

drawStepBox(
  2,
  'Rule #2: The Screen Is Divided into 3 Clear Zones',
  'Zone 1 (Left): Your Navigation Menu (takes you to POS, Menu, Tables, etc.).\nZone 2 (Top): Shows your Restaurant Name, Today\'s Date, and the Orange Fast POS button.\nZone 3 (Middle): Your main workspace where you take orders, add dishes, and view numbers.',
  'Keep your mouse or finger focused on Zone 3 for 95% of your daily work.'
);

drawStepBox(
  3,
  'Rule #3: The Software Works Even Without Internet',
  'If your WiFi router disconnects or the broadband wire is cut, DO NOT PANIC! RestaurantOS has built-in Offline Billing. Your cashiers can keep taking orders, printing bills, and collecting cash. When internet returns, it updates automatically.',
  'Never turn away a hungry customer just because the internet is down.'
);

drawImportantBox(
  'How to Keep This Manual Handy',
  'Print this PDF and keep it beside the main cash counter billing computer. Give copies to your Restaurant Manager and head Cashier so everyone is on the same page.'
);

// =============================================================================
// PAGE 3: MODULE 1  -  SCREEN TOUR & ROAD SIGNS
// =============================================================================
doc.addPage();
drawHeader('1', 'Where Everything Is on Your Screen', 'Like learning the road signs before driving a car');

drawSectionHeading('1.1', 'The Left Sidebar: Your Command Center');
drawParagraph(
  'On the left edge of your screen is a dark gray vertical menu bar. Think of each icon as a door leading into a different room of your restaurant:'
);

const sidebarIcons = [
  { name: 'Overview / Home', icon: 'House icon', desc: 'Shows today\'s total money earned, order count, and sales chart.' },
  { name: 'POS (Cash Counter)', icon: 'Storefront icon', desc: 'The most important screen! Where you take orders and print customer bills.' },
  { name: 'Orders', icon: 'Shopping Bag icon', desc: 'List of all bills generated today. Reprint bills or view past receipts here.' },
  { name: 'Tables', icon: 'Fork & Knife icon', desc: 'See your dining room floor: Green tables are empty, Red tables are eating.' },
  { name: 'Kitchen Display', icon: 'Chef Hat icon', desc: 'Live screen for cooks to see what dishes to cook and in what order.' },
  { name: 'Menu', icon: 'Open Book icon', desc: 'Your food menu book! Add new dishes, change prices, or mark items sold out.' },
  { name: 'Inventory', icon: 'Cardboard Box icon', desc: 'Your storeroom: track Basmati rice, cooking oil, paneer, chicken, and spices.' },
  { name: 'Staff', icon: 'People icon', desc: 'Add waiters, cashiers, and managers. Assign simple 4-digit PIN passwords.' },
  { name: 'Reports', icon: 'Bar Chart icon', desc: 'See how much profit you made this week, GST tax reports, and top-selling dishes.' },
  { name: 'Settings', icon: 'Gear icon', desc: 'Configure restaurant name, address, phone number, GSTIN, and printer setup.' },
];

let sy = doc.y;
for (const item of sidebarIcons) {
  doc.roundedRect(45, sy, 505, 23, 3).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);
  doc.fillColor(COLOR_PRIMARY_DARK).fontSize(8.5).font('Helvetica-Bold');
  doc.text(item.name, 55, sy + 6, { width: 130 });
  doc.fillColor(COLOR_SECONDARY).fontSize(8).font('Helvetica-Oblique');
  doc.text(`[ ${item.icon} ]`, 190, sy + 6, { width: 110 });
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8).font('Helvetica');
  doc.text(item.desc, 305, sy + 6, { width: 240 });
  sy += 26;
}
doc.y = sy + 5;

drawSectionHeading('1.2', 'The Top Bar: Quick Status & Fast Buttons');
drawBullet('Fast POS Button', 'An orange button on the top right that says "Fast POS". Click this from any screen to jump straight into billing in 1 second.');
drawBullet('Restaurant & Branch Switcher', 'Shows your restaurant name (e.g. Bawarchi Royale). If you own 2 or 3 branches, click here to switch between them.');
drawBullet('Universal Search (Ctrl + K)', 'Type any dish name, table number, or customer phone number to find it immediately.');

// =============================================================================
// PAGE 4: MODULE 2  -  UPLOADING & ADDING YOUR FOOD MENU
// =============================================================================
doc.addPage();
drawHeader('2', 'Uploading & Adding Your Food Menu', 'How to enter your categories, dishes, prices & portion sizes');

drawParagraph(
  'Before taking orders, you need your food items inside the computer. Adding dishes in RestaurantOS takes less than 30 seconds per item. Follow these 5 simple steps:'
);

drawStepBox(
  1,
  'Step 1: Open the Menu Screen',
  'Move your mouse to the left menu bar and click on the "Menu" button (the icon looks like an Open Book). You will see your food categories and dish list.',
  'You can also press Ctrl + M on your keyboard to jump directly here.'
);

drawStepBox(
  2,
  'Step 2: Create Your Food Categories First',
  'Food categories are like the sections in your printed menu (e.g. "Starters", "Biryani & Rice", "Breads & Roti", "Chinese", "Beverages"). Click the "+ Add Category" button, type the name, and click Save.',
  'Creating categories first makes it super fast for cashiers to find items during dinner rush.'
);

drawStepBox(
  3,
  'Step 3: Click the "+ Add Dish" Button',
  'Look at the top right of the Menu screen. You will see a black button that says "+ Add Dish". Click it. A clean form will appear on your screen.',
  'Do not worry if you make a spelling mistake; you can edit it anytime.'
);

drawStepBox(
  4,
  'Step 4: Fill in 4 Simple Details',
  '1. Dish Name: Type the item name (e.g., "Paneer Butter Masala" or "Chicken Biryani").\n2. Category: Click the dropdown and pick which section it belongs to.\n3. Selling Price: Type the price in Rupees (e.g., 280).\n4. Food Type: Select Green Dot for Veg or Red Dot for Non-Veg.',
  'You can optionally add a short description like "Cooked in rich cashew tomato gravy".'
);

drawStepBox(
  5,
  'Step 5: Click the Green "Save Dish" Button',
  'Scroll to the bottom of the form and click the green "Save Dish" button. Congratulations! Your dish is now saved and will immediately appear on the cashier billing screen.',
  'That is all! Repeat this for your other dishes.'
);

drawSectionHeading('2.1', 'How to Handle "Half" and "Full" Portion Sizes');
drawParagraph(
  'Does your restaurant sell dishes in different sizes? (e.g. Chicken Biryani: Half plate Rs. 180, Full plate Rs. 320). When creating or editing a dish, look for the section called "Portion Sizes / Variants". Click "+ Add Size", type "Half" with Rs. 180, and "Full" with Rs. 320. On the billing screen, the cashier can pick the size with 1 touch!'
);

drawSectionHeading('2.2', 'What to Do When Food Runs Out (Mark Sold Out)');
drawParagraph(
  'If your kitchen runs out of Mutton Biryani at 9:30 PM, do NOT delete the dish! Simply go to the Menu screen, find the dish, and flip the green toggle button to "Inactive / Sold Out". The dish will instantly be grayed out on billing terminals so no waiter can mistakenly order it.'
);

// =============================================================================
// PAGE 5: MODULE 3  -  BILLING AT THE CASH COUNTER (POS)
// =============================================================================
doc.addPage();
drawHeader('3', 'Taking Orders & Billing at the Cash Counter (POS)', 'How any cashier can generate a bill in under 10 seconds');

drawParagraph(
  'The POS (Point of Sale) screen is where cashiers spend 95% of their working day. We designed it like an oversized smartphone screen so anyone can use it without prior training.'
);

drawStepBox(
  1,
  'Step 1: Open the POS Screen',
  'Click the orange "Fast POS" button at the very top right of your screen (or click "POS" on the left menu). You will see food categories on the left, dish tiles in the middle, and the Current Bill slip on the right.',
  'On touchscreens, cashiers can tap dishes directly with their finger!'
);

drawStepBox(
  2,
  'Step 2: Choose Order Type (Dine-In, Takeaway, or Delivery)',
  'At the top of the billing slip on the right, click one of 3 buttons:\n• Dine-In: Customer is sitting at a table (Pick Table number, e.g. T-4).\n• Takeaway / Parcel: Customer is taking the food home in a carry bag.\n• Delivery: Online or phone home delivery order.',
  'Dine-In orders keep the bill open so customers can order more items later.'
);

drawStepBox(
  3,
  'Step 3: Tap or Click Dishes to Add to Bill',
  'Click on any dish tile (e.g. "Butter Naan"). It immediately flies into the bill slip on the right!\n• Want 2 or 3 plates? Tap the "+" plus button beside the item name.\n• Customer changed their mind? Tap the red "Trash" icon to remove it.',
  'You can also use the search bar at the top to type dish codes or names.'
);

drawStepBox(
  4,
  'Step 4: Send Order to Kitchen (Click "Print KOT")',
  'Once dishes are selected, click the blue button that says "Print KOT" (Kitchen Order Ticket). The order instantly prints inside the kitchen, and your cooks start preparing the food without waiting!',
  'The table will automatically turn RED on the Tables screen.'
);

drawStepBox(
  5,
  'Step 5: Customer Requests Bill? Click "Settle & Pay"',
  'When the customer is done eating and ready to pay, open their table and click the big green button at the bottom right that says "Settle & Pay". The Payment Window will open.',
  'Turn to Chapter 4 to see how to collect cash, UPI, or cards.'
);

drawScreenMockup('Cash Counter Billing Terminal (POS)', 'http://localhost:3000/pos', 78, (x, y, w, h) => {
  // Category Bar
  doc.rect(x + 5, y + 5, 290, 15).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold');
  doc.text('[ All (48) ]   [ Starters ]   [ Main Course ]   [ Biryani ]   [ Breads ]', x + 10, y + 9);

  // Left Dish Tile 1
  doc.roundedRect(x + 5, y + 24, 140, 22, 3).fillAndStroke('#ffffff', '#e2e8f0');
  doc.fillColor('#15803d').fontSize(5.5).text('[VEG]', x + 10, y + 28);
  doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('Paneer Butter Masala', x + 10, y + 35);
  doc.fillColor('#475569').fontSize(6.5).text('Rs. 320', x + 115, y + 35);

  // Left Dish Tile 2
  doc.roundedRect(x + 150, y + 24, 145, 22, 3).fillAndStroke('#ffffff', '#e2e8f0');
  doc.fillColor('#b91c1c').fontSize(5.5).text('[NON-VEG]', x + 155, y + 28);
  doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('Murgh Dum Biryani', x + 155, y + 35);
  doc.fillColor('#475569').fontSize(6.5).text('Rs. 350', x + 260, y + 35);

  // Right Bill Slip
  doc.roundedRect(x + 305, y + 5, 185, 42, 3).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('TABLE T-04 (DINE-IN)', x + 312, y + 8);
  doc.fillColor('#475569').fontSize(6).font('Helvetica').text('2x Murgh Dum Biryani ................. Rs. 700', x + 312, y + 16);
  doc.fillColor('#475569').fontSize(6).text('2x Butter Garlic Naan ................. Rs. 130', x + 312, y + 24);
  doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('TOTAL: Rs. 872 (Incl. GST)', x + 312, y + 33);

  // Bottom action buttons
  doc.roundedRect(x + 305, y + 51, 88, 15, 3).fill('#2563eb');
  doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold').text('PRINT KOT', x + 325, y + 56);

  doc.roundedRect(x + 400, y + 51, 90, 15, 3).fill('#16a34a');
  doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold').text('SETTLE & PAY', x + 418, y + 56);
});

drawImportantBox(
  'Adding Special Cooking Instructions',
  'If a guest says "make the noodles less spicy" or "no garlic in the dal", click the small pencil icon beside the item in the bill slip, type "Less Spicy", and print KOT. The instruction prints clearly for the chef in bold capital letters!'
);

// =============================================================================
// PAGE 6: MODULE 4  -  COLLECTING PAYMENTS & GST INVOICES
// =============================================================================
doc.addPage();
drawHeader('4', 'Collecting Payments & Printing Tax Invoices', 'Accepting Cash, UPI QR Code, Cards & Splitting Bills');

drawParagraph(
  'When you click "Settle & Pay", RestaurantOS opens the Payment Window. Here is how to handle each payment method smoothly:'
);

drawSectionHeading('4.1', 'Payment Method 1: Cash Payment (With Auto-Change Calculator)');
drawParagraph(
  '1. Click the "CASH" button on the payment window.\n2. The screen shows the Grand Total (e.g. Rs. 420).\n3. If the customer hands you a Rs. 500 note, type "500" in the Cash Received box.\n4. The screen instantly displays in big green letters: "RETURN CHANGE: Rs. 80". You never have to do mental math in your head or make calculation errors!\n5. Click "Print Tax Invoice". The cash drawer pops open automatically, and the receipt prints.'
);

drawSectionHeading('4.2', 'Payment Method 2: UPI / QR Code Payment (Google Pay, PhonePe, Paytm)');
drawParagraph(
  '1. Click the "UPI QR" button.\n2. A dynamic UPI QR code appears on the cashier screen (or on your counter customer display).\n3. Customer opens Google Pay, PhonePe, Paytm, or BHIM on their phone and scans the QR code.\n4. The exact bill amount is pre-filled on their phone. Once they pay and show you the green tick on their phone screen, click "Confirm Payment & Print".'
);

drawSectionHeading('4.3', 'Payment Method 3: Credit / Debit Card');
drawParagraph(
  '1. Swipe or insert the customer\'s card on your bank POS swipe machine (Pine Labs, Paytm Soundbox, or HDFC EDC).\n2. Once the card machine prints the bank slip, click "CARD" in RestaurantOS.\n3. Click "Complete & Print Tax Invoice".'
);

drawSectionHeading('4.4', 'Understanding the Printed GST Bill');
drawParagraph(
  'RestaurantOS automatically formats the bill according to official Indian GST rules:\n• Top: Restaurant Legal Name, Branch Address, Phone, and 15-digit GSTIN number.\n• Middle: Tax Invoice Number (e.g. INV-2026-0042), Date, Time, and Table Number.\n• Line Items: Item name, quantity, rate, and total amount.\n• Tax Breakdown: Subtotal, CGST 2.5%, SGST 2.5% (Total 5.0% GST), and Grand Total.\n• Bottom: "Thank You! Please Visit Again" and your restaurant Wi-Fi password.'
);

drawButtonCallout(
  'REPRINT INVOICE',
  'Shopping Bag -> Click Order -> Reprint',
  'If a customer asks for a duplicate receipt or if printer ran out of paper mid-print.'
);

// =============================================================================
// PAGE 7: MODULE 5  -  MANAGING TABLES & DINING ROOM
// =============================================================================
doc.addPage();
drawHeader('5', 'Managing Tables & Dining Room Floor', 'Keep track of every seated guest with 3 easy colors');

drawParagraph(
  'Click on the "Tables" button on the left sidebar (icon looks like a Fork & Knife). This screen gives you a bird\'s-eye view of your entire dining room. You can instantly see which tables are empty and which are occupied without walking into the dining hall.'
);

drawSectionHeading('5.1', 'The 3 Table Colors You Need to Know');

drawStepBox(
  1,
  'GREEN TABLE = Empty & Ready for Guests',
  'The table is clean and sanitized. When new guests arrive, click the green table tile to start taking their order immediately.',
  'If you have 10 tables and 6 are green, you have 6 tables available for walk-ins.'
);

drawStepBox(
  2,
  'RED TABLE = Guests Sitting & Eating (Active Bill)',
  'The table has an active order being prepared or served. The tile displays the running bill amount (e.g. Rs. 850) and a small timer showing how many minutes they have been seated (e.g. 24 mins).',
  'Clicking the red table allows you to add more rotis, drinks, or extra dishes.'
);

drawStepBox(
  3,
  'YELLOW TABLE = Bill Requested (Preparing to Vacate)',
  'The customer asked the waiter for the bill. The pre-bill has been printed and given to the table. This tells your floor manager that the table will become free in 2 to 3 minutes!',
  'Once payment is completed, the table resets back to clean GREEN automatically.'
);

drawScreenMockup('Dining Room Tables & Floor Map', 'http://localhost:3000/tables', 55, (x, y, w, h) => {
  // Table 1: Green
  doc.roundedRect(x + 5, y + 6, 115, 38, 4).fillAndStroke('#ecfdf5', '#10b981');
  doc.fillColor('#065f46').fontSize(7.5).font('Helvetica-Bold').text('TABLE T-01', x + 10, y + 10);
  doc.fillColor('#047857').fontSize(6.5).font('Helvetica').text('AVAILABLE (4 Seats)', x + 10, y + 20);
  doc.fillColor('#059669').fontSize(6).text(' Clean & Ready', x + 10, y + 29);

  // Table 2: Red
  doc.roundedRect(x + 128, y + 6, 115, 38, 4).fillAndStroke('#fff1f2', '#f43f5e');
  doc.fillColor('#881337').fontSize(7.5).font('Helvetica-Bold').text('TABLE T-02', x + 133, y + 10);
  doc.fillColor('#be123c').fontSize(6.5).font('Helvetica-Bold').text('Rs. 1,450 (32 mins)', x + 133, y + 20);
  doc.fillColor('#e11d48').fontSize(6).font('Helvetica').text(' Guests Eating (KOT #42)', x + 133, y + 29);

  // Table 3: Yellow
  doc.roundedRect(x + 251, y + 6, 118, 38, 4).fillAndStroke('#fefce8', '#eab308');
  doc.fillColor('#713f12').fontSize(7.5).font('Helvetica-Bold').text('TABLE T-03', x + 256, y + 10);
  doc.fillColor('#a16207').fontSize(6.5).font('Helvetica-Bold').text('BILL REQUESTED', x + 256, y + 20);
  doc.fillColor('#ca8a04').fontSize(6).font('Helvetica').text(' Pre-Bill Printed', x + 256, y + 29);

  // Table 4: QR Standee Card
  doc.roundedRect(x + 377, y + 6, 118, 38, 4).fillAndStroke('#eff6ff', '#3b82f6');
  doc.fillColor('#1e3a8a').fontSize(7).font('Helvetica-Bold').text('TABLE QR STANDEE', x + 382, y + 10);
  doc.fillColor('#1d4ed8').fontSize(6).font('Helvetica').text(' Scan with Camera', x + 382, y + 20);
  doc.fillColor('#2563eb').fontSize(6).text('No Waiter Needed', x + 382, y + 29);
});

drawSectionHeading('5.2', 'What if Guests Want to Move Tables? (Table Transfer)');
drawParagraph(
  'If a family is seated at Table 3, but Table 8 near the window becomes free and they ask to move: Click Table 3 -> Click the button "Transfer / Move Table" -> Click Table 8. All their food orders and running bill move to Table 8 instantly. You do not have to cancel or retype anything!'
);

drawSectionHeading('5.3', 'Merging Tables for Large Groups & Parties');
drawParagraph(
  'If a birthday party of 12 people joins Table 5 and Table 6 together: Click Table 5 -> Click "Merge Tables" -> Select Table 6. Both tables combine into a single master bill slip.'
);

// =============================================================================
// PAGE 8: MODULE 6  -  KITCHEN DISPLAY & KOT FOR COOKS
// =============================================================================
doc.addPage();
drawHeader('6', 'Kitchen Display & KOT for Your Cooks', 'Eliminate shouting, wrong food orders & slow cooking times');

drawParagraph(
  'In traditional restaurants, waiters run into the kitchen shouting orders, tickets get lost near the stove, and customers get angry when their food takes 45 minutes. RestaurantOS fixes this completely in two modern ways:'
);

drawSectionHeading('6.1', 'Option A: The Kitchen Order Ticket (KOT) Thermal Printer');
drawParagraph(
  'Place a small 80mm thermal receipt printer inside your kitchen connected by LAN wire or WiFi. Whenever a waiter or cashier punches an order on POS, the kitchen printer instantly spits out a clean white KOT ticket with:\n• Big Table Number (e.g. TABLE 7)\n• Time & KOT Serial Number (e.g. KOT #28)\n• List of Dishes with Quantities (e.g. 2x Garlic Naan, 1x Paneer Tikka)\n• Cooking notes in bold (e.g. LESS OIL, VERY CRISPY)'
);

drawSectionHeading('6.2', 'Option B: The Kitchen Display Screen (KDS Tablet / TV)');
drawParagraph(
  'Instead of paper tickets that can get wet or greasy, mount a cheap Android tablet or TV screen on the kitchen wall. Open "Kitchen Display" on the left menu (icon looks like a Chef Hat). Orders appear as large colorful cards:'
);

const kdsStates = [
  { status: 'GREEN CARD (0 to 10 mins)', meaning: 'Freshly ordered food. The cook has just started preparing it.' },
  { status: 'YELLOW CARD (10 to 20 mins)', meaning: 'Cooking in progress. Chef should be plating the food soon.' },
  { status: 'RED CARD (Over 20 mins)', meaning: 'Order is running late! Alerts the kitchen captain to expedite the food immediately.' },
];

let ky = doc.y;
for (const s of kdsStates) {
  doc.roundedRect(45, ky, 505, 24, 4).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);
  doc.fillColor(COLOR_PRIMARY_DARK).fontSize(8.5).font('Helvetica-Bold');
  doc.text(s.status, 55, ky + 6, { width: 170 });
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8).font('Helvetica');
  doc.text(s.meaning, 230, ky + 6, { width: 310 });
  ky += 28;
}
doc.y = ky + 5;

drawParagraph(
  'When the cook finishes cooking the dish, they tap the screen on "Mark Ready". An alert sounds on the waiter\'s phone or counter display so the food is served steaming hot!'
);

drawScreenMockup('Kitchen Display System (KDS) Live Order Queue', 'http://localhost:3000/kitchen', 65, (x, y, w, h) => {
  // Ticket 1: Preparing
  doc.roundedRect(x + 5, y + 6, 240, 48, 3).fillAndStroke('#ffffff', '#f59e0b');
  doc.rect(x + 5, y + 6, 240, 12).fill('#fef3c7');
  doc.fillColor('#92400e').fontSize(6.5).font('Helvetica-Bold').text('KOT #42 • TABLE 4  (12 mins ago • PREPARING)', x + 10, y + 9);
  doc.fillColor('#1e293b').fontSize(6.5).font('Helvetica').text('• 2x Murgh Dum Biryani  [LESS SPICY]', x + 10, y + 22);
  doc.fillColor('#1e293b').fontSize(6.5).text('• 2x Butter Garlic Naan', x + 10, y + 31);
  doc.roundedRect(x + 172, y + 26, 68, 16, 3).fill('#16a34a');
  doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold').text('MARK READY', x + 179, y + 31);

  // Ticket 2: New Order
  doc.roundedRect(x + 252, y + 6, 242, 48, 3).fillAndStroke('#ffffff', '#10b981');
  doc.rect(x + 252, y + 6, 242, 12).fill('#d1fae5');
  doc.fillColor('#065f46').fontSize(6.5).font('Helvetica-Bold').text('KOT #43 • TABLE 1  (3 mins ago • NEW ORDER)', x + 257, y + 9);
  doc.fillColor('#1e293b').fontSize(6.5).font('Helvetica').text('• 1x Paneer Tikka Angara  [TANDOOR]', x + 257, y + 22);
  doc.fillColor('#1e293b').fontSize(6.5).text('• 2x Fresh Lime Soda  [BAR]', x + 257, y + 31);
  doc.roundedRect(x + 420, y + 26, 68, 16, 3).fill('#2563eb');
  doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold').text('START COOK', x + 427, y + 31);
});

// =============================================================================
// PAGE 9: MODULE 7  -  MANAGING STOREROOM & INVENTORY
// =============================================================================
doc.addPage();
drawHeader('7', 'Managing Storeroom & Raw Ingredients', 'Stop food theft, track raw material costs & avoid running out');

drawParagraph(
  'Your food inventory is your money sitting on storeroom shelves. If raw chicken, paneer, cooking oil, or Basmati rice go missing or spoil, your profits vanish. RestaurantOS tracks your storeroom automatically:'
);

drawStepBox(
  1,
  'Step 1: Open the Inventory Screen',
  'Click on "Inventory" on the left menu (icon looks like a Cardboard Box). You will see your raw material items, current stock levels, and valuation numbers.',
  'At the top, you see 4 cards: Total Stock Valuation, Low Stock Alerts, Food Cost %, and Wastage Value.'
);

drawStepBox(
  2,
  'Step 2: Add Your Raw Materials (Rice, Oil, Paneer, Spices)',
  'Click the black button "+ Add Raw Material". Enter:\n• Item Name: e.g. "Basmati Rice" or "Amul Butter".\n• Category: Dairy, Grains, Poultry, Vegetables, or Spices.\n• Unit: Kilograms (KG), Liters (L), or Packets (PKT).\n• Minimum Stock Level: e.g. 5 KG. When stock drops below 5 KG, the system alerts you!',
  'Setting minimum levels ensures your manager purchases refills before stock runs out.'
);

drawStepBox(
  3,
  'Step 3: How Automatic Stock Deduction Works (Recipe BOM)',
  'Whenever a cashier sells 1 Butter Chicken on POS, RestaurantOS automatically deducts: 250g Chicken, 30g Butter, and 50ml Cream from your digital storeroom! You never have to manually count items every hour.',
  'This connects your kitchen sales directly to your storeroom inventory.'
);

drawStepBox(
  4,
  'Step 4: Recording Food Wastage or Spoilage',
  'If 2 liters of milk spoiled overnight or a cook burned a pot of gravy: Click the button "Record Wastage" -> Select item -> Enter quantity -> Pick reason ("Spoiled" or "Burnt").',
  'Recording waste keeps your profit reports accurate and highlights kitchen careless habits.'
);

drawImportantBox(
  'Why Food Cost % Matters to You',
  'Your Food Cost % should ideally stay between 28% and 32%. If your food cost goes above 35%, it means cooks are wasting ingredients or staff is giving away unauthorized free food. RestaurantOS alerts you on your dashboard in bright red!'
);

// =============================================================================
// PAGE 10: MODULE 8  -  STAFF, PASSWORDS & SECURITY
// =============================================================================
doc.addPage();
drawHeader('8', 'Staff Management & 4-Digit PIN Security', 'Give employees their own login while keeping your money safe');

drawParagraph(
  'You cannot be at the restaurant 24 hours a day. RestaurantOS allows you to give every staff member their own simple 4-digit PIN (just like an ATM PIN) so they can do their job without accessing your confidential financial numbers.'
);

drawSectionHeading('8.1', 'The 4 Staff Roles & What They Can See');

const staffRoles = [
  { role: 'Owner / General Manager', pin: 'Master PIN', access: 'Can see EVERYTHING: Daily profits, expenses, total bank collections, staff salaries, and change menu prices.' },
  { role: 'Cashier', pin: 'Cashier PIN', access: 'Can bill orders, accept cash/UPI, and print receipts. CANNOT delete bills, view monthly net profits, or change menu prices.' },
  { role: 'Waiter / Captain', pin: 'Waiter PIN', access: 'Can take orders at dining tables and punch KOTs from their mobile or tablet. CANNOT collect cash or settle bills.' },
  { role: 'Cook / Kitchen Staff', pin: 'Kitchen PIN', access: 'Can only see the Kitchen Display Screen to cook orders and tap "Mark Ready". No access to billing or customer details.' },
];

let ry = doc.y;
for (const r of staffRoles) {
  doc.roundedRect(45, ry, 505, 34, 4).fillAndStroke(COLOR_BG_LIGHT, COLOR_BORDER);
  doc.fillColor(COLOR_PRIMARY_DARK).fontSize(9).font('Helvetica-Bold');
  doc.text(r.role, 55, ry + 7, { width: 140 });
  doc.fillColor(COLOR_SECONDARY).fontSize(8).font('Helvetica-Oblique');
  doc.text(`[ ${r.pin} ]`, 200, ry + 7, { width: 90 });
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8).font('Helvetica');
  doc.text(r.access, 295, ry + 7, { width: 245 });
  ry += 38;
}
doc.y = ry + 5;

drawSectionHeading('8.2', 'How to Add a New Staff Member in 3 Steps');
drawParagraph(
  '1. Click on "Staff" on the left menu (People icon).\n2. Click the black button "+ Add Staff Member".\n3. Type their Name (e.g. "Ramesh Kumar"), select their Role ("Cashier"), and type a 4-digit PIN (e.g. "4582"). Click Save. That\'s it! Ramesh can now log into the terminal using PIN 4582.'
);

drawSectionHeading('8.3', 'Preventing Theft: Supervisor Approval for Cancelled Bills');
drawParagraph(
  'In dishonest restaurants, cashiers sometimes collect cash from a customer, pocket the money, and then delete the bill from the computer. In RestaurantOS, a cashier CANNOT delete or void a bill without an Owner or Manager typing their Master PIN! Every voided item is permanently logged in the audit trail.'
);

// =============================================================================
// PAGE 11: MODULE 9  -  THE DAILY ROUTINE (OPENING TO CLOSING)
// =============================================================================
doc.addPage();
drawHeader('9', 'The Daily Routine: Opening, Rush & Closing', 'Your restaurant\'s complete operating rhythm in 3 simple checklists');

drawParagraph(
  'To make sure your restaurant runs like clockwork every day, follow this standard 3-step routine:'
);

drawSectionHeading('9.1', 'Morning Opening Checklist (Takes 3 Minutes)');
drawStepBox(
  1,
  '1. Turn On Billing PC & Check Printer',
  'Turn on your computer, double-click the RestaurantOS icon. Make sure the thermal printer has a fresh paper roll and the green power light is on.',
  'Feed 1 test receipt to make sure paper is not jammed.'
);
drawStepBox(
  2,
  '2. Start Cash Shift (Enter Starting Float / Petty Cash)',
  'Click Staff -> Shift Register. Enter the cash currently in your physical cash drawer (e.g. Rs. 2,000 in small change notes for customer balance). This is your starting float.',
  'Starting float prevents confusing opening change with today\'s fresh sales.'
);
drawStepBox(
  3,
  '3. Quick Menu Scan for Out-of-Stock Items',
  'Ask your chef if any ingredient is missing today. If fish or mutton is not available, toggle it to "Sold Out" on the Menu screen before the lunch crowd arrives.',
  'Avoids embarrassing situations where guests order an unavailable dish.'
);

drawSectionHeading('9.2', 'Night Closing & Daily Z-Report (Takes 2 Minutes)');
drawParagraph(
  'At the end of the night after the last guest leaves, you must close the business day and verify your money:'
);
drawStepBox(
  4,
  '1. Open Home / Overview & Click "Export Z-Report"',
  'At the top right of the Overview screen, click the button "Export Z-Report". The software instantly compiles all orders settled between morning and night.',
  'Z-Report is the official daily business closure summary.'
);
drawStepBox(
  5,
  '2. Match the Numbers with Your Physical Cash Drawer',
  'The Z-Report displays:\n• Total Cash Sales: e.g. Rs. 18,450\n• Total UPI (GPay/PhonePe): e.g. Rs. 24,800\n• Total Card Sales: e.g. Rs. 12,300\n• Total GST Collected: e.g. Rs. 2,780\nCount the cash notes in your physical counter drawer. If your cash matches the screen number, your cashier has accounted for every single rupee! Lock the cash drawer and shut down.'
);

drawScreenMockup('Daily Z-Report Shift Closure Snapshot', 'http://localhost:3000/reports', 62, (x, y, w, h) => {
  // Receipt Paper Mockup
  doc.roundedRect(x + 120, y + 5, 260, 48, 3).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('BAWARCHI ROYALE  -  DAILY Z-REPORT (Shift #44)', x + 130, y + 9);
  doc.fillColor('#475569').fontSize(6).font('Helvetica').text('Cash Sales: Rs. 18,450  |  UPI (QR): Rs. 24,800  |  Cards: Rs. 12,300', x + 130, y + 20);
  doc.fillColor('#475569').fontSize(6).text('Total Revenue: Rs. 55,550.00  |  GST Tax Collected (5%): Rs. 2,778.00', x + 130, y + 29);
  doc.roundedRect(x + 130, y + 37, 240, 12, 2).fill('#ecfdf5');
  doc.fillColor('#047857').fontSize(6.5).font('Helvetica-Bold').text(' PHYSICAL CASH DRAWER RECONCILIATION: 100% MATCH', x + 140, y + 40);
});

// =============================================================================
// PAGE 12: MODULE 10  -  SIMPLE TROUBLESHOOTING & FAQ
// =============================================================================
doc.addPage();
drawHeader('10', 'Frequently Asked Questions & Don\'t Panic Guide', 'Simple answers to common situations you might face');

drawSectionHeading('10.1', 'Common Questions & 10-Second Fixes');

const faqs = [
  {
    q: 'Q1: What if my internet goes down or WiFi disconnects?',
    a: 'DON\'T PANIC! RestaurantOS runs in Offline-First mode. You can keep taking orders, printing KOTs, settling bills, and giving change. All bills are saved safely on your computer. As soon as internet reconnects, everything syncs to the cloud automatically.',
  },
  {
    q: 'Q2: The thermal receipt printer is not printing!',
    a: 'Check 3 things:\n1. Is the printer power switch ON with blue/green light?\n2. Did the paper roll finish? Open the lid, insert a new thermal roll (make sure paper feeds from under the roll, not over).\n3. Is the USB cable firmly plugged into the computer?',
  },
  {
    q: 'Q3: A customer wants to apply a 10% discount on their bill.',
    a: 'On the POS billing screen, look right below the item list. Click the button "Apply Discount". You can choose 10% percentage discount or type a flat Rupee discount (e.g. Rs. 50 off). The bill recalculates taxes and totals instantly.',
  },
  {
    q: 'Q4: How do I change the price of a dish if vegetable prices increase?',
    a: 'Go to Menu on the left sidebar -> Click the dish name -> In the "Price" box, delete the old number and type the new price (e.g. from 250 to 280) -> Click Save. The new price takes effect immediately on all billing screens.',
  },
  {
    q: 'Q5: Can I open RestaurantOS on my mobile phone while at home?',
    a: 'YES! RestaurantOS is cloud-ready. You can open your restaurant link on your iPhone or Android phone, log in with your Owner credentials, and see live sales updates, table status, and daily revenue while relaxing at home.',
  },
];

let fqY = doc.y;
for (const f of faqs) {
  doc.fillColor(COLOR_PRIMARY_DARK).fontSize(9).font('Helvetica-Bold');
  doc.text(f.q, 45, fqY, { width: 505 });
  fqY = doc.y + 2;
  doc.fillColor(COLOR_TEXT_MAIN).fontSize(8.5).font('Helvetica').lineGap(2);
  doc.text(f.a, 45, fqY, { width: 505 });
  fqY = doc.y + 8;
}
doc.y = fqY;

drawImportantBox(
  'Congratulations! You Are Ready to Run Your Restaurant Like a Pro',
  'Remember: Software is just a tool to help you serve delicious food and keep your hard-earned profits safe. Keep this guide near your counter, train your staff for 15 minutes, and enjoy watching your restaurant grow!',
  COLOR_GREEN
);

// End document stream
doc.end();

console.log('RestaurantOS Owner Beginner Manual generated successfully at:');
console.log('1.', OUTPUT_PUBLIC_PATH);
console.log('2.', OUTPUT_DOCS_PATH);
console.log('3.', OUTPUT_ARTIFACT_PATH);
