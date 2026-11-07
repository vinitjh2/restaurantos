import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromTable, toTable } = body;

    if (!fromTable || !toTable) {
      return NextResponse.json({ success: false, error: "Both fromTable and toTable are required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Find table
      const source = await tx.tableSeat.findUnique({ where: { tableNumber: fromTable } });
      const currentOrderId = source?.currentOrderId;

      // Vacate source table
      await tx.tableSeat.update({
        where: { tableNumber: fromTable },
        data: { status: "AVAILABLE", currentOrderId: null },
      });

      // Occupy target table
      await tx.tableSeat.update({
        where: { tableNumber: toTable },
        data: { status: "OCCUPIED", currentOrderId },
      });

      // Update Order if exists
      if (currentOrderId) {
        await tx.order.update({
          where: { id: currentOrderId },
          data: { tableNumber: toTable },
        });
      }

      // Log audit
      await tx.auditLog.create({
        data: {
          action: "TABLE_TRANSFERRED",
          entityType: "TableSeat",
          entityId: toTable,
          authorizedBy: "Captain / Floor Manager",
          reason: `Shifted party from ${fromTable} to ${toTable}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Table transferred from ${fromTable} to ${toTable} successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
