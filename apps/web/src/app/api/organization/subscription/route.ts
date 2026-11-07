import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const org = await prisma.organization.findUnique({
      where: { id: tenantCtx.organizationId },
      include: {
        branches: true,
        userAccounts: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
        subscriptionInvoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const activeSub =
      org.subscriptions.find((s) => s.status === "ACTIVE" || s.status === "TRIALING") ||
      org.subscriptions[0];

    // Get all plans for upgrade comparison
    const allPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    // Compute real usage
    const branchesUsed = org.branches.length;
    const employeesUsed = org.userAccounts.length;
    const branchIds = org.branches.map((b) => b.id);
    const orderCount = await prisma.order.count({
      where: { branchId: { in: branchIds } },
    });
    const storageUsedMB = Math.round(orderCount * 0.05 + 15);

    const planCode = activeSub?.plan?.code || org.subscriptionPlan || "GROWTH";
    const currentPlan =
      activeSub?.plan ||
      allPlans.find((p) => p.code === planCode) ||
      allPlans[1];

    let allowedModulesList: string[] = [];
    try {
      allowedModulesList = JSON.parse(currentPlan.allowedModules);
    } catch {
      allowedModulesList = ["pos", "orders", "menu", "tables", "kds", "inventory"];
    }

    return NextResponse.json({
      success: true,
      subscription: {
        organizationName: org.name,
        planCode: currentPlan.code,
        planName: currentPlan.name,
        monthlyPrice: currentPlan.monthlyPrice,
        annualPrice: currentPlan.annualPrice,
        status: org.status,
        billingCycle: activeSub?.billingCycle || "MONTHLY",
        renewalDate: org.subscriptionRenewal?.toISOString() || null,
        allowedModules: allowedModulesList,
        hasAdvancedReporting: currentPlan.hasAdvancedReporting,
        hasApiIntegrations: currentPlan.hasApiIntegrations,
        hasCustomDomain: currentPlan.hasCustomDomain,
        usage: {
          branches: {
            used: branchesUsed,
            limit: currentPlan.maxBranches,
            percent: Math.min(100, Math.round((branchesUsed / currentPlan.maxBranches) * 100)),
          },
          employees: {
            used: employeesUsed,
            limit: currentPlan.maxEmployees,
            percent: Math.min(100, Math.round((employeesUsed / currentPlan.maxEmployees) * 100)),
          },
          storageMB: {
            used: storageUsedMB,
            limit: currentPlan.storageLimitMB,
            percent: Math.min(100, Math.round((storageUsedMB / currentPlan.storageLimitMB) * 100)),
          },
        },
      },
      availablePlans: allPlans.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        maxBranches: p.maxBranches,
        maxEmployees: p.maxEmployees,
        storageLimitMB: p.storageLimitMB,
        hasAdvancedReporting: p.hasAdvancedReporting,
        hasApiIntegrations: p.hasApiIntegrations,
      })),
      invoices: org.subscriptionInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        paymentMethod: inv.paymentMethod,
        razorpayPaymentId: inv.razorpayPaymentId,
        date: inv.paidAt?.toISOString() || inv.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Tenant subscription error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
