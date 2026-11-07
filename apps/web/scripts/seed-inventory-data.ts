import { prisma } from "../src/lib/server/prisma";

async function seedInventoryAndProcurement() {
  console.log("=== SEEDING RESTAURANTOS INVENTORY, RECIPES & PROCUREMENT ===");

  // 1. Seed Raw Material Ingredients
  const ingredientsData = [
    {
      name: "Fresh Malai Paneer",
      itemType: "RAW_MATERIAL",
      category: "Dairy",
      baseUom: "KG",
      currentStock: 24.5,
      minimumStock: 8.0,
      maximumStock: 60.0,
      purchasePrice: 340.0,
      batchNumber: "BAT-PAN-092",
      expiryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    },
    {
      name: "Amul Pasteurised Butter",
      itemType: "INGREDIENT",
      category: "Dairy",
      baseUom: "KG",
      currentStock: 18.0,
      minimumStock: 5.0,
      maximumStock: 40.0,
      purchasePrice: 520.0,
      batchNumber: "BAT-AML-114",
      expiryDate: new Date(Date.now() + 60 * 24 * 3600 * 1000),
    },
    {
      name: "Amul Fresh Cream",
      itemType: "INGREDIENT",
      category: "Dairy",
      baseUom: "LITRE",
      currentStock: 12.0,
      minimumStock: 4.0,
      maximumStock: 30.0,
      purchasePrice: 210.0,
      batchNumber: "BAT-CRM-208",
      expiryDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
    },
    {
      name: "Fresh Boneless Chicken Breast",
      itemType: "RAW_MATERIAL",
      category: "Poultry",
      baseUom: "KG",
      currentStock: 28.0,
      minimumStock: 10.0,
      maximumStock: 70.0,
      purchasePrice: 260.0,
      batchNumber: "BAT-CHK-552",
      expiryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    },
    {
      name: "Fresh Tomato Puree",
      itemType: "INGREDIENT",
      category: "Vegetables",
      baseUom: "KG",
      currentStock: 35.0,
      minimumStock: 10.0,
      maximumStock: 80.0,
      purchasePrice: 55.0,
      batchNumber: "BAT-TOM-401",
      expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
    },
    {
      name: "Brown Onion Paste",
      itemType: "INGREDIENT",
      category: "Vegetables",
      baseUom: "KG",
      currentStock: 20.0,
      minimumStock: 6.0,
      maximumStock: 50.0,
      purchasePrice: 75.0,
      batchNumber: "BAT-ONI-330",
      expiryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    },
    {
      name: "Premium Maida Wheat Flour",
      itemType: "RAW_MATERIAL",
      category: "Grains",
      baseUom: "KG",
      currentStock: 65.0,
      minimumStock: 20.0,
      maximumStock: 150.0,
      purchasePrice: 42.0,
      batchNumber: "BAT-MAI-102",
      expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000),
    },
    {
      name: "Peeled Garlic Cloves",
      itemType: "RAW_MATERIAL",
      category: "Vegetables",
      baseUom: "KG",
      currentStock: 7.5,
      minimumStock: 3.0,
      maximumStock: 20.0,
      purchasePrice: 140.0,
      batchNumber: "BAT-GAR-808",
      expiryDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
    },
    {
      name: "Daawat Biryani Basmati Rice",
      itemType: "RAW_MATERIAL",
      category: "Grains",
      baseUom: "KG",
      currentStock: 45.0,
      minimumStock: 15.0,
      maximumStock: 100.0,
      purchasePrice: 115.0,
      batchNumber: "BAT-RIC-919",
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
    },
    {
      name: "Royal Shahi Garam Masala",
      itemType: "INGREDIENT",
      category: "Spices",
      baseUom: "KG",
      currentStock: 4.2,
      minimumStock: 2.0,
      maximumStock: 15.0,
      purchasePrice: 850.0,
      batchNumber: "BAT-MSL-611",
      expiryDate: new Date(Date.now() + 240 * 24 * 3600 * 1000),
    },
    {
      name: "Kasoori Methi Leaves",
      itemType: "INGREDIENT",
      category: "Spices",
      baseUom: "KG",
      currentStock: 1.8,
      minimumStock: 1.0,
      maximumStock: 8.0,
      purchasePrice: 600.0,
      batchNumber: "BAT-KAS-221",
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
    },
    {
      name: "750ml Meal Takeaway Container",
      itemType: "PACKAGING",
      category: "Packaging",
      baseUom: "PIECE",
      currentStock: 420.0,
      minimumStock: 100.0,
      maximumStock: 1000.0,
      purchasePrice: 7.5,
      batchNumber: "BAT-BOX-004",
      expiryDate: null,
    },
    {
      name: "Kraft Paper Carry Bag (Medium)",
      itemType: "PACKAGING",
      category: "Packaging",
      baseUom: "PIECE",
      currentStock: 350.0,
      minimumStock: 80.0,
      maximumStock: 800.0,
      purchasePrice: 5.0,
      batchNumber: "BAT-BAG-101",
      expiryDate: null,
    },
  ];

  const ingredientMap = new Map<string, any>();

  for (const ing of ingredientsData) {
    const record = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {
        category: ing.category,
        baseUom: ing.baseUom,
        currentStock: ing.currentStock,
        minimumStock: ing.minimumStock,
        maximumStock: ing.maximumStock,
        purchasePrice: ing.purchasePrice,
        batchNumber: ing.batchNumber,
        expiryDate: ing.expiryDate,
      },
      create: ing,
    });
    ingredientMap.set(ing.name, record);

    // Initial movement log if none exists
    const existingMov = await prisma.stockMovement.findFirst({
      where: { ingredientId: record.id },
    });
    if (!existingMov) {
      await prisma.stockMovement.create({
        data: {
          ingredientId: record.id,
          movementType: "PURCHASE_GRN",
          quantity: ing.currentStock,
          balanceBefore: 0,
          balanceAfter: ing.currentStock,
          unitCost: ing.purchasePrice,
          totalValue: Math.round(ing.currentStock * ing.purchasePrice * 100) / 100,
          referenceId: "INITIAL-STOCK",
          reason: "System Initial Opening Stock Setup",
          performedBy: "System Administrator",
        },
      });
    }
  }
  console.log(`[PASS] Seeded ${ingredientsData.length} Ingredients & Initial Movements`);

  // 2. Map Recipes to Existing Menu Items
  // Check for Paneer Butter Masala
  let paneerItem = await prisma.menuItem.findFirst({
    where: { name: { contains: "Paneer" } },
  });

  if (!paneerItem) {
    paneerItem = await prisma.menuItem.create({
      data: {
        name: "Paneer Butter Masala",
        category: "Curries & Gravies",
        shortCode: "PBM",
        basePrice: 320.0,
        dietType: "VEG",
      },
    });
  }

  // Butter Chicken item
  let butterChickenItem = await prisma.menuItem.findFirst({
    where: { shortCode: "BC" },
  });

  // Butter Garlic Naan item
  let naanItem = await prisma.menuItem.findFirst({
    where: { shortCode: "BGN" },
  });

  // Create Recipe for Paneer Butter Masala
  if (paneerItem) {
    await prisma.recipe.deleteMany({ where: { menuItemId: paneerItem.id } });
    await prisma.recipe.create({
      data: {
        menuItemId: paneerItem.id,
        yieldServings: 1,
        instructions: "Saute spices in 30g butter, add 100g puree, stir in 200g paneer cubes, finish with 40ml fresh cream.",
        ingredients: {
          create: [
            {
              ingredientId: ingredientMap.get("Fresh Malai Paneer")!.id,
              quantityRequired: 200,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Amul Pasteurised Butter")!.id,
              quantityRequired: 30,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Fresh Tomato Puree")!.id,
              quantityRequired: 100,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Amul Fresh Cream")!.id,
              quantityRequired: 40,
              uom: "ML",
            },
            {
              ingredientId: ingredientMap.get("Royal Shahi Garam Masala")!.id,
              quantityRequired: 8,
              uom: "GRAM",
            },
          ],
        },
      },
    });
    console.log(`[PASS] Recipe Configured: 'Paneer Butter Masala' (BOM: Paneer 200g, Butter 30g, Tomato 100g, Cream 40ml, Spices 8g)`);
  }

  // Create Recipe for Butter Chicken
  if (butterChickenItem) {
    await prisma.recipe.deleteMany({ where: { menuItemId: butterChickenItem.id } });
    await prisma.recipe.create({
      data: {
        menuItemId: butterChickenItem.id,
        yieldServings: 1,
        instructions: "Marinate chicken, char in tandoor, simmer in tomato cream makhani gravy with butter and fenugreek.",
        ingredients: {
          create: [
            {
              ingredientId: ingredientMap.get("Fresh Boneless Chicken Breast")!.id,
              quantityRequired: 250,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Amul Pasteurised Butter")!.id,
              quantityRequired: 40,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Fresh Tomato Puree")!.id,
              quantityRequired: 80,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Amul Fresh Cream")!.id,
              quantityRequired: 50,
              uom: "ML",
            },
            {
              ingredientId: ingredientMap.get("Royal Shahi Garam Masala")!.id,
              quantityRequired: 10,
              uom: "GRAM",
            },
          ],
        },
      },
    });
    console.log(`[PASS] Recipe Configured: 'Butter Chicken' (BOM: Chicken 250g, Butter 40g, Tomato 80g, Cream 50ml, Spices 10g)`);
  }

  // Create Recipe for Naan
  if (naanItem) {
    await prisma.recipe.deleteMany({ where: { menuItemId: naanItem.id } });
    await prisma.recipe.create({
      data: {
        menuItemId: naanItem.id,
        yieldServings: 1,
        instructions: "Roll 120g dough, smear minced garlic, stretch and slap inside clay tandoor. Brush with 20g melted butter.",
        ingredients: {
          create: [
            {
              ingredientId: ingredientMap.get("Premium Maida Wheat Flour")!.id,
              quantityRequired: 120,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Amul Pasteurised Butter")!.id,
              quantityRequired: 20,
              uom: "GRAM",
            },
            {
              ingredientId: ingredientMap.get("Peeled Garlic Cloves")!.id,
              quantityRequired: 10,
              uom: "GRAM",
            },
          ],
        },
      },
    });
    console.log(`[PASS] Recipe Configured: 'Butter Garlic Naan' (BOM: Flour 120g, Butter 20g, Garlic 10g)`);
  }

  // 3. Seed Suppliers
  const suppliersData = [
    {
      name: "Dairy Fresh Farms LLP",
      category: "Dairy Products",
      contactPerson: "Ramesh Sharma",
      phone: "+91 98201 12345",
      email: "orders@dairyfreshfarms.in",
      gstin: "27AABBD1234F1Z8",
      address: "Plot 42, Goregaon East Dairy Estate, Mumbai, MH",
      paymentTermsDays: 15,
      creditBalance: 18500.0,
      rating: 4.9,
    },
    {
      name: "Royal Poultry & Meats",
      category: "Poultry & Fresh Meats",
      contactPerson: "Imran Khan",
      phone: "+91 98765 43210",
      email: "sales@royalpoultry.in",
      gstin: "27AACCR9876M1ZQ",
      address: "Wholesale Shed 12, APMC Market Yard, Vashi, Navi Mumbai, MH",
      paymentTermsDays: 7,
      creditBalance: 24200.0,
      rating: 4.8,
    },
    {
      name: "KR Agro & Spice Mills",
      category: "Grains, Pulses & Spices",
      contactPerson: "Kishore Patel",
      phone: "+91 98111 22334",
      email: "kishore@kragromills.com",
      gstin: "27AAECK5544J1Z2",
      address: "Shop 14, Grain Merchant Association, Dana Bunder, Mumbai, MH",
      paymentTermsDays: 30,
      creditBalance: 32000.0,
      rating: 4.7,
    },
    {
      name: "EcoPack Containers & Packaging",
      category: "Biodegradable Food Packaging",
      contactPerson: "Sunita Deshmukh",
      phone: "+91 99300 88776",
      email: "support@ecopackindia.com",
      gstin: "27AAFFE3321L1Z5",
      address: "Road 16, MIDC Industrial Area, Andheri East, Mumbai, MH",
      paymentTermsDays: 15,
      creditBalance: 8750.0,
      rating: 4.6,
    },
  ];

  const supplierMap = new Map<string, any>();
  for (const sup of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } });
    if (existing) {
      const updated = await prisma.supplier.update({
        where: { id: existing.id },
        data: sup,
      });
      supplierMap.set(sup.name, updated);
    } else {
      const created = await prisma.supplier.create({ data: sup });
      supplierMap.set(sup.name, created);
    }
  }
  console.log(`[PASS] Seeded ${suppliersData.length} Procurement Suppliers`);

  // 4. Seed Purchase Orders & GRNs
  const dairySupplier = supplierMap.get("Dairy Fresh Farms LLP");
  if (dairySupplier) {
    const existingPo = await prisma.purchaseOrder.findUnique({
      where: { poNumber: "PO-8821" },
    });

    if (!existingPo) {
      const po = await prisma.purchaseOrder.create({
        data: {
          poNumber: "PO-8821",
          supplierId: dairySupplier.id,
          status: "COMPLETED",
          totalAmount: 18500.0,
          notes: "Regular weekly dairy delivery: Malai Paneer & Amul Butter",
          items: {
            create: [
              {
                ingredientId: ingredientMap.get("Fresh Malai Paneer")!.id,
                orderedQuantity: 30.0,
                receivedQuantity: 30.0,
                unitCost: 340.0,
                totalCost: 10200.0,
              },
              {
                ingredientId: ingredientMap.get("Amul Pasteurised Butter")!.id,
                orderedQuantity: 15.0,
                receivedQuantity: 15.0,
                unitCost: 520.0,
                totalCost: 7800.0,
              },
            ],
          },
        },
      });

      // GRN
      const grn = await prisma.goodsReceivedNote.create({
        data: {
          grnNumber: "GRN-2041",
          purchaseOrderId: po.id,
          supplierId: dairySupplier.id,
          receivedBy: "Chef Manpreet",
          vendorChallanNumber: "CH-DF-8819",
          inspectionStatus: "PASSED",
          notes: "Checked temperature at 4°C, freshness verified.",
          items: {
            create: [
              {
                ingredientId: ingredientMap.get("Fresh Malai Paneer")!.id,
                quantityReceived: 30.0,
                unitCost: 340.0,
                totalCost: 10200.0,
                batchNumber: "BAT-PAN-092",
                expiryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
              },
              {
                ingredientId: ingredientMap.get("Amul Pasteurised Butter")!.id,
                quantityReceived: 15.0,
                unitCost: 520.0,
                totalCost: 7800.0,
                batchNumber: "BAT-AML-114",
                expiryDate: new Date(Date.now() + 60 * 24 * 3600 * 1000),
              },
            ],
          },
        },
      });

      // Purchase Invoice
      await prisma.purchaseInvoice.create({
        data: {
          invoiceNumber: "INV-DF-2026-904",
          supplierId: dairySupplier.id,
          taxableAmount: 17619.05,
          cgstAmount: 440.48,
          sgstAmount: 440.48,
          totalAmount: 18500.0,
          paidAmount: 0.0,
          balanceDue: 18500.0,
          status: "UNPAID",
          dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        },
      });

      console.log(`[PASS] Seeded PO-8821, GRN-2041 and Purchase Invoice for Dairy Fresh Farms`);
    }
  }

  // Active / Issued PO for KR Agro
  const spiceSupplier = supplierMap.get("KR Agro & Spice Mills");
  if (spiceSupplier) {
    const existingPo = await prisma.purchaseOrder.findUnique({
      where: { poNumber: "PO-8822" },
    });

    if (!existingPo) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: "PO-8822",
          supplierId: spiceSupplier.id,
          status: "ISSUED",
          totalAmount: 12450.0,
          notes: "Stock replenishment: Shahi Garam Masala & Basmati Rice",
          items: {
            create: [
              {
                ingredientId: ingredientMap.get("Daawat Biryani Basmati Rice")!.id,
                orderedQuantity: 50.0,
                receivedQuantity: 0.0,
                unitCost: 115.0,
                totalCost: 5750.0,
              },
              {
                ingredientId: ingredientMap.get("Royal Shahi Garam Masala")!.id,
                orderedQuantity: 8.0,
                receivedQuantity: 0.0,
                unitCost: 850.0,
                totalCost: 6800.0,
              },
            ],
          },
        },
      });
      console.log(`[PASS] Seeded Active PO-8822 (Status: ISSUED) for KR Agro & Spice Mills`);
    }
  }

  console.log("\n=== INVENTORY & PROCUREMENT SEED COMPLETED SUCCESSFULLY! ===");
}

seedInventoryAndProcurement()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
