import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { roundToTwo } from "@/lib/server/inventory-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const grns = await prisma.goodsReceivedNote.findMany({
      include: {
        purchaseOrder: {
          select: { poNumber: true },
        },
        items: {
          include: {
            ingredient: {
              select: { name: true, baseUom: true },
            },
          },
        },
      },
      orderBy: { receivedAt: "desc" },
      take: 100,
    });

    // Also fetch supplier info for each GRN
    const supplierIds = Array.from(new Set(grns.map((g) => g.supplierId)));
    const suppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true, phone: true },
    });
    const supMap = new Map(suppliers.map((s) => [s.id, s]));

    const formattedGrns = grns.map((g) => ({
      ...g,
      supplier: supMap.get(g.supplierId) || { name: "Unknown Vendor" },
    }));

    return NextResponse.json({ success: true, grns: formattedGrns });
  } catch (error: any) {
    console.error("GRN fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      purchaseOrderId,
      supplierId,
      receivedBy,
      vendorChallanNumber,
      inspectionStatus,
      notes,
      items, // Array of { ingredientId, quantityReceived, unitCost, batchNumber, expiryDate }
    } = body;

    const branch = await prisma.branch.findFirst({ where: { code: "IND" } });
    const grnSeq = branch ? branch.nextGrnSeq : 1;
    const grnNumber = `GRN-${String(grnSeq).padStart(3, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Increment GRN sequence
      if (branch) {
        await tx.branch.update({
          where: { id: branch.id },
          data: { nextGrnSeq: grnSeq + 1 },
        });
      }

      let totalValue = 0;
      const grnItemsData: any[] = [];

      // 2. Process each received item
      for (const it of items) {
        const ingredient = await tx.ingredient.findUnique({ where: { id: it.ingredientId } });
        if (!ingredient) continue;

        const qtyReceived = Number(it.quantityReceived);
        const unitCost = Number(it.unitCost) || ingredient.purchasePrice;
        const lineTotal = roundToTwo(qtyReceived * unitCost);
        totalValue += lineTotal;

        const balanceBefore = ingredient.currentStock;
        const balanceAfter = roundToTwo(balanceBefore + qtyReceived);

        // Update Ingredient stock, purchase price, batch and expiry
        await tx.ingredient.update({
          where: { id: ingredient.id },
          data: {
            currentStock: balanceAfter,
            purchasePrice: unitCost,
            batchNumber: it.batchNumber || ingredient.batchNumber,
            expiryDate: it.expiryDate ? new Date(it.expiryDate) : ingredient.expiryDate,
          },
        });

        // Insert StockMovement
        await tx.stockMovement.create({
          data: {
            ingredientId: ingredient.id,
            movementType: "PURCHASE_GRN",
            quantity: qtyReceived,
            balanceBefore,
            balanceAfter,
            unitCost,
            totalValue: lineTotal,
            referenceId: grnNumber,
            reason: `Goods received under ${grnNumber} (Challan: ${vendorChallanNumber || "N/A"})`,
            performedBy: receivedBy || "Kitchen Inventory Staff",
          },
        });

        grnItemsData.push({
          ingredientId: ingredient.id,
          quantityReceived: qtyReceived,
          unitCost,
          totalCost: lineTotal,
          batchNumber: it.batchNumber || null,
          expiryDate: it.expiryDate ? new Date(it.expiryDate) : null,
        });
      }

      // 3. Create GoodsReceivedNote record
      const grn = await tx.goodsReceivedNote.create({
        data: {
          grnNumber,
          purchaseOrderId: purchaseOrderId || null,
          supplierId,
          receivedBy: receivedBy || "Inventory Manager",
          vendorChallanNumber: vendorChallanNumber || null,
          inspectionStatus: inspectionStatus || "PASSED",
          notes: notes || null,
          items: {
            create: grnItemsData,
          },
        },
        include: { items: true },
      });

      // 4. If linked to PO, mark PO completed
      if (purchaseOrderId) {
        await tx.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: { status: "COMPLETED" },
        });
      }

      // 5. Automatically create PurchaseInvoice and update Supplier credit balance
      const invoiceNumber = `VINV-${Date.now().toString().slice(-5)}`;
      const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days terms

      const invoice = await tx.purchaseInvoice.create({
        data: {
          invoiceNumber,
          supplierId,
          taxableAmount: totalValue,
          cgstAmount: roundToTwo(totalValue * 0.025),
          sgstAmount: roundToTwo(totalValue * 0.025),
          totalAmount: roundToTwo(totalValue * 1.05), // with 5% GST
          paidAmount: 0,
          balanceDue: roundToTwo(totalValue * 1.05),
          status: "UNPAID",
          dueDate,
        },
      });

      // Update supplier credit balance
      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          creditBalance: {
            increment: roundToTwo(totalValue * 1.05),
          },
        },
      });

      return { grn, invoice };
    });

    return NextResponse.json({
      success: true,
      grn: result.grn,
      invoice: result.invoice,
      message: `${result.grn.grnNumber} processed. Stock credited and vendor invoice ${result.invoice.invoiceNumber} recorded!`,
    });
  } catch (error: any) {
    console.error("GRN receipt error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
