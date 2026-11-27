import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";
import { createPhonePeCheckoutOrder, getPhonePeConfig } from "@/lib/server/phonepe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN"]);

    const body = await req.json().catch(() => ({}));
    const planCode = String(body.planCode || "GROWTH").toUpperCase();
    const billingCycle: "MONTHLY" | "ANNUAL" =
      String(body.billingCycle || "MONTHLY").toUpperCase() === "ANNUAL" ? "ANNUAL" : "MONTHLY";

    const origin = req.nextUrl.origin;
    const cfg = getPhonePeConfig(origin);

    if (cfg.mode === "unconfigured") {
      return NextResponse.json(
        {
          success: false,
          code: "PHONEPE_NOT_CONFIGURED",
          error:
            "PhonePe Payment Gateway credentials are not configured yet. Add PHONEPE_CLIENT_ID & PHONEPE_CLIENT_SECRET (or v1 Merchant ID & Salt Key) in your server .env file.",
        },
        { status: 503 }
      );
    }

    const [org, plan] = await Promise.all([
      prisma.organization.findUnique({ where: { id: tenantCtx.organizationId } }),
      prisma.subscriptionPlan.findUnique({ where: { code: planCode } }),
    ]);

    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }
    if (!plan || !plan.isActive) {
      return NextResponse.json({ success: false, error: `Plan '${planCode}' not found` }, { status: 404 });
    }

    const amountInr = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
    const amountPaise = Math.max(100, Math.round(amountInr * 100));

    const merchantOrderId = `PP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const redirectUrl = `${cfg.appUrl}/subscription?phonepeOrderId=${encodeURIComponent(merchantOrderId)}`;
    const callbackUrl = `${cfg.appUrl}/api/webhooks/phonepe`;

    const now = new Date();
    const durationDays = billingCycle === "ANNUAL" ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Record PENDING invoice and metadata prior to redirecting to PhonePe
    await prisma.subscriptionInvoice.create({
      data: {
        organizationId: org.id,
        invoiceNumber: merchantOrderId,
        amount: amountInr,
        currency: "INR",
        status: "PENDING",
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        paymentMethod: "PHONEPE",
        razorpayOrderId: merchantOrderId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PHONEPE_ORDER_INITIATED",
        entityType: "SUBSCRIPTION_INVOICE",
        entityId: merchantOrderId,
        authorizedBy: tenantCtx.email,
        reason: `Initiated PhonePe ${billingCycle} checkout for ${plan.code}`,
        details: JSON.stringify({
          organizationId: org.id,
          planCode: plan.code,
          billingCycle,
          amount: amountInr,
        }),
      },
    });

    const checkout = await createPhonePeCheckoutOrder(cfg, {
      merchantOrderId,
      amountPaise,
      redirectUrl,
      callbackUrl,
      message: `DineSutra ${plan.name} (${billingCycle}) — SutraUniverse`,
      merchantUserId: org.id.slice(0, 32),
      mobileNumber: org.contactPhone,
      metaInfo: {
        udf1: org.id,
        udf2: plan.code,
        udf3: billingCycle,
      },
    });

    await prisma.subscriptionInvoice.update({
      where: { invoiceNumber: merchantOrderId },
      data: {
        razorpayOrderId: checkout.orderId,
      },
    });

    return NextResponse.json({
      success: true,
      merchantOrderId,
      phonepeOrderId: checkout.orderId,
      redirectUrl: checkout.redirectUrl,
      amount: amountInr,
      planCode: plan.code,
      billingCycle,
      env: cfg.env,
    });
  } catch (error: any) {
    console.error("[PhonePe Create Order Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate PhonePe checkout" },
      { status: error.statusCode || 500 }
    );
  }
}
