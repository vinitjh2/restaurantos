import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { calculateOrderTotals, generateUPILink } from "@/lib/server/billing-engine";
import { deductStockForOrder } from "@/lib/server/inventory-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      orderType,
      tableNumber,
      customerName,
      customerPhone,
      customerGstin,
      billDiscountPercentage,
      billDiscountAmount,
      billDiscountReason,
      packagingCharge,
      deliveryCharge,
      serviceChargePercentage,
      payments, // Array of { method: "CASH" | "UPI" | "CARD", amount: number, transactionRef?: string }
    } = body;

    // 1. Authoritative Backend Calculation
    const branch = await prisma.branch.findFirst({ where: { code: "IND" } });
    const calc = calculateOrderTotals({
      items,
      orderType: orderType || "DINE_IN",
      billDiscountPercentage,
      billDiscountAmount,
      billDiscountReason,
      packagingCharge,
      deliveryCharge,
      serviceChargePercentage,
      cgstRate: branch?.cgstRate ?? 2.5,
      sgstRate: branch?.sgstRate ?? 2.5,
      igstRate: branch?.igstRate ?? 0.0,
      isTaxInclusive: branch?.isTaxInclusive ?? false,
    });

    // 2. Verify Payments
    const totalPaid = (payments || []).reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
    if (totalPaid < calc.grandTotal) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient payment. Required: ₹${calc.grandTotal}, Received: ₹${totalPaid}`,
        },
        { status: 400 }
      );
    }

    // 3. Sequential Invoice Number
    const invSeq = branch ? branch.nextInvoiceSeq : 1;
    const fiscalYr = branch?.currentFiscalYr || "2026-27";
    const branchCode = branch?.code || "IND";
    const invoiceNumber = `${branchCode}/${fiscalYr}/${String(invSeq).padStart(5, "0")}`;

    // 4. Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Increment invoice sequence
      if (branch) {
        await tx.branch.update({
          where: { id: branch.id },
          data: { nextInvoiceSeq: invSeq + 1 },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
          orderType: orderType || "DINE_IN",
          status: "PAID",
          branchId: branch?.id || "default",
          tableNumber: tableNumber || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerGstin: customerGstin || null,
          billDiscount: calc.billDiscount,
          billDiscountReason: calc.billDiscountReason || null,
          packagingCharge: calc.packagingCharge,
          deliveryCharge: calc.deliveryCharge,
          serviceCharge: calc.serviceCharge,
          subtotal: calc.subtotal,
          taxAmount: calc.totalTax,
          grandTotal: calc.grandTotal,
          items: {
            create: calc.lineItems.map((li) => ({
              menuItemId: li.menuItemId,
              itemName: li.name,
              variantId: li.variantId || null,
              variantName: li.variantName || null,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              modifierTotal: li.modifierTotal,
              discountAmount: li.discountAmount,
              subtotal: li.grossLineTotal,
              taxAmount: 0,
              cookingNotes: li.cookingNotes || null,
            })),
          },
        },
      });

      // Primary payment method label
      const primaryPaymentMethod =
        payments.length > 1
          ? "SPLIT"
          : payments[0]?.method || "CASH";

      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          fiscalYear: fiscalYr,
          orderId: order.id,
          branchId: branch?.id || "default",
          subtotal: calc.subtotal,
          itemDiscounts: calc.totalItemDiscounts,
          billDiscount: calc.billDiscount,
          packagingCharge: calc.packagingCharge,
          deliveryCharge: calc.deliveryCharge,
          serviceCharge: calc.serviceCharge,
          taxableAmount: calc.taxableAmount,
          cgstRate: calc.cgstRate,
          cgstAmount: calc.cgstAmount,
          sgstRate: calc.sgstRate,
          sgstAmount: calc.sgstAmount,
          igstRate: calc.igstRate,
          igstAmount: calc.igstAmount,
          isTaxInclusive: calc.isTaxInclusive,
          roundOff: calc.roundOff,
          grandTotal: calc.grandTotal,
          paidAmount: totalPaid,
          balanceDue: Math.max(0, calc.grandTotal - totalPaid),
          status: "PAID",
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerGstin: customerGstin || null,
          paymentMethod: primaryPaymentMethod,
          payments: {
            create: payments.map((p: any) => ({
              method: p.method,
              amount: Number(p.amount),
              transactionRef: p.transactionRef || null,
              notes: p.notes || null,
            })),
          },
        },
        include: {
          payments: true,
        },
      });

      // Free table if Dine-In
      if (orderType === "DINE_IN" && tableNumber) {
        await tx.tableSeat.updateMany({
          where: { tableNumber },
          data: { status: "AVAILABLE", currentOrderId: null },
        });
      }

      // Automatically deduct recipe ingredients in same atomic transaction
      await deductStockForOrder(order.id, invoiceNumber, tx);

      return { order, invoice };
    });

    const upiLink = generateUPILink({
      vpa: "bawarchiroyale@icici",
      merchantName: branch?.name || "Bawarchi Royale",
      amount: calc.grandTotal,
      invoiceNumber,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoiceNumber} settled successfully!`,
      invoiceNumber,
      grandTotal: calc.grandTotal,
      calculation: calc,
      invoice: result.invoice,
      branch,
      upiLink,
    });
  } catch (error: any) {
    console.error("Order settlement error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
