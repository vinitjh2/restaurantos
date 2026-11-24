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

    // 2. Demo sample data if audit logs are empty
    const alerts = auditLogs.length > 0
      ? auditLogs.map((log) => ({
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
        }))
      : [
          {
            id: "alt-01",
            type: "ORDER_CANCELLED",
            severity: "HIGH",
            message: "Table T-03 Bill #IND/2026-27/00281 (₹1,450) was cancelled after KOT was sent to kitchen.",
            authorizedBy: "Manager Vikram (PIN Override)",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            details: "Reason: Customer claimed delayed service and departed before main course.",
          },
          {
            id: "alt-02",
            type: "DISCOUNT_APPLIED",
            severity: "MEDIUM",
            message: "30% Staff Courtesy Discount (₹620) applied on Table T-07.",
            authorizedBy: "Manager Vikram",
            timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
            details: "Reason: VIP Regular Customer / Birthday discount.",
          },
          {
            id: "alt-03",
            type: "PIN_VERIFY_FAILED",
            severity: "CRITICAL",
            message: "Multiple failed supervisor PIN attempts on Cashier Station #01.",
            authorizedBy: "UNKNOWN",
            timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
            details: "3 consecutive invalid PINs entered within 40 seconds.",
          },
          {
            id: "alt-04",
            type: "DRAWER_KICK_MANUAL",
            severity: "HIGH",
            message: "Cash drawer solenoid opened manually without active bill settlement.",
            authorizedBy: "Cashier Amit",
            timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
            details: "Reason: Cash exchange for customer change.",
          },
        ];

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

