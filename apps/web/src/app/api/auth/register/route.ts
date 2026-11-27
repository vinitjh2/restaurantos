import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/lib/server/auth-context";
import { createPhonePeCheckoutOrder, getPhonePeConfig } from "@/lib/server/phonepe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantName,
      slug,
      businessType, // CAFE, CLOUD_KITCHEN, RESTAURANT, BAKERY, MULTI_CHAIN
      ownerName,
      email,
      password,
      phone,
      branchName,
      address,
      city,
      state,
      pincode,
      gstin,
      fssaiNumber,
      subscriptionPlan, // STARTER, GROWTH, PRO, ENTERPRISE
      billingCycle: rawCycle,
    } = body;

    // Validation
    if (!restaurantName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Restaurant Name, Email, and Password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Normalize legacy plan code aliases to match SubscriptionPlan table
    const rawPlanCode = String(subscriptionPlan || "GROWTH").trim().toUpperCase();
    const requestedPlanCode = rawPlanCode === "PROFESSIONAL" ? "PRO" : rawPlanCode;
    const billingCycle: "MONTHLY" | "ANNUAL" =
      String(rawCycle || "MONTHLY").toUpperCase() === "ANNUAL" ? "ANNUAL" : "MONTHLY";

    // Auto-generate clean URL slug if not provided
    const cleanSlug = (slug || restaurantName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check email uniqueness
    const existingUser = await prisma.userAccount.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check slug uniqueness
    const existingOrg = await prisma.organization.findUnique({ where: { slug: cleanSlug } });
    const finalSlug = existingOrg ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    // Resolve chosen plan from SubscriptionPlan table
    const plan =
      (await prisma.subscriptionPlan.findUnique({ where: { code: requestedPlanCode } })) ||
      (await prisma.subscriptionPlan.findFirst({ where: { isActive: true }, orderBy: { monthlyPrice: "asc" } }));

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "No active subscription plans available" },
        { status: 500 }
      );
    }

    const amountInr = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
    const amountPaise = Math.max(100, Math.round(amountInr * 100));
    const merchantOrderId = `PP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date();
    const durationDays = billingCycle === "ANNUAL" ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanPrefix = restaurantName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "RST";
    const branchCode = `${cleanPrefix}${Date.now().toString().slice(-3)}`;

    // Atomic transaction: Create Organization (PENDING_PAYMENT) + Owner + Initial Outlet + Pending Invoice
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: restaurantName.trim(),
          slug: finalSlug,
          businessType: businessType || "RESTAURANT",
          contactEmail: email.toLowerCase().trim(),
          contactPhone: phone || null,
          currency: "INR",
          status: "PENDING_PAYMENT",
          subscriptionPlan: plan.code,
          subscriptionRenewal: null,
          mandateRegistered: false,
        },
      });

      const userAccount = await tx.userAccount.create({
        data: {
          organizationId: organization.id,
          email: email.toLowerCase().trim(),
          passwordHash,
          name: ownerName || "Restaurant Owner",
          phone: phone || null,
          role: "TENANT_OWNER",
        },
      });

      const initialBranch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: branchName?.trim() || `${restaurantName.trim()} — Main Outlet`,
          code: branchCode,
          address: address?.trim() || "",
          city: city?.trim() || "",
          state: state?.trim() || "",
          pincode: pincode?.trim() || "",
          phone: phone?.trim() || "",
          gstin: gstin?.trim() || "",
          fssaiNumber: fssaiNumber?.trim() || "",
          cgstRate: 2.5,
          sgstRate: 2.5,
          igstRate: 5.0,
          isTaxInclusive: false,
          currentFiscalYr: "2026-27",
        },
      });

      // Default table seats scoped by branchCode prefix
      const defaultTables = ["T-01", "T-02", "T-03", "T-04", "T-05"];
      for (const tNum of defaultTables) {
        await tx.tableSeat.create({
          data: {
            tableNumber: `${branchCode}-${tNum}`,
            floor: "Main Dining Hall",
            capacity: 4,
            status: "AVAILABLE",
          },
        });
      }

      // Create PENDING subscription invoice prior to PhonePe redirect
      await tx.subscriptionInvoice.create({
        data: {
          organizationId: organization.id,
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

      await tx.auditLog.create({
        data: {
          action: "ORGANIZATION_REGISTERED",
          entityType: "ORGANIZATION",
          entityId: organization.id,
          authorizedBy: userAccount.email,
          details: `Registered tenant '${organization.name}' with branch '${initialBranch.name}' (${initialBranch.code})`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "PHONEPE_ORDER_INITIATED",
          entityType: "SUBSCRIPTION_INVOICE",
          entityId: merchantOrderId,
          authorizedBy: userAccount.email,
          reason: `Initiated onboarding PhonePe ${billingCycle} checkout for ${plan.code}`,
          details: JSON.stringify({
            organizationId: organization.id,
            planCode: plan.code,
            billingCycle,
            amount: amountInr,
          }),
        },
      });

      return { organization, userAccount, initialBranch };
    });

    // Generate PhonePe PG checkout link immediately after registration
    let checkoutUrl: string | null = null;
    let phonepeOrderId: string | null = null;
    let paymentError: string | null = null;

    const cfg = getPhonePeConfig(req.nextUrl.origin);
    if (cfg.mode !== "unconfigured") {
      try {
        const redirectUrl = `${cfg.appUrl}/subscription?phonepeOrderId=${encodeURIComponent(merchantOrderId)}&onboarding=1`;
        const callbackUrl = `${cfg.appUrl}/api/webhooks/phonepe`;
        const checkout = await createPhonePeCheckoutOrder(cfg, {
          merchantOrderId,
          amountPaise,
          redirectUrl,
          callbackUrl,
          message: `DineSutra ${plan.name} (${billingCycle}) — SutraUniverse`,
          merchantUserId: result.organization.id.slice(0, 32),
          mobileNumber: phone || null,
          metaInfo: {
            udf1: result.organization.id,
            udf2: plan.code,
            udf3: billingCycle,
          },
        });
        checkoutUrl = checkout.redirectUrl;
        phonepeOrderId = checkout.orderId;
        await prisma.subscriptionInvoice.update({
          where: { invoiceNumber: merchantOrderId },
          data: { razorpayOrderId: checkout.orderId },
        });
      } catch (pgErr: any) {
        console.error("[Register PhonePe Checkout Error]:", pgErr);
        paymentError = pgErr.message || "Unable to initiate PhonePe checkout immediately.";
      }
    } else {
      paymentError = "PhonePe gateway is not configured on this server yet.";
    }

    // Generate JWT session cookie so verification & subscription routes work seamlessly
    const token = signJwtToken({
      userId: result.userAccount.id,
      organizationId: result.organization.id,
      organizationSlug: result.organization.slug,
      email: result.userAccount.email,
      name: result.userAccount.name,
      role: result.userAccount.role as any,
      assignedBranchId: null,
    });

    const response = NextResponse.json({
      success: true,
      paymentRequired: true,
      checkoutUrl,
      fallbackUrl: "/subscription?paymentRequired=1",
      merchantOrderId,
      phonepeOrderId,
      amount: amountInr,
      planCode: plan.code,
      billingCycle,
      paymentError,
      message: checkoutUrl
        ? `Account created! Redirecting to PhonePe Checkout (₹${amountInr})...`
        : `Account created! Please complete PhonePe payment on your Subscription page.`,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        status: result.organization.status,
        businessType: result.organization.businessType,
        subscriptionPlan: result.organization.subscriptionPlan,
      },
      branch: {
        id: result.initialBranch.id,
        name: result.initialBranch.name,
        code: result.initialBranch.code,
      },
      user: {
        id: result.userAccount.id,
        email: result.userAccount.email,
        name: result.userAccount.name,
        role: result.userAccount.role,
      },
      token,
    });

    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";

    response.cookies.set("restaurantos_session", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Restaurant registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register restaurant" },
      { status: 500 }
    );
  }
}
