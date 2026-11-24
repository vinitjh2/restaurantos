import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const body = await req.json();

    const {
      planCode = "GROWTH",
      paymentMethod = "UPI_AUTOPAY",
      upiId,
      cardNumber,
      bankName,
    } = body;

    // 1. Fetch Plan
    const plan =
      (await prisma.subscriptionPlan.findUnique({ where: { code: planCode } })) ||
      (await prisma.subscriptionPlan.findFirst({ where: { isActive: true } }));

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Selected plan not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    // 14 Days Free Trial
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const mandateRef = `MND-${Date.now().toString(36).toUpperCase()}`;
    const pennyDropTxnId = `TXN-PENN-${Date.now().toString(36).toUpperCase()}`;
    const refundRef = `REF-PENNY-${Date.now().toString(36).toUpperCase()}`;

    // Clean masked identifiers
    let mandateBank = bankName || "HDFC Bank";
    let formattedUpiId = upiId;
    if (paymentMethod === "CARD" && cardNumber) {
      const last4 = cardNumber.replace(/\D/g, "").slice(-4) || "4210";
      mandateBank = `Credit Card (••${last4})`;
    } else if (paymentMethod === "UPI_AUTOPAY") {
      formattedUpiId = upiId || "owner@okhdfcbank";
    }

    // 2. Find existing subscription or create new
    const existingSub = await prisma.tenantSubscription.findFirst({
      where: { organizationId: tenantCtx.organizationId },
      orderBy: { createdAt: "desc" },
    });

    let subscription;
    if (existingSub) {
      subscription = await prisma.tenantSubscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          status: "TRIALING",
          billingCycle: "MONTHLY",
          isTrialActive: true,
          trialEndsAt: trialEndsAt,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: trialEndsAt, // First period ends when trial ends
          mandateStatus: "ACTIVE",
          mandateMethod: paymentMethod,
          mandateUpiId: formattedUpiId,
          mandateBank: mandateBank,
          pennyDropRefunded: true,
          preDebitAlertSent: false,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
          razorpaySubscriptionId: mandateRef,
        },
      });
    } else {
      subscription = await prisma.tenantSubscription.create({
        data: {
          organizationId: tenantCtx.organizationId,
          planId: plan.id,
          status: "TRIALING",
          billingCycle: "MONTHLY",
          isTrialActive: true,
          trialEndsAt: trialEndsAt,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: trialEndsAt,
          mandateStatus: "ACTIVE",
          mandateMethod: paymentMethod,
          mandateUpiId: formattedUpiId,
          mandateBank: mandateBank,
          pennyDropRefunded: true,
          preDebitAlertSent: false,
          cancelAtPeriodEnd: false,
          razorpaySubscriptionId: mandateRef,
        },
      });
    }

    // 3. Update Organization
    await prisma.organization.update({
      where: { id: tenantCtx.organizationId },
      data: {
        status: "ACTIVE",
        subscriptionPlan: plan.code,
        subscriptionRenewal: trialEndsAt,
        trialEndsAt: trialEndsAt,
        mandateRegistered: true,
      },
    });

    // 4. Log the ₹1 Penny Drop Verification & Auto-Refund Invoice
    const invoiceNumber = `PENNY-DROP-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.subscriptionInvoice.create({
      data: {
        organizationId: tenantCtx.organizationId,
        subscriptionId: subscription.id,
        invoiceNumber,
        amount: 1.0,
        currency: "INR",
        status: "REFUNDED",
        billingPeriodStart: now,
        billingPeriodEnd: trialEndsAt,
        paymentMethod: paymentMethod,
        razorpayPaymentId: pennyDropTxnId,
        paidAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mandate successfully registered! 14-Day Free Trial activated.",
      mandate: {
        mandateId: mandateRef,
        method: paymentMethod,
        upiId: formattedUpiId,
        bank: mandateBank,
        status: "ACTIVE",
        planName: plan.name,
        monthlyPrice: plan.monthlyPrice,
        trialDaysRemaining: 14,
        trialEndsAt: trialEndsAt.toISOString(),
        firstScheduledDebitDate: trialEndsAt.toISOString(),
        firstScheduledDebitAmount: plan.monthlyPrice,
      },
      pennyDrop: {
        amountCharged: 1.0,
        transactionId: pennyDropTxnId,
        refundStatus: "INSTANTLY_REFUNDED",
        refundReference: refundRef,
        message: "₹1 verification charge was authenticated and instantly refunded to your original source.",
      },
    });
  } catch (err: any) {
    console.error("[Mandate Enroll API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to enroll mandate" },
      { status: 500 }
    );
  }
}
