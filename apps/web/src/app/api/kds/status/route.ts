import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { broadcastKDSEvent } from "@/lib/server/kds-events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kotId, itemId, newStatus } = body;

    if (!kotId) {
      return NextResponse.json({ success: false, error: "Missing kotId" }, { status: 400 });
    }

    // 1. If bumping an individual item
    if (itemId) {
      const updatedItem = await prisma.kOTItem.update({
        where: { id: itemId },
        data: { status: newStatus },
      });

      const fullKot = await prisma.kOT.findUnique({
        where: { id: kotId },
        include: {
          items: true,
          order: true,
        },
      });

      broadcastKDSEvent("ITEM_STATUS_UPDATED", fullKot);

      return NextResponse.json({
        success: true,
        item: updatedItem,
        kot: fullKot,
      });
    }

    // 2. If bumping the entire KOT ticket
    const now = new Date();
    const updateData: any = { status: newStatus };

    if (newStatus === "ACCEPTED") {
      updateData.acceptedAt = now;
    } else if (newStatus === "PREPARING") {
      updateData.preparingAt = now;
    } else if (newStatus === "READY") {
      updateData.readyAt = now;
    } else if (newStatus === "SERVED") {
      updateData.servedAt = now;
    }

    const updatedKot = await prisma.kOT.update({
      where: { id: kotId },
      data: updateData,
      include: {
        items: true,
        order: true,
      },
    });

    // Also update order status if all KOTs are ready/served
    if (newStatus === "READY") {
      await prisma.order.update({
        where: { id: updatedKot.orderId },
        data: { status: "COMPLETED" },
      });
    }

    // Broadcast real-time event to all connected kitchen screens
    broadcastKDSEvent("KOT_STATUS_UPDATED", updatedKot);

    return NextResponse.json({
      success: true,
      kot: updatedKot,
      message: `${updatedKot.kotNumber} transitioned to ${newStatus}`,
    });
  } catch (error: any) {
    console.error("KDS status update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
