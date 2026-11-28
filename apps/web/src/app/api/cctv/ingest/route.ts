import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-cctv-token") || "";
    const body = await req.json();
    const cameraId = String(body.cameraId || "").trim();

    if (!token || !cameraId) {
      return NextResponse.json(
        { success: false, error: "Missing cameraId or x-cctv-token header" },
        { status: 401 }
      );
    }

    const camera = await prisma.cctvCamera.findUnique({ where: { id: cameraId } });
    if (!camera || !camera.isActive) {
      return NextResponse.json({ success: false, error: "Camera not found or inactive" }, { status: 404 });
    }

    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(camera.edgeToken, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ success: false, error: "Invalid edge token" }, { status: 401 });
    }

    // Cross-reference active POS/KOT orders so tables already served don't fire false SLA alerts
    const activeOrders = await prisma.order.findMany({
      where: {
        branchId: camera.branchId,
        status: { in: ["OPEN", "KOT_SENT", "PREPARING", "READY"] },
        tableNumber: { not: null },
      },
      select: { tableNumber: true },
    });
    const servedTables = new Set(
      activeOrders.map((o) => String(o.tableNumber || "").trim().toUpperCase())
    );

    const rawTables = Array.isArray(body.tables) ? body.tables : [];
    const enrichedTables = rawTables.map((t: any) => {
      const tNum = String(t.tableNumber || t.id || "").trim().toUpperCase();
      const hasKot = servedTables.has(tNum);
      const isBreach = t.status === "SLA_BREACH" && !hasKot;
      return {
        ...t,
        waiterArrived: Boolean(t.waiterArrived || hasKot),
        status: isBreach ? "SLA_BREACH" : t.status === "SLA_BREACH" && hasKot ? "SEATED" : t.status,
        noWaiterAlert: isBreach,
      };
    });

    const telemetry = {
      tables: enrichedTables,
      detections: Array.isArray(body.detections) ? body.detections : [],
      fps: Number(body.fps || 0),
      model: String(body.model || "YOLOv8n"),
      updatedAt: new Date().toISOString(),
    };

    const snapshot =
      typeof body.snapshotBase64 === "string" && body.snapshotBase64.length < 350_000
        ? body.snapshotBase64
        : undefined;

    await prisma.cctvCamera.update({
      where: { id: camera.id },
      data: {
        lastHeartbeatAt: new Date(),
        lastTelemetryJson: JSON.stringify(telemetry),
        ...(snapshot !== undefined ? { lastSnapshotBase64: snapshot } : {}),
      },
    });

    // Record SLA breach alerts in AuditLog (throttled per camera every 5 minutes)
    const breached = enrichedTables.filter((t: any) => t.status === "SLA_BREACH");
    if (breached.length > 0) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentAlert = await prisma.auditLog.findFirst({
        where: {
          branchId: camera.branchId,
          action: "CCTV_WAITER_SLA_BREACH",
          entityId: camera.id,
          createdAt: { gte: fiveMinsAgo },
        },
      });
      if (!recentAlert) {
        await prisma.auditLog.create({
          data: {
            branchId: camera.branchId,
            action: "CCTV_WAITER_SLA_BREACH",
            entityType: "CctvCamera",
            entityId: camera.id,
            details: `Unattended table alert on ${camera.name}: ${breached.map((b: any) => b.tableNumber).join(", ")}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      tableZones: JSON.parse(camera.tableZones || "[]"),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Ingest failed" },
      { status: 500 }
    );
  }
}
