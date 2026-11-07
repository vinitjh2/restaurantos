import { prisma } from "../src/lib/server/prisma";
import {
  calculatePointsEarned,
  calculatePointRedemption,
  determineLoyaltyTier,
} from "../src/lib/server/loyalty-engine";
import {
  ALL_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
  PERMISSIONS,
} from "../src/lib/server/rbac-engine";
import {
  checkLateArrival,
  calculateShiftHours,
  computeStaffPayroll,
} from "../src/lib/server/workforce-engine";

async function runWorkforceCRMTest() {
  console.log("=== STARTING RESTAURANTOS CRM & WORKFORCE INTEGRATION TEST ===");

  // 1. Test Loyalty & Rewards Engine
  console.log("\n[TEST 1] Testing Loyalty Points & Tier Engine...");
  const bronzeTier = determineLoyaltyTier(5000);
  const goldTier = determineLoyaltyTier(32000);
  const platTier = determineLoyaltyTier(65000);

  if (bronzeTier !== "Bronze" || goldTier !== "Gold" || platTier !== "Platinum") {
    throw new Error(`Tier mismatch: ${bronzeTier}, ${goldTier}, ${platTier}`);
  }

  // Calculate points earned: ₹2,000 order for Gold tier (1.5x)
  const pointsEarned = calculatePointsEarned(2000, "Gold"); // 20 pts * 1.5 = 30 pts
  console.log(`- Gold Tier Patron Spending ₹2,000 -> Earns: ${pointsEarned} Points (1.5x multiplier)`);
  if (pointsEarned !== 30) throw new Error(`Points calculation mismatch: expected 30, got ${pointsEarned}`);

  // Calculate points redemption: 500 available points, ₹600 bill -> max 50% = ₹300 (300 points)
  const redemption = calculatePointRedemption(500, 600, 400);
  console.log(`- Points Redemption: Bill ₹600, Points Available: 500 -> Redeemed: ${redemption.pointsRedeemed} pts (-₹${redemption.rupeeDiscount}), Remaining: ${redemption.remainingPoints} pts`);
  if (redemption.pointsRedeemed !== 300 || redemption.rupeeDiscount !== 300 || redemption.remainingPoints !== 200) {
    throw new Error(`Redemption mismatch: ${JSON.stringify(redemption)}`);
  }
  console.log("[PASS] Customer Loyalty & Rewards math verified 100%");

  // 2. Test Staff Roles & Granular RBAC Permissions
  console.log("\n[TEST 2] Testing Staff Roles & Granular RBAC Permissions...");
  if (ALL_ROLES.length !== 8) {
    throw new Error(`Expected 8 roles, found ${ALL_ROLES.length}`);
  }

  const managerCanCancel = hasPermission("MANAGER", undefined, PERMISSIONS.POS_CANCEL_ORDER);
  const waiterCanCancel = hasPermission("WAITER", undefined, PERMISSIONS.POS_CANCEL_ORDER);
  const cashierCanRefund = hasPermission("CASHIER", undefined, PERMISSIONS.POS_REFUND);
  const ownerCanEverything = hasPermission("OWNER", undefined, PERMISSIONS.PAYROLL_CALCULATE);
  const accountantCanPayroll = hasPermission("ACCOUNTANT", undefined, PERMISSIONS.PAYROLL_VIEW);

  console.log(`- Manager can cancel order: ${managerCanCancel} (Expected: true)`);
  console.log(`- Waiter can cancel order: ${waiterCanCancel} (Expected: false)`);
  console.log(`- Cashier can refund bill directly: ${cashierCanRefund} (Expected: false)`);
  console.log(`- Accountant can view payroll: ${accountantCanPayroll} (Expected: true)`);

  if (!managerCanCancel || waiterCanCancel || cashierCanRefund || !ownerCanEverything || !accountantCanPayroll) {
    throw new Error("RBAC permission evaluation failed");
  }

  // Verify PIN Authentication in Database
  const managerStaff = await prisma.staff.findFirst({ where: { role: "MANAGER" } });
  if (!managerStaff || managerStaff.pinCode !== "1234") {
    throw new Error("Manager staff PIN code not found");
  }
  console.log(`[PASS] Staff Roles, Granular Permissions and PIN security verified: ${managerStaff.name} (Role: ${managerStaff.role})`);

  // 3. Test Attendance & Shift Engine
  console.log("\n[TEST 3] Testing Workforce Attendance, Shifts & Late Arrivals...");
  const onTime = new Date();
  onTime.setHours(8, 45, 0, 0);
  const isLateFalse = checkLateArrival(onTime, "09:00", 15);

  const lateTime = new Date();
  lateTime.setHours(9, 25, 0, 0);
  const isLateTrue = checkLateArrival(lateTime, "09:00", 15);

  if (isLateFalse || !isLateTrue) {
    throw new Error(`Late arrival detection failed: ${isLateFalse}, ${isLateTrue}`);
  }
  console.log(`- Clock-in at 8:45 AM: Late = ${isLateFalse} | Clock-in at 9:25 AM: Late = ${isLateTrue}`);

  // Test shift hours & overtime calculation
  const clockIn = new Date("2026-11-06T09:00:00Z");
  const clockOut = new Date("2026-11-06T19:30:00Z"); // 10.5 hours worked
  const shiftHours = calculateShiftHours(clockIn, clockOut, 8.0);
  console.log(`- Shift Hours: Total = ${shiftHours.totalHoursWorked} hrs, Overtime = ${shiftHours.overtimeHours} hrs`);
  if (shiftHours.totalHoursWorked !== 10.5 || shiftHours.overtimeHours !== 2.5) {
    throw new Error(`Shift hours mismatch: ${JSON.stringify(shiftHours)}`);
  }
  console.log("[PASS] Shift Hours and Overtime calculation verified");

  // 4. Test Payroll Calculation Engine
  console.log("\n[TEST 4] Testing Attendance-Based Payroll Calculation...");
  const samplePayroll = computeStaffPayroll({
    calculationType: "MONTHLY",
    monthlySalary: 60000,
    hourlyRate: 0,
    daysPresent: 25,
    totalDaysInMonth: 30,
    hoursWorked: 200,
    overtimeHours: 10,
    bonuses: 2000,
    deductions: 3000,
  });

  // Base = (60,000 / 30) * 25 = 50,000
  // Effective hourly = 2000 / 8 = 250
  // OT pay = 10 * (250 * 1.5) = 3,750
  // Gross = 50,000 + 3,750 + 2,000 = 55,750
  // Net = 55,750 - 3,000 = 52,750
  console.log(`- Monthly Salary ₹60,000 (25 days present): Base Earned = ₹${samplePayroll.baseAmount}`);
  console.log(`- Overtime Pay (10 hrs @ 1.5x): ₹${samplePayroll.overtimePay}`);
  console.log(`- Gross Amount: ₹${samplePayroll.grossAmount} | Net Payable: ₹${samplePayroll.netSalary}`);

  if (samplePayroll.baseAmount !== 50000 || samplePayroll.overtimePay !== 3750 || samplePayroll.netSalary !== 52750) {
    throw new Error(`Payroll calculation mismatch: ${JSON.stringify(samplePayroll)}`);
  }
  console.log("[PASS] Payroll Engine accurate with overtime and statutory deductions");

  console.log("\n==========================================================");
  console.log("=== ALL CRM & WORKFORCE INTEGRATION TESTS PASSED 100%! ===");
  console.log("==========================================================");
}

runWorkforceCRMTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
