import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, reason, supervisorPin } = body;

    // Validate Supervisor PIN
    const supervisor = await prisma.user.findFirst({
      where: {
        pinCode: supervisorPin,
        role: { in: ["ADMIN", "MANAGER"] },
      },
    });

    if (!supervisor) {
      return NextResponse.json(
        { success: false, error: "Invalid Supervisor PIN. Action unauthorized." },
        { status: 403 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Cancellation reason is mandatory for audit trail." },
        { status: 400 }
      );
    }

    // Free table if associated
    if (tableNumber) {
      const table = await prisma.tableSeat.findUnique({ where: { tableNumber } });
      if (table && table.currentOrderId) {
        await prisma.order.update({
          where: { id: table.currentOrderId },
          data: { status: "CANCELLED" },
        });
      }

      await prisma.tableSeat.updateMany({
        where: { tableNumber },
        data: { status: "AVAILABLE", currentOrderId: null },
      });
    }

    // Record Tamper-Evident Audit Log
    await prisma.auditLog.create({
      data: {
        action: "ORDER_CANCELLED",
        entityType: "Order",
        entityId: tableNumber || "COUNTER",
        authorizedBy: supervisor.name,
        reason,
        details: `Supervisor ${supervisor.name} approved cancellation.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order on ${tableNumber || "Counter"} cancelled by ${supervisor.name}. Reason logged: "${reason}"`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
