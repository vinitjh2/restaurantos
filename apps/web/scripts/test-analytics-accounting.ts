import { prisma } from "../src/lib/server/prisma";
import { computeProfitAndLoss } from "../src/lib/server/analytics-engine";
import { reconcileCashDrawer } from "../src/lib/server/accounting-engine";
import { transferStockBetweenBranches, acknowledgeTransferReceipt } from "../src/lib/server/multi-branch-engine";

async function runAnalyticsAccountingTest() {
  console.log("=== STARTING RESTAURANTOS ADVANCED ANALYTICS, ACCOUNTING & MULTI-BRANCH TEST ===");

  // 1. Test Profit and Loss Statement Math
  console.log("\n[TEST 1] Testing Profit and Loss Financial Accounting Engine...");
  const pnl = computeProfitAndLoss({
    grossSales: 500000,
    discounts: 25000,
    taxesCollected: 23750, // 5% GST
    cogsIngredients: 142500, // 30% food cost
    wastageLoss: 4750, // 1% wastage
    expensesByCategory: {
      "Kitchen LPG": 8000,
      "Utilities": 30000,
      "Rent": 75000,
      "Packaging": 12000,
      "Maintenance": 5000,
    },
    staffPayroll: 95000,
    overtimePay: 6000,
    startDate: "2026-11-01",
    endDate: "2026-11-30",
  });

  // Net Sales = 500,000 - 25,000 = 475,000
  // Total COGS = 142,500 + 4,750 = 147,250 (31% food cost)
  // Gross Profit = 475,000 - 147,250 = 327,750 (69% gross margin)
  // Operating Expenses = 8,000 + 30,000 + 75,000 + 12,000 + 5,000 = 130,000
  // Labor Costs = 95,000 + 6,000 = 101,000
  // Net Operating Profit = 475,000 - (147,250 + 130,000 + 101,000) = 475,000 - 378,250 = 96,750
  // Net Margin % = (96,750 / 475,000) * 100 = 20.37% -> 20.4%

  console.log(`- Net Sales: ₹${pnl.revenue.netSales.toLocaleString("en-IN")}`);
  console.log(`- Total COGS: ₹${pnl.costOfGoodsSold.totalCOGS.toLocaleString("en-IN")} (Food Cost: ${pnl.costOfGoodsSold.foodCostPercent}%)`);
  console.log(`- Gross Profit: ₹${pnl.grossProfit.toLocaleString("en-IN")} (Gross Margin: ${pnl.grossMarginPercent}%)`);
  console.log(`- Total Operating Expenses: ₹${pnl.operatingExpenses.totalOperatingExpenses.toLocaleString("en-IN")}`);
  console.log(`- Total Labor Cost: ₹${pnl.laborCosts.totalLaborCost.toLocaleString("en-IN")}`);
  console.log(`- Net Operating Profit: ₹${pnl.netOperatingProfit.toLocaleString("en-IN")} (Net Margin: ${pnl.netProfitMarginPercent}%)`);

  if (pnl.revenue.netSales !== 475000 || pnl.grossProfit !== 327750 || pnl.netOperatingProfit !== 96750) {
    throw new Error(`P&L calculation mismatch! Net profit calculated as ₹${pnl.netOperatingProfit}`);
  }
  console.log("[PASS] Profit and Loss financial statement accurate to the rupee");

  // 2. Test Cash Register Drawer Variance Math
  console.log("\n[TEST 2] Testing Cash Drawer Till Reconciliation & Variance...");
  // Shift with 3,000 opening float, 12,000 cash sales, 4,000 cash drop to safe, 500 cash refund
  // Expected Cash = 3,000 + 12,000 - 4,000 - 500 = 10,500
  const balancedCase = reconcileCashDrawer({
    openingBalance: 3000,
    cashSales: 12000,
    cashDrops: 4000,
    cashRefunds: 500,
    actualClosingCash: 10500,
  });
  if (!balancedCase.isBalanced || balancedCase.cashVariance !== 0) {
    throw new Error("Balanced cash drawer case failed");
  }
  console.log("- Balanced Till: Expected ₹10,500, Actual ₹10,500 -> Variance ₹0 (Balanced: true)");

  // Shortage case: physical count 10,380 (-120 shortage)
  const shortageCase = reconcileCashDrawer({
    openingBalance: 3000,
    cashSales: 12000,
    cashDrops: 4000,
    cashRefunds: 500,
    actualClosingCash: 10380,
  });
  if (!shortageCase.isShortage || shortageCase.cashVariance !== -120) {
    throw new Error(`Shortage case failed: variance ${shortageCase.cashVariance}`);
  }
  console.log(`- Shortage Till: Expected ₹10,500, Actual ₹10,380 -> Shortage: -₹${Math.abs(shortageCase.cashVariance)} (Shortage Flagged: true)`);
  console.log("[PASS] Cash Register Till reconciliation & variance calculation verified");

  // 3. Test Cross-Branch Stock Transfer
  console.log("\n[TEST 3] Testing Cross-Branch Stock Transfer Lifecycle...");
  const paneer = await prisma.ingredient.findFirst({ where: { name: { contains: "Paneer" } } });
  if (!paneer) throw new Error("Paneer ingredient not found");

  const initialStock = paneer.currentStock;
  const transferQty = 2.0; // 2kg
  const transferNum = `TRF-TEST-${Date.now().toString().slice(-4)}`;

  // Step A: Initiate Transfer from IND to KOR
  const transfer = await transferStockBetweenBranches({
    transferNumber: transferNum,
    sourceBranchCode: "IND",
    destBranchCode: "KOR",
    initiatedBy: "Chef Manpreet",
    items: [
      {
        ingredientId: paneer.id,
        quantity: transferQty,
        uom: "KG",
      },
    ],
    notes: "QA Test branch stock transfer",
  });

  const paneerAfterDispatch = await prisma.ingredient.findUnique({ where: { id: paneer.id } });
  console.log(`- Stock after dispatch: Pre ${initialStock} KG -> Post ${paneerAfterDispatch!.currentStock} KG (-${transferQty} KG)`);
  if (Math.abs(paneerAfterDispatch!.currentStock - (initialStock - transferQty)) > 0.001) {
    throw new Error("Source stock deduction mismatch during dispatch");
  }
  if (transfer.status !== "IN_TRANSIT") {
    throw new Error(`Expected status IN_TRANSIT, got ${transfer.status}`);
  }
  console.log(`- Transfer ${transfer.transferNumber} status: ${transfer.status}`);

  // Step B: Acknowledge Receipt at KOR
  const receivedTransfer = await acknowledgeTransferReceipt(transfer.id, "Chef Karan (Koramangala)");
  const paneerAfterReceipt = await prisma.ingredient.findUnique({ where: { id: paneer.id } });
  console.log(`- Transfer ${receivedTransfer.transferNumber} status after receipt: ${receivedTransfer.status} (Stock restored: ${paneerAfterReceipt!.currentStock} KG)`);
  if (receivedTransfer.status !== "RECEIVED" || !receivedTransfer.receivedAt) {
    throw new Error("Transfer receipt status mismatch");
  }
  console.log("[PASS] Multi-Branch Stock Transfer dispatched, tracked in-transit, and acknowledged atomically");

  console.log("\n==========================================================================");
  console.log("=== ALL ADVANCED ANALYTICS, ACCOUNTING & MULTI-BRANCH TESTS PASSED 100%! ===");
  console.log("==========================================================================");
}

runAnalyticsAccountingTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
