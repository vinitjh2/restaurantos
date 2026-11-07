import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { calculateOrderTotals } from "@/lib/server/billing-engine";
import { deductStockForOrder } from "@/lib/server/inventory-engine";
import {
  getTenantContext,
  verifyBranchOwnership,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Authentication: Verify authenticated tenant session
    const tenantCtx = await getTenantContext(req);

    // 2. Parse and validate JSON request payload
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Validation Error: Invalid JSON in request body" },
        { status: 400 }
      );
    }
    const orderData = payload;

    const opId =
      orderData.operationId ||
      orderData.offlineSyncId ||
      orderData.uuid;

    if (!opId || typeof opId !== "string" || opId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation Error: Missing required operationId or offlineSyncId" },
        { status: 400 }
      );
    }

    // 3. Forged Tenant & User ID Protection
    // Cross-tenant injection barrier: Never trust client-supplied tenantId
    if (
      orderData.tenantId &&
      orderData.tenantId !== tenantCtx.organizationId &&
      tenantCtx.role !== "PLATFORM_OWNER"
    ) {
      await prisma.auditLog.create({
        data: {
          action: "SECURITY_FORGED_TENANT_SYNC_ATTEMPT",
          entityType: "SYNC_OPERATION",
          entityId: opId,
          authorizedBy: `${tenantCtx.email} (${tenantCtx.role})`,
          reason: `Sync payload tenantId '${orderData.tenantId}' does not match authenticated tenant '${tenantCtx.organizationId}'`,
          details: JSON.stringify({
            claimedTenantId: orderData.tenantId,
            actualTenantId: tenantCtx.organizationId,
            operationId: opId,
          }),
        },
      }).catch(() => {});

      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Cross-tenant sync is strictly prohibited. Supplied tenantId does not match authenticated session.",
        },
        { status: 403 }
      );
    }

    // Forged User ID barrier:
    // Only managers or platform owners may sync on behalf of other staff
    const canSyncForOthers = ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN", "BRANCH_MANAGER"].includes(tenantCtx.role);
    if (orderData.userId && orderData.userId !== tenantCtx.userId && !canSyncForOthers) {
      return NextResponse.json(
        {
          success: false,
          error: `Forbidden: Staff role '${tenantCtx.role}' cannot synchronize operations on behalf of another user ID.`,
        },
        { status: 403 }
      );
    }

    // Authoritative identifiers derived strictly from authenticated session
    const tenantId = tenantCtx.organizationId;
    const userId = (canSyncForOthers && orderData.userId) ? orderData.userId : tenantCtx.userId;
    const offlineSyncId = opId;
    const deviceId = (orderData.deviceId && typeof orderData.deviceId === "string") ? orderData.deviceId.trim() : "POS-DEV-DEFAULT";
    const operationType = orderData.operationType || "CREATE_ORDER";

    // 4. Branch Ownership & Confinement Verification
    const branchIdentifier = orderData.branchId || orderData.branchCode;
    if (!branchIdentifier) {
      return NextResponse.json(
        { success: false, error: "Validation Error: Missing required branch identifier (branchId or branchCode)" },
        { status: 400 }
      );
    }

    const branch = await verifyBranchOwnership(tenantCtx, branchIdentifier);
    const branchId = branch.id;

    // 5. Payload Validation for Order Creation Operations
    if (operationType === "CREATE_ORDER" || !orderData.operationType) {
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        return NextResponse.json(
          { success: false, error: "Validation Error: Order must contain at least one line item" },
          { status: 400 }
        );
      }

      for (const item of orderData.items) {
        if (!item.itemName && !item.menuItemId) {
          return NextResponse.json(
            { success: false, error: "Validation Error: Line item missing name or menuItemId" },
            { status: 400 }
          );
        }
        if (typeof item.quantity !== "number" || item.quantity <= 0) {
          return NextResponse.json(
            { success: false, error: `Validation Error: Invalid quantity for item '${item.itemName || item.menuItemId}'. Must be > 0` },
            { status: 400 }
          );
        }
        if (typeof item.unitPrice === "number" && item.unitPrice < 0) {
          return NextResponse.json(
            { success: false, error: `Validation Error: Negative unit price for item '${item.itemName || item.menuItemId}' is prohibited` },
            { status: 400 }
          );
        }
      }
    }

    // 6. Conflict / Duplicate Detection: Check SyncOperation ledger
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    console.error("Offline POS Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process offline sync request",
      },
      { status: error.statusCode || 500 }
    );
  }
}
