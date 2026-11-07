/**
 * Seed Platform Super Admin, Subscription Plans, Subscriptions and Invoices
 */

import { prisma } from "../src/lib/server/prisma";
import bcrypt from "bcryptjs";

async function seedPlatformAdmin() {
  console.log(">>> Seeding Platform Super Admin & Subscription Plans...");

  // 1. Create or Find Platform HQ Organization
  let platformOrg = await prisma.organization.findUnique({
    where: { slug: "platform-hq" },
  });

  if (!platformOrg) {
    platformOrg = await prisma.organization.create({
      data: {
        name: "RestaurantOS Platform Headquarters",
        slug: "platform-hq",
        contactEmail: "platform@restaurantos.io",
        contactPhone: "+91 80 4000 0000",
        businessType: "MULTI_CHAIN",
        subscriptionPlan: "ENTERPRISE",
        status: "ACTIVE",
      },
    });
    console.log("Created Platform HQ Organization:", platformOrg.id);
  }

  // 2. Create Super Admin UserAccount
  const superAdminEmail = "superadmin@restaurantos.io";
  let superAdmin = await prisma.userAccount.findUnique({
    where: { email: superAdminEmail },
  });

  const passwordHash = await bcrypt.hash("AdminPassword123!", 10);

  if (!superAdmin) {
    superAdmin = await prisma.userAccount.create({
      data: {
        organizationId: platformOrg.id,
        email: superAdminEmail,
        passwordHash,
        name: "Platform Super Administrator",
        role: "PLATFORM_OWNER",
        phone: "+91 99999 00000",
        isActive: true,
      },
    });
    console.log("Created Platform Super Admin user:", superAdmin.email);
  } else {
    await prisma.userAccount.update({
      where: { id: superAdmin.id },
      data: { role: "PLATFORM_OWNER", passwordHash, isActive: true },
    });
    console.log("Updated Platform Super Admin user:", superAdmin.email);
  }

  // 3. Create / Upsert 4 Subscription Plans
  const plans = [
    {
      code: "STARTER",
      name: "Starter",
      description: "Ideal for small standalone cafes, food trucks and kiosks",
      monthlyPrice: 499.0,
      annualPrice: 4990.0,
      maxBranches: 1,
      maxEmployees: 5,
      storageLimitMB: 500,
      allowedModules: JSON.stringify(["pos", "orders", "menu", "tables"]),
      hasAdvancedReporting: false,
      hasApiIntegrations: false,
      hasCustomDomain: false,
    },
    {
      code: "GROWTH",
      name: "Growth",
      description: "Perfect for growing restaurants and busy cloud kitchens",
      monthlyPrice: 999.0,
      annualPrice: 9990.0,
      maxBranches: 3,
      maxEmployees: 20,
      storageLimitMB: 2000,
      allowedModules: JSON.stringify(["pos", "orders", "menu", "tables", "kds", "inventory", "crm"]),
      hasAdvancedReporting: false,
      hasApiIntegrations: false,
      hasCustomDomain: false,
    },
    {
      code: "PRO",
      name: "Pro",
      description: "Full-scale restaurant management with multi-branch, accounting & KDS",
      monthlyPrice: 1999.0,
      annualPrice: 19990.0,
      maxBranches: 10,
      maxEmployees: 100,
      storageLimitMB: 10000,
      allowedModules: JSON.stringify([
        "pos",
        "orders",
        "menu",
        "tables",
        "kds",
        "inventory",
        "crm",
        "accounting",
        "reports",
        "attendance",
        "payroll",
        "branches",
      ]),
      hasAdvancedReporting: true,
      hasApiIntegrations: true,
      hasCustomDomain: true,
    },
    {
      code: "ENTERPRISE",
      name: "Enterprise",
      description: "Unlimited scale for enterprise restaurant chains & large franchises",
      monthlyPrice: 4999.0,
      annualPrice: 49990.0,
      maxBranches: 999,
      maxEmployees: 9999,
      storageLimitMB: 100000,
      allowedModules: JSON.stringify([
        "pos",
        "orders",
        "menu",
        "tables",
        "kds",
        "inventory",
        "crm",
        "accounting",
        "reports",
        "attendance",
        "payroll",
        "branches",
        "api",
        "audit",
      ]),
      hasAdvancedReporting: true,
      hasApiIntegrations: true,
      hasCustomDomain: true,
    },
  ];

  const planMap: Record<string, any> = {};

  for (const p of plans) {
    const upserted = await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        maxBranches: p.maxBranches,
        maxEmployees: p.maxEmployees,
        storageLimitMB: p.storageLimitMB,
        allowedModules: p.allowedModules,
        hasAdvancedReporting: p.hasAdvancedReporting,
        hasApiIntegrations: p.hasApiIntegrations,
        hasCustomDomain: p.hasCustomDomain,
      },
      create: p,
    });
    planMap[p.code] = upserted;
    console.log(`Plan [${p.code}] synchronized: ₹${p.monthlyPrice}/mo`);
  }

  // 4. Attach Subscriptions to Existing Organizations
  // Bawarchi Royale Hospitality -> PRO Plan (Monthly)
  const bawarchi = await prisma.organization.findUnique({
    where: { slug: "bawarchi-royale" },
  });

  if (bawarchi && planMap["PRO"]) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subBawarchi = await prisma.tenantSubscription.create({
      data: {
        organizationId: bawarchi.id,
        planId: planMap["PRO"].id,
        billingCycle: "MONTHLY",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: nextMonth,
        razorpaySubscriptionId: "sub_rzp_bawarchi_001",
        razorpayCustomerId: "cust_rzp_bawarchi",
      },
    });

    // Seed Invoice
    await prisma.subscriptionInvoice.create({
      data: {
        organizationId: bawarchi.id,
        subscriptionId: subBawarchi.id,
        invoiceNumber: "SUB-INV-2026-0001",
        amount: 1999.0,
        currency: "INR",
        status: "PAID",
        billingPeriodStart: new Date(),
        billingPeriodEnd: nextMonth,
        paymentMethod: "RAZORPAY",
        razorpayPaymentId: "pay_rzp_bawarchi_tx1",
        paidAt: new Date(),
      },
    });

    // Update organization renewal date
    await prisma.organization.update({
      where: { id: bawarchi.id },
      data: {
        subscriptionPlan: "PRO",
        subscriptionRenewal: nextMonth,
        status: "ACTIVE",
      },
    });
    console.log("Bawarchi Royale subscribed to PRO plan");
  }

  // Himalayan Momo & Chaat Co. -> GROWTH Plan (Monthly)
  const himalayan = await prisma.organization.findUnique({
    where: { slug: "himalayan-momo" },
  });

  if (himalayan && planMap["GROWTH"]) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subHimalayan = await prisma.tenantSubscription.create({
      data: {
        organizationId: himalayan.id,
        planId: planMap["GROWTH"].id,
        billingCycle: "MONTHLY",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: nextMonth,
        razorpaySubscriptionId: "sub_rzp_himalayan_002",
        razorpayCustomerId: "cust_rzp_himalayan",
      },
    });

    // Seed Invoice
    await prisma.subscriptionInvoice.create({
      data: {
        organizationId: himalayan.id,
        subscriptionId: subHimalayan.id,
        invoiceNumber: "SUB-INV-2026-0002",
        amount: 999.0,
        currency: "INR",
        status: "PAID",
        billingPeriodStart: new Date(),
        billingPeriodEnd: nextMonth,
        paymentMethod: "RAZORPAY",
        razorpayPaymentId: "pay_rzp_himalayan_tx2",
        paidAt: new Date(),
      },
    });

    await prisma.organization.update({
      where: { id: himalayan.id },
      data: {
        subscriptionPlan: "GROWTH",
        subscriptionRenewal: nextMonth,
        status: "ACTIVE",
      },
    });
    console.log("Himalayan Momo subscribed to GROWTH plan");
  }

  // 5. Create a Trial Restaurant (Cafe Mocha)
  let trialOrg = await prisma.organization.findUnique({
    where: { slug: "cafe-mocha" },
  });

  if (!trialOrg) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    trialOrg = await prisma.organization.create({
      data: {
        name: "Cafe Mocha Artisan Roastery",
        slug: "cafe-mocha",
        contactEmail: "owner@cafemocha.in",
        contactPhone: "+91 80 2555 3333",
        businessType: "CAFE",
        subscriptionPlan: "STARTER",
        subscriptionRenewal: trialEnd,
        status: "TRIALING",
      },
    });

    const trialPass = await bcrypt.hash("Password123!", 10);
    await prisma.userAccount.create({
      data: {
        organizationId: trialOrg.id,
        email: "owner@cafemocha.in",
        name: "Aman Verma",
        passwordHash: trialPass,
        role: "TENANT_OWNER",
        isActive: true,
      },
    });

    if (planMap["STARTER"]) {
      await prisma.tenantSubscription.create({
        data: {
          organizationId: trialOrg.id,
          planId: planMap["STARTER"].id,
          billingCycle: "TRIAL",
          status: "TRIALING",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        },
      });
    }
    console.log("Created Trial Organization: Cafe Mocha");
  }

  // 6. Create a Suspended Restaurant (Spice Route Express)
  let suspendedOrg = await prisma.organization.findUnique({
    where: { slug: "spice-route" },
  });

  if (!suspendedOrg) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 15);

    suspendedOrg = await prisma.organization.create({
      data: {
        name: "Spice Route Express Kiosk",
        slug: "spice-route",
        contactEmail: "admin@spiceroute.in",
        contactPhone: "+91 80 4111 2222",
        businessType: "CLOUD_KITCHEN",
        subscriptionPlan: "STARTER",
        subscriptionRenewal: pastDate,
        status: "SUSPENDED",
      },
    });

    const pass = await bcrypt.hash("Password123!", 10);
    await prisma.userAccount.create({
      data: {
        organizationId: suspendedOrg.id,
        email: "admin@spiceroute.in",
        name: "Rohan Nair",
        passwordHash: pass,
        role: "TENANT_OWNER",
        isActive: false,
      },
    });

    if (planMap["STARTER"]) {
      const sub = await prisma.tenantSubscription.create({
        data: {
          organizationId: suspendedOrg.id,
          planId: planMap["STARTER"].id,
          billingCycle: "MONTHLY",
          status: "EXPIRED",
          currentPeriodStart: pastDate,
          currentPeriodEnd: pastDate,
        },
      });

      // Failed invoice
      await prisma.subscriptionInvoice.create({
        data: {
          organizationId: suspendedOrg.id,
          subscriptionId: sub.id,
          invoiceNumber: "SUB-INV-2026-0003",
          amount: 499.0,
          currency: "INR",
          status: "FAILED",
          billingPeriodStart: pastDate,
          billingPeriodEnd: pastDate,
          paymentMethod: "RAZORPAY",
        },
      });
    }
    console.log("Created Suspended Organization: Spice Route Express");
  }

  console.log(">>> Platform Super Admin Seeding Completed Successfully!\n");
}

seedPlatformAdmin()
  .catch((e) => {
    console.error("Failed to seed platform admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
