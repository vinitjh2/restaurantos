import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import {
  getPhonePeConfig,
  reconcilePhonePeOrderInDb,
  verifyPhonePeWebhookRequest,
} from "@/lib/server/phonepe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const cfg = getPhonePeConfig(req.nextUrl.origin);

    const isAuthentic = verifyPhonePeWebhookRequest(cfg, req.headers, rawBody);
    if (!isAuthentic) {
      console.warn("[PhonePe Webhook] Invalid webhook signature/authorization rejected.");
      return NextResponse.json(
        { success: false, error: "Invalid PhonePe webhook authorization" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);
    let eventType = String(body?.event || "PHONEPE_CALLBACK");
    let merchantOrderId = "";
    let phonepeOrderId = "";
    let transactionId = "";
    let amountPaise: number | undefined;
    let paymentMode: string | undefined;
    let state: "COMPLETED" | "FAILED" | "PENDING" = "PENDING";

    if (body?.payload && cfg.mode === "v2") {
      // Standard Checkout v2 payload
      const p = body.payload;
      merchantOrderId = String(p.merchantOrderId || "");
      phonepeOrderId = String(p.orderId || "");
      amountPaise = typeof p.amount === "number" ? p.amount : undefined;
      const firstDetail = Array.isArray(p.paymentDetails) ? p.paymentDetails[0] : null;
      transactionId = String(firstDetail?.transactionId || phonepeOrderId || "");
      paymentMode = firstDetail?.paymentMode;

      const rawState = String(p.state || "").toUpperCase();
      if (rawState === "COMPLETED" || eventType === "checkout.order.completed") {
        state = "COMPLETED";
      } else if (rawState === "FAILED" || eventType === "checkout.order.failed") {
        state = "FAILED";
      }
    } else if (body?.response && cfg.mode === "v1") {
      // Legacy PG v1 base64 callback payload
      const decoded = JSON.parse(Buffer.from(body.response, "base64").toString("utf8"));
      eventType = String(decoded?.code || "PHONEPE_V1_CALLBACK");
      const d = decoded?.data || {};
      merchantOrderId = String(d.merchantTransactionId || "");
      phonepeOrderId = String(d.transactionId || "");
      transactionId = String(d.transactionId || "");
      amountPaise = typeof d.amount === "number" ? d.amount : undefined;
      paymentMode = d.paymentInstrument?.type;

      const codeUpper = eventType.toUpperCase();
      const stateUpper = String(d.state || "").toUpperCase();
      if (codeUpper === "PAYMENT_SUCCESS" || stateUpper === "COMPLETED") {
        state = "COMPLETED";
      } else if (codeUpper === "PAYMENT_ERROR" || codeUpper === "PAYMENT_DECLINED" || stateUpper === "FAILED") {
        state = "FAILED";
      }
    }

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing merchantOrderId in webhook payload" },
        { status: 400 }
      );
    }

    const eventId = `pp_${merchantOrderId}_${state}`;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existingEvent) {
      return NextResponse.json({ success: true, message: "Duplicate event ignored", eventId });
    }

    await reconcilePhonePeOrderInDb({
      merchantOrderId,
      state,
      phonepeOrderId,
      transactionId,
      amountPaise,
      paymentMode,
    });

    await prisma.webhookEvent.create({
      data: {
        provider: "PHONEPE",
        eventId,
        eventType,
        payload: rawBody,
        status: "PROCESSED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "PhonePe webhook processed",
      eventId,
      merchantOrderId,
      state,
    });
  } catch (error: any) {
    console.error("[PhonePe Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "PhonePe webhook processing error" },
      { status: 500 }
    );
  }
}
