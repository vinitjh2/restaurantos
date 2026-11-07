import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { roundToTwo } from "@/lib/server/inventory-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
        grns: true,
      },
      orderBy: { orderDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Purchase orders fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, expectedDeliveryDate, notes, items } = body;
    // items: Array of { ingredientId: string, orderedQuantity: number, unitCost: number }

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Supplier and line items are required" }, { status: 400 });
    }

    const branch = await prisma.branch.findFirst({ where: { code: "IND" } });
    const poSeq = branch ? branch.nextPoSeq : 1;
    const poNumber = `PO-${String(poSeq).padStart(3, "0")}`;

    const po = await prisma.$transaction(async (tx) => {
      // Increment PO sequence
      if (branch) {
        await tx.branch.update({
          where: { id: branch.id },
          data: { nextPoSeq: poSeq + 1 },
        });
      }

      let totalAmount = 0;
      const orderItemsData = items.map((it: any) => {
        const lineTotal = roundToTwo(Number(it.orderedQuantity) * Number(it.unitCost));
        totalAmount += lineTotal;
        return {
          ingredientId: it.ingredientId,
          orderedQuantity: Number(it.orderedQuantity),
          unitCost: Number(it.unitCost),
          totalCost: lineTotal,
        };
      });

      const newPo = await tx.purchaseOrder.create({
        data: {
          poNumber,
          branchId: branch?.id || "default",
          supplierId,
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
          status: "ISSUED",
          totalAmount: roundToTwo(totalAmount),
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          supplier: true,
          items: {
            include: { ingredient: true },
          },
        },
      });

      return newPo;
    });

    return NextResponse.json({
      success: true,
      po,
      message: `Purchase Order ${po.poNumber} issued to ${po.supplier.name} for ₹${po.totalAmount}!`,
    });
  } catch (error: any) {
    console.error("Create PO error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
