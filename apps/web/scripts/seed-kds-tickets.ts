import { prisma } from "../src/lib/server/prisma";

async function seedKDSTickets() {
  console.log("Seeding realistic KDS multi-station tickets...");

  const branch = await prisma.branch.findFirst({ where: { code: "IND" } });
  if (!branch) throw new Error("Branch not found");

  // Create Sample Orders
  const ord1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-280",
      orderType: "DINE_IN",
      tableNumber: "T-04",
      status: "OPEN",
      branchId: branch.id,
      customerName: "Suresh Nambiar",
      subtotal: 990,
      grandTotal: 1040,
    },
  });

  const ord2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-281",
      orderType: "TAKEAWAY",
      status: "OPEN",
      branchId: branch.id,
      customerName: "Priya Sharma",
      subtotal: 320,
      grandTotal: 336,
    },
  });

  const ord3 = await prisma.order.create({
    data: {
      orderNumber: "ORD-282",
      orderType: "DELIVERY",
      tableNumber: "Zomato #9841",
      status: "OPEN",
      branchId: branch.id,
      subtotal: 740,
      grandTotal: 777,
    },
  });

  const now = Date.now();

  // 1. Critical Delayed Rush Ticket (> 22 mins ago) -> Main Kitchen
  await prisma.kOT.create({
    data: {
      kotNumber: "KOT-140",
      orderId: ord1.id,
      branchId: branch.id,
      tableNumber: "T-04",
      orderType: "DINE_IN",
      station: "Main Kitchen",
      status: "PREPARING",
      createdAt: new Date(now - 24 * 60 * 1000), // 24 mins ago
      items: {
        create: [
          {
            itemName: "Butter Chicken",
            variantName: "Full Handi",
            quantity: 2,
            station: "Main Kitchen",
            status: "COOKING",
            cookingNotes: "Less spicy, extra butter on top",
          },
          {
            itemName: "Murgh Dum Biryani",
            variantName: "Full",
            quantity: 1,
            station: "Main Kitchen",
            status: "PENDING",
            cookingNotes: "Double Salan & Raita",
          },
        ],
      },
    },
  });

  // 2. Warning / Delayed Ticket (13 mins ago) -> Bakery Station
  await prisma.kOT.create({
    data: {
      kotNumber: "KOT-141",
      orderId: ord1.id,
      branchId: branch.id,
      tableNumber: "T-04",
      orderType: "DINE_IN",
      station: "Bakery",
      status: "ACCEPTED",
      createdAt: new Date(now - 13 * 60 * 1000), // 13 mins ago
      items: {
        create: [
          {
            itemName: "Butter Garlic Naan",
            quantity: 4,
            station: "Bakery",
            status: "COOKING",
            cookingNotes: "Crisp well-done",
          },
          {
            itemName: "Tandoori Roti",
            quantity: 2,
            station: "Bakery",
            status: "PENDING",
          },
        ],
      },
    },
  });

  // 3. Normal Fresh Ticket (5 mins ago) -> Beverage Counter
  await prisma.kOT.create({
    data: {
      kotNumber: "KOT-142",
      orderId: ord2.id,
      branchId: branch.id,
      orderType: "TAKEAWAY",
      station: "Beverage Counter",
      status: "ACCEPTED",
      createdAt: new Date(now - 5 * 60 * 1000), // 5 mins ago
      items: {
        create: [
          {
            itemName: "Masala Chaas",
            quantity: 2,
            station: "Beverage Counter",
            status: "PENDING",
            cookingNotes: "Cold, extra roasted cumin",
          },
        ],
      },
    },
  });

  // 4. Brand New Ticket (Just Now) -> Bar
  await prisma.kOT.create({
    data: {
      kotNumber: "KOT-143",
      orderId: ord3.id,
      branchId: branch.id,
      tableNumber: "Table 8",
      orderType: "DINE_IN",
      station: "Bar",
      status: "NEW",
      createdAt: new Date(now - 1 * 60 * 1000), // 1 min ago
      items: {
        create: [
          {
            itemName: "Virgin Mojito",
            quantity: 2,
            station: "Bar",
            status: "PENDING",
            cookingNotes: "Fresh mint, low sugar",
          },
        ],
      },
    },
  });

  console.log("KDS sample tickets seeded successfully across all stations!");
}

seedKDSTickets()
  .catch((e) => {
    console.error("KDS seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
