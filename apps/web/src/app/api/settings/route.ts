import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, verifyBranchOwnership, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get("branchId") || searchParams.get("branchCode");

    let branch = null;
    if (branchParam) {
      branch = await verifyBranchOwnership(tenantCtx, branchParam);
    } else {
      branch = await prisma.branch.findFirst({
        where: { organizationId: tenantCtx.organizationId },
      });
      if (!branch) {
        branch = await prisma.branch.findFirst({ where: { code: "IND" } });
      }
    }

    if (!branch) {
      return NextResponse.json({ success: false, error: "No branch found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        pincode: branch.pincode,
        phone: branch.phone,
        gstin: branch.gstin,
        fssaiNumber: branch.fssaiNumber,
        cgstRate: branch.cgstRate,
        sgstRate: branch.sgstRate,
        igstRate: branch.igstRate,
        isTaxInclusive: branch.isTaxInclusive,
        currentFiscalYr: branch.currentFiscalYr,
      },
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
    const {
      branchId,
      name,
      address,
      city,
      state,
      pincode,
      phone,
      gstin,
      fssaiNumber,
      cgstRate,
      sgstRate,
      igstRate,
      isTaxInclusive,
      currentFiscalYr,
    } = body;

    const branch = await verifyBranchOwnership(tenantCtx, branchId || "IND");

    const updated = await prisma.branch.update({
      where: { id: branch.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(address ? { address: address.trim() } : {}),
        ...(city ? { city: city.trim() } : {}),
        ...(state ? { state: state.trim() } : {}),
        ...(pincode ? { pincode: pincode.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(gstin ? { gstin: gstin.trim() } : {}),
        ...(fssaiNumber ? { fssaiNumber: fssaiNumber.trim() } : {}),
        ...(cgstRate !== undefined ? { cgstRate: Number(cgstRate) } : {}),
        ...(sgstRate !== undefined ? { sgstRate: Number(sgstRate) } : {}),
        ...(igstRate !== undefined ? { igstRate: Number(igstRate) } : {}),
        ...(isTaxInclusive !== undefined ? { isTaxInclusive: Boolean(isTaxInclusive) } : {}),
        ...(currentFiscalYr ? { currentFiscalYr: currentFiscalYr.trim() } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "BRANCH_SETTINGS_UPDATED",
        entityType: "BRANCH",
        entityId: updated.id,
        authorizedBy: `${tenantCtx.email} (${tenantCtx.role})`,
        details: `Updated statutory and GST settings for branch '${updated.name}' (${updated.code})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Settings for '${updated.name}' updated successfully!`,
      branch: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
