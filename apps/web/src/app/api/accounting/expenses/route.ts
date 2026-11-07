import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const branch = searchParams.get("branch");

    const where: any = {};
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
    const body = await req.json();
    const { category, description, amount, paymentMode, vendor, authorizedBy, branchId, receiptRef } = body;

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
        authorizedBy: authorizedBy || "Manager",
        branchId: branchId || "IND",
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
