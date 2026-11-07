import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");

    const where: any = {
      slug: { not: "platform-hq" },
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (plan && plan !== "ALL") {
      where.subscriptionPlan = plan;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { contactEmail: { contains: search } },
        { contactPhone: { contains: search } },
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        branches: true,
        userAccounts: {
          select: { id: true, name: true, email: true, role: true, isActive: true },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        subscriptionInvoices: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = await Promise.all(
      organizations.map(async (org) => {
        const branchIds = org.branches.map((b) => b.id);
        const orderCount = await prisma.order.count({
          where: { branchId: { in: branchIds } },
        });

        const activeSub = org.subscriptions[0] || null;

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          businessType: org.businessType,
          contactEmail: org.contactEmail,
          contactPhone: org.contactPhone,
          status: org.status,
          subscriptionPlan: org.subscriptionPlan,
          subscriptionRenewal: org.subscriptionRenewal?.toISOString() || null,
          createdAt: org.createdAt.toISOString(),
          branchCount: org.branches.length,
          branches: org.branches.map((b) => ({ id: b.id, name: b.name, code: b.code, city: b.city })),
          userCount: org.userAccounts.length,
          userAccounts: org.userAccounts,
          orderCount,
          activeSubscription: activeSub
            ? {
                id: activeSub.id,
                planCode: activeSub.plan.code,
                planName: activeSub.plan.name,
                monthlyPrice: activeSub.plan.monthlyPrice,
                status: activeSub.status,
                billingCycle: activeSub.billingCycle,
                currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
                maxBranches: activeSub.plan.maxBranches,
                maxEmployees: activeSub.plan.maxEmployees,
                storageLimitMB: activeSub.plan.storageLimitMB,
              }
            : null,
          recentInvoices: org.subscriptionInvoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            status: inv.status,
            paidAt: inv.paidAt?.toISOString() || null,
            createdAt: inv.createdAt.toISOString(),
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      restaurants: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error("Platform admin restaurants error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
