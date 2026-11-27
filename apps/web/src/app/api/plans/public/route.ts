import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

/**
 * Public read-only endpoint returning active SaaS subscription tiers for /register onboarding.
 */
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        monthlyPrice: true,
        annualPrice: true,
        maxBranches: true,
        maxEmployees: true,
        storageLimitMB: true,
        hasAdvancedReporting: true,
        hasApiIntegrations: true,
      },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error("Failed to fetch public plans:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load subscription plans" },
      { status: 500 }
    );
  }
}
