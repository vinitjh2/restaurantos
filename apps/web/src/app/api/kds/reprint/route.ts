import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { broadcastKDSEvent } from "@/lib/server/kds-events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kotId, reason, authorizedBy } = body;

    if (!kotId) {
      return NextResponse.json({ success: false, error: "Missing kotId" }, { status: 400 });
    }

    const kot = await prisma.kOT.findUnique({
      where: { id: kotId },
      include: {
        items: true,
        order: true,
      },
    });

    if (!kot) {
      return NextResponse.json({ success: false, error: "KOT ticket not found" }, { status: 404 });
    }

    // Log reprint in audit log
    await prisma.auditLog.create({
      data: {
        action: "KOT_REPRINTED",
        entityType: "KOT",
        entityId: kot.kotNumber,
        authorizedBy: authorizedBy || "Kitchen Head Chef",
        reason: reason || "Lost thermal slip / Station reprint request",
        details: `Station: ${kot.station}, Table: ${kot.tableNumber || "Counter"}`,
      },
    });

    broadcastKDSEvent("KOT_REPRINTED", kot);

    return NextResponse.json({
      success: true,
      kot,
      message: `${kot.kotNumber} authorized for reprint!`,
    });
  } catch (error: any) {
    console.error("KOT reprint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
