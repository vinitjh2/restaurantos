import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { roundToTwo } from "@/lib/server/inventory-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, reason, authorizedBy, items } = body;
    // items: Array of { ingredientId: string, quantity: number, unitCost?: number, notes?: string }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items provided for adjustment" }, { status: 400 });
    }

    const adjustmentNumber = `${type || "ADJ"}-${Date.now().toString().slice(-4)}`;

    const result = await prisma.$transaction(async (tx) => {
      let totalLoss = 0;
      const adjustmentItemRecords: any[] = [];

      for (const it of items) {
        const ingredient = await tx.ingredient.findUnique({ where: { id: it.ingredientId } });
        if (!ingredient) continue;

        const qty = Number(it.quantity);
        const cost = it.unitCost || ingredient.purchasePrice;
        const lineLoss = roundToTwo(Math.abs(qty) * cost);
        totalLoss += lineLoss;

        const balanceBefore = ingredient.currentStock;
        let balanceAfter = 0;

        if (type === "AUDIT_RECONCILIATION") {
          // Absolute set to physical count
          balanceAfter = qty;
        } else {
          // Wastage or Damaged: deduct from stock
          balanceAfter = roundToTwo(balanceBefore - Math.abs(qty));
        }

        // Update Ingredient stock
        await tx.ingredient.update({
          where: { id: ingredient.id },
          data: { currentStock: balanceAfter },
        });

        // Insert StockMovement
        await tx.stockMovement.create({
          data: {
            ingredientId: ingredient.id,
            movementType: type || "WASTAGE",
            quantity: type === "AUDIT_RECONCILIATION" ? (balanceAfter - balanceBefore) : -Math.abs(qty),
            balanceBefore,
            balanceAfter,
            unitCost: cost,
            totalValue: lineLoss,
            referenceId: adjustmentNumber,
            reason: reason || `Manual adjustment: ${type}`,
            performedBy: authorizedBy || "Kitchen Inventory Manager",
          },
        });

        adjustmentItemRecords.push({
          ingredientId: ingredient.id,
          quantity: Math.abs(qty),
          unitCost: cost,
          lossValue: lineLoss,
        });
      }

      // Create StockAdjustment record
      const adjustment = await tx.stockAdjustment.create({
        data: {
          adjustmentNumber,
          type: type || "WASTAGE",
          totalLossValue: roundToTwo(totalLoss),
          reason: reason || "Inventory adjustment",
          authorizedBy: authorizedBy || "Kitchen Manager",
          items: {
            create: adjustmentItemRecords,
          },
        },
        include: { items: true },
      });

      return adjustment;
    });

    return NextResponse.json({
      success: true,
      adjustment: result,
      message: `${result.adjustmentNumber} recorded. Total loss value: ₹${result.totalLossValue}`,
    });
  } catch (error: any) {
    console.error("Adjustment error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
