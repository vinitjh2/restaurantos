import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const { id } = params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        branches: true,
        userAccounts: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
        subscriptionInvoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Restaurant organization not found" },
        { status: 404 }
      );
    }

    const branchIds = org.branches.map((b) => b.id);
    const orderCount = await prisma.order.count({
      where: { branchId: { in: branchIds } },
    });

    const activeSub = org.subscriptions.find((s) => s.status === "ACTIVE") || org.subscriptions[0];

    // Compute usage statistics
    const currentBranches = org.branches.length;
    const currentEmployees = org.userAccounts.length;
    const maxBranches = activeSub?.plan.maxBranches || 1;
    const maxEmployees = activeSub?.plan.maxEmployees || 5;

    return NextResponse.json({
      success: true,
      restaurant: {
        ...org,
        orderCount,
        usage: {
          branches: { used: currentBranches, limit: maxBranches },
          employees: { used: currentEmployees, limit: maxEmployees },
          storageMB: { used: Math.round(orderCount * 0.05 + 10), limit: activeSub?.plan.storageLimitMB || 500 },
        },
      },
    });
  } catch (error: any) {
    console.error("Fetch single restaurant error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const { id } = params;
    const body = await req.json();
    const { status, subscriptionPlan, renewalDays } = body;

    const org = await prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Restaurant organization not found" },
        { status: 404 }
      );
    }

    const data: any = {};

    if (status) {
      data.status = status;
      // If suspended, deactivate user accounts to prevent login
      if (status === "SUSPENDED") {
        await prisma.userAccount.updateMany({
          where: { organizationId: id },
          data: { isActive: false },
        });
      } else if (status === "ACTIVE") {
        await prisma.userAccount.updateMany({
          where: { organizationId: id },
          data: { isActive: true },
        });
      }
    }

    if (subscriptionPlan) {
      data.subscriptionPlan = subscriptionPlan;

      // Find the subscription plan record
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { code: subscriptionPlan },
      });

      if (plan) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + (Number(renewalDays) || 30));
        data.subscriptionRenewal = nextMonth;

        // Upsert active subscription
        await prisma.tenantSubscription.create({
          data: {
            organizationId: id,
            planId: plan.id,
            billingCycle: "MONTHLY",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: nextMonth,
          },
        });
      }
    }

    const updated = await prisma.organization.update({
      where: { id },
      data,
    });

    // Log the Super Admin action in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "SUPER_ADMIN_RESTAURANT_MUTATION",
        entityType: "ORGANIZATION",
        entityId: id,
        authorizedBy: `${tenantCtx.email} (PLATFORM_OWNER)`,
        reason: `Super Admin updated status to '${updated.status}' and plan to '${updated.subscriptionPlan}'`,
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: updated,
    });
  } catch (error: any) {
    console.error("Update restaurant error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
