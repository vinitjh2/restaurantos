import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

// GET /api/pos/orders/hold -> List held orders
export async function GET() {
  try {
    const heldOrders = await prisma.heldOrder.findMany({
      orderBy: { heldAt: "desc" },
    });
    return NextResponse.json({ success: true, heldOrders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/pos/orders/hold -> Hold current order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderType, tableNumber, customerName, customerPhone, cartData } = body;

    const orderNumber = `HOLD-${Date.now().toString().slice(-4)}`;
    const held = await prisma.heldOrder.create({
      data: {
        orderNumber,
        orderType: orderType || "DINE_IN",
        tableNumber: tableNumber || null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        orderData: JSON.stringify(cartData),
      },
    });

    return NextResponse.json({
      success: true,
      heldOrder: held,
      message: `Order saved to Hold list as ${orderNumber}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/pos/orders/hold -> Delete / resume held order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await prisma.heldOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
