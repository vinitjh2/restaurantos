export interface AnalyticsDateFilter {
  startDate: Date;
  endDate: Date;
  branchId?: string;
}

export interface SalesAggregation {
  period: string; // "2026-11-01", "2026-W45", "2026-11", "2026"
  grossSales: number;
  netSales: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  discounts: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface ItemSalesMetric {
  itemId: string;
  name: string;
  category: string;
  quantitySold: number;
  grossRevenue: number;
  foodCostEstimate: number;
  grossMarginPercent: number;
}

export interface ProfitAndLossReport {
  period: { start: string; end: string };
  revenue: {
    grossSales: number;
    discountsGiven: number;
    netSales: number;
    taxesCollected: number;
    totalInvoiced: number;
  };
  costOfGoodsSold: {
    ingredientConsumption: number;
    wastageAndLosses: number;
    totalCOGS: number;
    foodCostPercent: number;
  };
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: {
    kitchenLPG: number;
    utilities: number;
    rentAndProperty: number;
    maintenance: number;
    packaging: number;
    marketing: number;
    staffWelfare: number;
    miscellaneous: number;
    totalOperatingExpenses: number;
  };
  laborCosts: {
    staffSalaries: number;
    overtimePay: number;
    totalLaborCost: number;
  };
  netOperatingProfit: number;
  netProfitMarginPercent: number;
}

/**
 * Compute Profit and Loss Statement with exact financial accounting rules
 */
export function computeProfitAndLoss(params: {
  grossSales: number;
  discounts: number;
  taxesCollected: number;
  cogsIngredients: number;
  wastageLoss: number;
  expensesByCategory: Record<string, number>;
  staffPayroll: number;
  overtimePay: number;
  startDate: string;
  endDate: string;
}): ProfitAndLossReport {
  const {
    grossSales,
    discounts,
    taxesCollected,
    cogsIngredients,
    wastageLoss,
    expensesByCategory,
    staffPayroll,
    overtimePay,
    startDate,
    endDate,
  } = params;

  const netSales = Math.max(0, Math.round((grossSales - discounts) * 100) / 100);
  const totalInvoiced = Math.round((netSales + taxesCollected) * 100) / 100;

  const totalCOGS = Math.round((cogsIngredients + wastageLoss) * 100) / 100;
  const foodCostPercent = netSales > 0 ? Math.round((totalCOGS / netSales) * 1000) / 10 : 30.0;

  const grossProfit = Math.round((netSales - totalCOGS) * 100) / 100;
  const grossMarginPercent = netSales > 0 ? Math.round((grossProfit / netSales) * 1000) / 10 : 0;

  let totalOperatingExpenses = 0;
  Object.values(expensesByCategory).forEach((val) => {
    totalOperatingExpenses += val;
  });
  totalOperatingExpenses = Math.round(totalOperatingExpenses * 100) / 100;

  const totalLaborCost = Math.round((staffPayroll + overtimePay) * 100) / 100;
  const totalTotalCosts = Math.round((totalCOGS + totalOperatingExpenses + totalLaborCost) * 100) / 100;
  const netOperatingProfit = Math.round((netSales - (totalCOGS + totalOperatingExpenses + totalLaborCost)) * 100) / 100;
  const netProfitMarginPercent = netSales > 0 ? Math.round((netOperatingProfit / netSales) * 1000) / 10 : 0;

  return {
    period: { start: startDate, end: endDate },
    revenue: {
      grossSales,
      discountsGiven: discounts,
      netSales,
      taxesCollected,
      totalInvoiced,
    },
    costOfGoodsSold: {
      ingredientConsumption: cogsIngredients,
      wastageAndLosses: wastageLoss,
      totalCOGS,
      foodCostPercent,
    },
    grossProfit,
    grossMarginPercent,
    operatingExpenses: {
      kitchenLPG: expensesByCategory["Kitchen LPG"] || 0,
      utilities: expensesByCategory["Utilities"] || 0,
      rentAndProperty: expensesByCategory["Rent"] || 0,
      maintenance: expensesByCategory["Maintenance"] || 0,
      packaging: expensesByCategory["Packaging"] || 0,
      marketing: expensesByCategory["Marketing"] || 0,
      staffWelfare: expensesByCategory["Staff Welfare"] || 0,
      miscellaneous: expensesByCategory["Miscellaneous"] || 0,
      totalOperatingExpenses,
    },
    laborCosts: {
      staffSalaries: staffPayroll,
      overtimePay,
      totalLaborCost,
    },
    netOperatingProfit,
    netProfitMarginPercent,
  };
}
