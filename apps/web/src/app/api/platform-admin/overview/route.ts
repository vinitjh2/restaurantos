import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    // Exclude the platform HQ organization itself from metrics
    const restaurantWhere = {
      slug: { not: "platform-hq" },
    };

    const [
      totalRestaurants,
      activeRestaurants,
      trialAccounts,
      suspendedAccounts,
      organizations,
      activeSubs,
      expiredSubs,
      failedInvoicesCount,
      allInvoices,
    ] = await Promise.all([
      prisma.organization.count({ where: restaurantWhere }),
      prisma.organization.count({ where: { ...restaurantWhere, status: "ACTIVE" } }),
      prisma.organization.count({ where: { ...restaurantWhere, status: "TRIALING" } }),
      prisma.organization.count({ where: { ...restaurantWhere, status: "SUSPENDED" } }),
      prisma.organization.findMany({
        where: restaurantWhere,
        include: {
          branches: { select: { id: true } },
          userAccounts: { select: { id: true } },
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenantSubscription.findMany({
        where: {
          status: "ACTIVE",
          organization: restaurantWhere,
        },
        include: { plan: true },
      }),
      prisma.tenantSubscription.count({
        where: {
          status: { in: ["EXPIRED", "PAST_DUE", "CANCELLED"] },
          organization: restaurantWhere,
        },
      }),
      prisma.subscriptionInvoice.count({
        where: { status: "FAILED" },
      }),
      prisma.subscriptionInvoice.findMany({
        where: { status: "PAID" },
        select: { amount: true, createdAt: true },
      }),
    ]);

    // Calculate Monthly Recurring Revenue (MRR)
    let mrr = 0;
    for (const sub of activeSubs) {
      if (sub.plan) {
        if (sub.billingCycle === "ANNUAL") {
          mrr += sub.plan.annualPrice / 12;
        } else {
          mrr += sub.plan.monthlyPrice;
        }
      }
    }
    const arr = mrr * 12;

    // Calculate new registrations in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = organizations.filter(
      (o) => new Date(o.createdAt) >= thirtyDaysAgo
    ).length;

    const recentRestaurants = organizations.slice(0, 8).map((o) => {
      const activeSub = o.subscriptions[0];
      return {
        id: o.id,
        name: o.name,
        slug: o.slug,
        businessType: o.businessType,
        contactEmail: o.contactEmail,
        status: o.status,
        planCode: activeSub?.plan?.code || o.subscriptionPlan,
        planName: activeSub?.plan?.name || o.subscriptionPlan,
        branchesCount: o.branches.length,
        usersCount: o.userAccounts.length,
        renewalDate: o.subscriptionRenewal ? o.subscriptionRenewal.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRestaurants,
        activeRestaurants,
        trialAccounts,
        suspendedAccounts,
        activeSubscriptions: activeSubs.length,
        expiredSubscriptions: expiredSubs,
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        newRegistrations,
        failedPayments: failedInvoicesCount,
      },
      recentRestaurants,
    });
  } catch (error: any) {
    console.error("Platform admin overview error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
