import { prisma } from "../src/lib/server/prisma";
import { DEFAULT_ROLE_PERMISSIONS, SystemRole } from "../src/lib/server/rbac-engine";
import { computeStaffPayroll } from "../src/lib/server/workforce-engine";

async function seedCRMAndWorkforce() {
  console.log("=== SEEDING RESTAURANTOS CRM, LOYALTY, STAFF, ATTENDANCE & PAYROLL ===");

  // 1. Customers & Loyalty
  const customersData = [
    {
      name: "Suresh Nambiar",
      phone: "+91 98801 23456",
      email: "suresh.nambiar@gmail.com",
      address: "B-402, Raheja Residency, Koramangala 3rd Block, Bengaluru",
      customerNotes: "Prefers corner booth. Regular weekend diner with family.",
      totalSpend: 34200.0,
      totalVisits: 18,
      averageOrderValue: 1900.0,
      lastVisit: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      loyaltyTier: "Gold",
      loyaltyPoints: 680,
    },
    {
      name: "Deepika Sharma",
      phone: "+91 99002 34567",
      email: "deepika.s@outlook.com",
      address: "Flat 12, Indiranagar 100ft Road, Bengaluru",
      customerNotes: "Nut allergy, always double check makhani sauces.",
      totalSpend: 21900.0,
      totalVisits: 12,
      averageOrderValue: 1825.0,
      lastVisit: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      loyaltyTier: "Silver",
      loyaltyPoints: 430,
    },
    {
      name: "Arjun Reddy",
      phone: "+91 97410 45678",
      email: "arjun.reddy@techcorp.in",
      address: "HSR Layout Sector 2, Bengaluru",
      customerNotes: "Enjoys spicy tandoori starters.",
      totalSpend: 11400.0,
      totalVisits: 6,
      averageOrderValue: 1900.0,
      lastVisit: new Date(Date.now() - 12 * 24 * 3600 * 1000),
      loyaltyTier: "Bronze",
      loyaltyPoints: 220,
    },
    {
      name: "Priya Menon",
      phone: "+91 98450 99887",
      email: "priya.menon@venture.com",
      address: "Penthouse 4, Lavelle Road, Bengaluru",
      customerNotes: "VIP Patron. High-value wine and banquet reservations.",
      totalSpend: 62400.0,
      totalVisits: 28,
      averageOrderValue: 2228.0,
      lastVisit: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      loyaltyTier: "Platinum",
      loyaltyPoints: 1240,
    },
    {
      name: "Infosys BPM (Corporate B2B)",
      phone: "+91 98455 67890",
      email: "admin.procurement@infosys.com",
      address: "Electronics City Phase 1, Hosur Road, Bengaluru",
      customerNotes: "Corporate team dinners & monthly executive catering.",
      totalSpend: 86500.0,
      totalVisits: 24,
      averageOrderValue: 3604.0,
      lastVisit: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      loyaltyTier: "Platinum",
      loyaltyPoints: 1730,
      gstin: "29AAACI1234F1Z8",
    },
  ];

  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: c,
      create: c,
    });

    const txExists = await prisma.loyaltyTransaction.findFirst({
      where: { customerId: cust.id },
    });
    if (!txExists) {
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: cust.id,
          points: cust.loyaltyPoints,
          type: "EARN",
          balanceAfter: cust.loyaltyPoints,
          referenceId: "OPENING-BALANCE",
          notes: "Loyalty points accumulated from verified past orders",
        },
      });
    }
  }
  console.log(`[PASS] Seeded ${customersData.length} Customers with Loyalty Tiers and Ledger Entries`);

  // 2. Coupons & Gift Vouchers
  const couponsData = [
    {
      code: "WELCOME50",
      title: "Welcome Discount for First Order",
      discountType: "FLAT",
      discountValue: 50.0,
      minOrderValue: 299.0,
      maxDiscount: 50.0,
      usageLimit: 500,
    },
    {
      code: "FEAST20",
      title: "20% Weekend Dining Special",
      discountType: "PERCENTAGE",
      discountValue: 20.0,
      minOrderValue: 799.0,
      maxDiscount: 250.0,
      usageLimit: 200,
    },
    {
      code: "FLAT200",
      title: "Flat ₹200 Family Feast Voucher",
      discountType: "FLAT",
      discountValue: 200.0,
      minOrderValue: 1200.0,
      maxDiscount: 200.0,
      usageLimit: 150,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // Gift Voucher
  const existingVoucher = await prisma.giftVoucher.findUnique({
    where: { code: "GIFT-2026-8812" },
  });
  if (!existingVoucher) {
    const priya = await prisma.customer.findFirst({ where: { name: { contains: "Priya" } } });
    await prisma.giftVoucher.create({
      data: {
        code: "GIFT-2026-8812",
        initialAmount: 2500.0,
        currentBalance: 2500.0,
        customerName: "Priya Menon",
        customerPhone: "+91 98450 99887",
        recipientEmail: "friend@gmail.com",
        expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
        status: "ACTIVE",
        customerId: priya?.id || null,
      },
    });
  }
  console.log("[PASS] Seeded Promotional Coupons & Gift Vouchers");

  // 3. Staff with All 8 Roles & Granular RBAC Permissions
  const staffData: Array<{
    name: string;
    email: string;
    phone: string;
    role: SystemRole;
    pinCode: string;
    monthlySalary: number;
    hourlyRate: number;
  }> = [
    {
      name: "Vikramaditya Singhania",
      email: "owner@restaurantos.in",
      phone: "+91 98200 00001",
      role: "OWNER",
      pinCode: "9999",
      monthlySalary: 150000,
      hourlyRate: 0,
    },
    {
      name: "Neha Sen",
      email: "neha.admin@restaurantos.in",
      phone: "+91 98200 00002",
      role: "ADMINISTRATOR",
      pinCode: "1111",
      monthlySalary: 75000,
      hourlyRate: 0,
    },
    {
      name: "Ananya Roy",
      email: "ananya.manager@restaurantos.in",
      phone: "+91 98800 11223",
      role: "MANAGER",
      pinCode: "1234",
      monthlySalary: 55000,
      hourlyRate: 0,
    },
    {
      name: "Rahul Sharma",
      email: "rahul.cashier@restaurantos.in",
      phone: "+91 98800 22334",
      role: "CASHIER",
      pinCode: "2222",
      monthlySalary: 28000,
      hourlyRate: 0,
    },
    {
      name: "Manpreet Singh",
      email: "chef.manpreet@restaurantos.in",
      phone: "+91 98800 33445",
      role: "KITCHEN_STAFF",
      pinCode: "3333",
      monthlySalary: 65000,
      hourlyRate: 0,
    },
    {
      name: "Arvind Swamy",
      email: "arvind.inventory@restaurantos.in",
      phone: "+91 98800 44556",
      role: "INVENTORY_MANAGER",
      pinCode: "4444",
      monthlySalary: 42000,
      hourlyRate: 0,
    },
    {
      name: "Sneha Deshmukh",
      email: "sneha.accounts@restaurantos.in",
      phone: "+91 98800 55667",
      role: "ACCOUNTANT",
      pinCode: "5555",
      monthlySalary: 48000,
      hourlyRate: 0,
    },
    {
      name: "Pooja Hegde",
      email: "pooja.waiter@restaurantos.in",
      phone: "+91 98800 66778",
      role: "WAITER",
      pinCode: "6666",
      monthlySalary: 22000,
      hourlyRate: 0,
    },
  ];

  const staffMap = new Map<string, any>();

  for (const s of staffData) {
    const perms = DEFAULT_ROLE_PERMISSIONS[s.role] || [];
    const staff = await prisma.staff.upsert({
      where: { email: s.email },
      update: {
        ...s,
        permissions: JSON.stringify(perms),
      },
      create: {
        ...s,
        permissions: JSON.stringify(perms),
      },
    });
    staffMap.set(s.role, staff);

    // Sync legacy user table
    await prisma.user.upsert({
      where: { id: staff.id },
      update: { name: s.name, role: s.role, pinCode: s.pinCode, isActive: true },
      create: { id: staff.id, name: s.name, role: s.role, pinCode: s.pinCode, isActive: true },
    });
  }
  console.log(`[PASS] Seeded ${staffData.length} Staff Members covering all 8 Enterprise Roles & Permissions`);

  // 4. Shift Schedules & Attendance
  const shifts = [
    { name: "Morning Prep & Lunch", startTime: "08:30", endTime: "16:30", lateThresholdMins: 15 },
    { name: "Dinner & Bar Rush", startTime: "16:00", endTime: "00:00", lateThresholdMins: 15 },
  ];
  for (const sh of shifts) {
    const existing = await prisma.shiftSchedule.findFirst({ where: { name: sh.name } });
    if (!existing) await prisma.shiftSchedule.create({ data: sh });
  }

  // Today's Attendance
  const manager = staffMap.get("MANAGER");
  const cashier = staffMap.get("CASHIER");
  const chef = staffMap.get("KITCHEN_STAFF");
  const waiter = staffMap.get("WAITER");

  const today = new Date();
  const morningClockIn = new Date(today);
  morningClockIn.setHours(8, 40, 0, 0); // 8:40 AM (not late)

  const lateClockIn = new Date(today);
  lateClockIn.setHours(9, 25, 0, 0); // 9:25 AM (late)

  if (manager) {
    const existing = await prisma.attendanceRecord.findFirst({ where: { staffId: manager.id } });
    if (!existing) {
      await prisma.attendanceRecord.create({
        data: {
          staffId: manager.id,
          date: today,
          shiftName: "Morning Prep & Lunch",
          clockInTime: morningClockIn,
          isLate: false,
          status: "CLOCKED_IN",
        },
      });
    }
  }

  if (cashier) {
    const existing = await prisma.attendanceRecord.findFirst({ where: { staffId: cashier.id } });
    if (!existing) {
      await prisma.attendanceRecord.create({
        data: {
          staffId: cashier.id,
          date: today,
          shiftName: "Morning Prep & Lunch",
          clockInTime: lateClockIn,
          isLate: true,
          status: "CLOCKED_IN",
          notes: "Delayed due to metro rail maintenance",
        },
      });
    }
  }

  if (chef) {
    const existing = await prisma.attendanceRecord.findFirst({ where: { staffId: chef.id } });
    if (!existing) {
      await prisma.attendanceRecord.create({
        data: {
          staffId: chef.id,
          date: today,
          shiftName: "Morning Prep & Lunch",
          clockInTime: morningClockIn,
          isLate: false,
          status: "CLOCKED_IN",
        },
      });
    }
  }

  // Approved Leave for Waiter
  if (waiter) {
    const existingLeave = await prisma.staffLeave.findFirst({ where: { staffId: waiter.id } });
    if (!existingLeave) {
      await prisma.staffLeave.create({
        data: {
          staffId: waiter.id,
          leaveType: "CASUAL_LEAVE",
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 3600 * 1000),
          totalDays: 1.0,
          reason: "Family function in hometown",
          status: "APPROVED",
          approvedBy: "Ananya Roy (Manager)",
        },
      });
    }
  }
  console.log("[PASS] Seeded Daily Attendance Records (On-time, Late Arrival) and Approved Leave");

  // 5. Monthly Payroll Run
  const targetMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const existingPayroll = await prisma.payrollRun.findUnique({ where: { monthYear: targetMonth } });

  if (!existingPayroll) {
    const run = await prisma.payrollRun.create({
      data: {
        monthYear: targetMonth,
        status: "DRAFT",
      },
    });

    let totalNet = 0;
    for (const s of staffData) {
      const staffRecord = staffMap.get(s.role);
      if (!staffRecord) continue;

      const calc = computeStaffPayroll({
        calculationType: "MONTHLY",
        monthlySalary: s.monthlySalary,
        hourlyRate: s.hourlyRate,
        daysPresent: 26,
        hoursWorked: 26 * 8,
        overtimeHours: s.role === "KITCHEN_STAFF" ? 14 : s.role === "CASHIER" ? 8 : 0,
        bonuses: s.role === "WAITER" ? 3500 : 0, // tips share bonus
        deductions: Math.round(s.monthlySalary * 0.05), // standard 5% tax/PF deduction
      });

      totalNet += calc.netSalary;

      await prisma.staffPayroll.create({
        data: {
          payrollRunId: run.id,
          staffId: staffRecord.id,
          calculationType: "MONTHLY",
          baseAmount: calc.baseAmount,
          daysPresent: 26,
          hoursWorked: 26 * 8,
          overtimeHours: s.role === "KITCHEN_STAFF" ? 14 : s.role === "CASHIER" ? 8 : 0,
          overtimePay: calc.overtimePay,
          bonuses: s.role === "WAITER" ? 3500 : 0,
          deductions: Math.round(s.monthlySalary * 0.05),
          netSalary: calc.netSalary,
          status: "PENDING",
        },
      });
    }

    await prisma.payrollRun.update({
      where: { id: run.id },
      data: {
        totalNet,
        status: "DRAFT",
        processedAt: new Date(),
      },
    });
    console.log(`[PASS] Seeded Monthly Payroll Run for ${targetMonth} (Total Net: ₹${totalNet.toLocaleString("en-IN")})`);
  }

  console.log("\n=== CRM & WORKFORCE SEED COMPLETED SUCCESSFULLY! ===");
}

seedCRMAndWorkforce()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
