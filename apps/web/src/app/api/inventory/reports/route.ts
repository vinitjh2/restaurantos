import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Fetch all ingredients for current valuation
    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        itemType: true,
        baseUom: true,
        currentStock: true,
        purchasePrice: true,
        minimumStock: true,
      },
    });

    let totalValuation = 0;
    const valuationByCategory: Record<string, { count: number; value: number }> = {};
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const ing of ingredients) {
      const itemVal = Math.round(ing.currentStock * ing.purchasePrice * 100) / 100;
      totalValuation += itemVal;

      if (!valuationByCategory[ing.category]) {
        valuationByCategory[ing.category] = { count: 0, value: 0 };
      }
      valuationByCategory[ing.category].count += 1;
      valuationByCategory[ing.category].value += itemVal;

      if (ing.currentStock <= 0) {
        outOfStockCount += 1;
      } else if (ing.currentStock <= ing.minimumStock) {
        lowStockCount += 1;
      }
    }

    // 2. Fetch stock movements in date range for consumption and wastage analysis
    const movements = await prisma.stockMovement.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        ingredient: {
          select: { name: true, category: true, baseUom: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let orderConsumptionValue = 0;
    let wastageLossValue = 0;
    const consumptionByItem: Record<string, { name: string; quantity: number; uom: string; totalCost: number }> = {};
    const wastageByReason: Record<string, number> = {};

    for (const mov of movements) {
      if (mov.movementType === 'ORDER_DEDUCTION') {
        const cost = Math.abs(mov.totalValue);
        orderConsumptionValue += cost;

        if (!consumptionByItem[mov.ingredientId]) {
          consumptionByItem[mov.ingredientId] = {
            name: mov.ingredient.name,
            quantity: 0,
            uom: mov.ingredient.baseUom,
            totalCost: 0,
          };
        }
        consumptionByItem[mov.ingredientId].quantity += Math.abs(mov.quantity);
        consumptionByItem[mov.ingredientId].totalCost += cost;
      } else if (['WASTAGE', 'DAMAGED', 'EXPIRED'].includes(mov.movementType)) {
        const loss = Math.abs(mov.totalValue);
        wastageLossValue += loss;
        const r = mov.reason || 'Unspecified';
        wastageByReason[r] = (wastageByReason[r] || 0) + loss;
      }
    }

    // Sort top consumed items
    const topConsumedIngredients = Object.values(consumptionByItem)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    // 3. Sales revenue for Food Cost Percentage calculation
    const salesInvoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PAID', 'PARTIAL'] },
      },
      select: { grandTotal: true },
    });

    const totalSalesRevenue = salesInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const foodCostPercentage = totalSalesRevenue > 0
      ? Math.round((orderConsumptionValue / totalSalesRevenue) * 1000) / 10
      : 30.5; // fallback industry standard if no sales yet

    // 4. Supplier balances and pending orders
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true, invoices: true },
        },
      },
    });

    const totalPayablesDue = suppliers.reduce((sum, s) => sum + s.creditBalance, 0);

    return NextResponse.json({
      success: true,
      report: {
        summary: {
          totalValuation: Math.round(totalValuation * 100) / 100,
          totalIngredientsCount: ingredients.length,
          lowStockCount,
          outOfStockCount,
          orderConsumptionValue: Math.round(orderConsumptionValue * 100) / 100,
          wastageLossValue: Math.round(wastageLossValue * 100) / 100,
          totalSalesRevenue: Math.round(totalSalesRevenue * 100) / 100,
          foodCostPercentage,
          totalPayablesDue: Math.round(totalPayablesDue * 100) / 100,
          timeWindowDays: days,
        },
        valuationByCategory: Object.entries(valuationByCategory).map(([category, data]) => ({
          category,
          count: data.count,
          value: Math.round(data.value * 100) / 100,
        })),
        topConsumedIngredients,
        wastageByReason: Object.entries(wastageByReason).map(([reason, amount]) => ({
          reason,
          amount: Math.round(amount * 100) / 100,
        })),
        suppliersBreakdown: suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          creditBalance: s.creditBalance,
          ordersCount: s._count.purchaseOrders,
          rating: s.rating,
        })),
      },
    });
  } catch (error: any) {
    console.error('Failed to generate inventory reports:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
}
