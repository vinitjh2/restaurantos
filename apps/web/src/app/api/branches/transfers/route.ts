import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { transferStockBetweenBranches, acknowledgeTransferReceipt } from "@/lib/server/multi-branch-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transfers = await prisma.branchTransfer.findMany({
      include: {
        items: true,
      },
      orderBy: { initiatedAt: "desc" },
    });

    // Populate ingredient names
    const ingIds = Array.from(new Set(transfers.flatMap((t) => t.items.map((i) => i.ingredientId))));
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: ingIds } },
      select: { id: true, name: true, baseUom: true },
    });
    const ingMap = new Map(ingredients.map((i) => [i.id, i]));

    const enrichedTransfers = transfers.map((t) => ({
      ...t,
      items: t.items.map((it) => ({
        ...it,
        ingredientName: ingMap.get(it.ingredientId)?.name || "Raw Material",
      })),
    }));

    return NextResponse.json({ success: true, transfers: enrichedTransfers });
  } catch (error: any) {
    console.error("Transfers fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, transferId, sourceBranchCode, destBranchCode, initiatedBy, receivedBy, items, notes } = body;

    // 1. RECEIVE IN-TRANSIT TRANSFER
    if (action === "RECEIVE") {
      if (!transferId) {
        return NextResponse.json({ success: false, error: "transferId required" }, { status: 400 });
      }
      const updated = await acknowledgeTransferReceipt(transferId, receivedBy || "Store Manager");
      return NextResponse.json({
        success: true,
        transfer: updated,
        message: `Transfer ${updated.transferNumber} received at ${updated.destBranchId}. Stock credited!`,
      });
    }

    // 2. INITIATE TRANSFER
    if (!sourceBranchCode || !destBranchCode || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Source branch, destination branch and transfer items are required" },
        { status: 400 }
      );
    }

    const transferSeq = (await prisma.branchTransfer.count()) + 1;
    const transferNumber = `TRF-${String(transferSeq).padStart(3, "0")}`;

    const transfer = await transferStockBetweenBranches({
      transferNumber,
      sourceBranchCode,
      destBranchCode,
      initiatedBy: initiatedBy || "Head Chef",
      items,
      notes,
    });

    return NextResponse.json({
      success: true,
      transfer,
      message: `Stock transfer ${transfer.transferNumber} dispatched from ${sourceBranchCode} to ${destBranchCode} (Valuation: ₹${transfer.totalValue.toLocaleString("en-IN")})`,
    });
  } catch (error: any) {
    console.error("Branch transfer error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
