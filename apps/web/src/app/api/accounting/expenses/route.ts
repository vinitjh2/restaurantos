import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const branch = searchParams.get("branch");

    const tenantBranches = await prisma.branch.findMany({
      where: { organizationId: tenantCtx.organizationId },
      select: { id: true, code: true },
    });
    const branchKeys = Array.from(new Set(tenantBranches.flatMap((b) => [b.id, b.code])));

    const where: any =
      tenantCtx.role === "PLATFORM_OWNER"
        ? {}
        : branchKeys.length > 0
        ? { branchId: { in: branchKeys } }
        : { branchId: "__none__" };

    if (category && category !== "All") where.category = category;
    if (branch && branch !== "All") where.branchId = branch;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    for (const e of expenses) {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    }

    return NextResponse.json({
      success: true,
      expenses,
      totalExpense: Math.round(totalExpense * 100) / 100,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([cat, total]) => ({
        category: cat,
        total: Math.round(total * 100) / 100,
      })),
    });
  } catch (error: any) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const body = await req.json();
    const { category, description, amount, paymentMode, vendor, authorizedBy, branchId, receiptRef } = body;

    const primaryBranch = await prisma.branch.findFirst({
      where: { organizationId: tenantCtx.organizationId },
      select: { id: true, code: true },
    });

    const expenseAmount = Number(amount);
    if (!category || !description || isNaN(expenseAmount) || expenseAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Category, description and valid positive amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: expenseAmount,
        paymentMode: paymentMode || "CASH",
        vendor: vendor || null,
        authorizedBy: authorizedBy || tenantCtx.name || "Manager",
        branchId: branchId || primaryBranch?.code || primaryBranch?.id || tenantCtx.organizationId,
        receiptRef: receiptRef || null,
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      expense,
      message: `Expense of ₹${expenseAmount.toLocaleString("en-IN")} logged under '${category}'`,
    });
  } catch (error: any) {
    console.error("Save expense error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
