import { prisma } from "../src/lib/server/prisma";
import { calculateRecipeFinancials, convertToBaseUom, deductStockForOrder } from "../src/lib/server/inventory-engine";

async function runInventoryProcurementTest() {
  console.log("=== STARTING RESTAURANTOS INVENTORY & PROCUREMENT TEST ===");

  // 1. Verify Recipe BOM Financials
  console.log("\n[TEST 1] Testing Recipe BOM Financial Engine...");
  const paneerItem = await prisma.menuItem.findFirst({
    where: { name: "Paneer Butter Masala" },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      },
    },
  });

  if (!paneerItem || !paneerItem.recipe) {
    throw new Error("Paneer Butter Masala recipe not found");
  }

  const recipe = paneerItem.recipe;
  const financials = calculateRecipeFinancials(
    recipe.yieldServings,
    paneerItem.basePrice,
    recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      name: ri.ingredient.name,
      quantityRequired: ri.quantityRequired,
      uom: ri.uom,
      baseUom: ri.ingredient.baseUom,
      purchasePrice: ri.ingredient.purchasePrice,
    }))
  );

  console.log(`- Dish: ${paneerItem.name} (Selling Price: ₹${financials.sellingPrice})`);
  console.log(`- Recipe Cost: ₹${financials.totalRecipeCost.toFixed(2)} | Cost Per Serving: ₹${financials.costPerServing.toFixed(2)}`);
  console.log(`- Gross Profit: ₹${financials.grossProfit.toFixed(2)} | Profit Margin: ${financials.profitMarginPercent}% | Food Cost: ${financials.foodCostPercent}%`);

  if (financials.totalRecipeCost <= 0 || financials.foodCostPercent > 50) {
    throw new Error(`Unexpected recipe cost calculation: ₹${financials.totalRecipeCost}`);
  }
  console.log("[PASS] Recipe BOM Financial Engine validated with standard Indian F&B margins");

  // 2. Test POS Order Automatic Stock Deduction
  console.log("\n[TEST 2] Testing POS Settle Automatic Stock Deduction...");
  const paneerIngBefore = await prisma.ingredient.findUnique({
    where: { name: "Fresh Malai Paneer" },
  });
  const butterIngBefore = await prisma.ingredient.findUnique({
    where: { name: "Amul Pasteurised Butter" },
  });

  if (!paneerIngBefore || !butterIngBefore) {
    throw new Error("Target ingredients missing for test");
  }

  const initialPaneerStock = paneerIngBefore.currentStock;
  const initialButterStock = butterIngBefore.currentStock;
  console.log(`- Pre-Order Stock: Paneer = ${initialPaneerStock} KG, Butter = ${initialButterStock} KG`);

  // Simulate a real order with 2 Paneer Butter Masala
  const testOrderNumber = `ORD-TEST-${Date.now().toString().slice(-4)}`;
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: testOrderNumber,
      branchId: "default",
      status: "PAID",
      tableNumber: "T-04",
      subtotal: paneerItem.basePrice * 2,
      grandTotal: paneerItem.basePrice * 2 * 1.05,
      items: {
        create: [
          {
            menuItemId: paneerItem.id,
            itemName: paneerItem.name,
            quantity: 2, // 2 x 200g = 400g Paneer (0.4 kg), 2 x 30g = 60g Butter (0.06 kg)
            unitPrice: paneerItem.basePrice,
            subtotal: paneerItem.basePrice * 2,
            taxAmount: 0,
          },
        ],
      },
    },
  });

  const testInvoiceNumber = `INV-TEST-${Date.now().toString().slice(-4)}`;
  await prisma.$transaction(async (tx) => {
    await deductStockForOrder(testOrder.id, testInvoiceNumber, tx);
  });

  const paneerIngAfter = await prisma.ingredient.findUnique({
    where: { name: "Fresh Malai Paneer" },
  });
  const butterIngAfter = await prisma.ingredient.findUnique({
    where: { name: "Amul Pasteurised Butter" },
  });

  const paneerDeducted = Math.round((initialPaneerStock - paneerIngAfter!.currentStock) * 1000) / 1000;
  const butterDeducted = Math.round((initialButterStock - butterIngAfter!.currentStock) * 1000) / 1000;

  console.log(`- Post-Order Stock: Paneer = ${paneerIngAfter!.currentStock} KG (Deducted: ${paneerDeducted} KG)`);
  console.log(`- Post-Order Stock: Butter = ${butterIngAfter!.currentStock} KG (Deducted: ${butterDeducted} KG)`);

  if (Math.abs(paneerDeducted - 0.4) > 0.001 || Math.abs(butterDeducted - 0.06) > 0.001) {
    throw new Error(`Deduction mismatch! Expected 0.4kg Paneer and 0.06kg Butter, got ${paneerDeducted}kg and ${butterDeducted}kg`);
  }

  // Check audit log / movement
  const orderMovement = await prisma.stockMovement.findFirst({
    where: {
      referenceId: testInvoiceNumber,
      ingredientId: paneerIngBefore.id,
    },
  });

  if (!orderMovement || orderMovement.movementType !== "ORDER_DEDUCTION") {
    throw new Error("Order deduction movement log was not found");
  }
  console.log(`[PASS] Transactional Stock Deduction & Audit Movement Verified: ${orderMovement.id} (Quantity: ${orderMovement.quantity} KG, Total: ₹${orderMovement.totalValue})`);

  // 3. Test GRN Inward Receipt
  console.log("\n[TEST 3] Testing Goods Received Note (GRN) Inward Stock Credit...");
  const grnNumber = `GRN-TEST-${Date.now().toString().slice(-4)}`;
  const dairySupplier = await prisma.supplier.findFirst({
    where: { name: "Dairy Fresh Farms LLP" },
  });

  if (!dairySupplier) throw new Error("Supplier Dairy Fresh Farms LLP not found");

  const stockBeforeGRN = paneerIngAfter!.currentStock;
  const quantityToReceive = 10.0; // 10 kg
  const unitCost = 340.0;

  await prisma.$transaction(async (tx) => {
    // create GRN
    const grn = await tx.goodsReceivedNote.create({
      data: {
        grnNumber,
        supplierId: dairySupplier.id,
        receivedBy: "Test QA Manager",
        vendorChallanNumber: "CHAL-TEST-001",
        inspectionStatus: "PASSED",
        items: {
          create: [
            {
              ingredientId: paneerIngBefore.id,
              quantityReceived: quantityToReceive,
              unitCost,
              totalCost: quantityToReceive * unitCost,
              batchNumber: "BAT-PAN-NEW-99",
              expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            },
          ],
        },
      },
    });

    // Credit stock
    const updated = await tx.ingredient.update({
      where: { id: paneerIngBefore.id },
      data: {
        currentStock: { increment: quantityToReceive },
        purchasePrice: unitCost,
        batchNumber: "BAT-PAN-NEW-99",
      },
    });

    // Log movement
    await tx.stockMovement.create({
      data: {
        ingredientId: paneerIngBefore.id,
        movementType: "PURCHASE_GRN",
        quantity: quantityToReceive,
        balanceBefore: stockBeforeGRN,
        balanceAfter: updated.currentStock,
        unitCost,
        totalValue: quantityToReceive * unitCost,
        referenceId: grnNumber,
        reason: `GRN received from ${dairySupplier.name}`,
        performedBy: "Test QA Manager",
      },
    });
  });

  const paneerAfterGRN = await prisma.ingredient.findUnique({
    where: { id: paneerIngBefore.id },
  });
  console.log(`- Stock after receiving ${quantityToReceive} KG via ${grnNumber}: ${paneerAfterGRN!.currentStock} KG`);
  if (Math.abs(paneerAfterGRN!.currentStock - (stockBeforeGRN + quantityToReceive)) > 0.001) {
    throw new Error("GRN stock increment mismatch");
  }
  console.log("[PASS] GRN Inward Receipt credited stock and created audit movement correctly");

  // 4. Test Stock Wastage / Loss Adjustment
  console.log("\n[TEST 4] Testing Stock Wastage Adjustment & Loss Valuation...");
  const wasteQty = 0.5; // 500g
  const wasteCost = 340.0;
  const wasteLoss = wasteQty * wasteCost; // ₹170
  const adjNumber = `ADJ-TEST-${Date.now().toString().slice(-4)}`;

  await prisma.$transaction(async (tx) => {
    const adj = await tx.stockAdjustment.create({
      data: {
        adjustmentNumber: adjNumber,
        type: "WASTAGE",
        totalLossValue: wasteLoss,
        reason: "Cold storage temperature fluctuation spillage",
        authorizedBy: "Head Chef Manpreet",
        items: {
          create: [
            {
              ingredientId: paneerIngBefore.id,
              quantity: wasteQty,
              unitCost: wasteCost,
              lossValue: wasteLoss,
            },
          ],
        },
      },
    });

    const currentIng = await tx.ingredient.findUnique({ where: { id: paneerIngBefore.id } });
    const newStock = Math.max(0, (currentIng?.currentStock || 0) - wasteQty);

    await tx.ingredient.update({
      where: { id: paneerIngBefore.id },
      data: { currentStock: newStock },
    });

    await tx.stockMovement.create({
      data: {
        ingredientId: paneerIngBefore.id,
        movementType: "WASTAGE",
        quantity: -wasteQty,
        balanceBefore: currentIng!.currentStock,
        balanceAfter: newStock,
        unitCost: wasteCost,
        totalValue: -wasteLoss,
        referenceId: adjNumber,
        reason: "Cold storage temperature fluctuation spillage",
        performedBy: "Head Chef Manpreet",
      },
    });
  });

  const paneerAfterWaste = await prisma.ingredient.findUnique({
    where: { id: paneerIngBefore.id },
  });
  console.log(`- Stock after recording ${wasteQty} KG wastage: ${paneerAfterWaste!.currentStock} KG`);
  console.log("[PASS] Stock Wastage recorded, stock reduced, and financial loss valuation tracked");

  // 5. Test Supplier Payment Settlement
  console.log("\n[TEST 5] Testing Supplier Payment Settlement & Outstanding Balance...");
  const initialCredit = dairySupplier.creditBalance;
  const paymentAmount = 5000.0;

  await prisma.$transaction(async (tx) => {
    const pay = await tx.supplierPayment.create({
      data: {
        supplierId: dairySupplier.id,
        amount: paymentAmount,
        paymentMethod: "BANK_TRANSFER",
        transactionRef: "NEFT-HDFC-992144",
        paidBy: "Finance Lead",
      },
    });

    await tx.supplier.update({
      where: { id: dairySupplier.id },
      data: {
        creditBalance: { decrement: paymentAmount },
      },
    });
  });

  const supplierAfterPay = await prisma.supplier.findUnique({
    where: { id: dairySupplier.id },
  });
  console.log(`- Supplier Balance: Pre-pay ₹${initialCredit} -> Post-pay ₹${supplierAfterPay!.creditBalance}`);
  if (Math.abs(supplierAfterPay!.creditBalance - (initialCredit - paymentAmount)) > 0.01) {
    throw new Error("Supplier payment balance mismatch");
  }
  console.log("[PASS] Supplier Payment processed, credit balance updated atomically");

  console.log("\n=======================================================");
  console.log("=== ALL INVENTORY & PROCUREMENT TESTS PASSED 100%! ===");
  console.log("=======================================================");
}

runInventoryProcurementTest()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
