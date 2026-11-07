import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const organization = await prisma.organization.findUnique({
      where: { id: tenantCtx.organizationId },
      include: {
        branches: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    // Filter branches if user is restricted to a single branch
    let accessibleBranches = organization.branches;
    if (tenantCtx.assignedBranchId) {
      accessibleBranches = organization.branches.filter(
        (b) => b.id === tenantCtx.assignedBranchId
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
        branches: accessibleBranches.map((b) => ({
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
