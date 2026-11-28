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

    const telemetry = {
      tables: Array.isArray(body.tables) ? body.tables : [],
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
