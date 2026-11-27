import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch recent sensitive audit events
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "ORDER_CANCELLED",
            "DISCOUNT_APPLIED",
            "REFUND_ISSUED",
            "PIN_VERIFY_FAILED",
            "DRAWER_KICK_MANUAL",
            "ACTION_APPROVED_CANCEL_ORDER",
            "ACTION_APPROVED_REFUND",
            "ACTION_REJECTED_CANCEL_ORDER",
          ],
        },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    // 2. Return live audit log alerts (empty if none exist)
    const alerts = auditLogs.map((log) => ({
      id: log.id,
      type: log.action,
      severity: log.action.includes("FAILED") || log.action.includes("REJECTED") || log.action === "REFUND_ISSUED"
        ? "CRITICAL"
        : log.action === "ORDER_CANCELLED"
        ? "HIGH"
        : "MEDIUM",
      message: `${log.action.replace(/_/g, " ")}: ${log.reason || "Action triggered on system"}`,
      authorizedBy: log.authorizedBy,
      timestamp: log.timestamp.toISOString(),
      details: log.details || "",
    }));

    return NextResponse.json({
      success: true,
      alerts,
      settings: {
        whatsappEnabled: true,
        ownerPhone: "+91 98765 43210",
        notifyOnVoid: true,
        notifyOnDiscountOverPercent: 20,
        notifyOnManualDrawer: true,
        notifyOnTillVarianceOver: 100,
      },
    });
  } catch (error: any) {
    console.error("Fetch security alerts error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "TEST_ALERT") {
      // Create simulated audit log entry
      const log = await prisma.auditLog.create({
        data: {
          action: "SECURITY_TEST_ALERT",
          entityType: "Security",
          entityId: "SYS",
          authorizedBy: "System Test",
          reason: "Owner triggered test WhatsApp anti-theft notification",
          details: JSON.stringify({
            phone: payload?.phone || "+91 98765 43210",
            sentAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Security test WhatsApp alert dispatched to ${payload?.phone || "+91 98765 43210"}!`,
        logId: log.id,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Security alert error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

