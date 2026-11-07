import { NextRequest, NextResponse } from "next/server";
import { calculateOrderTotals, BillingCalculationInput } from "@/lib/server/billing-engine";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: NextRequest) {
  try {
    const body: BillingCalculationInput = await req.json();

    // Fetch branch configuration for authoritative tax rates
    const branch = await prisma.branch.findFirst({
      where: { code: "IND" },
    });

    const calculation = calculateOrderTotals({
      ...body,
      cgstRate: branch?.cgstRate ?? 2.5,
      sgstRate: branch?.sgstRate ?? 2.5,
      igstRate: branch?.igstRate ?? 0.0,
      isTaxInclusive: branch?.isTaxInclusive ?? false,
    });

    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (error: any) {
    console.error("Calculation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
