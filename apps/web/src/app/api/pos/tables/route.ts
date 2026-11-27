import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const tenantBranches = await prisma.branch.findMany({
      where: { organizationId: tenantCtx.organizationId },
      select: { id: true, code: true },
    });
    const branchIds = tenantBranches.map((b) => b.id);
    const branchCodes = tenantBranches.map((b) => b.code);

    const tables =
      tenantCtx.role === "PLATFORM_OWNER"
        ? await prisma.tableSeat.findMany({ orderBy: { tableNumber: "asc" } })
        : branchCodes.length > 0
        ? await prisma.tableSeat.findMany({
            where: {
              OR: branchCodes.map((code) => ({ tableNumber: { startsWith: `${code}-` } })),
            },
            orderBy: { tableNumber: "asc" },
          })
        : [];

    // Query active/recent orders linked to tenant's branches
    let orders: any[] = [];
    try {
      orders =
        tenantCtx.role === "PLATFORM_OWNER" || branchIds.length > 0
          ? await prisma.order.findMany({
              where: {
                tableNumber: { not: null },
                ...(tenantCtx.role === "PLATFORM_OWNER" ? {} : { branchId: { in: branchIds } }),
              },
              include: {
                items: true,
                invoice: true,
              },
              orderBy: { createdAt: "desc" },
            })
          : [];
    } catch (e) {
      console.warn("Failed to query table orders:", e);
    }

    const enrichedTables = tables.map((t) => {
      const tableOrders = orders.filter((o) => o.tableNumber === t.tableNumber);
      const active =
        tableOrders.find((o) => ["OPEN", "KOT_SENT", "PREPARING", "BILLED"].includes(o.status)) ||
        (t.status !== "AVAILABLE" ? tableOrders[0] : null);

      let activeOrder = null;
      if (active && active.items && active.items.length > 0) {
        activeOrder = {
          id: active.id,
          orderNumber: active.orderNumber,
          orderType: active.orderType,
          status: active.status,
          customerName: active.customerName || `Guest (${t.tableNumber})`,
          customerPhone: active.customerPhone || null,
          guestCount: active.guestCount || t.capacity,
          subtotal: active.subtotal,
          taxAmount: active.taxAmount,
          grandTotal: active.grandTotal,
          paymentMethod: active.invoice?.paymentMethod || (active.status === "PAID" ? "UPI / Card" : "UNPAID"),
          invoiceNumber: active.invoice?.invoiceNumber || null,
          createdAt: active.createdAt.toISOString(),
          items: active.items.map((i: any) => ({
            id: i.id,
            itemName: i.itemName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
            taxAmount: i.taxAmount,
            cookingNotes: i.cookingNotes || null,
          })),
        };
      }

      return {
        id: t.id,
        tableNumber: t.tableNumber,
        floor: t.floor,
        capacity: t.capacity,
        status: t.status,
        currentOrderId: active?.id || t.currentOrderId || null,
        activeOrder,
        estimatedTotal: activeOrder ? activeOrder.grandTotal : 0,
        createdAt: (t as any).createdAt ? new Date((t as any).createdAt).toISOString() : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      tables: enrichedTables,
    });
  } catch (error: any) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const body = await req.json();
    const { tableNumber, floor, capacity } = body;

    if (!tableNumber || !floor) {
      return NextResponse.json(
        { success: false, error: "Table number and floor are required" },
        { status: 400 }
      );
    }

    const primaryBranch = await prisma.branch.findFirst({
      where: { organizationId: tenantCtx.organizationId },
      select: { code: true },
    });

    const rawNum = tableNumber.trim().toUpperCase();
    const scopedTableNumber =
      primaryBranch && !rawNum.startsWith(`${primaryBranch.code}-`)
        ? `${primaryBranch.code}-${rawNum}`
        : rawNum;

    const existing = await prisma.tableSeat.findUnique({
      where: { tableNumber: scopedTableNumber },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Table ${scopedTableNumber} already exists on ${existing.floor}` },
        { status: 409 }
      );
    }

    const newTable = await prisma.tableSeat.create({
      data: {
        tableNumber: scopedTableNumber,
        floor: floor.trim(),
        capacity: Number(capacity) || 4,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      table: newTable,
    });
  } catch (error: any) {
    console.error("Failed to create table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, capacity } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Table ID is required" }, { status: 400 });
    }

    const updated = await prisma.tableSeat.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      table: updated,
    });
  } catch (error: any) {
    console.error("Failed to update table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
