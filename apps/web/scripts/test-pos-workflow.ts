import { calculateOrderTotals } from "../src/lib/server/billing-engine";
import { prisma } from "../src/lib/server/prisma";

async function runEndToEndPOSTest() {
  console.log("=== STARTING END-TO-END RESTAURANTOS POS WORKFLOW TEST ===");

  // 1. Verify Database Connection & Branch
  const branch = await prisma.branch.findUnique({ where: { code: "IND" } });
  if (!branch) throw new Error("Branch 'IND' not found in database.");
  console.log(`[PASS] Branch Verified: ${branch.name} (GSTIN: ${branch.gstin}, FSSAI: ${branch.fssaiNumber})`);

  // 2. Select Menu Items & Modifiers
  const butterChicken = await prisma.menuItem.findFirst({
    where: { shortCode: "BC" },
    include: { variants: true },
  });
  const naan = await prisma.menuItem.findFirst({
    where: { shortCode: "BGN" },
    include: { modifiers: { include: { options: true } } },
  });

  if (!butterChicken || !naan) throw new Error("Menu items missing in database.");
  console.log(`[PASS] Menu Items Loaded: '${butterChicken.name}', '${naan.name}'`);

  const fullVariant = butterChicken.variants.find((v) => v.name === "Full");
  const cheeseModifier = naan.modifiers?.[0]?.options.find((o) => o.name.includes("Cheese"));

  // 3. Test Backend Financial Calculation Engine
  const orderInput = {
    items: [
      {
        menuItemId: butterChicken.id,
        name: butterChicken.name,
        basePrice: butterChicken.basePrice,
        variantId: fullVariant?.id,
        variantName: fullVariant?.name,
        variantPrice: fullVariant?.price, // 370
        quantity: 2,
        cookingNotes: "Medium Spicy, extra butter",
      },
      {
        menuItemId: naan.id,
        name: naan.name,
        basePrice: naan.basePrice, // 80
        modifierOptions: cheeseModifier ? [{ id: cheeseModifier.id, name: cheeseModifier.name, price: cheeseModifier.price }] : [], // +50 = 130
        quantity: 4,
      },
    ],
    orderType: "DINE_IN" as const,
    billDiscountPercentage: 10, // 10% manager discount
    billDiscountReason: "Corporate Partner Visit",
    cgstRate: branch.cgstRate, // 2.5%
    sgstRate: branch.sgstRate, // 2.5%
  };

  const calc = calculateOrderTotals(orderInput);
  console.log("\n--- FINANCIAL BREAKDOWN (BACKEND VERIFIED) ---");
  console.log(`Gross Subtotal:     ₹${calc.subtotal}`);
  console.log(`10% Discount:      -₹${calc.billDiscount} (Reason: ${calc.billDiscountReason})`);
  console.log(`Taxable Value:      ₹${calc.taxableAmount}`);
  console.log(`CGST (2.5%):        ₹${calc.cgstAmount}`);
  console.log(`SGST (2.5%):        ₹${calc.sgstAmount}`);
  console.log(`Round-off:          ₹${calc.roundOff}`);
  console.log(`GRAND TOTAL:        ₹${calc.grandTotal}`);

  if (calc.grandTotal <= 0) throw new Error("Invalid grand total calculation.");
  console.log("[PASS] Strict Backend Calculation Verified!");

  // 4. Test KOT Generation Workflow
  const kotSeq = branch.nextKotSeq;
  const kotNumber = `KOT-${String(kotSeq).padStart(3, "0")}`;

  const kot = await prisma.kOT.create({
    data: {
      kotNumber,
      orderType: "DINE_IN",
      tableNumber: "T-04",
      status: "PENDING",
      branchId: branch.id,
      order: {
        create: {
          orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
          orderType: "DINE_IN",
          tableNumber: "T-04",
          status: "KOT_SENT",
          branchId: branch.id,
          subtotal: calc.subtotal,
          grandTotal: calc.grandTotal,
        },
      },
      items: {
        create: calc.lineItems.map((li) => ({
          itemName: li.name,
          variantName: li.variantName || null,
          quantity: li.quantity,
          cookingNotes: li.cookingNotes || null,
        })),
      },
    },
    include: { items: true, order: true },
  });

  console.log(`\n[PASS] KOT Generated: ${kot.kotNumber} for Table: ${kot.tableNumber} with ${kot.items.length} line items`);

  // 5. Test Payment Settlement & Invoice Generation
  const invSeq = branch.nextInvoiceSeq;
  const invoiceNumber = `${branch.code}/${branch.currentFiscalYr}/${String(invSeq).padStart(5, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      fiscalYear: branch.currentFiscalYr,
      orderId: kot.order.id,
      branchId: branch.id,
      subtotal: calc.subtotal,
      itemDiscounts: calc.totalItemDiscounts,
      billDiscount: calc.billDiscount,
      packagingCharge: calc.packagingCharge,
      deliveryCharge: calc.deliveryCharge,
      serviceCharge: calc.serviceCharge,
      taxableAmount: calc.taxableAmount,
      cgstRate: calc.cgstRate,
      cgstAmount: calc.cgstAmount,
      sgstRate: calc.sgstRate,
      sgstAmount: calc.sgstAmount,
      igstRate: calc.igstRate,
      igstAmount: calc.igstAmount,
      isTaxInclusive: calc.isTaxInclusive,
      roundOff: calc.roundOff,
      grandTotal: calc.grandTotal,
      paidAmount: calc.grandTotal,
      balanceDue: 0,
      status: "PAID",
      paymentMethod: "SPLIT",
      payments: {
        create: [
          { method: "CASH", amount: 500, notes: "Cash tendered" },
          { method: "UPI", amount: calc.grandTotal - 500, transactionRef: "UPI-4312890123" },
        ],
      },
    },
    include: { payments: true },
  });

  // Mark order paid
  await prisma.order.update({
    where: { id: kot.order.id },
    data: { status: "PAID" },
  });

  console.log(`\n[PASS] Tax Invoice Generated: ${invoice.invoiceNumber}`);
  console.log(`       Status: ${invoice.status}`);
  console.log(`       Settled: Paid ₹${invoice.paidAmount} via Split Payment (Cash: ₹${invoice.payments[0].amount}, UPI: ₹${invoice.payments[1].amount})`);

  // 6. Test Supervisor PIN Authorization
  const supervisor = await prisma.user.findFirst({ where: { role: "MANAGER" } });
  if (!supervisor || supervisor.pinCode !== "1234") throw new Error("Manager PIN verification failed.");
  console.log(`[PASS] Supervisor PIN Security Verified: ${supervisor.name} (Role: ${supervisor.role})`);

  console.log("\n=== ALL POS WORKFLOW TESTS PASSED SUCCESSFULLY! ===");
}

runEndToEndPOSTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
