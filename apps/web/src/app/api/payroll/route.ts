import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { computeStaffPayroll } from "@/lib/server/workforce-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthYear = searchParams.get("month") || currentMonth;

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { monthYear },
      include: {
        staffPayrolls: {
          include: {
            staff: {
              select: { id: true, name: true, role: true, phone: true, monthlySalary: true, hourlyRate: true },
            },
          },
          orderBy: { staff: { name: "asc" } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      monthYear,
      payrollRun,
    });
  } catch (error: any) {
    console.error("Payroll fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, monthYear, staffPayrollId, paymentMethod, paymentRef, bonuses, deductions } = body;

    // 1. Settle individual staff payroll slip
    if (action === "PAY") {
      if (!staffPayrollId) {
        return NextResponse.json({ success: false, error: "staffPayrollId required" }, { status: 400 });
      }

      const updated = await prisma.staffPayroll.update({
        where: { id: staffPayrollId },
        data: {
          status: "PAID",
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          paymentRef: paymentRef || `SAL-${Date.now().toString().slice(-6)}`,
          paidAt: new Date(),
        },
        include: { staff: true, payrollRun: true },
      });

      return NextResponse.json({
        success: true,
        slip: updated,
        message: `Salary of ₹${updated.netSalary.toLocaleString("en-IN")} paid to ${updated.staff.name}`,
      });
    }

    // 2. Generate or refresh full monthly payroll run
    const targetMonth = monthYear || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Fetch all active staff
    const staffList = await prisma.staff.findMany({
      where: { isActive: true },
      include: {
        attendance: {
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        },
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      // Find or create PayrollRun
      let run = await tx.payrollRun.findUnique({
        where: { monthYear: targetMonth },
      });

      if (!run) {
        run = await tx.payrollRun.create({
          data: {
            monthYear: targetMonth,
            status: "DRAFT",
          },
        });
      }

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const st of staffList) {
        // Compute attendance summary
        let daysPresent = 0;
        let totalHours = 0;
        let overtimeHours = 0;

        for (const att of st.attendance) {
          if (["CLOCKED_OUT", "CLOCKED_IN"].includes(att.status)) {
            daysPresent += 1;
            totalHours += att.totalHoursWorked || 8;
            overtimeHours += att.overtimeHours || 0;
          } else if (att.status === "HALF_DAY") {
            daysPresent += 0.5;
            totalHours += 4;
          }
        }

        // If no attendance recorded yet in new month, default to full month for preview
        if (daysPresent === 0) {
          daysPresent = 26; // standard working days in month
          totalHours = 26 * 8;
        }

        const staffBonus = (bonuses && bonuses[st.id]) || 0;
        const staffDeduction = (deductions && deductions[st.id]) || 0;

        const payrollCalc = computeStaffPayroll({
          calculationType: st.monthlySalary > 0 ? "MONTHLY" : "HOURLY",
          monthlySalary: st.monthlySalary,
          hourlyRate: st.hourlyRate,
          daysPresent,
          totalDaysInMonth: daysInMonth,
          hoursWorked: totalHours,
          overtimeHours,
          bonuses: staffBonus,
          deductions: staffDeduction,
        });

        totalGross += payrollCalc.grossAmount;
        totalDeductions += staffDeduction;
        totalNet += payrollCalc.netSalary;

        // Upsert staff payroll slip
        const existingSlip = await tx.staffPayroll.findFirst({
          where: { payrollRunId: run.id, staffId: st.id },
        });

        if (existingSlip) {
          await tx.staffPayroll.update({
            where: { id: existingSlip.id },
            data: {
              baseAmount: payrollCalc.baseAmount,
              daysPresent,
              hoursWorked: totalHours,
              overtimeHours,
              overtimePay: payrollCalc.overtimePay,
              bonuses: staffBonus,
              deductions: staffDeduction,
              netSalary: payrollCalc.netSalary,
            },
          });
        } else {
          await tx.staffPayroll.create({
            data: {
              payrollRunId: run.id,
              staffId: st.id,
              calculationType: st.monthlySalary > 0 ? "MONTHLY" : "HOURLY",
              baseAmount: payrollCalc.baseAmount,
              daysPresent,
              hoursWorked: totalHours,
              overtimeHours,
              overtimePay: payrollCalc.overtimePay,
              bonuses: staffBonus,
              deductions: staffDeduction,
              netSalary: payrollCalc.netSalary,
              status: "PENDING",
            },
          });
        }
      }

      // Update PayrollRun summary
      const updatedRun = await tx.payrollRun.update({
        where: { id: run.id },
        data: {
          totalGross: Math.round(totalGross * 100) / 100,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          totalNet: Math.round(totalNet * 100) / 100,
          processedAt: new Date(),
        },
        include: {
          staffPayrolls: {
            include: { staff: true },
          },
        },
      });

      return updatedRun;
    });

    return NextResponse.json({
      success: true,
      payrollRun: result,
      message: `Payroll run for ${targetMonth} processed for ${result.staffPayrolls.length} staff members (Total: ₹${result.totalNet.toLocaleString("en-IN")})`,
    });
  } catch (error: any) {
    console.error("Payroll generate error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
