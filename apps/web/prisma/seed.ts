import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RestaurantOS database...");

  // 1. Create or upsert Branch
  const branch = await prisma.branch.upsert({
    where: { code: "IND" },
    update: {},
    create: {
      name: "Indiranagar Flagship",
      code: "IND",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 80 4123 4567",
      gstin: "29AABCU9603R1ZM",
      fssaiNumber: "11223334000189",
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 0.0,
      isTaxInclusive: false,
      currentFiscalYr: "2026-27",
      nextInvoiceSeq: 285,
      nextKotSeq: 143,
      nextOrderSeq: 285,
    },
  });

  // 2. Create Users (with supervisor PINs)
  await prisma.user.createMany({
    data: [
      { name: "Ananya Roy", role: "MANAGER", pinCode: "1234" },
      { name: "Rahul Sharma", role: "CASHIER", pinCode: "9999" },
      { name: "Vikram Gowda", role: "CAPTAIN", pinCode: "5555" },
    ],
  });

  // 3. Create Tables
  const tableData = [
    { tableNumber: "T-01", floor: "Ground Floor", capacity: 2, status: "AVAILABLE" },
    { tableNumber: "T-02", floor: "Ground Floor", capacity: 4, status: "OCCUPIED" },
    { tableNumber: "T-03", floor: "Ground Floor", capacity: 4, status: "AVAILABLE" },
    { tableNumber: "T-04", floor: "Ground Floor", capacity: 6, status: "OCCUPIED" },
    { tableNumber: "T-05", floor: "Ground Floor", capacity: 4, status: "BILLED" },
    { tableNumber: "T-06", floor: "Ground Floor", capacity: 8, status: "AVAILABLE" },
    { tableNumber: "AC-01", floor: "AC Family Hall", capacity: 4, status: "AVAILABLE" },
    { tableNumber: "AC-02", floor: "AC Family Hall", capacity: 6, status: "AVAILABLE" },
    { tableNumber: "RF-01", floor: "Rooftop Garden", capacity: 4, status: "AVAILABLE" },
    { tableNumber: "RF-02", floor: "Rooftop Garden", capacity: 6, status: "OCCUPIED" },
  ];

  for (const t of tableData) {
    await prisma.tableSeat.upsert({
      where: { tableNumber: t.tableNumber },
      update: { status: t.status },
      create: t,
    });
  }

  // 4. Create Menu Items with Variants & Modifiers
  const biryani = await prisma.menuItem.create({
    data: {
      name: "Murgh Dum Biryani",
      category: "Biryani",
      shortCode: "MDB",
      basePrice: 350,
      dietType: "NON_VEG",
      isAvailable: true,
      variants: {
        create: [
          { name: "Half Portion", price: 220, isDefault: false },
          { name: "Full Handi", price: 350, isDefault: true },
        ],
      },
      modifiers: {
        create: [
          {
            name: "Biryani Add-ons",
            minSelect: 0,
            maxSelect: 3,
            options: {
              create: [
                { name: "Extra Mirchi Ka Salan", price: 30 },
                { name: "Double Burani Raita", price: 40 },
                { name: "Boiled Egg (1 pc)", price: 25 },
              ],
            },
          },
        ],
      },
    },
  });

  const butterChicken = await prisma.menuItem.create({
    data: {
      name: "Butter Chicken",
      category: "Main Course",
      shortCode: "BC",
      basePrice: 370,
      dietType: "NON_VEG",
      isAvailable: true,
      variants: {
        create: [
          { name: "Half", price: 240, isDefault: false },
          { name: "Full", price: 370, isDefault: true },
        ],
      },
      modifiers: {
        create: [
          {
            name: "Preparation Style",
            minSelect: 0,
            maxSelect: 1,
            options: {
              create: [
                { name: "Mild / Creamy", price: 0 },
                { name: "Medium Spicy", price: 0 },
                { name: "Extra Butter Float", price: 40 },
              ],
            },
          },
        ],
      },
    },
  });

  const paneerTikka = await prisma.menuItem.create({
    data: {
      name: "Paneer Butter Masala",
      category: "Main Course",
      shortCode: "PBM",
      basePrice: 320,
      dietType: "VEG",
      isAvailable: true,
      variants: {
        create: [
          { name: "Half", price: 200, isDefault: false },
          { name: "Full", price: 320, isDefault: true },
        ],
      },
    },
  });

  const garlicNaan = await prisma.menuItem.create({
    data: {
      name: "Butter Garlic Naan",
      category: "Breads",
      shortCode: "BGN",
      basePrice: 80,
      dietType: "VEG",
      isAvailable: true,
      modifiers: {
        create: [
          {
            name: "Crust Options",
            minSelect: 0,
            maxSelect: 1,
            options: {
              create: [
                { name: "Extra Garlic Flakes", price: 15 },
                { name: "Cheese Stuffed", price: 50 },
              ],
            },
          },
        ],
      },
    },
  });

  const dalMakhani = await prisma.menuItem.create({
    data: {
      name: "Dal Makhani",
      category: "Main Course",
      shortCode: "DM",
      basePrice: 250,
      dietType: "VEG",
      isAvailable: true,
    },
  });

  const crispyCorn = await prisma.menuItem.create({
    data: {
      name: "Crispy Corn Salt & Pepper",
      category: "Starters",
      shortCode: "CC",
      basePrice: 240,
      dietType: "VEG",
      isAvailable: true,
    },
  });

  const tandooriChicken = await prisma.menuItem.create({
    data: {
      name: "Tandoori Chicken",
      category: "Starters",
      shortCode: "TC",
      basePrice: 260,
      dietType: "NON_VEG",
      isAvailable: true,
      variants: {
        create: [
          { name: "Half (4 Pcs)", price: 260, isDefault: true },
          { name: "Full (8 Pcs)", price: 480, isDefault: false },
        ],
      },
    },
  });

  const chaas = await prisma.menuItem.create({
    data: {
      name: "Masala Chaas",
      category: "Beverages",
      shortCode: "MC",
      basePrice: 70,
      dietType: "VEG",
      isAvailable: true,
    },
  });

  const gulabJamun = await prisma.menuItem.create({
    data: {
      name: "Gulab Jamun (2 Pcs)",
      category: "Desserts",
      shortCode: "GJ",
      basePrice: 110,
      dietType: "VEG",
      isAvailable: true,
    },
  });

  // 5. Seed Realistic Demo Orders with Invoices & Line Items
  console.log("Seeding demo orders...");
  const demoOrdersData = [
    {
      orderNumber: "ORD-2840",
      orderType: "DINE_IN",
      status: "PREPARING",
      tableNumber: "T-01",
      customerName: "Vikram Malhotra",
      customerPhone: "+91 98450 11223",
      paymentMethod: "UNPAID",
      items: [
        { item: butterChicken, name: "Butter Chicken", qty: 2, price: 370 },
        { item: garlicNaan, name: "Butter Garlic Naan", qty: 4, price: 80 },
        { item: dalMakhani, name: "Dal Makhani", qty: 1, price: 250 },
      ],
    },
    {
      orderNumber: "ORD-2841",
      orderType: "QR_DIGITAL",
      status: "PREPARING",
      tableNumber: "T-04",
      customerName: "Ananya Deshmukh",
      customerPhone: "+91 97412 88341",
      paymentMethod: "UPI (Google Pay)",
      items: [
        { item: paneerTikka, name: "Paneer Butter Masala", qty: 1, price: 320 },
        { item: garlicNaan, name: "Butter Garlic Naan", qty: 2, price: 80 },
        { item: chaas, name: "Masala Chaas", qty: 2, price: 70 },
      ],
    },
    {
      orderNumber: "ORD-2842",
      orderType: "DELIVERY",
      status: "SERVED",
      tableNumber: null,
      customerName: "Zomato Partner (#9841)",
      customerPhone: "+91 98800 23456",
      customerAddress: "Flat 402, Prestige Palms, Indiranagar",
      paymentMethod: "Zomato Pay",
      items: [
        { item: biryani, name: "Murgh Dum Biryani", qty: 2, price: 350 },
        { item: gulabJamun, name: "Gulab Jamun (2 Pcs)", qty: 2, price: 110 },
      ],
    },
    {
      orderNumber: "ORD-2843",
      orderType: "TAKEAWAY",
      status: "PAID",
      tableNumber: null,
      customerName: "Rohit Verma",
      customerPhone: "+91 99160 55421",
      paymentMethod: "Cash",
      items: [
        { item: crispyCorn, name: "Crispy Corn Salt & Pepper", qty: 1, price: 240 },
        { item: paneerTikka, name: "Paneer Butter Masala", qty: 1, price: 320 },
        { item: garlicNaan, name: "Butter Garlic Naan", qty: 3, price: 80 },
      ],
    },
    {
      orderNumber: "ORD-2844",
      orderType: "DINE_IN",
      status: "PAID",
      tableNumber: "T-02",
      customerName: "Priya Nair",
      customerPhone: "+91 96110 33902",
      paymentMethod: "Credit Card (HDFC)",
      items: [
        { item: tandooriChicken, name: "Tandoori Chicken", qty: 1, price: 260 },
        { item: biryani, name: "Murgh Dum Biryani", qty: 1, price: 350 },
        { item: chaas, name: "Masala Chaas", qty: 2, price: 70 },
      ],
    },
    {
      orderNumber: "ORD-2845",
      orderType: "DINE_IN",
      status: "PAID",
      tableNumber: "T-06",
      customerName: "Aditya & Family",
      customerPhone: "+91 98451 99012",
      paymentMethod: "UPI (PhonePe)",
      items: [
        { item: biryani, name: "Murgh Dum Biryani", qty: 3, price: 350 },
        { item: butterChicken, name: "Butter Chicken", qty: 1, price: 370 },
        { item: garlicNaan, name: "Butter Garlic Naan", qty: 6, price: 80 },
        { item: gulabJamun, name: "Gulab Jamun (2 Pcs)", qty: 3, price: 110 },
      ],
    },
  ];

  for (let idx = 0; idx < demoOrdersData.length; idx++) {
    const o = demoOrdersData[idx];
    let subtotal = 0;
    const items = o.items.map((it) => {
      const line = it.qty * it.price;
      subtotal += line;
      return {
        menuItemId: it.item.id,
        itemName: it.name,
        quantity: it.qty,
        unitPrice: it.price,
        subtotal: line,
        taxAmount: Math.round(line * 0.05 * 100) / 100,
      };
    });
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const grandTotal = subtotal + taxAmount;
    const date = new Date(Date.now() - idx * 20 * 60 * 1000);

    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {
        status: o.status,
        customerName: o.customerName,
        grandTotal,
      },
      create: {
        orderNumber: o.orderNumber,
        branchId: branch.id,
        orderType: o.orderType,
        status: o.status,
        tableNumber: o.tableNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress || null,
        subtotal,
        taxAmount,
        grandTotal,
        createdAt: date,
        updatedAt: date,
        items: { create: items },
        invoice: {
          create: {
            invoiceNumber: `INV-IND-${2840 + idx}`,
            fiscalYear: "2026-27",
            branchId: branch.id,
            subtotal,
            taxableAmount: subtotal,
            cgstRate: 2.5,
            cgstAmount: Math.round((taxAmount / 2) * 100) / 100,
            sgstRate: 2.5,
            sgstAmount: Math.round((taxAmount / 2) * 100) / 100,
            grandTotal,
            paidAmount: o.status === "PAID" ? grandTotal : 0,
            balanceDue: o.status === "PAID" ? 0 : grandTotal,
            status: o.status === "PAID" ? "PAID" : "ISSUED",
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            paymentMethod: o.paymentMethod,
            createdAt: date,
            settledAt: date,
          },
        },
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
