import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "restaurantos_rzp_webhook_secret_2026";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("[Razorpay Webhook] Invalid HMAC-SHA256 signature rejected.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const eventType = payload.event;

    // 2. Duplicate-Event Protection (Strict Idempotency)
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      console.log(`[Razorpay Webhook] Duplicate event '${eventId}' ignored (idempotent).`);
      return NextResponse.json({
        success: true,
        message: "Event already processed",
        eventId,
      });
    }

    // 3. Process Specific Razorpay Event
    console.log(`[Razorpay Webhook] Processing event: ${eventType} (ID: ${eventId})`);

    if (eventType === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const organizationId = paymentEntity?.notes?.organizationId;
      const planCode = paymentEntity?.notes?.planCode || "GROWTH";

      if (organizationId) {
        const org = await prisma.organization.findUnique({
          where: { id: organizationId },
        });

        if (org) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          // Update organization subscription status
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              status: "ACTIVE",
              subscriptionPlan: planCode,
              subscriptionRenewal: nextMonth,
            },
          });

          // Create Paid Subscription Invoice
          await prisma.subscriptionInvoice.create({
            data: {
              organizationId,
              invoiceNumber: `SUB-INV-${Date.now().toString().slice(-6)}`,
              amount: (paymentEntity.amount || 0) / 100, // paise to INR
              currency: paymentEntity.currency || "INR",
              status: "PAID",
              billingPeriodStart: new Date(),
              billingPeriodEnd: nextMonth,
              paymentMethod: "RAZORPAY",
              razorpayPaymentId: paymentEntity.id,
              paidAt: new Date(),
            },
          });
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const organizationId = paymentEntity?.notes?.organizationId;

      if (organizationId) {
        await prisma.subscriptionInvoice.create({
          data: {
            organizationId,
            invoiceNumber: `SUB-FAIL-${Date.now().toString().slice(-6)}`,
            amount: (paymentEntity.amount || 0) / 100,
            currency: paymentEntity.currency || "INR",
            status: "FAILED",
            billingPeriodStart: new Date(),
            billingPeriodEnd: new Date(),
            paymentMethod: "RAZORPAY",
            razorpayPaymentId: paymentEntity.id,
          },
        });
      }
    } else if (eventType === "subscription.cancelled") {
      const subEntity = payload.payload?.subscription?.entity;
      const subId = subEntity?.id;

      if (subId) {
        await prisma.tenantSubscription.updateMany({
          where: { razorpaySubscriptionId: subId },
          data: {
            status: "CANCELLED",
            cancelAtPeriodEnd: true,
            cancelledAt: new Date(),
          },
        });
      }
    }

    // 4. Save Event Record in Database for Idempotency
    await prisma.webhookEvent.create({
      data: {
        provider: "RAZORPAY",
        eventId,
        eventType,
        payload: rawBody,
        status: "PROCESSED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      eventId,
    });
  } catch (error: any) {
    console.error("[Razorpay Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
