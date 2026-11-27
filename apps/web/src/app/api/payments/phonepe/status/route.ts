import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";
import {
  fetchPhonePeOrderStatus,
  getPhonePeConfig,
  reconcilePhonePeOrderInDb,
} from "@/lib/server/phonepe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const merchantOrderId = (req.nextUrl.searchParams.get("merchantOrderId") || "").trim();

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "merchantOrderId query parameter is required" },
        { status: 400 }
      );
    }

    const existingInvoice = await prisma.subscriptionInvoice.findUnique({
      where: { invoiceNumber: merchantOrderId },
    });

    if (!existingInvoice) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (
      existingInvoice.organizationId !== tenantCtx.organizationId &&
      tenantCtx.role !== "PLATFORM_OWNER"
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized order access" }, { status: 403 });
    }

    if (existingInvoice.status === "PAID") {
      return NextResponse.json({
        success: true,
        status: "PAID",
        merchantOrderId,
        transactionId: existingInvoice.razorpayPaymentId,
        paymentMode: existingInvoice.paymentMethod,
        invoice: existingInvoice,
      });
    }

    const cfg = getPhonePeConfig(req.nextUrl.origin);
    if (cfg.mode === "unconfigured") {
      return NextResponse.json(
        { success: false, error: "PhonePe gateway not configured on server" },
        { status: 503 }
      );
    }

    const remoteStatus = await fetchPhonePeOrderStatus(cfg, merchantOrderId);
    const reconciled = await reconcilePhonePeOrderInDb({
      merchantOrderId,
      state: remoteStatus.state,
      phonepeOrderId: remoteStatus.phonepeOrderId,
      transactionId: remoteStatus.transactionId,
      amountPaise: remoteStatus.amountPaise,
      paymentMode: remoteStatus.paymentMode,
    });

    return NextResponse.json({
      success: true,
      status: reconciled.status,
      merchantOrderId,
      transactionId: remoteStatus.transactionId,
      paymentMode: remoteStatus.paymentMode,
      invoice: "invoice" in reconciled ? reconciled.invoice : existingInvoice,
    });
  } catch (error: any) {
    console.error("[PhonePe Order Status Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment status" },
      { status: error.statusCode || 500 }
    );
  }
}
