import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const cameras = await prisma.cctvCamera.findMany({
      where: { organizationId: tenantCtx.organizationId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, cameras });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load cameras" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN", "BRANCH_MANAGER"]);

    const body = await req.json();
    const name = String(body.name || "").trim();
    const rtspUrl = String(body.rtspUrl || "").trim();
    const brand = String(body.brand || "CP_PLUS").trim();
    const branchId = String(body.branchId || tenantCtx.assignedBranchId || "default");

    if (!name || !rtspUrl) {
      return NextResponse.json(
        { success: false, error: "Camera name and RTSP URL are required" },
        { status: 400 }
      );
    }

    if (!rtspUrl.toLowerCase().startsWith("rtsp://")) {
      return NextResponse.json(
        { success: false, error: "Stream URL must start with rtsp://" },
        { status: 400 }
      );
    }

    const camera = await prisma.cctvCamera.create({
      data: {
        organizationId: tenantCtx.organizationId,
        branchId,
        name,
        brand,
        rtspUrl,
        edgeToken: `cctv_${crypto.randomBytes(20).toString("hex")}`,
        tableZones: JSON.stringify(Array.isArray(body.tableZones) ? body.tableZones : []),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, camera }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create camera" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN", "BRANCH_MANAGER"]);

    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Camera id is required" }, { status: 400 });
    }

    const existing = await prisma.cctvCamera.findFirst({
      where: { id, organizationId: tenantCtx.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Camera not found" }, { status: 404 });
    }

    const updated = await prisma.cctvCamera.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(body.brand !== undefined ? { brand: String(body.brand).trim() } : {}),
        ...(body.rtspUrl !== undefined ? { rtspUrl: String(body.rtspUrl).trim() } : {}),
        ...(body.tableZones !== undefined
          ? {
              tableZones:
                typeof body.tableZones === "string"
                  ? body.tableZones
                  : JSON.stringify(body.tableZones),
            }
          : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, camera: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update camera" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN", "BRANCH_MANAGER"]);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Camera id is required" }, { status: 400 });
    }

    const existing = await prisma.cctvCamera.findFirst({
      where: { id, organizationId: tenantCtx.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Camera not found" }, { status: 404 });
    }

    await prisma.cctvCamera.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete camera" },
      { status: error.statusCode || 500 }
    );
  }
}
