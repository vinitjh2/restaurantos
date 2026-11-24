import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const subscription = await prisma.tenantSubscription.findFirst({
      where: { organizationId: tenantCtx.organizationId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found to cancel" },
        { status: 404 }
      );
    }

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd;
    const isPastPeriod = now > periodEnd;

    // Update mandate status and set cancelAtPeriodEnd to true
    const updatedSub = await prisma.tenantSubscription.update({
      where: { id: subscription.id },
      data: {
        mandateStatus: "CANCELLED",
        cancelAtPeriodEnd: true,
        cancelledAt: now,
      },
    });

    const formattedEndDate = periodEnd.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return NextResponse.json({
      success: true,
      message: `Your recurring mandate has been stopped. Per our period-end policy, your restaurant retains full operational access until ${formattedEndDate}. No further auto-debits will occur.`,
      cancellationDetails: {
        mandateStatus: "CANCELLED",
        cancelAtPeriodEnd: true,
        cancelledAt: now.toISOString(),
        accessValidUntil: periodEnd.toISOString(),
        isAccessCurrentlyActive: !isPastPeriod,
        planName: subscription.plan.name,
      },
    });
  } catch (err: any) {
    console.error("[Mandate Cancel API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel mandate" },
      { status: 500 }
    );
  }
}
