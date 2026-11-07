import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { checkLateArrival, calculateShiftHours } from "@/lib/server/workforce-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { staffId, pinCode, shiftName } = body;

    let targetStaff = null;
    if (pinCode) {
      targetStaff = await prisma.staff.findFirst({
        where: { pinCode: String(pinCode).trim(), isActive: true },
      });
    } else if (staffId) {
      targetStaff = await prisma.staff.findUnique({
        where: { id: staffId },
      });
    }

    if (!targetStaff) {
      return NextResponse.json(
        { success: false, error: "Staff not found or invalid PIN" },
        { status: 404 }
      );
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Check if staff has an open active attendance record today
    const activeRecord = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: targetStaff.id,
        date: { gte: startOfDay, lte: endOfDay },
        status: "CLOCKED_IN",
      },
    });

    if (activeRecord) {
      // CLOCK OUT
      const clockOutTime = new Date();
      const clockInTime = activeRecord.clockInTime || activeRecord.createdAt;
      const { totalHoursWorked, overtimeHours } = calculateShiftHours(clockInTime, clockOutTime);

      const updated = await prisma.attendanceRecord.update({
        where: { id: activeRecord.id },
        data: {
          clockOutTime,
          status: "CLOCKED_OUT",
          totalHoursWorked,
          overtimeHours,
        },
      });

      return NextResponse.json({
        success: true,
        action: "CLOCK_OUT",
        record: updated,
        message: `${targetStaff.name} clocked out. Total shift: ${totalHoursWorked} hrs (${overtimeHours} hrs OT).`,
      });
    } else {
      // CLOCK IN
      const clockInTime = new Date();
      const isLate = checkLateArrival(clockInTime, "09:00", 15);

      const newRecord = await prisma.attendanceRecord.create({
        data: {
          staffId: targetStaff.id,
          date: clockInTime,
          shiftName: shiftName || "General Shift",
          clockInTime,
          isLate,
          status: "CLOCKED_IN",
        },
      });

      return NextResponse.json({
        success: true,
        action: "CLOCK_IN",
        record: newRecord,
        message: `${targetStaff.name} clocked in at ${clockInTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}${isLate ? " (Flagged: Late arrival)" : ""}`,
      });
    }
  } catch (error: any) {
    console.error("Clock in/out error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
