import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { reconcileCashDrawer } from "@/lib/server/accounting-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branch") || "IND";

    // Find current active (OPEN) shift or latest closed shift
    let shift = await prisma.cashRegisterShift.findFirst({
      where: { branchId, status: "OPEN" },
      orderBy: { openingTime: "desc" },
    });

    if (!shift) {
      shift = await prisma.cashRegisterShift.findFirst({
        where: { branchId },
        orderBy: { openingTime: "desc" },
      });
    }

    if (!shift) {
      return NextResponse.json({
        success: true,
        activeShift: null,
        message: "No cash register shift open. Open a new drawer shift to begin.",
      });
    }

    // If shift is OPEN, compute live cash sales received since opening
    let liveCashSales = shift.cashSales;
    if (shift.status === "OPEN") {
      const cashInvoices = await prisma.invoice.findMany({
        where: {
          branchId,
          status: "PAID",
          paymentMethod: { in: ["CASH", "SPLIT"] },
          settledAt: { gte: shift.openingTime },
        },
        include: { payments: { where: { method: "CASH" } } },
      });

      let calculatedCashSales = 0;
      for (const inv of cashInvoices) {
        if (inv.paymentMethod === "CASH") {
          calculatedCashSales += inv.grandTotal;
        } else {
          // split payment cash portion
          for (const p of inv.payments) {
            calculatedCashSales += p.amount;
          }
        }
      }
      liveCashSales = Math.round(calculatedCashSales * 100) / 100;
    }

    const expectedCash = Math.round((shift.openingBalance + liveCashSales - shift.cashDrops - shift.cashRefunds) * 100) / 100;

    return NextResponse.json({
      success: true,
      activeShift: {
        ...shift,
        cashSales: liveCashSales,
        expectedCash,
      },
    });
  } catch (error: any) {
    console.error("Cash register fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, branchId, openedBy, closedBy, openingBalance, cashDropAmount, actualClosingCash, notes } = body;

    const branch = branchId || "IND";

    // 1. OPEN NEW SHIFT
    if (action === "OPEN") {
      // Check if an open shift already exists
      const existingOpen = await prisma.cashRegisterShift.findFirst({
        where: { branchId: branch, status: "OPEN" },
      });

      if (existingOpen) {
        return NextResponse.json(
          { success: false, error: "A cash drawer shift is already OPEN. Please close the active shift first." },
          { status: 400 }
        );
      }

      const openBalance = Number(openingBalance) || 0;
      const newShift = await prisma.cashRegisterShift.create({
        data: {
          branchId: branch,
          openedBy: openedBy || "Cashier",
          openingBalance: openBalance,
          expectedCash: openBalance,
          status: "OPEN",
          notes: notes || "Shift drawer opened",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "CASH_DRAWER_OPENED",
          entityType: "CashRegisterShift",
          entityId: newShift.id,
          authorizedBy: openedBy || "Cashier",
          details: `Opening Float: ₹${openBalance}`,
        },
      });

      return NextResponse.json({
        success: true,
        shift: newShift,
        message: `Cash drawer opened with float of ₹${openBalance.toLocaleString("en-IN")}`,
      });
    }

    // 2. CASH DROP (Transfer cash to safe)
    if (action === "DROP") {
      const activeShift = await prisma.cashRegisterShift.findFirst({
        where: { branchId: branch, status: "OPEN" },
      });

      if (!activeShift) {
        return NextResponse.json({ success: false, error: "No active OPEN cash drawer shift found" }, { status: 404 });
      }

      const drop = Number(cashDropAmount);
      if (isNaN(drop) || drop <= 0) {
        return NextResponse.json({ success: false, error: "Valid positive drop amount required" }, { status: 400 });
      }

      const updated = await prisma.cashRegisterShift.update({
        where: { id: activeShift.id },
        data: {
          cashDrops: { increment: drop },
          notes: notes ? `${activeShift.notes || ""}; Drop: ${notes}` : activeShift.notes,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "CASH_DROP_RECORDED",
          entityType: "CashRegisterShift",
          entityId: activeShift.id,
          authorizedBy: openedBy || "Manager",
          details: `Dropped ₹${drop} to safe vault`,
        },
      });

      return NextResponse.json({
        success: true,
        shift: updated,
        message: `Safe cash drop of ₹${drop.toLocaleString("en-IN")} recorded`,
      });
    }

    // 3. CLOSE SHIFT & RECONCILE
    if (action === "CLOSE") {
      const activeShift = await prisma.cashRegisterShift.findFirst({
        where: { branchId: branch, status: "OPEN" },
      });

      if (!activeShift) {
        return NextResponse.json({ success: false, error: "No active OPEN cash drawer shift found" }, { status: 404 });
      }

      const countedCash = Number(actualClosingCash);
      if (isNaN(countedCash) || countedCash < 0) {
        return NextResponse.json({ success: false, error: "Valid non-negative actual cash count required" }, { status: 400 });
      }

      // Compute live cash sales
      const cashInvoices = await prisma.invoice.findMany({
        where: {
          branchId: branch,
          status: "PAID",
          paymentMethod: { in: ["CASH", "SPLIT"] },
          settledAt: { gte: activeShift.openingTime },
        },
        include: { payments: { where: { method: "CASH" } } },
      });

      let calculatedCashSales = 0;
      for (const inv of cashInvoices) {
        if (inv.paymentMethod === "CASH") {
          calculatedCashSales += inv.grandTotal;
        } else {
          for (const p of inv.payments) calculatedCashSales += p.amount;
        }
      }
      calculatedCashSales = Math.round(calculatedCashSales * 100) / 100;

      // Reconcile
      const rec = reconcileCashDrawer({
        openingBalance: activeShift.openingBalance,
        cashSales: calculatedCashSales,
        cashDrops: activeShift.cashDrops,
        cashRefunds: activeShift.cashRefunds,
        actualClosingCash: countedCash,
      });

      const closed = await prisma.cashRegisterShift.update({
        where: { id: activeShift.id },
        data: {
          closedBy: closedBy || "Manager",
          closingTime: new Date(),
          cashSales: calculatedCashSales,
          expectedCash: rec.expectedCash,
          actualClosingCash: countedCash,
          cashVariance: rec.cashVariance,
          status: "CLOSED",
          notes: notes || `Shift closed with variance ₹${rec.cashVariance}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "CASH_DRAWER_CLOSED",
          entityType: "CashRegisterShift",
          entityId: activeShift.id,
          authorizedBy: closedBy || "Manager",
          details: JSON.stringify(rec),
        },
      });

      return NextResponse.json({
        success: true,
        shift: closed,
        reconciliation: rec,
        message: rec.isBalanced
          ? `Cash drawer balanced perfectly! Expected: ₹${rec.expectedCash}`
          : rec.isSurplus
          ? `Cash drawer closed with Surplus of +₹${rec.cashVariance}`
          : `Cash drawer closed with Shortage of -₹${Math.abs(rec.cashVariance)}`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Choose OPEN, DROP, or CLOSE." }, { status: 400 });
  } catch (error: any) {
    console.error("Cash register action error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
