import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";
import { DEMO_RESTAURANTS, DEMO_BRANCHES } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    let organization: any = null;
    try {
      organization = await prisma.organization.findUnique({
        where: { id: tenantCtx.organizationId },
        include: {
          branches: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (e) {
      console.warn("[Auth Me] Database query fallback:", e);
    }

    if (!organization) {
      const demoOrg = DEMO_RESTAURANTS.find((o) => o.id === tenantCtx.organizationId) || DEMO_RESTAURANTS[0];
      return NextResponse.json({
        success: true,
        user: {
          id: tenantCtx.userId,
          name: tenantCtx.name,
          email: tenantCtx.email,
          role: tenantCtx.role,
          assignedBranchId: tenantCtx.assignedBranchId || DEMO_BRANCHES[0].id,
        },
        organization: {
          id: demoOrg.id,
          name: demoOrg.name,
          slug: (demoOrg as any).slug || "bawarchi-royale",
          businessType: "MULTI_CHAIN",
          currency: "INR",
          status: "ACTIVE",
          subscriptionPlan: "ENTERPRISE",
          branches: DEMO_BRANCHES.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            city: b.city,
            address: "100 Feet Road, Indiranagar",
            phone: "+91 80 4123 4567",
            gstin: b.gstin,
            fssaiNumber: b.fssai,
          })),
        },
      });
    }

    // Filter branches if user is restricted to a single branch
    let accessibleBranches = organization.branches;
    if (tenantCtx.assignedBranchId) {
      accessibleBranches = organization.branches.filter(
        (b: any) => b.id === tenantCtx.assignedBranchId
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: tenantCtx.userId,
        name: tenantCtx.name,
        email: tenantCtx.email,
        role: tenantCtx.role,
        assignedBranchId: tenantCtx.assignedBranchId,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        businessType: organization.businessType,
        currency: organization.currency,
        status: organization.status,
        subscriptionPlan: organization.subscriptionPlan,
        subscriptionRenewal: organization.subscriptionRenewal,
        branches: accessibleBranches.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          city: b.city,
          address: b.address,
          phone: b.phone,
          gstin: b.gstin,
          fssaiNumber: b.fssaiNumber,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve session" },
      { status: error.statusCode || 401 }
    );
  }
}
