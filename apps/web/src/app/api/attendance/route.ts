import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const queryDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59);

    // Fetch attendance for the day
    const records = await prisma.attendanceRecord.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        staff: {
          select: { id: true, name: true, role: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all active staff to show complete workforce status
    const allStaff = await prisma.staff.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, phone: true },
    });

    // Check active approved leaves for the day
    const activeLeaves = await prisma.staffLeave.findMany({
      where: {
        status: "APPROVED",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      select: { staffId: true, leaveType: true, reason: true },
    });
    const leaveMap = new Map(activeLeaves.map((l) => [l.staffId, l]));

    const attendanceStaffIds = new Set(records.map((r) => r.staffId));
    let clockedInCount = 0;
    let lateArrivalsCount = 0;

    for (const rec of records) {
      if (rec.status === "CLOCKED_IN") clockedInCount++;
      if (rec.isLate) lateArrivalsCount++;
    }

    // Combine into complete daily roster
    const dailyRoster = allStaff.map((st) => {
      const rec = records.find((r) => r.staffId === st.id);
      const leave = leaveMap.get(st.id);

      return {
        staffId: st.id,
        name: st.name,
        role: st.role,
        phone: st.phone,
        status: leave ? "ON_LEAVE" : rec ? rec.status : "NOT_CLOCKED_IN",
        clockInTime: rec?.clockInTime || null,
        clockOutTime: rec?.clockOutTime || null,
        shiftName: rec?.shiftName || "General Shift",
        totalHoursWorked: rec?.totalHoursWorked || 0,
        overtimeHours: rec?.overtimeHours || 0,
        isLate: rec?.isLate || false,
        leaveDetails: leave ? { type: leave.leaveType, reason: leave.reason } : null,
      };
    });

    return NextResponse.json({
      success: true,
      queryDate: startOfDay.toISOString().split("T")[0],
      summary: {
        totalStaff: allStaff.length,
        clockedInCount,
        lateArrivalsCount,
        onLeaveCount: activeLeaves.length,
      },
      roster: dailyRoster,
    });
  } catch (error: any) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
