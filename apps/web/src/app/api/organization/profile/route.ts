import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);

    const organization = await prisma.organization.findUnique({
      where: { id: tenantCtx.organizationId },
      include: {
        branches: true,
        userAccounts: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            assignedBranchId: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN"]);

    const body = await req.json();
    const { name, businessType, contactEmail, contactPhone, currency, logoUrl } = body;

    const updated = await prisma.organization.update({
      where: { id: tenantCtx.organizationId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(businessType ? { businessType } : {}),
        ...(contactEmail ? { contactEmail: contactEmail.toLowerCase().trim() } : {}),
        ...(contactPhone !== undefined ? { contactPhone } : {}),
        ...(currency ? { currency } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ORGANIZATION_PROFILE_UPDATED",
        entityType: "ORGANIZATION",
        entityId: updated.id,
        authorizedBy: `${tenantCtx.email} (${tenantCtx.role})`,
        details: `Updated organization details for '${updated.name}'`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Organization profile updated successfully",
      organization: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
