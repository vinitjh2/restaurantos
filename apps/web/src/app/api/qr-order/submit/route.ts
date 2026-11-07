import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { calculateOrderTotals } from "@/lib/server/billing-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      branchCode = "IND",
      tableNumber = "T-01",
      customerName = "Table Patron",
      customerPhone,
      paymentWorkflow = "PAY_LATER", // "PAY_LATER" | "PAY_ONLINE"
      items = [],
      specialInstructions,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    // 1. Fetch branch configuration
    let branch = await prisma.branch.findFirst({ where: { code: branchCode } });
    if (!branch) {
      branch = await prisma.branch.findFirst();
    }
    const branchId = branch?.id || "default";

    // 2. Authoritative GST Tax Calculation
    const calc = calculateOrderTotals({
      items: items.map((i: any) => ({
        menuItemId: i.menuItemId || i.id,
        name: i.name || i.itemName,
        basePrice: i.price || i.unitPrice,
        quantity: i.quantity,
        modifierOptions: (i.modifiers || []).map((m: any) => ({
          id: m.id || m,
          name: typeof m === "string" ? m : m.name,
          price: typeof m === "string" ? 0 : m.price || 0,
        })),
        cookingNotes: i.cookingNotes,
      })),
      orderType: "DINE_IN",
      billDiscountAmount: 0,
      packagingCharge: 0,
      deliveryCharge: 0,
      serviceChargePercentage: 0,
      cgstRate: branch?.cgstRate ?? 2.5,
      sgstRate: branch?.sgstRate ?? 2.5,
    });

    const orderSeq = (branch?.nextOrderSeq || 1);
    const orderNumber = `ORD-${branch?.code || "IND"}-QR${String(orderSeq).padStart(3, "0")}`;
    const kotNumber = `KOT-QR-${Date.now().toString().slice(-4)}`;

    // 3. Atomic Database Insertion
    const result = await prisma.$transaction(async (tx) => {
      // Advance branch order sequence counter
      if (branch) {
        await tx.branch.update({
          where: { id: branch.id },
          data: { nextOrderSeq: orderSeq + 1 },
        });
      }

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          orderType: "DINE_IN",
          status: paymentWorkflow === "PAY_ONLINE" ? "PENDING" : "OPEN",
          branchId,
          tableNumber,
          guestCount: 2,
          customerName: customerName || `Patron Table ${tableNumber}`,
          customerPhone: customerPhone || null,
          subtotal: calc.subtotal,
          taxAmount: calc.totalTax,
          grandTotal: calc.grandTotal,
          items: {
            create: calc.lineItems.map((it) => ({
              menuItemId: it.menuItemId,
              itemName: it.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              modifierTotal: it.modifierTotal,
              discountAmount: 0,
              subtotal: it.netLineTotal,
              taxAmount: (it.netLineTotal * (calc.cgstRate + calc.sgstRate)) / 100,
              cookingNotes: it.cookingNotes || null,
            })),
          },
        },
      });

      // Create KOT for Kitchen Display System
      const createdKOT = await tx.kOT.create({
        data: {
          kotNumber,
          orderId: createdOrder.id,
          branchId,
          tableNumber,
          orderType: "DINE_IN",
          station: "Main Kitchen",
          status: "NEW",
          items: {
            create: calc.lineItems.map((it) => ({
              itemName: it.name,
              quantity: it.quantity,
              station: "Main Kitchen",
              status: "PENDING",
              cookingNotes: it.cookingNotes || null,
            })),
          },
        },
        include: { items: true },
      });

      return { order: createdOrder, kot: createdKOT };
    });

    return NextResponse.json({
      success: true,
      message: "Table QR order received and routed to kitchen!",
      orderNumber: result.order.orderNumber,
      orderId: result.order.id,
      kotNumber: result.kot.kotNumber,
      tableNumber,
      grandTotal: calc.grandTotal,
      subtotal: calc.subtotal,
      taxes: calc.totalTax,
      paymentWorkflow,
    });
  } catch (error: any) {
    console.error("QR Order submission failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process QR self-order" },
      { status: 500 }
    );
  }
}
