import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, verifyBranchOwnership } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const { searchParams } = new URL(req.url);

    const branchParam = searchParams.get("branchId") || searchParams.get("branchCode");
    const status = searchParams.get("status");
    const orderType = searchParams.get("orderType");
    const search = searchParams.get("search");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    // Determine target branch filter scoped strictly to authenticated tenant
    let targetBranchIds: string[] = [];

    if (branchParam) {
      const verifiedBranch = await verifyBranchOwnership(tenantCtx, branchParam);
      targetBranchIds = [verifiedBranch.id];
    } else if (tenantCtx.role === "PLATFORM_OWNER") {
      const allBranches = await prisma.branch.findMany({ select: { id: true } });
      targetBranchIds = allBranches.map((b) => b.id);
    } else {
      const tenantBranches = await prisma.branch.findMany({
        where: { organizationId: tenantCtx.organizationId },
        select: { id: true },
      });
      targetBranchIds = tenantBranches.map((b) => b.id);
    }

    if (targetBranchIds.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        page: 1,
        totalPages: 1,
      });
    }

    const where: any = {
      branchId: { in: targetBranchIds },
    };

    if (status && status !== "ALL") {
      if (status === "PREPARING") {
        where.status = { in: ["PREPARING", "KOT_SENT", "OPEN"] };
      } else if (status === "SERVED") {
        where.status = { in: ["SERVED", "BILLED"] };
      } else if (status === "CANCELLED") {
        where.status = { in: ["CANCELLED", "REFUNDED", "VOID"] };
      } else {
        where.status = status;
      }
    }

    if (orderType && orderType !== "ALL") {
      where.orderType = orderType;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { tableNumber: { contains: search } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          invoice: {
            include: { payments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
    ]);

    // Return empty array cleanly for newly onboarded restaurants with 0 orders
    if (total === 0 || orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        page: 1,
        totalPages: 1,
      });
    }

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      orderType: o.orderType,
      status: o.status,
      tableNumber: o.tableNumber,
      customerName: o.customerName || (o.tableNumber ? `Guest (${o.tableNumber})` : "Walk-in Guest"),
      customerPhone: o.customerPhone,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      itemsSummary: o.items.length > 0 ? o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(", ") : "Dine-in Order",
      subtotal: o.subtotal,
      taxAmount: o.taxAmount,
      grandTotal: o.grandTotal,
      paymentMethod: o.invoice?.paymentMethod || (o.status === "PAID" ? "UPI / Card" : "UNPAID"),
      invoiceNumber: o.invoice?.invoiceNumber || null,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
