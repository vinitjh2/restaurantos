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
