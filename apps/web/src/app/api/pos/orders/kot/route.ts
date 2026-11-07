import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { resolveItemStation } from "@/lib/server/station-router";
import { broadcastKDSEvent } from "@/lib/server/kds-events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderType, tableNumber, items, customerName } = body;

    const branch = await prisma.branch.findFirst({ where: { code: "IND" } });
    const kotSeq = branch ? branch.nextKotSeq : 1;
    const kotNumber = `KOT-${String(kotSeq).padStart(3, "0")}`;

    // Increment KOT sequence on branch
    if (branch) {
      await prisma.branch.update({
        where: { id: branch.id },
        data: { nextKotSeq: kotSeq + 1 },
      });
    }

    // Find or create active order for this table/channel
    let orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        orderType: orderType || "DINE_IN",
        status: "KOT_SENT",
        branchId: branch?.id || "default",
        tableNumber: tableNumber || null,
        customerName: customerName || null,
        subtotal: 0,
        grandTotal: 0,
      },
    });

    // Map item stations
    const mappedItems = (items || []).map((item: any) => {
      const station = resolveItemStation(item.category || "", item.name);
      return {
        itemName: item.name,
        variantName: item.variantName || null,
        quantity: item.quantity,
        cookingNotes: item.cookingNotes || null,
        station,
        status: "PENDING",
      };
    });

    // Determine primary station
    const primaryStation = mappedItems[0]?.station || "Main Kitchen";

    // Create KOT record
    const kot = await prisma.kOT.create({
      data: {
        kotNumber,
        orderId: order.id,
        branchId: branch?.id || "default",
        tableNumber: tableNumber || null,
        orderType: orderType || "DINE_IN",
        station: primaryStation,
        status: "NEW",
        items: {
          create: mappedItems,
        },
      },
      include: {
        items: true,
        order: {
          select: {
            orderNumber: true,
            orderType: true,
            customerName: true,
          },
        },
      },
    });

    // Broadcast instant real-time event to kitchen screens
    broadcastKDSEvent("KOT_CREATED", kot);

    // Update table status if dine-in
    if (orderType === "DINE_IN" && tableNumber) {
      await prisma.tableSeat.updateMany({
        where: { tableNumber },
        data: { status: "OCCUPIED", currentOrderId: order.id },
      });
    }

    return NextResponse.json({
      success: true,
      kot,
      orderId: order.id,
      message: `${kotNumber} dispatched to kitchen successfully!`,
    });
  } catch (error: any) {
    console.error("KOT generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
