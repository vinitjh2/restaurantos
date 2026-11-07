import { prisma } from "@/lib/server/prisma";

export interface StockTransferItemInput {
  ingredientId: string;
  quantity: number;
  uom: string;
}

/**
 * Execute a transactional cross-branch stock transfer
 */
export async function transferStockBetweenBranches(params: {
  transferNumber: string;
  sourceBranchCode: string;
  destBranchCode: string;
  initiatedBy: string;
  items: StockTransferItemInput[];
  notes?: string;
}) {
  const { transferNumber, sourceBranchCode, destBranchCode, initiatedBy, items, notes } = params;

  return await prisma.$transaction(async (tx) => {
    let totalTransferValue = 0;
    const transferItemsData: any[] = [];

    for (const item of items) {
      const sourceIng = await tx.ingredient.findUnique({
        where: { id: item.ingredientId },
      });

      if (!sourceIng) {
        throw new Error(`Ingredient ${item.ingredientId} not found at source branch`);
      }

      if (sourceIng.currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for '${sourceIng.name}' at branch ${sourceBranchCode}: Available ${sourceIng.currentStock} ${sourceIng.baseUom}, Requested ${item.quantity}`
        );
      }

      const lineTotal = Math.round(item.quantity * sourceIng.purchasePrice * 100) / 100;
      totalTransferValue += lineTotal;

      const balanceBefore = sourceIng.currentStock;
      const balanceAfter = Math.round((balanceBefore - item.quantity) * 1000) / 1000;

      // Deduct from source branch stock
      await tx.ingredient.update({
        where: { id: sourceIng.id },
        data: { currentStock: balanceAfter },
      });

      // Log movement for source branch
      await tx.stockMovement.create({
        data: {
          ingredientId: sourceIng.id,
          movementType: "TRANSFER",
          quantity: -item.quantity,
          balanceBefore,
          balanceAfter,
          unitCost: sourceIng.purchasePrice,
          totalValue: -lineTotal,
          referenceId: transferNumber,
          reason: `Stock transferred out from ${sourceBranchCode} to ${destBranchCode}`,
          performedBy: initiatedBy,
        },
      });

      transferItemsData.push({
        ingredientId: sourceIng.id,
        quantity: item.quantity,
        uom: item.uom,
        unitCost: sourceIng.purchasePrice,
        totalCost: lineTotal,
      });
    }

    // Create BranchTransfer record in IN_TRANSIT
    const transfer = await tx.branchTransfer.create({
      data: {
        transferNumber,
        sourceBranchId: sourceBranchCode,
        destBranchId: destBranchCode,
        status: "IN_TRANSIT",
        initiatedBy,
        totalValue: Math.round(totalTransferValue * 100) / 100,
        notes: notes || null,
        items: {
          create: transferItemsData,
        },
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        action: "BRANCH_STOCK_TRANSFERRED_OUT",
        entityType: "BranchTransfer",
        entityId: transfer.id,
        authorizedBy: initiatedBy,
        reason: notes || `Transferred to ${destBranchCode}`,
        details: JSON.stringify({ transferNumber, totalValue: totalTransferValue }),
      },
    });

    return transfer;
  });
}

/**
 * Acknowledge and receive in-transit stock at the destination branch
 */
export async function acknowledgeTransferReceipt(transferId: string, receivedBy: string) {
  return await prisma.$transaction(async (tx) => {
    const transfer = await tx.branchTransfer.findUnique({
      where: { id: transferId },
      include: { items: true },
    });

    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    if (transfer.status !== "IN_TRANSIT") {
      throw new Error(`Transfer ${transfer.transferNumber} is not IN_TRANSIT (Status: ${transfer.status})`);
    }

    // For each item, credit stock
    for (const item of transfer.items) {
      const sourceIng = await tx.ingredient.findUnique({ where: { id: item.ingredientId } });
      if (!sourceIng) continue;

      // Credit stock
      const balanceBefore = sourceIng.currentStock;
      const balanceAfter = Math.round((balanceBefore + item.quantity) * 1000) / 1000;

      await tx.ingredient.update({
        where: { id: sourceIng.id },
        data: { currentStock: balanceAfter },
      });

      // Log movement for receiving branch
      await tx.stockMovement.create({
        data: {
          ingredientId: sourceIng.id,
          movementType: "TRANSFER",
          quantity: item.quantity,
          balanceBefore,
          balanceAfter,
          unitCost: item.unitCost,
          totalValue: item.totalCost,
          referenceId: transfer.transferNumber,
          reason: `Stock received at ${transfer.destBranchId} from ${transfer.sourceBranchId}`,
          performedBy: receivedBy,
        },
      });
    }

    // Update transfer status
    const updated = await tx.branchTransfer.update({
      where: { id: transferId },
      data: {
        status: "RECEIVED",
        receivedBy,
        receivedAt: new Date(),
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        action: "BRANCH_STOCK_TRANSFERRED_IN",
        entityType: "BranchTransfer",
        entityId: transfer.id,
        authorizedBy: receivedBy,
        details: `Received at ${transfer.destBranchId}`,
      },
    });

    return updated;
  });
}
