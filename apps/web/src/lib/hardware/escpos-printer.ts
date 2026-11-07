/**
 * RestaurantOS ESC/POS Hardware Integration Driver
 * Supports 58mm & 80mm thermal receipt printers, raw kitchen printers,
 * electronic cash drawer solenoids, and Customer-Facing Displays (CFD).
 */

// Common ESC/POS Control Sequences
export const ESCPOS_COMMANDS = {
  // Initialization
  INIT: '\x1B\x40',
  // Text alignment
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_RIGHT: '\x1B\x61\x02',
  // Font emphasis
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  UNDERLINE_ON: '\x1B\x2D\x01',
  UNDERLINE_OFF: '\x1B\x2D\x00',
  // Text sizing
  NORMAL_TEXT: '\x1D\x21\x00',
  DOUBLE_HEIGHT: '\x1D\x21\x01',
  DOUBLE_WIDTH: '\x1D\x21\x10',
  DOUBLE_SIZE: '\x1D\x21\x11',
  TRIPLE_SIZE: '\x1D\x21\x22',
  // Paper feed & cut
  FEED_3_LINES: '\x1B\x64\x03',
  FEED_5_LINES: '\x1B\x64\x05',
  CUT_FULL: '\x1D\x56\x00',
  CUT_PARTIAL: '\x1D\x56\x01',
  // Cash drawer kick pulse: Pin 2 (Standard Star/Epson RJ12 connector)
  DRAWER_KICK_PIN2: '\x1B\x70\x00\x19\xFA',
  DRAWER_KICK_PIN5: '\x1B\x70\x01\x19\xFA',
};

export interface ReceiptPrintData {
  restaurantName: string;
  branchName: string;
  address: string;
  phone: string;
  gstin?: string;
  fssai?: string;
  invoiceNumber: string;
  orderNumber: string;
  orderType: string;
  tableNumber?: string;
  date: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    modifiers?: string[];
  }>;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  roundOff?: number;
  paymentMethod: string;
  upiTxRef?: string;
}

export interface KOTPrintData {
  kotNumber: string;
  orderNumber: string;
  station: string;
  orderType: string;
  tableNumber?: string;
  serverName?: string;
  timestamp: string;
  items: Array<{
    name: string;
    variantName?: string;
    quantity: number;
    modifiers?: string[];
    cookingNotes?: string;
  }>;
}

/**
 * Pads left and right strings to fit exact fixed character column width
 */
function justifyRow(left: string, right: string, width: number): string {
  const leftTrim = left.substring(0, width - right.length - 1);
  const spaces = Math.max(1, width - leftTrim.length - right.length);
  return leftTrim + ' '.repeat(spaces) + right;
}

/**
 * Generates an 80mm ESC/POS raw command buffer (48 characters per line)
 */
export function buildReceipt80mm(data: ReceiptPrintData): string {
  const W = 48;
  const divider = '-'.repeat(W);
  const doubleDivider = '='.repeat(W);

  let out = ESCPOS_COMMANDS.INIT;

  // Header
  out += ESCPOS_COMMANDS.ALIGN_CENTER;
  out += ESCPOS_COMMANDS.DOUBLE_SIZE + ESCPOS_COMMANDS.BOLD_ON + data.restaurantName + '\n';
  out += ESCPOS_COMMANDS.NORMAL_TEXT + ESCPOS_COMMANDS.BOLD_OFF;
  out += data.branchName + '\n';
  out += data.address + '\n';
  out += `Tel: ${data.phone}\n`;
  if (data.gstin) out += `GSTIN: ${data.gstin}\n`;
  if (data.fssai) out += `FSSAI: ${data.fssai}\n`;

  out += ESCPOS_COMMANDS.ALIGN_LEFT;
  out += doubleDivider + '\n';
  out += `TAX INVOICE: ${data.invoiceNumber}\n`;
  out += justifyRow(`Date: ${data.date}`, data.tableNumber ? `Table: ${data.tableNumber}` : '', W) + '\n';
  out += `Order: ${data.orderNumber} (${data.orderType})\n`;
  if (data.cashierName) out += `Cashier: ${data.cashierName}\n`;
  if (data.customerName) out += `Customer: ${data.customerName} (${data.customerPhone || ''})\n`;
  if (data.customerGstin) out += `B2B GSTIN: ${data.customerGstin}\n`;

  out += divider + '\n';
  // Item Columns: Item (26), Qty (6), Rate (7), Total (9)
  out += ESCPOS_COMMANDS.BOLD_ON;
  out += 'ITEM'.padEnd(24) + 'QTY'.padStart(6) + 'RATE'.padStart(8) + 'TOTAL'.padStart(10) + '\n';
  out += ESCPOS_COMMANDS.BOLD_OFF;
  out += divider + '\n';

  for (const item of data.items) {
    const itemLine = item.name.substring(0, 24).padEnd(24) +
      String(item.quantity).padStart(6) +
      item.price.toFixed(2).padStart(8) +
      item.total.toFixed(2).padStart(10);
    out += itemLine + '\n';
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        out += `  + ${mod.substring(0, 44)}\n`;
      }
    }
  }

  out += divider + '\n';
  out += justifyRow('Subtotal:', `Rs.${data.subtotal.toFixed(2)}`, W) + '\n';
  if (data.discount > 0) {
    out += justifyRow('Discount:', `-Rs.${data.discount.toFixed(2)}`, W) + '\n';
  }
  out += justifyRow('Taxable Amount:', `Rs.${data.taxableAmount.toFixed(2)}`, W) + '\n';
  out += justifyRow('CGST (2.5%):', `Rs.${data.cgst.toFixed(2)}`, W) + '\n';
  out += justifyRow('SGST (2.5%):', `Rs.${data.sgst.toFixed(2)}`, W) + '\n';
  if (data.roundOff) {
    out += justifyRow('Round Off:', `Rs.${data.roundOff.toFixed(2)}`, W) + '\n';
  }

  out += doubleDivider + '\n';
  out += ESCPOS_COMMANDS.BOLD_ON + ESCPOS_COMMANDS.DOUBLE_HEIGHT;
  out += justifyRow('GRAND TOTAL:', `Rs.${data.grandTotal.toFixed(2)}`, W) + '\n';
  out += ESCPOS_COMMANDS.NORMAL_TEXT + ESCPOS_COMMANDS.BOLD_OFF;
  out += doubleDivider + '\n';

  out += ESCPOS_COMMANDS.ALIGN_LEFT;
  out += `Payment Mode: ${data.paymentMethod}\n`;
  if (data.upiTxRef) out += `UPI Ref: ${data.upiTxRef}\n`;

  out += ESCPOS_COMMANDS.ALIGN_CENTER;
  out += '\nThank you for dining with us!\nPlease visit again!\n';
  out += ESCPOS_COMMANDS.FEED_5_LINES;
  out += ESCPOS_COMMANDS.CUT_FULL;

  return out;
}

/**
 * Generates a 58mm compact ESC/POS raw command buffer (32 characters per line)
 */
export function buildReceipt58mm(data: ReceiptPrintData): string {
  const W = 32;
  const divider = '-'.repeat(W);
  const doubleDivider = '='.repeat(W);

  let out = ESCPOS_COMMANDS.INIT;

  // Header
  out += ESCPOS_COMMANDS.ALIGN_CENTER;
  out += ESCPOS_COMMANDS.BOLD_ON + data.restaurantName.substring(0, 32) + '\n';
  out += ESCPOS_COMMANDS.BOLD_OFF;
  out += data.branchName.substring(0, 32) + '\n';
  if (data.gstin) out += `GST: ${data.gstin}\n`;

  out += ESCPOS_COMMANDS.ALIGN_LEFT;
  out += doubleDivider + '\n';
  out += `Inv: ${data.invoiceNumber}\n`;
  out += `Date: ${data.date}\n`;
  if (data.tableNumber) out += `Table: ${data.tableNumber} | `;
  out += `Type: ${data.orderType}\n`;

  out += divider + '\n';
  out += 'ITEM'.padEnd(16) + 'QTY'.padStart(4) + 'TOTAL'.padStart(12) + '\n';
  out += divider + '\n';

  for (const item of data.items) {
    const itemName = item.name.substring(0, 15).padEnd(16);
    const qty = String(item.quantity).padStart(4);
    const tot = item.total.toFixed(2).padStart(12);
    out += itemName + qty + tot + '\n';
  }

  out += divider + '\n';
  out += justifyRow('Subtotal:', `Rs.${data.subtotal.toFixed(2)}`, W) + '\n';
  if (data.discount > 0) {
    out += justifyRow('Disc:', `-Rs.${data.discount.toFixed(2)}`, W) + '\n';
  }
  out += justifyRow('Taxes (5%):', `Rs.${(data.cgst + data.sgst).toFixed(2)}`, W) + '\n';
  out += doubleDivider + '\n';

  out += ESCPOS_COMMANDS.BOLD_ON;
  out += justifyRow('TOTAL:', `Rs.${data.grandTotal.toFixed(2)}`, W) + '\n';
  out += ESCPOS_COMMANDS.BOLD_OFF;
  out += `Paid via: ${data.paymentMethod}\n`;

  out += ESCPOS_COMMANDS.ALIGN_CENTER;
  out += '\n*** THANK YOU ***\n';
  out += ESCPOS_COMMANDS.FEED_3_LINES;
  out += ESCPOS_COMMANDS.CUT_PARTIAL;

  return out;
}

/**
 * Generates an ESC/POS Kitchen Order Ticket (KOT)
 */
export function buildKitchenKOT(data: KOTPrintData): string {
  const W = 48;
  const divider = '-'.repeat(W);
  const doubleDivider = '='.repeat(W);

  let out = ESCPOS_COMMANDS.INIT;
  out += ESCPOS_COMMANDS.ALIGN_CENTER;
  out += ESCPOS_COMMANDS.DOUBLE_SIZE + ESCPOS_COMMANDS.BOLD_ON;
  out += `*** KOT - ${data.station.toUpperCase()} ***\n`;
  out += ESCPOS_COMMANDS.NORMAL_TEXT + ESCPOS_COMMANDS.BOLD_OFF;

  out += ESCPOS_COMMANDS.ALIGN_LEFT;
  out += doubleDivider + '\n';
  out += ESCPOS_COMMANDS.BOLD_ON + ESCPOS_COMMANDS.DOUBLE_HEIGHT;
  out += justifyRow(`KOT #: ${data.kotNumber}`, data.tableNumber ? `TABLE: ${data.tableNumber}` : data.orderType, W) + '\n';
  out += ESCPOS_COMMANDS.NORMAL_TEXT + ESCPOS_COMMANDS.BOLD_OFF;
  out += justifyRow(`Order #: ${data.orderNumber}`, data.timestamp, W) + '\n';
  if (data.serverName) out += `Captain / Server: ${data.serverName}\n`;

  out += divider + '\n';
  out += ESCPOS_COMMANDS.BOLD_ON;
  out += 'QTY'.padEnd(8) + 'ITEM DESCRIPTION' + '\n';
  out += ESCPOS_COMMANDS.BOLD_OFF;
  out += divider + '\n';

  for (const item of data.items) {
    out += ESCPOS_COMMANDS.DOUBLE_HEIGHT + ESCPOS_COMMANDS.BOLD_ON;
    const qtyStr = `[ ${item.quantity} ]`.padEnd(8);
    const itemName = item.variantName ? `${item.name} (${item.variantName})` : item.name;
    out += `${qtyStr} ${itemName}\n`;
    out += ESCPOS_COMMANDS.NORMAL_TEXT + ESCPOS_COMMANDS.BOLD_OFF;

    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        out += `         >> + ${mod}\n`;
      }
    }
    if (item.cookingNotes) {
      out += ESCPOS_COMMANDS.BOLD_ON;
      out += `         ** NOTE: ${item.cookingNotes.toUpperCase()} **\n`;
      out += ESCPOS_COMMANDS.BOLD_OFF;
    }
  }

  out += doubleDivider + '\n';
  out += ESCPOS_COMMANDS.FEED_5_LINES;
  out += ESCPOS_COMMANDS.CUT_FULL;

  return out;
}

/**
 * Returns raw bytes to fire the cash drawer solenoid (Pin 2: ESC p 0 25 250)
 */
export function getCashDrawerPulse(): Uint8Array {
  return new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
}

/**
 * Converts string commands to binary buffer for USB / Serial / Network transmission
 */
export function encodeCommandString(commandStr: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(commandStr);
}

/**
 * Customer-Facing Display (CFD) VFD 2x20 Pole Display Formatter
 */
export function buildVFDpoleDisplay(line1: string, line2: string): string {
  // Clear display: 0x0C
  // Move to line 1: 0x1F 0x24 0x01 0x01
  // Move to line 2: 0x1F 0x24 0x01 0x02
  const CLR = '\x0C';
  const L1 = line1.substring(0, 20).padEnd(20);
  const L2 = line2.substring(0, 20).padEnd(20);
  return `${CLR}${L1}${L2}`;
}
