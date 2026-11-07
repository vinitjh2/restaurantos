/**
 * RestaurantOS Authoritative Backend Financial Calculation Engine
 * 
 * CRITICAL BUSINESS RULES:
 * 1. All calculations must happen strictly on the backend.
 * 2. Never trust frontend numbers, prices, or taxes.
 * 3. Enforce Indian F&B GST slabs (CGST + SGST = 5% or IGST = 5%).
 * 4. Handle both Tax-Inclusive and Tax-Exclusive pricing models.
 * 5. Mathematical round-off to nearest whole Rupee (INR).
 */

export interface ItemCalculationInput {
  menuItemId: string;
  name: string;
  basePrice: number;
  variantId?: string | null;
  variantName?: string | null;
  variantPrice?: number;
  modifierOptions?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  quantity: number;
  discountPercentage?: number;
  discountAmount?: number;
  discountReason?: string;
  cookingNotes?: string;
}

export interface BillingCalculationInput {
  items: ItemCalculationInput[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "PICKUP";
  billDiscountPercentage?: number;
  billDiscountAmount?: number;
  billDiscountReason?: string;
  packagingCharge?: number;
  deliveryCharge?: number;
  serviceChargePercentage?: number;
  isTaxInclusive?: boolean;
  cgstRate?: number; // Standard 2.5% in India
  sgstRate?: number; // Standard 2.5% in India
  igstRate?: number; // Standard 0% (or 5% if interstate)
}

export interface CalculatedLineItem {
  menuItemId: string;
  name: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  modifierTotal: number;
  effectiveUnitPrice: number;
  grossLineTotal: number;
  discountAmount: number;
  netLineTotal: number;
  cookingNotes?: string;
  modifierOptions: Array<{ id: string; name: string; price: number }>;
}

export interface CalculatedBillSummary {
  lineItems: CalculatedLineItem[];
  subtotal: number;
  totalItemDiscounts: number;
  netItemSubtotal: number;
  billDiscount: number;
  billDiscountReason?: string;
  discountedSubtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  serviceCharge: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  isTaxInclusive: boolean;
  rawTotal: number;
  grandTotal: number;
  roundOff: number;
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateOrderTotals(input: BillingCalculationInput): CalculatedBillSummary {
  const isTaxInclusive = input.isTaxInclusive ?? false;
  const cgstRate = input.cgstRate ?? 2.5;
  const sgstRate = input.sgstRate ?? 2.5;
  const igstRate = input.igstRate ?? 0.0;
  const totalTaxRate = cgstRate + sgstRate + igstRate;

  let subtotal = 0;
  let totalItemDiscounts = 0;

  const lineItems: CalculatedLineItem[] = input.items.map((item) => {
    const unitPrice = item.variantPrice !== undefined && item.variantPrice !== null
      ? item.variantPrice
      : item.basePrice;

    const modifierTotal = (item.modifierOptions || []).reduce((acc, m) => acc + (m.price || 0), 0);
    const effectiveUnitPrice = unitPrice + modifierTotal;
    const grossLineTotal = roundToTwo(effectiveUnitPrice * item.quantity);

    let discountAmount = 0;
    if (item.discountPercentage && item.discountPercentage > 0) {
      discountAmount = roundToTwo(grossLineTotal * (Math.min(item.discountPercentage, 100) / 100));
    } else if (item.discountAmount && item.discountAmount > 0) {
      discountAmount = Math.min(item.discountAmount, grossLineTotal);
    }

    const netLineTotal = roundToTwo(grossLineTotal - discountAmount);
    subtotal += grossLineTotal;
    totalItemDiscounts += discountAmount;

    return {
      menuItemId: item.menuItemId,
      name: item.name,
      variantId: item.variantId,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice,
      modifierTotal,
      effectiveUnitPrice,
      grossLineTotal,
      discountAmount,
      netLineTotal,
      cookingNotes: item.cookingNotes,
      modifierOptions: item.modifierOptions || [],
    };
  });

  subtotal = roundToTwo(subtotal);
  totalItemDiscounts = roundToTwo(totalItemDiscounts);
  const netItemSubtotal = roundToTwo(subtotal - totalItemDiscounts);

  // Bill-Level Discount
  let billDiscount = 0;
  if (input.billDiscountPercentage && input.billDiscountPercentage > 0) {
    billDiscount = roundToTwo(netItemSubtotal * (Math.min(input.billDiscountPercentage, 100) / 100));
  } else if (input.billDiscountAmount && input.billDiscountAmount > 0) {
    billDiscount = Math.min(input.billDiscountAmount, netItemSubtotal);
  }
  billDiscount = roundToTwo(billDiscount);

  const discountedSubtotal = roundToTwo(netItemSubtotal - billDiscount);

  // Packaging and Delivery Charges
  const packagingCharge =
    input.orderType === "TAKEAWAY" || input.orderType === "DELIVERY"
      ? roundToTwo(input.packagingCharge ?? 25)
      : 0;

  const deliveryCharge =
    input.orderType === "DELIVERY" ? roundToTwo(input.deliveryCharge ?? 40) : 0;

  // Service Charge (Voluntary F&B standard)
  const serviceChargePercentage = input.serviceChargePercentage ?? 0;
  const serviceCharge =
    serviceChargePercentage > 0
      ? roundToTwo(discountedSubtotal * (serviceChargePercentage / 100))
      : 0;

  // Indian GST Calculation
  let taxableAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalTax = 0;

  if (isTaxInclusive) {
    // Back-calculate base taxable amount: Base = Gross / (1 + Rate / 100)
    const grossTaxablePool = discountedSubtotal + packagingCharge + serviceCharge;
    taxableAmount = roundToTwo(grossTaxablePool / (1 + totalTaxRate / 100));
    totalTax = roundToTwo(grossTaxablePool - taxableAmount);
    if (totalTaxRate > 0) {
      cgstAmount = roundToTwo(totalTax * (cgstRate / totalTaxRate));
      sgstAmount = roundToTwo(totalTax * (sgstRate / totalTaxRate));
      igstAmount = roundToTwo(totalTax - cgstAmount - sgstAmount);
    }
  } else {
    // Tax-Exclusive model: Add tax on top
    taxableAmount = roundToTwo(discountedSubtotal + packagingCharge + serviceCharge);
    cgstAmount = roundToTwo(taxableAmount * (cgstRate / 100));
    sgstAmount = roundToTwo(taxableAmount * (sgstRate / 100));
    igstAmount = roundToTwo(taxableAmount * (igstRate / 100));
    totalTax = roundToTwo(cgstAmount + sgstAmount + igstAmount);
  }

  // Raw Total before Round-Off
  const rawTotal = isTaxInclusive
    ? roundToTwo(discountedSubtotal + packagingCharge + serviceCharge + deliveryCharge)
    : roundToTwo(taxableAmount + totalTax + deliveryCharge);

  // Indian Currency Round-Off to Nearest Whole Rupee
  const grandTotal = Math.round(rawTotal);
  const roundOff = roundToTwo(grandTotal - rawTotal);

  return {
    lineItems,
    subtotal,
    totalItemDiscounts,
    netItemSubtotal,
    billDiscount,
    billDiscountReason: input.billDiscountReason,
    discountedSubtotal,
    packagingCharge,
    deliveryCharge,
    serviceCharge,
    taxableAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    isTaxInclusive,
    rawTotal,
    grandTotal,
    roundOff,
  };
}

/**
 * Generate UPI Payment Link compatible with BHIM / GPay / PhonePe / Paytm
 * Schema: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tn=<invoiceNumber>&cu=INR
 */
export function generateUPILink(params: {
  vpa: string;
  merchantName: string;
  amount: number;
  invoiceNumber: string;
}): string {
  const vpa = encodeURIComponent(params.vpa);
  const name = encodeURIComponent(params.merchantName);
  const amt = params.amount.toFixed(2);
  const note = encodeURIComponent(`Bill ${params.invoiceNumber}`);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${amt}&tn=${note}&cu=INR`;
}
