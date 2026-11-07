import { prisma } from "../src/lib/server/prisma";

async function seedAnalyticsAccountingAndBranches() {
  console.log("=== SEEDING RESTAURANTOS MULTI-BRANCH, EXPENSES & CASH DRAWER ===");

  // 1. Branches
  const branchesData = [
    {
      name: "RestaurantOS — Indiranagar Flagship",
      code: "IND",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 80 4123 4567",
      gstin: "29AABCR1234F1Z8",
      fssaiNumber: "11223344556677",
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 5.0,
    },
    {
      name: "RestaurantOS — Koramangala Kitchen & Bar",
      code: "KOR",
      address: "80 Feet Road, 4th Block, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      phone: "+91 80 4234 5678",
      gstin: "29AABCR1234F1Z8",
      fssaiNumber: "11223344556678",
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 5.0,
    },
    {
      name: "RestaurantOS — HSR Cloud Kitchen",
      code: "HSR",
      address: "27th Main Road, Sector 1, HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      phone: "+91 80 4345 6789",
      gstin: "29AABCR1234F1Z8",
      fssaiNumber: "11223344556679",
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 5.0,
    },
  ];

  for (const b of branchesData) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
  }
  console.log(`[PASS] Seeded ${branchesData.length} Multi-Branch Locations (Flagship, Kitchen & Bar, Cloud Kitchen)`);

  // 2. Operational Expenses
  const expensesData = [
    {
      branchId: "IND",
      category: "Kitchen LPG",
      description: "2x Commercial Indane 19Kg Cylinders Refill",
      amount: 3950.0,
      paymentMode: "CASH",
      vendor: "Indane Gas Agency Indiranagar",
      authorizedBy: "Chef Manpreet",
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      receiptRef: "REC-GAS-9041",
    },
    {
      branchId: "IND",
      category: "Utilities & Electricity",
      description: "BESCOM Commercial Electricity Bill for Kitchen & AC",
      amount: 28990.0,
      paymentMode: "BANK_TRANSFER",
      vendor: "BESCOM Karnataka",
      authorizedBy: "Ananya Roy (Manager)",
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      receiptRef: "BES-OCT-2026",
    },
    {
      branchId: "IND",
      category: "Property Rent",
      description: "Monthly Indiranagar Commercial Property Lease",
      amount: 65000.0,
      paymentMode: "BANK_TRANSFER",
      vendor: "Prestige Commercial Estates",
      authorizedBy: "Vikramaditya (Owner)",
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      receiptRef: "RENT-NOV-2026",
    },
    {
      branchId: "IND",
      category: "Food Packaging",
      description: "Zomato tamper-proof boxes & eco paper bags (500 pcs)",
      amount: 4800.0,
      paymentMode: "UPI",
      vendor: "EcoPack Containers",
      authorizedBy: "Ananya Roy (Manager)",
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      receiptRef: "UPI-ECO-8812",
    },
    {
      branchId: "IND",
      category: "Equipment Maintenance",
      description: "Tandoor clay lining repair and exhaust hood degreasing",
      amount: 3500.0,
      paymentMode: "CASH",
      vendor: "Shiv Shakti Kitchen Equipment",
      authorizedBy: "Chef Manpreet",
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      receiptRef: "VCH-MAINT-102",
    },
  ];

  await prisma.expense.deleteMany();
  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }
  console.log(`[PASS] Seeded ${expensesData.length} Operating Expenses across categories`);

  // 3. Cash Register Shift
  await prisma.cashRegisterShift.deleteMany();
  await prisma.cashRegisterShift.create({
    data: {
      branchId: "IND",
      openedBy: "Rahul Sharma (Cashier)",
      openingTime: new Date(Date.now() - 8 * 3600 * 1000),
      openingBalance: 3000.0, // float
      cashSales: 14200.0,
      cashDrops: 5000.0, // safe deposit drop
      cashRefunds: 0.0,
      expectedCash: 12200.0, // 3000 + 14200 - 5000
      actualClosingCash: null,
      status: "OPEN",
      notes: "Daily lunch drawer shift in progress",
    },
  });
  console.log("[PASS] Seeded Active Open Cash Drawer Shift with Float and Safe Drop");

  // 4. Branch Stock Transfer
  const paneer = await prisma.ingredient.findFirst({ where: { name: { contains: "Paneer" } } });
  const butter = await prisma.ingredient.findFirst({ where: { name: { contains: "Butter" } } });

  if (paneer && butter) {
    await prisma.branchTransfer.deleteMany();
    await prisma.branchTransfer.create({
      data: {
        transferNumber: "TRF-001",
        sourceBranchId: "IND",
        destBranchId: "KOR",
        status: "RECEIVED",
        initiatedBy: "Chef Manpreet",
        receivedBy: "Chef Karan (Koramangala)",
        initiatedAt: new Date(Date.now() - 24 * 3600 * 1000),
        receivedAt: new Date(Date.now() - 20 * 3600 * 1000),
        totalValue: 3260.0,
        notes: "Emergency weekend dairy replenishment",
        items: {
          create: [
            {
              ingredientId: paneer.id,
              quantity: 5.0,
              uom: "KG",
              unitCost: paneer.purchasePrice,
              totalCost: 5.0 * paneer.purchasePrice,
            },
            {
              ingredientId: butter.id,
              quantity: 3.0,
              uom: "KG",
              unitCost: butter.purchasePrice,
              totalCost: 3.0 * butter.purchasePrice,
            },
          ],
        },
      },
    });
    console.log("[PASS] Seeded Cross-Branch Stock Transfer (TRF-001: Indiranagar -> Koramangala)");
  }

  console.log("\n=== MULTI-BRANCH, EXPENSES & ACCOUNTING SEED COMPLETED! ===");
}

seedAnalyticsAccountingAndBranches()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
