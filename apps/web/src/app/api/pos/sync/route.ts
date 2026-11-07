import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { calculateOrderTotals } from "@/lib/server/billing-engine";
import { deductStockForOrder } from "@/lib/server/inventory-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const orderData = payload;

    const opId =
      orderData.operationId ||
      orderData.offlineSyncId ||
      orderData.uuid;

    if (!opId) {
      return NextResponse.json(
        { success: false, error: "Missing required operationId or offlineSyncId" },
        { status: 400 }
      );
    }

    const offlineSyncId = opId;
    const deviceId = orderData.deviceId || "POS-DEV-DEFAULT";
    const tenantId = orderData.tenantId || "org-bawarchi";
    const operationType = orderData.operationType || "CREATE_ORDER";
    const userId = orderData.userId || "staff-offline";

    // 1. Conflict / Duplicate Detection: Check SyncOperation ledger
    const existingOp = await prisma.syncOperation.findUnique({
      where: { operationId: opId },
    });

    if (existingOp) {
      return NextResponse.json({
        success: true,
        status: "ALREADY_SYNCED",
        message: "Operation already synchronized previously (idempotent)",
        operationId: opId,
        serverOrderId: existingOp.entityId,
        syncStatus: existingOp.syncStatus,
      });
    }

    // Also check Order table directly for offlineSyncId
    const existingOrder = await prisma.order.findUnique({
      where: { offlineSyncId },
      include: { invoice: true },
    });

    if (existingOrder) {
      // Record in SyncOperation for ledger completeness
      await prisma.syncOperation.create({
        data: {
          operationId: opId,
          deviceId,
          tenantId,
          branchId: existingOrder.branchId,
          userId,
          operationType,
          clientTimestamp: new Date(orderData.clientTimestamp || Date.now()),
          payload: JSON.stringify(orderData),
          syncStatus: "SYNCED",
          entityType: "ORDER",
          entityId: existingOrder.id,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        status: "ALREADY_SYNCED",
        message: "Order already synchronized previously",
        serverOrderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        serverInvoiceNumber: existingOrder.invoice?.invoiceNumber || null,
      });
    }

    // 2. Fetch Branch context
    const branchCode = orderData.branchId || "IND";
    let branch = await prisma.branch.findFirst({
      where: {
        OR: [{ code: branchCode }, { id: branchCode }],
      },
    });

    if (!branch) {
      branch = await prisma.branch.findFirst({ where: { code: "IND" } });
    }

    const branchId = branch?.id || "default";

    // 3. Conflict Detection: Table or Status Overwrite Barrier
    if (operationType === "UPDATE_ORDER" || operationType === "CANCEL_ORDER") {
      const targetOrderId = orderData.targetOrderId || orderData.orderId;
      if (targetOrderId) {
        const currentTarget = await prisma.order.findUnique({
          where: { id: targetOrderId },
          include: { invoice: true },
        });

        if (currentTarget && (currentTarget.status === "PAID" || currentTarget.invoice)) {
          // Record conflict in SyncOperation ledger
          await prisma.syncOperation.create({
            data: {
              operationId: opId,
              deviceId,
              tenantId,
              branchId,
              userId,
              operationType,
              clientTimestamp: new Date(orderData.clientTimestamp || Date.now()),
              payload: JSON.stringify(orderData),
              syncStatus: "CONFLICT",
              conflictReason: `Cannot ${operationType} Order #${currentTarget.orderNumber}: Already settled/invoiced by another terminal.`,
              entityType: "ORDER",
              entityId: targetOrderId,
            },
          });

          return NextResponse.json(
            {
              success: false,
              status: "CONFLICT",
              error: `Conflict: Order #${currentTarget.orderNumber} is already settled with invoice #${currentTarget.invoice?.invoiceNumber}. Overwrite rejected.`,
            },
            { status: 409 }
          );
        }
      }
    }

    // 4. Calculate authoritative financial totals
    const calc = calculateOrderTotals({
      items: (orderData.items || []).map((i: any) => ({
        menuItemId: i.menuItemId,
        name: i.itemName,
        basePrice: i.unitPrice,
        quantity: i.quantity,
        variantId: i.variantId,
        variantName: i.variantName,
        modifierOptions: (i.modifiers || []).map((m: any) => ({
          id: m.modifierOptionId,
          name: m.modifierName,
          price: m.price,
        })),
        discountAmount: i.discountAmount || 0,
        discountReason: i.discountReason,
        cookingNotes: i.cookingNotes,
      })),
      orderType: orderData.orderType || "DINE_IN",
      billDiscountAmount: orderData.billDiscount || 0,
      packagingCharge: orderData.packagingCharge || 0,
      deliveryCharge: orderData.deliveryCharge || 0,
      serviceChargePercentage: orderData.serviceCharge ? 5 : 0,
      cgstRate: branch?.cgstRate ?? 2.5,
      sgstRate: branch?.sgstRate ?? 2.5,
      igstRate: branch?.igstRate ?? 0.0,
      isTaxInclusive: branch?.isTaxInclusive ?? false,
    });

    // 5. Sequence numbering & atomic transaction
    let invSeq = branch ? branch.nextInvoiceSeq : 1;
    let orderSeq = branch ? branch.nextOrderSeq : 1;
    const fiscalYr = branch?.currentFiscalYr || "2026-27";
    const bCode = branch?.code || "IND";

    // Guarantee collision-free monotonic sequential statutory numbering
    const prefix = `${bCode}/${fiscalYr}/`;
    const existingInvoices = await prisma.invoice.findMany({
      where: { invoiceNumber: { startsWith: prefix } },
      select: { invoiceNumber: true },
    });
    let maxSeq = invSeq;
    for (const inv of existingInvoices) {
      const suffix = inv.invoiceNumber.slice(prefix.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num >= maxSeq) {
        maxSeq = num + 1;
      }
    }
    invSeq = maxSeq;
    const invoiceNumber = `${prefix}${String(invSeq).padStart(5, "0")}`;
    const generatedOrderNumber = `ORD-${bCode}-${String(orderSeq).padStart(4, "0")}`;

    const isSettled = Boolean(orderData.isSettled && orderData.payment);
    const paymentMethod = orderData.payment?.method || "CASH";

    // Financial Safety: Offline UPI payments MUST be marked UNVERIFIED
    let paymentRecordStatus = "COMPLETED";
    let paymentNotes = "Synchronized from offline POS queue";

    if (paymentMethod === "UPI") {
      paymentRecordStatus = "UNVERIFIED";
      paymentNotes = "Offline UPI payment pending bank UTR verification upon reconnect";
    } else if (paymentMethod === "CASH") {
      paymentNotes = "Offline Cash collection - pending shift cash register reconciliation";
    }

    const result = await prisma.$transaction(async (tx) => {
      // Advance sequential counters
      if (branch) {
        await tx.branch.update({
          where: { id: branch.id },
          data: {
            nextOrderSeq: Math.max(orderSeq + 1, branch.nextOrderSeq + 1),
            ...(isSettled ? { nextInvoiceSeq: Math.max(invSeq + 1, branch.nextInvoiceSeq + 1) } : {}),
          },
        });
      }

      // Create Order with offlineSyncId
      const createdOrder = await tx.order.create({
        data: {
          offlineSyncId,
          orderNumber: orderData.orderNumber || generatedOrderNumber,
          orderType: orderData.orderType || "DINE_IN",
          status: isSettled ? "PAID" : "OPEN",
          branchId,
          tableNumber: orderData.tableNumber || null,
          guestCount: orderData.guestCount || 1,
          customerName: orderData.customerName || null,
          customerPhone: orderData.customerPhone || null,
          customerGstin: orderData.customerGstin || null,
          customerAddress: orderData.customerAddress || null,
          billDiscount: calc.billDiscount,
          packagingCharge: calc.packagingCharge,
          deliveryCharge: calc.deliveryCharge,
          serviceCharge: calc.serviceCharge,
          subtotal: calc.subtotal,
          taxAmount: calc.totalTax,
          grandTotal: calc.grandTotal,
          createdAt: new Date(orderData.clientTimestamp || Date.now()),
          items: {
            create: calc.lineItems.map((it) => ({
              menuItemId: it.menuItemId,
              itemName: it.name,
              variantId: it.variantId || null,
              variantName: it.variantName || null,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              modifierTotal: it.modifierTotal,
              discountAmount: it.discountAmount,
              discountReason: null,
              subtotal: it.netLineTotal,
              taxAmount: (it.netLineTotal * (calc.cgstRate + calc.sgstRate)) / 100,
              cookingNotes: it.cookingNotes || null,
              modifiers: {
                create: it.modifierOptions.map((mod) => ({
                  modifierOptionId: mod.id,
                  modifierName: mod.name,
                  price: mod.price,
                })),
              },
            })),
          },
        },
        include: { items: true },
      });

      let createdInvoice = null;

      // If settled offline, issue official sequential invoice & payment
      if (isSettled && orderData.payment) {
        createdInvoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            fiscalYear: fiscalYr,
            orderId: createdOrder.id,
            branchId,
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
            paidAmount: orderData.payment.amount || calc.grandTotal,
            balanceDue: 0.0,
            status: "PAID",
            customerName: orderData.customerName || null,
            customerPhone: orderData.customerPhone || null,
            customerGstin: orderData.customerGstin || null,
            paymentMethod,
            payments: {
              create: [
                {
                  method: paymentMethod,
                  amount: orderData.payment.amount || calc.grandTotal,
                  transactionRef:
                    orderData.payment.transactionRef ||
                    orderData.localReceiptNumber ||
                    `OFFLINE-${Date.now()}`,
                  status: paymentRecordStatus,
                  notes: paymentNotes,
                },
              ],
            },
          },
        });
      }

      // Record in SyncOperation ledger for audit & idempotency
      await tx.syncOperation.create({
        data: {
          operationId: opId,
          deviceId,
          tenantId,
          branchId,
          userId,
          operationType,
          clientTimestamp: new Date(orderData.clientTimestamp || Date.now()),
          payload: JSON.stringify(orderData),
          syncStatus: "SYNCED",
          entityType: "ORDER",
          entityId: createdOrder.id,
        },
      });

      // Audit Log Entry
      await tx.auditLog.create({
        data: {
          action: "OFFLINE_ORDER_SYNCHRONIZED",
          entityType: "ORDER",
          entityId: createdOrder.id,
          authorizedBy: `${userId} (${deviceId})`,
          reason: `Offline Order #${createdOrder.orderNumber} synced. Payment: ${paymentMethod} (${paymentRecordStatus}).`,
          details: JSON.stringify({
            offlineSyncId,
            deviceId,
            operationType,
            localReceipt: orderData.localReceiptNumber,
            invoiceNumber: createdInvoice?.invoiceNumber,
          }),
        },
      });

      return {
        order: createdOrder,
        invoice: createdInvoice,
      };
    });

    // 6. Automatic Recipe Stock Deduction
    if (isSettled && result.order) {
      try {
        await deductStockForOrder(result.order.id, branchId);
      } catch (err) {
        console.error("Inventory deduction during offline sync error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      status: "SUCCESS",
      offlineSyncId,
      serverOrderId: result.order.id,
      orderNumber: result.order.orderNumber,
      serverInvoiceNumber: result.invoice?.invoiceNumber || null,
      grandTotal: calc.grandTotal,
    });
  } catch (error: any) {
    console.error("Offline POS Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process offline sync request",
      },
      { status: 500 }
    );
  }
}
