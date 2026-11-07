export const EXPENSE_CATEGORIES = [
  "Kitchen LPG",
  "Daily Dairy & Produce",
  "Utilities & Electricity",
  "Property Rent",
  "Equipment Maintenance",
  "Food Packaging",
  "Marketing & Promotions",
  "Staff Welfare & Meals",
  "Miscellaneous",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface CashRegisterCalculation {
  openingBalance: number;
  cashSales: number;
  cashDrops: number;
  cashRefunds: number;
  expectedCash: number;
  actualClosingCash: number;
  cashVariance: number;
  isShortage: boolean;
  isSurplus: boolean;
  isBalanced: boolean;
}

/**
 * Calculate expected drawer cash and till reconciliation variance
 */
export function reconcileCashDrawer(params: {
  openingBalance: number;
  cashSales: number;
  cashDrops: number;
  cashRefunds: number;
  actualClosingCash: number;
}): CashRegisterCalculation {
  const { openingBalance, cashSales, cashDrops, cashRefunds, actualClosingCash } = params;

  // Expected Cash = Opening + Cash Received - Cash Drops - Cash Refunds
  const expectedCash = Math.round((openingBalance + cashSales - cashDrops - cashRefunds) * 100) / 100;
  const cashVariance = Math.round((actualClosingCash - expectedCash) * 100) / 100;

  const isShortage = cashVariance < -0.01;
  const isSurplus = cashVariance > 0.01;
  const isBalanced = !isShortage && !isSurplus;

  return {
    openingBalance,
    cashSales,
    cashDrops,
    cashRefunds,
    expectedCash,
    actualClosingCash,
    cashVariance,
    isShortage,
    isSurplus,
    isBalanced,
  };
}
