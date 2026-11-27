import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, verifyBranchOwnership } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

const FALLBACK_DEMO_ORDERS = [
  {
    id: "demo-ord-2840",
    orderNumber: "ORD-2840",
    orderType: "DINE_IN",
    status: "PREPARING",
    tableNumber: "T-01",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98450 11223",
    itemsCount: 7,
    itemsSummary: "2x Butter Chicken, 4x Butter Garlic Naan, 1x Dal Makhani",
    subtotal: 1310,
    taxAmount: 65.5,
    grandTotal: 1375.5,
    paymentMethod: "UNPAID",
    invoiceNumber: "INV-IND-2840",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2841",
    orderNumber: "ORD-2841",
    orderType: "QR_DIGITAL",
    status: "PREPARING",
    tableNumber: "T-04",
    customerName: "Ananya Deshmukh",
    customerPhone: "+91 97412 88341",
    itemsCount: 5,
    itemsSummary: "1x Paneer Butter Masala, 2x Butter Garlic Naan, 2x Masala Chaas",
    subtotal: 620,
    taxAmount: 31,
    grandTotal: 651,
    paymentMethod: "UPI (Google Pay)",
    invoiceNumber: "INV-IND-2841",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2842",
    orderNumber: "ORD-2842",
    orderType: "DELIVERY",
    status: "SERVED",
    tableNumber: null,
    customerName: "Zomato Partner (#9841)",
    customerPhone: "+91 98800 23456",
    itemsCount: 4,
    itemsSummary: "2x Murgh Dum Biryani, 2x Gulab Jamun (2 Pcs)",
    subtotal: 920,
    taxAmount: 46,
    grandTotal: 966,
    paymentMethod: "Zomato Pay",
    invoiceNumber: "INV-IND-2842",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2843",
    orderNumber: "ORD-2843",
    orderType: "TAKEAWAY",
    status: "PAID",
    tableNumber: null,
    customerName: "Rohit Verma",
    customerPhone: "+91 99160 55421",
    itemsCount: 5,
    itemsSummary: "1x Crispy Corn Salt & Pepper, 1x Paneer Butter Masala, 3x Butter Garlic Naan",
    subtotal: 800,
    taxAmount: 40,
    grandTotal: 840,
    paymentMethod: "Cash",
    invoiceNumber: "INV-IND-2843",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2844",
    orderNumber: "ORD-2844",
    orderType: "DINE_IN",
    status: "PAID",
    tableNumber: "T-02",
    customerName: "Priya Nair",
    customerPhone: "+91 96110 33902",
    itemsCount: 4,
    itemsSummary: "1x Tandoori Chicken, 1x Murgh Dum Biryani, 2x Masala Chaas",
    subtotal: 750,
    taxAmount: 37.5,
    grandTotal: 787.5,
    paymentMethod: "Credit Card (HDFC)",
    invoiceNumber: "INV-IND-2844",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2845",
    orderNumber: "ORD-2845",
    orderType: "DINE_IN",
    status: "PAID",
    tableNumber: "T-06",
    customerName: "Aditya & Family",
    customerPhone: "+91 98451 99012",
    itemsCount: 13,
    itemsSummary: "3x Murgh Dum Biryani, 1x Butter Chicken, 6x Butter Garlic Naan, 3x Gulab Jamun",
    subtotal: 2230,
    taxAmount: 111.5,
    grandTotal: 2341.5,
    paymentMethod: "UPI (PhonePe)",
    invoiceNumber: "INV-IND-2845",
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2846",
    orderNumber: "ORD-2846",
    orderType: "DELIVERY",
    status: "PREPARING",
    tableNumber: null,
    customerName: "Swiggy Express (#4410)",
    customerPhone: "+91 99001 77234",
    itemsCount: 6,
    itemsSummary: "1x Butter Chicken, 1x Dal Makhani, 4x Butter Garlic Naan",
    subtotal: 940,
    taxAmount: 47,
    grandTotal: 987,
    paymentMethod: "Swiggy Pay",
    invoiceNumber: "INV-IND-2846",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2847",
    orderNumber: "ORD-2847",
    orderType: "QR_DIGITAL",
    status: "SERVED",
    tableNumber: "AC-01",
    customerName: "Kavita Rao",
    customerPhone: "+91 94480 66123",
    itemsCount: 2,
    itemsSummary: "1x Crispy Corn Salt & Pepper, 1x Masala Chaas",
    subtotal: 310,
    taxAmount: 15.5,
    grandTotal: 325.5,
    paymentMethod: "UPI (Paytm)",
    invoiceNumber: "INV-IND-2847",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2848",
    orderNumber: "ORD-2848",
    orderType: "DINE_IN",
    status: "CANCELLED",
    tableNumber: "RF-01",
    customerName: "Sameer Joshi",
    customerPhone: "+91 98200 44119",
    itemsCount: 3,
    itemsSummary: "1x Tandoori Chicken, 2x Butter Garlic Naan",
    subtotal: 420,
    taxAmount: 21,
    grandTotal: 441,
    paymentMethod: "REFUNDED",
    invoiceNumber: "INV-IND-2848",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

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
