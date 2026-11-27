import crypto from "crypto";
import { prisma } from "@/lib/server/prisma";

export type PhonePeEnv = "production" | "sandbox";
export type PhonePeAuthMode = "v2" | "v1" | "unconfigured";

export interface PhonePeConfig {
  env: PhonePeEnv;
  mode: PhonePeAuthMode;
  merchantId: string;
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  saltKey: string;
  saltIndex: string;
  webhookUsername: string;
  webhookPassword: string;
  oauthUrl: string;
  apiBaseUrl: string;
  appUrl: string;
}

let cachedV2Token: { token: string; expiresAtMs: number; key: string } | null = null;

export function getPhonePeConfig(requestOrigin?: string): PhonePeConfig {
  const rawEnv = (process.env.PHONEPE_ENV || "sandbox").toLowerCase().trim();
  const env: PhonePeEnv = rawEnv === "production" || rawEnv === "prod" || rawEnv === "live" ? "production" : "sandbox";

  const clientId = (process.env.PHONEPE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PHONEPE_CLIENT_SECRET || "").trim();
  const clientVersion = (process.env.PHONEPE_CLIENT_VERSION || "1").trim();
  const merchantId = (process.env.PHONEPE_MERCHANT_ID || "").trim();
  const saltKey = (process.env.PHONEPE_SALT_KEY || "").trim();
  const saltIndex = (process.env.PHONEPE_SALT_INDEX || "1").trim();
  const webhookUsername = (process.env.PHONEPE_WEBHOOK_USERNAME || "").trim();
  const webhookPassword = (process.env.PHONEPE_WEBHOOK_PASSWORD || "").trim();

  let mode: PhonePeAuthMode = "unconfigured";
  if (clientId && clientSecret) {
    mode = "v2";
  } else if (merchantId && saltKey) {
    mode = "v1";
  }

  const oauthUrl =
    env === "production"
      ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

  const apiBaseUrl =
    mode === "v1"
      ? env === "production"
        ? "https://api.phonepe.com/apis/hermes"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox"
      : env === "production"
      ? "https://api.phonepe.com/apis/pg"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox";

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    requestOrigin ||
    "https://dine.sutrauniverse.com"
  ).replace(/\/+$/, "");

  return {
    env,
    mode,
    merchantId,
    clientId,
    clientSecret,
    clientVersion,
    saltKey,
    saltIndex,
    webhookUsername,
    webhookPassword,
    oauthUrl,
    apiBaseUrl,
    appUrl,
  };
}

async function getPhonePeV2AccessToken(cfg: PhonePeConfig): Promise<string> {
  const cacheKey = `${cfg.env}:${cfg.clientId}:${cfg.clientVersion}`;
  if (
    cachedV2Token &&
    cachedV2Token.key === cacheKey &&
    Date.now() < cachedV2Token.expiresAtMs - 60_000
  ) {
    return cachedV2Token.token;
  }

  const formBody = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    client_version: cfg.clientVersion || "1",
    grant_type: "client_credentials",
  });

  const res = await fetch(cfg.oauthUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error(
      data?.message || data?.error_description || `PhonePe OAuth token failed (${res.status})`
    );
  }

  // PhonePe expires_at can be epoch seconds or milliseconds
  let expiresAtMs = Date.now() + 10 * 60_000;
  if (typeof data.expires_at === "number") {
    expiresAtMs = data.expires_at > 1e12 ? data.expires_at : data.expires_at * 1000;
  } else if (typeof data.expires_in === "number") {
    expiresAtMs = Date.now() + data.expires_in * 1000;
  }

  cachedV2Token = {
    token: data.access_token,
    expiresAtMs,
    key: cacheKey,
  };

  return data.access_token;
}

export interface CreatePhonePePaymentInput {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
  callbackUrl: string;
  message: string;
  merchantUserId: string;
  mobileNumber?: string | null;
  metaInfo?: Record<string, string>;
}

export interface CreatePhonePePaymentOutput {
  orderId: string;
  redirectUrl: string;
  state: string;
}

export async function createPhonePeCheckoutOrder(
  cfg: PhonePeConfig,
  input: CreatePhonePePaymentInput
): Promise<CreatePhonePePaymentOutput> {
  if (cfg.mode === "unconfigured") {
    throw new Error("PhonePe API credentials are not configured in environment variables");
  }

  if (cfg.mode === "v2") {
    const token = await getPhonePeV2AccessToken(cfg);
    const payload = {
      merchantOrderId: input.merchantOrderId,
      amount: input.amountPaise,
      expireAfter: 1200,
      metaInfo: input.metaInfo || {},
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: input.message,
        merchantUrls: {
          redirectUrl: input.redirectUrl,
        },
      },
    };

    const res = await fetch(`${cfg.apiBaseUrl}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.redirectUrl) {
      throw new Error(data?.message || data?.code || `PhonePe v2 checkout failed (${res.status})`);
    }

    return {
      orderId: data.orderId || input.merchantOrderId,
      redirectUrl: data.redirectUrl,
      state: data.state || "PENDING",
    };
  }

  // PhonePe PG v1 fallback
  const v1Body = {
    merchantId: cfg.merchantId,
    merchantTransactionId: input.merchantOrderId,
    merchantUserId: input.merchantUserId,
    amount: input.amountPaise,
    redirectUrl: input.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: input.callbackUrl,
    ...(input.mobileNumber ? { mobileNumber: input.mobileNumber.replace(/\D/g, "").slice(-10) } : {}),
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(v1Body)).toString("base64");
  const checksum =
    crypto
      .createHash("sha256")
      .update(`${base64Payload}/pg/v1/pay${cfg.saltKey}`)
      .digest("hex") + `###${cfg.saltIndex}`;

  const res = await fetch(`${cfg.apiBaseUrl}/pg/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url;
  if (!res.ok || !data?.success || !redirectUrl) {
    throw new Error(data?.message || data?.code || `PhonePe v1 checkout failed (${res.status})`);
  }

  return {
    orderId: data?.data?.merchantTransactionId || input.merchantOrderId,
    redirectUrl,
    state: "PENDING",
  };
}

export interface NormalizedPhonePeStatus {
  state: "COMPLETED" | "FAILED" | "PENDING";
  merchantOrderId: string;
  phonepeOrderId?: string;
  transactionId?: string;
  amountPaise?: number;
  paymentMode?: string;
  raw: any;
}

export async function fetchPhonePeOrderStatus(
  cfg: PhonePeConfig,
  merchantOrderId: string
): Promise<NormalizedPhonePeStatus> {
  if (cfg.mode === "unconfigured") {
    throw new Error("PhonePe API credentials are not configured");
  }

  if (cfg.mode === "v2") {
    const token = await getPhonePeV2AccessToken(cfg);
    const res = await fetch(
      `${cfg.apiBaseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || `PhonePe v2 status check failed (${res.status})`);
    }

    const rawState = String(data?.state || "PENDING").toUpperCase();
    const state: NormalizedPhonePeStatus["state"] =
      rawState === "COMPLETED" ? "COMPLETED" : rawState === "FAILED" ? "FAILED" : "PENDING";

    const firstDetail = Array.isArray(data?.paymentDetails) ? data.paymentDetails[0] : null;
    return {
      state,
      merchantOrderId,
      phonepeOrderId: data?.orderId,
      transactionId: firstDetail?.transactionId || data?.orderId,
      amountPaise: typeof data?.amount === "number" ? data.amount : firstDetail?.amount,
      paymentMode: firstDetail?.paymentMode,
      raw: data,
    };
  }

  // v1 status endpoint
  const path = `/pg/v1/status/${encodeURIComponent(cfg.merchantId)}/${encodeURIComponent(merchantOrderId)}`;
  const checksum =
    crypto
      .createHash("sha256")
      .update(`${path}${cfg.saltKey}`)
      .digest("hex") + `###${cfg.saltIndex}`;

  const res = await fetch(`${cfg.apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": cfg.merchantId,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `PhonePe v1 status check failed (${res.status})`);
  }

  const code = String(data?.code || "").toUpperCase();
  const stateVal = String(data?.data?.state || "").toUpperCase();
  const state: NormalizedPhonePeStatus["state"] =
    code === "PAYMENT_SUCCESS" || stateVal === "COMPLETED"
      ? "COMPLETED"
      : code === "PAYMENT_ERROR" || code === "PAYMENT_DECLINED" || stateVal === "FAILED"
      ? "FAILED"
      : "PENDING";

  return {
    state,
    merchantOrderId,
    phonepeOrderId: data?.data?.transactionId,
    transactionId: data?.data?.transactionId,
    amountPaise: data?.data?.amount,
    paymentMode: data?.data?.paymentInstrument?.type,
    raw: data,
  };
}

export function verifyPhonePeWebhookRequest(
  cfg: PhonePeConfig,
  headers: Headers,
  rawBody: string
): boolean {
  if (cfg.mode === "v2") {
    if (!cfg.webhookUsername || !cfg.webhookPassword) return false;
    const authHeader = (headers.get("authorization") || "").trim();
    if (!authHeader) return false;

    const cleanIncoming = authHeader.replace(/^SHA256\s+/i, "").trim().toLowerCase();
    const expectedHex = crypto
      .createHash("sha256")
      .update(`${cfg.webhookUsername}:${cfg.webhookPassword}`)
      .digest("hex")
      .toLowerCase();

    const a = Buffer.from(cleanIncoming, "utf8");
    const b = Buffer.from(expectedHex, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  if (cfg.mode === "v1") {
    const xVerify = (headers.get("x-verify") || "").trim();
    if (!xVerify || !cfg.saltKey) return false;
    try {
      const parsed = JSON.parse(rawBody);
      const base64Response = parsed?.response;
      if (!base64Response) return false;
      const expected =
        crypto
          .createHash("sha256")
          .update(`${base64Response}${cfg.saltKey}`)
          .digest("hex") + `###${cfg.saltIndex}`;
      const a = Buffer.from(xVerify, "utf8");
      const b = Buffer.from(expected, "utf8");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  return false;
}

export async function reconcilePhonePeOrderInDb(params: {
  merchantOrderId: string;
  state: "COMPLETED" | "FAILED" | "PENDING";
  phonepeOrderId?: string;
  transactionId?: string;
  amountPaise?: number;
  paymentMode?: string;
}) {
  const { merchantOrderId, state, phonepeOrderId, transactionId, amountPaise, paymentMode } = params;

  const invoice = await prisma.subscriptionInvoice.findUnique({
    where: { invoiceNumber: merchantOrderId },
  });

  if (!invoice) {
    return { found: false as const, status: "NOT_FOUND" as const };
  }

  if (invoice.status === "PAID") {
    return { found: true as const, status: "PAID" as const, alreadyProcessed: true, invoice };
  }

  if (state === "FAILED") {
    const updated = await prisma.subscriptionInvoice.update({
      where: { id: invoice.id },
      data: {
        status: "FAILED",
        razorpayOrderId: phonepeOrderId || invoice.razorpayOrderId,
        razorpayPaymentId: transactionId || invoice.razorpayPaymentId,
      },
    });
    return { found: true as const, status: "FAILED" as const, invoice: updated };
  }

  if (state !== "COMPLETED") {
    return { found: true as const, status: "PENDING" as const, invoice };
  }

  // Validate paid amount matches invoiced amount (paise tolerance <= 100 paise)
  if (typeof amountPaise === "number" && amountPaise + 100 < Math.round(invoice.amount * 100)) {
    throw new Error(
      `Amount mismatch for order ${merchantOrderId}: expected >= ₹${invoice.amount}, got ₹${amountPaise / 100}`
    );
  }

  // Retrieve plan & billing cycle metadata saved during order initiation
  const initAudit = await prisma.auditLog.findFirst({
    where: {
      action: "PHONEPE_ORDER_INITIATED",
      entityId: merchantOrderId,
    },
    orderBy: { timestamp: "desc" },
  });

  let planCode = "GROWTH";
  let billingCycle: "MONTHLY" | "ANNUAL" = "MONTHLY";
  if (initAudit?.details) {
    try {
      const parsed = JSON.parse(initAudit.details);
      if (parsed.planCode) planCode = String(parsed.planCode);
      if (parsed.billingCycle === "ANNUAL") billingCycle = "ANNUAL";
    } catch {}
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { code: planCode },
  });

  const now = new Date();
  const durationDays = billingCycle === "ANNUAL" ? 365 : 30;
  const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const methodLabel = paymentMode ? `PHONEPE_${paymentMode}` : "PHONEPE";

  const result = await prisma.$transaction(async (tx) => {
    let subscriptionId = invoice.subscriptionId;

    if (plan) {
      const sub = await tx.tenantSubscription.create({
        data: {
          organizationId: invoice.organizationId,
          planId: plan.id,
          billingCycle,
          status: "ACTIVE",
          isTrialActive: false,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          mandateStatus: "ACTIVE",
          mandateMethod: methodLabel,
          razorpaySubscriptionId: phonepeOrderId || merchantOrderId,
        },
      });
      subscriptionId = sub.id;
    }

    await tx.organization.update({
      where: { id: invoice.organizationId },
      data: {
        status: "ACTIVE",
        subscriptionPlan: planCode,
        subscriptionRenewal: periodEnd,
      },
    });

    const updatedInvoice = await tx.subscriptionInvoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        subscriptionId,
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        paymentMethod: methodLabel,
        razorpayOrderId: phonepeOrderId || merchantOrderId,
        razorpayPaymentId: transactionId || phonepeOrderId || merchantOrderId,
        paidAt: now,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "SUBSCRIPTION_PAYMENT_VERIFIED",
        entityType: "SUBSCRIPTION_INVOICE",
        entityId: updatedInvoice.id,
        authorizedBy: "PhonePe PG",
        reason: `Verified ${billingCycle} ${planCode} payment (₹${invoice.amount})`,
        details: JSON.stringify({
          merchantOrderId,
          phonepeOrderId,
          transactionId,
          paymentMode,
          amount: invoice.amount,
        }),
      },
    });

    return updatedInvoice;
  });

  return {
    found: true as const,
    status: "PAID" as const,
    alreadyProcessed: false,
    planCode,
    billingCycle,
    invoice: result,
  };
}
