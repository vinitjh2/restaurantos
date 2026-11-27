import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { computeProfitAndLoss } from "@/lib/server/analytics-engine";
import { getTenantContext, verifyBranchOwnership } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

const ORDER_CHANNEL_META: Record<string, { label: string; fill: string }> = {
  DINE_IN: { label: "Dine-in", fill: "#3b82f6" },
  QR_DIGITAL: { label: "Table QR", fill: "#8b5cf6" },
  DELIVERY: { label: "Delivery", fill: "#f59e0b" },
  TAKEAWAY: { label: "Takeaway", fill: "#10b981" },
  PICKUP: { label: "Pickup", fill: "#06b6d4" },
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  UPI: "#10b981",
  CARD: "#3b82f6",
  CASH: "#f59e0b",
  SPLIT: "#8b5cf6",
};

function formatHourBucket(hour24: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12} ${period}`;
}

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "today"; // today, yesterday, 7d, 30d, 1y
    const branchCode = searchParams.get("branch") || "All";

    const now = new Date();
    const startDate = new Date();
    let endDate: Date | null = null;

    if (timeRange === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "yesterday") {
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "1y") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const createdAtFilter = endDate
      ? { gte: startDate, lte: endDate }
      : { gte: startDate };

    // Resolve tenant's owned branches strictly
    let tenantBranches = await prisma.branch.findMany({
      where: { organizationId: tenantCtx.organizationId },
      select: { id: true, code: true, name: true },
    });

    if (branchCode !== "All") {
      const ownedBranch = await verifyBranchOwnership(tenantCtx, branchCode);
      tenantBranches = [{ id: ownedBranch.id, code: ownedBranch.code, name: ownedBranch.name }];
    }

    const branchIds = tenantBranches.map((b) => b.id);
    const branchCodes = tenantBranches.map((b) => b.code);
    const branchKeys = Array.from(new Set([...branchIds, ...branchCodes]));
    const ingBranchKeys = [...branchKeys];
    if (tenantCtx.organizationSlug === "bawarchi-royale" && branchCode === "All") {
      ingBranchKeys.push("default");
    }

    const emptyOrderWhere = branchIds.length > 0 ? { branchId: { in: branchIds } } : { branchId: "__none__" };
    const branchKeyWhere = branchKeys.length > 0 ? { branchId: { in: branchKeys } } : { branchId: "__none__" };

    // 1. Fetch Paid / Settled Invoices strictly scoped to tenant's branches
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: createdAtFilter,
        status: { in: ["PAID", "PARTIAL"] },
        ...emptyOrderWhere,
      },
      include: {
        order: {
          include: { items: true },
        },
        payments: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Fetch all tenant orders in range for channel mix + recent hourly orders
    const allRangeOrders = await prisma.order.findMany({
      where: {
        createdAt: createdAtFilter,
        ...emptyOrderWhere,
      },
      select: {
        id: true,
        orderType: true,
        status: true,
        grandTotal: true,
        createdAt: true,
      },
    });

    let grossSales = 0;
    let netSales = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalDiscounts = 0;

    const paymentMethodsMap: Record<string, number> = { UPI: 0, CARD: 0, CASH: 0, SPLIT: 0 };
    const itemsMap: Record<
      string,
      { name: string; category: string; count: number; quantity: number; revenue: number; diet: "VEG" | "NON_VEG" }
    > = {};
    const periodicSalesMap: Record<string, { gross: number; orders: number }> = {};
    const hourlyMap: Record<number, { sales: number; orders: number }> = {};

    let directOrdersCount = 0;
    let directOrdersRevenue = 0;

    for (const inv of invoices) {
      grossSales += inv.subtotal;
      netSales += inv.grandTotal;
      totalTaxable += inv.taxableAmount;
      totalCGST += inv.cgstAmount;
      totalSGST += inv.sgstAmount;
      totalDiscounts += inv.itemDiscounts + inv.billDiscount;

      const rawMethod = (inv.paymentMethod || "CASH").toUpperCase();
      const bucketMethod = rawMethod.includes("UPI")
        ? "UPI"
        : rawMethod.includes("CARD")
        ? "CARD"
        : rawMethod.includes("SPLIT")
        ? "SPLIT"
        : "CASH";
      paymentMethodsMap[bucketMethod] = (paymentMethodsMap[bucketMethod] || 0) + inv.grandTotal;

      const dateKey = inv.createdAt.toISOString().split("T")[0];
      if (!periodicSalesMap[dateKey]) {
        periodicSalesMap[dateKey] = { gross: 0, orders: 0 };
      }
      periodicSalesMap[dateKey].gross += inv.grandTotal;
      periodicSalesMap[dateKey].orders += 1;

      const hr = inv.createdAt.getHours();
      if (!hourlyMap[hr]) hourlyMap[hr] = { sales: 0, orders: 0 };
      hourlyMap[hr].sales += inv.grandTotal;
      hourlyMap[hr].orders += 1;

      if (inv.order?.orderType === "QR_DIGITAL" || inv.order?.orderType === "PICKUP") {
        directOrdersCount += 1;
        directOrdersRevenue += inv.grandTotal;
      }

      if (inv.order?.items) {
        for (const it of inv.order.items) {
          if (it.isVoid) continue;
          if (!itemsMap[it.itemName]) {
            const lower = it.itemName.toLowerCase();
            const isNonVeg =
              lower.includes("chicken") ||
              lower.includes("mutton") ||
              lower.includes("murgh") ||
              lower.includes("fish") ||
              lower.includes("prawn") ||
              lower.includes("egg");
            itemsMap[it.itemName] = {
              name: it.itemName,
              category: "Kitchen Menu",
              count: 0,
              quantity: 0,
              revenue: 0,
              diet: isNonVeg ? "NON_VEG" : "VEG",
            };
          }
          itemsMap[it.itemName].count += it.quantity;
          itemsMap[it.itemName].quantity += it.quantity;
          itemsMap[it.itemName].revenue += it.subtotal;
        }
      }
    }

    // Channel mix across tenant's orders in timeframe
    const channelCounts: Record<string, number> = {};
    for (const ord of allRangeOrders) {
      if (ord.status === "CANCELLED" || ord.status === "VOID") continue;
      const key = ord.orderType || "DINE_IN";
      channelCounts[key] = (channelCounts[key] || 0) + 1;
    }
    const totalChannelOrders = Object.values(channelCounts).reduce((a, b) => a + b, 0);
    const orderTypeDistribution = Object.entries(channelCounts).map(([key, count]) => {
      const meta = ORDER_CHANNEL_META[key] || { label: key.replace("_", " "), fill: "#64748b" };
      return {
        key,
        name: meta.label,
        count,
        value: totalChannelOrders > 0 ? Math.round((count / totalChannelOrders) * 100) : 0,
        fill: meta.fill,
      };
    });

    // 2. Scoped Refunds
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: createdAtFilter,
        invoice: emptyOrderWhere,
      },
    });
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

    // 3. Scoped Cancelled Orders
    const cancelledOrdersCount = allRangeOrders.filter(
      (o) => o.status === "CANCELLED" || o.status === "VOID"
    ).length;

    // 4. Scoped Stock Movements (COGS & Wastage)
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: createdAtFilter,
        ingredient: ingBranchKeys.length > 0 ? { branchId: { in: ingBranchKeys } } : { branchId: "__none__" },
      },
      select: { movementType: true, totalValue: true },
    });

    let ingredientCOGS = 0;
    let wastageLoss = 0;
    for (const mov of stockMovements) {
      if (mov.movementType === "ORDER_DEDUCTION") {
        ingredientCOGS += Math.abs(mov.totalValue);
      } else if (["WASTAGE", "DAMAGED", "EXPIRED"].includes(mov.movementType)) {
        wastageLoss += Math.abs(mov.totalValue);
      }
    }

    // 5. Scoped Operating Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: createdAtFilter,
        ...branchKeyWhere,
      },
    });

    const expensesByCategory: Record<string, number> = {};
    let totalExpensesAmount = 0;
    for (const exp of expenses) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
      totalExpensesAmount += exp.amount;
    }

    // 6. Scoped Labor Payroll
    const staffPayrolls = await prisma.staffPayroll.findMany({
      where: {
        staff: { organizationId: tenantCtx.organizationId },
      },
      select: { baseAmount: true, overtimePay: true },
    });
    let staffSalariesTotal = 0;
    let overtimePayTotal = 0;
    for (const slip of staffPayrolls) {
      staffSalariesTotal += slip.baseAmount;
      overtimePayTotal += slip.overtimePay;
    }

    // 7. Compute Profit & Loss
    const pnlReport = computeProfitAndLoss({
      grossSales: Math.round(grossSales * 100) / 100,
      discounts: Math.round(totalDiscounts * 100) / 100,
      taxesCollected: Math.round((totalCGST + totalSGST) * 100) / 100,
      cogsIngredients: Math.round(ingredientCOGS * 100) / 100,
      wastageLoss: Math.round(wastageLoss * 100) / 100,
      expensesByCategory,
      staffPayroll: Math.round(staffSalariesTotal * 100) / 100,
      overtimePay: Math.round(overtimePayTotal * 100) / 100,
      startDate: startDate.toISOString().split("T")[0],
      endDate: (endDate || now).toISOString().split("T")[0],
    });

    // 8. Scoped Floor / KDS / Cash Shift / Audit Feed telemetry
    const tableFilters =
      branchCodes.length > 0
        ? branchCodes.map((code) => ({ tableNumber: { startsWith: `${code}-` } }))
        : [];
    const tableRows =
      tableFilters.length > 0
        ? await prisma.tableSeat.findMany({
            where: {
              OR: [
                ...tableFilters,
                ...(tenantCtx.organizationSlug === "bawarchi-royale"
                  ? [{ tableNumber: { in: ["T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "AC-01", "RF-01"] } }]
                  : []),
              ],
            },
            select: { status: true },
          })
        : [];

    const occupiedTables = tableRows.filter((t) => t.status === "OCCUPIED").length;
    const billedTables = tableRows.filter((t) => t.status === "BILLED").length;
    const cleaningTables = tableRows.filter((t) => t.status === "CLEANING").length;
    const availableTables = tableRows.filter((t) => t.status === "AVAILABLE").length;

    const activeKots = await prisma.kOT.findMany({
      where: {
        ...emptyOrderWhere,
        status: { in: ["NEW", "ACCEPTED", "PREPARING"] },
      },
      select: { station: true },
    });

    const stationCounts: Record<string, number> = {};
    for (const k of activeKots) {
      stationCounts[k.station] = (stationCounts[k.station] || 0) + 1;
    }
    const stationsSummary =
      activeKots.length > 0
        ? Object.entries(stationCounts)
            .map(([st, cnt]) => `${cnt} ${st}`)
            .join(" · ")
        : "No pending KOTs";

    const latestShift = await prisma.cashRegisterShift.findFirst({
      where: branchKeyWhere,
      orderBy: { openingTime: "desc" },
    });

    const orgUsers = await prisma.userAccount.findMany({
      where: { organizationId: tenantCtx.organizationId },
      select: { email: true },
    });
    const orgEmails = orgUsers.map((u) => u.email);
    const tenantEntityIds = [
      tenantCtx.organizationId,
      ...branchIds,
      ...invoices.slice(-10).map((i) => i.invoiceNumber),
    ];

    const auditRows = await prisma.auditLog.findMany({
      where: {
        OR: [
          ...(orgEmails.length > 0 ? [{ authorizedBy: { in: orgEmails } }] : []),
          { entityId: { in: tenantEntityIds } },
        ],
      },
      orderBy: { timestamp: "desc" },
      take: 6,
    });

    const recentActivities = auditRows.map((a) => ({
      id: a.id,
      type: a.action.includes("PAYMENT") || a.action.includes("SETTLE")
        ? ("BILL" as const)
        : a.action.includes("KOT")
        ? ("KOT" as const)
        : a.action.includes("DISCOUNT")
        ? ("DISCOUNT" as const)
        : a.action.includes("SHIFT")
        ? ("SHIFT" as const)
        : a.action.includes("INVENTORY")
        ? ("INVENTORY" as const)
        : ("SYSTEM" as const),
      title: a.action.replace(/_/g, " "),
      description: a.reason || a.details || a.entityType,
      time: a.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      user: a.authorizedBy,
    }));

    const topSellingDishes = Object.values(itemsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const hourlySales = Object.entries(hourlyMap)
      .map(([hr, val]) => ({
        hour: Number(hr),
        time: formatHourBucket(Number(hr)),
        sales: Math.round(val.sales),
        orders: val.orders,
      }))
      .sort((a, b) => a.hour - b.hour)
      .map(({ time, sales, orders }) => ({ time, sales, orders }));

    const periodicSales = Object.entries(periodicSalesMap).map(([date, data]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: Math.round(data.gross),
      sales: Math.round(data.gross),
      orders: data.orders,
    }));

    const totalTendered = Object.values(paymentMethodsMap).reduce((a, b) => a + b, 0);
    const paymentMethods = Object.entries(paymentMethodsMap)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({
        name: method === "UPI" ? "UPI QR / Intent" : method === "CARD" ? "Cards" : method === "SPLIT" ? "Split Tender" : "Cash",
        method,
        amount: Math.round(amount),
        value: totalTendered > 0 ? Math.round((amount / totalTendered) * 100) : 0,
        fill: PAYMENT_METHOD_COLORS[method] || "#64748b",
      }));

    return NextResponse.json({
      success: true,
      timeRange,
      branchCode,
      metrics: {
        grossSales: Math.round(grossSales * 100) / 100,
        netSales: Math.round(netSales * 100) / 100,
        totalOrders: invoices.length,
        averageOrderValue: invoices.length > 0 ? Math.round(netSales / invoices.length) : 0,
        totalTaxable: Math.round(totalTaxable * 100) / 100,
        cgstCollected: Math.round(totalCGST * 100) / 100,
        sgstCollected: Math.round(totalSGST * 100) / 100,
        totalTaxes: Math.round((totalCGST + totalSGST) * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        cancelledOrdersCount,
        operatingExpenses: Math.round(totalExpensesAmount * 100) / 100,
        cogs: Math.round(ingredientCOGS * 100) / 100,
        wastageLoss: Math.round(wastageLoss * 100) / 100,
        foodCostPercent: pnlReport.costOfGoodsSold.foodCostPercent,
        netOperatingProfit: pnlReport.netOperatingProfit,
        netMarginPercent: pnlReport.netProfitMarginPercent,
      },
      floorTelemetry: {
        occupiedTables,
        billedTables,
        cleaningTables,
        availableTables,
        totalTables: tableRows.length,
      },
      kdsTelemetry: {
        activeKots: activeKots.length,
        avgPrepSeconds: 0,
        stationsSummary,
      },
      directSavings: {
        directOrdersCount,
        commissionSaved: Math.round(directOrdersRevenue * 0.25),
      },
      cashTillTelemetry: {
        hasOpenShift: latestShift?.status === "OPEN",
        shiftLabel: latestShift ? (latestShift.status === "OPEN" ? "Open Shift" : "Closed Shift") : "No Shift Started",
        expectedCash: Math.round(latestShift?.expectedCash || 0),
        openingBalance: Math.round(latestShift?.openingBalance || 0),
        cashDrops: Math.round(latestShift?.cashDrops || 0),
        cashVariance: Math.round(latestShift?.cashVariance || 0),
      },
      periodicSales,
      hourlySales,
      orderTypeDistribution,
      paymentMethods,
      topSellingDishes,
      recentActivities,
      pnlReport,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
