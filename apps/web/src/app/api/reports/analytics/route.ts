import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { computeProfitAndLoss } from "@/lib/server/analytics-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30d"; // today, 7d, 30d, 1y
    const branchCode = searchParams.get("branch") || "All";

    const now = new Date();
    const startDate = new Date();

    if (timeRange === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "1y") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // 30d
      startDate.setDate(startDate.getDate() - 30);
    }

    const branchFilter = branchCode !== "All" ? { branchId: branchCode } : {};

    // 1. Fetch Paid / Settled Invoices in range
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ["PAID", "PARTIAL"] },
        ...branchFilter,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "asc" },
    });

    let grossSales = 0;
    let netSales = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalDiscounts = 0;
    let totalRefunds = 0;

    const paymentMethodsMap: Record<string, number> = { CASH: 0, UPI: 0, CARD: 0, SPLIT: 0 };
    const itemsMap: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
    const periodicSalesMap: Record<string, { gross: number; orders: number }> = {};

    for (const inv of invoices) {
      grossSales += inv.subtotal;
      netSales += inv.grandTotal;
      totalTaxable += inv.taxableAmount;
      totalCGST += inv.cgstAmount;
      totalSGST += inv.sgstAmount;
      totalDiscounts += inv.itemDiscounts + inv.billDiscount;

      // Tender map
      const method = inv.paymentMethod || "CASH";
      paymentMethodsMap[method] = (paymentMethodsMap[method] || 0) + inv.grandTotal;

      // Period map (by date string)
      const dateKey = inv.createdAt.toISOString().split("T")[0];
      if (!periodicSalesMap[dateKey]) {
        periodicSalesMap[dateKey] = { gross: 0, orders: 0 };
      }
      periodicSalesMap[dateKey].gross += inv.grandTotal;
      periodicSalesMap[dateKey].orders += 1;

      // Line items breakdown
      if (inv.order?.items) {
        for (const it of inv.order.items) {
          if (!itemsMap[it.itemName]) {
            itemsMap[it.itemName] = {
              name: it.itemName,
              category: "General",
              quantity: 0,
              revenue: 0,
            };
          }
          itemsMap[it.itemName].quantity += it.quantity;
          itemsMap[it.itemName].revenue += it.subtotal;
        }
      }
    }

    // 2. Fetch Refunds
    const refunds = await prisma.refund.findMany({
      where: { createdAt: { gte: startDate } },
    });
    totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

    // 3. Fetch Cancelled / Voided Orders
    const cancelledOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: "CANCELLED",
        ...branchFilter,
      },
      select: { id: true, orderNumber: true, grandTotal: true, createdAt: true },
    });

    // 4. Stock Movements (COGS & Wastage)
    const stockMovements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte: startDate } },
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

    // 5. Operating Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate },
        ...(branchCode !== "All" ? { branchId: branchCode } : {}),
      },
    });

    const expensesByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    }

    // 6. Labor Payroll
    const payrollRuns = await prisma.payrollRun.findMany({
      include: { staffPayrolls: true },
    });
    let staffSalariesTotal = 0;
    let overtimePayTotal = 0;
    for (const run of payrollRuns) {
      for (const slip of run.staffPayrolls) {
        staffSalariesTotal += slip.baseAmount;
        overtimePayTotal += slip.overtimePay;
      }
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
      endDate: now.toISOString().split("T")[0],
    });

    // Top selling items
    const topSellingDishes = Object.values(itemsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

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
        cancelledOrdersCount: cancelledOrders.length,
        cogs: Math.round(ingredientCOGS * 100) / 100,
        wastageLoss: Math.round(wastageLoss * 100) / 100,
        foodCostPercent: pnlReport.costOfGoodsSold.foodCostPercent,
        netOperatingProfit: pnlReport.netOperatingProfit,
        netMarginPercent: pnlReport.netProfitMarginPercent,
      },
      periodicSales: Object.entries(periodicSalesMap).map(([date, data]) => ({
        date,
        sales: Math.round(data.gross),
        orders: data.orders,
      })),
      topSellingDishes,
      paymentMethods: Object.entries(paymentMethodsMap).map(([method, amount]) => ({
        method,
        amount: Math.round(amount),
      })),
      pnlReport,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
