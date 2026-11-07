import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "All") where.status = status;

    const leaves = await prisma.staffLeave.findMany({
      where,
      include: {
        staff: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, leaves });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, leaveId, staffId, leaveType, startDate, endDate, totalDays, reason, approvedBy } = body;

    // Handle Approve / Reject
    if (action === "APPROVE" || action === "REJECT") {
      if (!leaveId) {
        return NextResponse.json({ success: false, error: "leaveId is required" }, { status: 400 });
      }

      const updated = await prisma.staffLeave.update({
        where: { id: leaveId },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          approvedBy: approvedBy || "Manager",
        },
        include: { staff: true },
      });

      return NextResponse.json({
        success: true,
        leave: updated,
        message: `Leave request for ${updated.staff.name} marked as ${updated.status}`,
      });
    }

    // Submit new leave request
    if (!staffId || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: "Staff, start date, end date and reason are required" },
        { status: 400 }
      );
    }

    const leave = await prisma.staffLeave.create({
      data: {
        staffId,
        leaveType: leaveType || "CASUAL_LEAVE",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: Number(totalDays) || 1.0,
        reason,
        status: "PENDING",
      },
      include: { staff: true },
    });

    return NextResponse.json({
      success: true,
      leave,
      message: `Leave application submitted for ${leave.staff.name}`,
    });
  } catch (error: any) {
    console.error("Leave operation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
