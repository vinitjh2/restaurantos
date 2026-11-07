import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.syncStatus = status;
    }

    const [totalOps, conflictOps, syncedOps, operations, uniqueDevices] = await Promise.all([
      prisma.syncOperation.count(),
      prisma.syncOperation.count({ where: { syncStatus: "CONFLICT" } }),
      prisma.syncOperation.count({ where: { syncStatus: "SYNCED" } }),
      prisma.syncOperation.findMany({
        where,
        orderBy: { serverTimestamp: "desc" },
        take: limit,
      }),
      prisma.syncOperation.findMany({
        select: { deviceId: true },
        distinct: ["deviceId"],
      }),
    ]);

    const successRate = totalOps > 0 ? Math.round((syncedOps / totalOps) * 100) : 100;
    const lastOp = operations[0];

    const formattedOps = operations.map((op) => {
      let parsedPayload = null;
      try {
        parsedPayload = JSON.parse(op.payload);
      } catch {
        parsedPayload = op.payload;
      }

      return {
        id: op.id,
        operationId: op.operationId,
        deviceId: op.deviceId,
        tenantId: op.tenantId,
        branchId: op.branchId,
        userId: op.userId,
        operationType: op.operationType,
        clientTimestamp: op.clientTimestamp.toISOString(),
        serverTimestamp: op.serverTimestamp.toISOString(),
        syncStatus: op.syncStatus,
        conflictReason: op.conflictReason,
        entityType: op.entityType,
        entityId: op.entityId,
        payloadSummary: parsedPayload?.orderNumber || parsedPayload?.itemsSummary || "Payload",
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalOperations: totalOps,
        totalSynced: syncedOps,
        totalConflicts: conflictOps,
        totalDevices: uniqueDevices.length,
        successRate,
        lastSyncTimestamp: lastOp?.serverTimestamp.toISOString() || null,
      },
      operations: formattedOps,
    });
  } catch (error: any) {
    console.error("Sync monitor API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, operationId } = body;

    if (action === "RESOLVE_CONFLICT" && operationId) {
      const updated = await prisma.syncOperation.update({
        where: { operationId },
        data: {
          syncStatus: "RESOLVED",
          conflictReason: `Resolved by administrator on ${new Date().toLocaleString("en-IN")}`,
        },
      });

      return NextResponse.json({ success: true, updated });
    }

    if (action === "CLEAR_HISTORY") {
      await prisma.syncOperation.deleteMany({
        where: { syncStatus: "SYNCED" },
      });
      return NextResponse.json({ success: true, message: "Cleared synced history" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
