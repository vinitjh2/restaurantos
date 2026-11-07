import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPrice: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.error("Fetch plans error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const body = await req.json();
    const {
      id,
      code,
      name,
      description,
      monthlyPrice,
      annualPrice,
      maxBranches,
      maxEmployees,
      storageLimitMB,
      allowedModules,
      hasAdvancedReporting,
      hasApiIntegrations,
      hasCustomDomain,
      isActive,
    } = body;

    if (!id && !code) {
      return NextResponse.json(
        { success: false, error: "Plan ID or Code is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.subscriptionPlan.update({
      where: id ? { id } : { code },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(monthlyPrice !== undefined ? { monthlyPrice: Number(monthlyPrice) } : {}),
        ...(annualPrice !== undefined ? { annualPrice: Number(annualPrice) } : {}),
        ...(maxBranches !== undefined ? { maxBranches: Number(maxBranches) } : {}),
        ...(maxEmployees !== undefined ? { maxEmployees: Number(maxEmployees) } : {}),
        ...(storageLimitMB !== undefined ? { storageLimitMB: Number(storageLimitMB) } : {}),
        ...(allowedModules ? { allowedModules: typeof allowedModules === "string" ? allowedModules : JSON.stringify(allowedModules) } : {}),
        ...(hasAdvancedReporting !== undefined ? { hasAdvancedReporting: Boolean(hasAdvancedReporting) } : {}),
        ...(hasApiIntegrations !== undefined ? { hasApiIntegrations: Boolean(hasApiIntegrations) } : {}),
        ...(hasCustomDomain !== undefined ? { hasCustomDomain: Boolean(hasCustomDomain) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    // Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "SUPER_ADMIN_PLAN_MODIFIED",
        entityType: "SUBSCRIPTION_PLAN",
        entityId: updated.id,
        authorizedBy: `${tenantCtx.email} (PLATFORM_OWNER)`,
        reason: `Super Admin modified pricing/limits for Plan '${updated.code}'`,
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json({
      success: true,
      plan: updated,
    });
  } catch (error: any) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
