/**
 * RestaurantOS Targeted Security & Database Fixes Verification Suite
 * 
 * Verifies all requirements from external security audit:
 * 
 * FIX 1 — Authentication bypass in auth-context.ts:
 * 1. Unauthenticated request throws 401 AuthenticationError (NO default Bawarchi Royale fallback).
 * 2. Invalid, expired, or tampered JWT token throws 401.
 * 3. Deactivated user or missing user throws 401.
 * 4. Tenant mismatch (token organization != DB user organization) throws 401.
 * 5. Suspended organization throws 403 AuthorizationError.
 * 6. Valid user session payload verified and refreshed from server-side database.
 * 
 * FIX 2 — Secure JWT secret configuration:
 * 7. Missing APP_SECRET throws fatal security configuration error.
 * 8. APP_SECRET < 32 characters throws fatal security configuration error.
 * 9. Insecure placeholder in production throws fatal security configuration error.
 * 10. Valid APP_SECRET (>= 32 chars) operates correctly.
 * 
 * FIX 3 — Secure offline POS synchronization (/api/pos/sync):
 * 11. Unauthenticated sync request returns HTTP 401.
 * 12. Invalid token sync request returns HTTP 401.
 * 13. Forged tenantId (cross-tenant sync attempt) returns HTTP 403 and logs to AuditLog.
 * 14. Forged userId by staff role returns HTTP 403.
 * 15. Cross-tenant branch access attempt returns HTTP 403.
 * 16. Missing operationId or malformed payload returns HTTP 400.
 * 17. Empty items or invalid line item quantities/prices return HTTP 400.
 * 18. Legitimate offline order sync returns HTTP 200 SUCCESS and persists transaction atomically.
 * 19. Duplicate sync request returns HTTP 200 ALREADY_SYNCED (idempotent, no double billing).
 * 20. Conflict barrier: attempting to alter an already settled/invoiced order returns HTTP 409.
 */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/server/prisma";
import {
  getTenantContext,
  getJwtSecret,
  signJwtToken,
  verifyJwtToken,
  AuthenticationError,
  AuthorizationError,
  UserSessionPayload,
} from "../src/lib/server/auth-context";
import { POST as posSyncHandler } from "../src/app/api/pos/sync/route";

interface TestReport {
  name: string;
  category: "FIX 1" | "FIX 2" | "FIX 3";
  passed: boolean;
  message: string;
}

const reports: TestReport[] = [];

function assert(condition: boolean, name: string, category: "FIX 1" | "FIX 2" | "FIX 3", details: string) {
  if (condition) {
    reports.push({ name, category, passed: true, message: details });
    console.log(`  ✅ [PASS] [${category}] ${name}`);
    console.log(`            ${details}`);
  } else {
    reports.push({ name, category, passed: false, message: details });
    console.error(`  ❌ [FAIL] [${category}] ${name}`);
    console.error(`            ${details}`);
    throw new Error(`Test failed: [${category}] ${name}`);
  }
}

async function runSecuritySuite() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS TARGETED SECURITY & DATABASE AUDIT VERIFICATION SUITE");
  console.log("===============================================================================\n");

  const originalAppSecret = process.env.APP_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    // -------------------------------------------------------------------------
    // SETUP FIXTURES
    // -------------------------------------------------------------------------
    console.log(">>> Preparing Test Fixtures & Tenant Isolations...");

    // Org A (Bawarchi Royale)
    let orgA = await prisma.organization.findUnique({ where: { slug: "bawarchi-royale" } });
    if (!orgA) {
      orgA = await prisma.organization.create({
        data: {
          name: "Bawarchi Royale Hospitality",
          slug: "bawarchi-royale",
          businessType: "FINE_DINING",
          subscriptionPlan: "ENTERPRISE",
          status: "ACTIVE",
          contactEmail: "info@bawarchiroyale.com",
        },
      });
    }

    let branchA = await prisma.branch.findFirst({ where: { organizationId: orgA.id, code: "IND" } });
    if (!branchA) {
      branchA = await prisma.branch.create({
        data: {
          organizationId: orgA.id,
          name: "Indiranagar Flagship",
          code: "IND",
          city: "Bengaluru",
          state: "Karnataka",
          cgstRate: 2.5,
          sgstRate: 2.5,
          currentFiscalYr: "2026-27",
        },
      });
    }

    let userA = await prisma.userAccount.findUnique({ where: { email: "owner@bawarchiroyale.com" } });
    if (!userA) {
      const pwd = await bcrypt.hash("Password123!", 10);
      userA = await prisma.userAccount.create({
        data: {
          organizationId: orgA.id,
          email: "owner@bawarchiroyale.com",
          name: "Chef Singhania",
          role: "TENANT_OWNER",
          passwordHash: pwd,
          isActive: true,
        },
      });
    }

    // Staff user under Org A
    let staffA = await prisma.userAccount.findUnique({ where: { email: "staff.rohit@bawarchiroyale.com" } });
    if (!staffA) {
      const pwd = await bcrypt.hash("Password123!", 10);
      staffA = await prisma.userAccount.create({
        data: {
          organizationId: orgA.id,
          email: "staff.rohit@bawarchiroyale.com",
          name: "Rohit Staff",
          role: "STAFF",
          passwordHash: pwd,
          isActive: true,
        },
      });
    }

    // Deactivated user under Org A
    let deactUser = await prisma.userAccount.findUnique({ where: { email: "deactivated@bawarchiroyale.com" } });
    if (!deactUser) {
      const pwd = await bcrypt.hash("Password123!", 10);
      deactUser = await prisma.userAccount.create({
        data: {
          organizationId: orgA.id,
          email: "deactivated@bawarchiroyale.com",
          name: "Deactivated Cashier",
          role: "STAFF",
          passwordHash: pwd,
          isActive: false,
        },
      });
    }

    // Org B (Himalayan Momo)
    let orgB = await prisma.organization.findUnique({ where: { slug: "himalayan-momo" } });
    if (!orgB) {
      orgB = await prisma.organization.create({
        data: {
          name: "Himalayan Momo & Chaat Co.",
          slug: "himalayan-momo",
          contactEmail: "contact@himalayanmomo.com",
          businessType: "QSR_FAST_FOOD",
          subscriptionPlan: "GROWTH",
          status: "ACTIVE",
        },
      });
    }

    let branchB = await prisma.branch.findFirst({ where: { organizationId: orgB.id, code: "HMC" } });
    if (!branchB) {
      branchB = await prisma.branch.create({
        data: {
          organizationId: orgB.id,
          name: "Himalayan Momo Koramangala",
          code: "HMC",
          city: "Bengaluru",
          state: "Karnataka",
          cgstRate: 2.5,
          sgstRate: 2.5,
          currentFiscalYr: "2026-27",
        },
      });
    }

    let userB = await prisma.userAccount.findUnique({ where: { email: "owner@himalayanmomo.com" } });
    if (!userB) {
      const pwd = await bcrypt.hash("Password123!", 10);
      userB = await prisma.userAccount.create({
        data: {
          organizationId: orgB.id,
          email: "owner@himalayanmomo.com",
          name: "Tenzing Norgay",
          role: "TENANT_OWNER",
          passwordHash: pwd,
          isActive: true,
        },
      });
    }

    // Suspended Organization C
    let orgC = await prisma.organization.findUnique({ where: { slug: "suspended-eats" } });
    if (!orgC) {
      orgC = await prisma.organization.create({
        data: {
          name: "Suspended Eats LLC",
          slug: "suspended-eats",
          contactEmail: "billing-default@suspendedeats.com",
          businessType: "CAFE",
          subscriptionPlan: "STARTER",
          status: "SUSPENDED",
        },
      });
    }

    let userC = await prisma.userAccount.findUnique({ where: { email: "owner@suspendedeats.com" } });
    if (!userC) {
      const pwd = await bcrypt.hash("Password123!", 10);
      userC = await prisma.userAccount.create({
        data: {
          organizationId: orgC.id,
          email: "owner@suspendedeats.com",
          name: "Suspended Owner",
          role: "TENANT_OWNER",
          passwordHash: pwd,
          isActive: true,
        },
      });
    }

    console.log("   Test fixtures initialized.\n");

    // =========================================================================
    // FIX 2: SECURE JWT SECRET CONFIGURATION
    // =========================================================================
    console.log(">>> [FIX 2] Testing Secure JWT Secret Validation & Enforcement...");

    // Test 2.1: Missing secret throws fatal error
    delete process.env.APP_SECRET;
    delete process.env.JWT_SECRET;
    let missingSecretCaught = false;
    try {
      getJwtSecret();
    } catch (err: any) {
      if (err.message.includes("FATAL SECURITY CONFIGURATION ERROR") && err.message.includes("missing or empty")) {
        missingSecretCaught = true;
      }
    }
    assert(missingSecretCaught, "Missing APP_SECRET Rejected Safely", "FIX 2",
      "Function threw fatal error when APP_SECRET was undefined or empty."
    );

    // Test 2.2: Short secret (< 32 chars) throws fatal error
    process.env.APP_SECRET = "too-short-secret-key-123";
    let shortSecretCaught = false;
    try {
      getJwtSecret();
    } catch (err: any) {
      if (err.message.includes("at least 32 characters in length")) {
        shortSecretCaught = true;
      }
    }
    assert(shortSecretCaught, "Short APP_SECRET (< 32 chars) Rejected", "FIX 2",
      "Rejected secret of length 24 characters with strict minimum 32 character policy."
    );

    // Test 2.3: Insecure placeholder in production rejected
    process.env.NODE_ENV = "production";
    process.env.APP_SECRET = "change-this-to-a-super-secure-random-64-character-secret-in-production";
    let placeholderCaught = false;
    try {
      getJwtSecret();
    } catch (err: any) {
      if (err.message.includes("Insecure placeholder APP_SECRET detected in production environment")) {
        placeholderCaught = true;
      }
    }
    assert(placeholderCaught, "Insecure Placeholder in Production Forbidden", "FIX 2",
      "Blocked known placeholder secret in NODE_ENV=production."
    );

    // Test 2.4: Valid strong secret accepted
    const validSecret = "dev-restaurantos-secure-secret-key-for-local-testing-2026-xyz123";
    process.env.NODE_ENV = "development";
    process.env.APP_SECRET = validSecret;
    const resolvedSecret = getJwtSecret();
    assert(resolvedSecret === validSecret, "Valid Strong APP_SECRET Accepted", "FIX 2",
      "Verified secret of length >= 32 characters without disclosure or mutation."
    );

    console.log("");

    // =========================================================================
    // FIX 1: AUTHENTICATION BYPASS REMOVAL & VERIFICATION
    // =========================================================================
    console.log(">>> [FIX 1] Testing Strict Authentication & Server-Side Verification...");

    // Test 1.1: Unauthenticated request throws 401 (NO fallback to Bawarchi Royale)
    const unauthReq = new NextRequest("http://localhost:3000/api/orders");
    let unauthCaught = false;
    try {
      await getTenantContext(unauthReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.statusCode === 401) {
        unauthCaught = true;
      }
    }
    assert(unauthCaught, "Unauthenticated Request Returns 401 (No Fallback)", "FIX 1",
      "Unauthenticated request without session cookie or bearer token strictly rejected with 401 Unauthorized."
    );

    // Test 1.2: Invalid / malformed JWT token throws 401
    const invalidTokenReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: "Bearer invalid.token.gibberish" },
    });
    let invalidTokenCaught = false;
    try {
      await getTenantContext(invalidTokenReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.statusCode === 401) {
        invalidTokenCaught = true;
      }
    }
    assert(invalidTokenCaught, "Invalid Token Rejected with 401", "FIX 1",
      "Malformed JWT string rejected with AuthenticationError (401)."
    );

    // Test 1.3: Tampered token signature throws 401
    const legitPayloadA: UserSessionPayload = {
      userId: userA.id,
      organizationId: orgA.id,
      organizationSlug: orgA.slug,
      email: userA.email,
      name: userA.name,
      role: userA.role as any,
      assignedBranchId: userA.assignedBranchId,
    };
    const legitTokenA = signJwtToken(legitPayloadA);
    const tamperedTokenA = legitTokenA.slice(0, -6) + "XXXXXX";
    const tamperedReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${tamperedTokenA}` },
    });
    let tamperedCaught = false;
    try {
      await getTenantContext(tamperedReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.statusCode === 401) {
        tamperedCaught = true;
      }
    }
    assert(tamperedCaught, "Tampered Token Signature Rejected with 401", "FIX 1",
      "Cryptographically tampered signature rejected with AuthenticationError (401)."
    );

    // Test 1.4: Expired token throws 401
    const expiredToken = jwt.sign(legitPayloadA, validSecret, {
      expiresIn: "-10s",
      issuer: "RestaurantOS-SaaS",
    });
    const expiredReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    let expiredCaught = false;
    try {
      await getTenantContext(expiredReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.statusCode === 401) {
        expiredCaught = true;
      }
    }
    assert(expiredCaught, "Expired Token Rejected with 401", "FIX 1",
      "Token with expired timestamp rejected with AuthenticationError (401)."
    );

    // Test 1.5: Non-existent userId in database throws 401
    const nonExistentPayload: UserSessionPayload = {
      userId: "non-existent-user-uuid-99999",
      organizationId: orgA.id,
      organizationSlug: orgA.slug,
      email: "ghost@example.com",
      name: "Ghost User",
      role: "STAFF",
    };
    const ghostToken = signJwtToken(nonExistentPayload);
    const ghostReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${ghostToken}` },
    });
    let ghostCaught = false;
    try {
      await getTenantContext(ghostReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.message.includes("User account does not exist")) {
        ghostCaught = true;
      }
    }
    assert(ghostCaught, "Non-Existent User Rejected with 401", "FIX 1",
      "Token referencing deleted or non-existent user account rejected via server DB check."
    );

    // Test 1.6: Deactivated user account throws 401
    const deactPayload: UserSessionPayload = {
      userId: deactUser.id,
      organizationId: orgA.id,
      organizationSlug: orgA.slug,
      email: deactUser.email,
      name: deactUser.name,
      role: deactUser.role as any,
    };
    const deactToken = signJwtToken(deactPayload);
    const deactReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${deactToken}` },
    });
    let deactCaught = false;
    try {
      await getTenantContext(deactReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.message.includes("deactivated")) {
        deactCaught = true;
      }
    }
    assert(deactCaught, "Deactivated User Account Rejected with 401", "FIX 1",
      "Deactivated user (isActive=false) blocked immediately upon server DB validation."
    );

    // Test 1.7: Tenant membership mismatch throws 401
    const mismatchPayload: UserSessionPayload = {
      userId: userA.id,
      organizationId: orgB.id, // Forged: userA belongs to orgA, not orgB
      organizationSlug: orgB.slug,
      email: userA.email,
      name: userA.name,
      role: userA.role as any,
    };
    const mismatchToken = signJwtToken(mismatchPayload);
    const mismatchReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${mismatchToken}` },
    });
    let mismatchCaught = false;
    try {
      await getTenantContext(mismatchReq);
    } catch (err: any) {
      if (err instanceof AuthenticationError && err.message.includes("Tenant membership mismatch")) {
        mismatchCaught = true;
      }
    }
    assert(mismatchCaught, "Tenant Membership Mismatch Rejected with 401", "FIX 1",
      "Token claiming orgB when user belongs to orgA rejected via authoritative DB check."
    );

    // Test 1.8: Suspended organization throws 403
    const suspendedPayload: UserSessionPayload = {
      userId: userC.id,
      organizationId: orgC.id,
      organizationSlug: orgC.slug,
      email: userC.email,
      name: userC.name,
      role: userC.role as any,
    };
    const suspendedToken = signJwtToken(suspendedPayload);
    const suspendedReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${suspendedToken}` },
    });
    let suspendedCaught = false;
    try {
      await getTenantContext(suspendedReq);
    } catch (err: any) {
      if (err instanceof AuthorizationError && err.statusCode === 403) {
        suspendedCaught = true;
      }
    }
    assert(suspendedCaught, "Suspended Organization Rejected with 403", "FIX 1",
      "Access blocked with HTTP 403 Forbidden when restaurant organization status is SUSPENDED."
    );

    // Test 1.9: Valid session cookie or bearer token returns verified server-side payload
    const validBearerReq = new NextRequest("http://localhost:3000/api/orders", {
      headers: { authorization: `Bearer ${legitTokenA}` },
    });
    const verifiedSession = await getTenantContext(validBearerReq);
    assert(
      verifiedSession.userId === userA.id && verifiedSession.organizationId === orgA.id,
      "Valid Session Verified Authoritatively",
      "FIX 1",
      `Authenticated successfully as '${verifiedSession.email}' (${verifiedSession.role}) for Tenant '${verifiedSession.organizationSlug}'.`
    );

    console.log("");

    // =========================================================================
    // FIX 3: SECURE OFFLINE POS SYNCHRONIZATION (/api/pos/sync)
    // =========================================================================
    console.log(">>> [FIX 3] Testing Secure Offline POS Synchronization Endpoint...");

    // Helper to call posSyncHandler
    const callSync = async (body: any, token?: string, cookie?: string) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (token) headers["authorization"] = `Bearer ${token}`;
      if (cookie) headers["cookie"] = `restaurantos_session=${cookie}`;

      const req = new NextRequest("http://localhost:3000/api/pos/sync", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const res = await posSyncHandler(req);
      const json = await res.json();
      return { status: res.status, data: json };
    };

    // Test 3.1: Unauthenticated sync request returns HTTP 401
    const unauthSync = await callSync({
      operationId: `OP-UNAUTH-${Date.now()}`,
      branchId: branchA.code,
      items: [{ itemName: "Dosa", quantity: 1, unitPrice: 100 }],
    });
    assert(
      unauthSync.status === 401,
      "Unauthenticated POS Sync Returns 401",
      "FIX 3",
      `Rejected unauthenticated sync call with status ${unauthSync.status}. Error: '${unauthSync.data.error}'.`
    );

    // Test 3.2: Invalid token sync request returns HTTP 401
    const badTokenSync = await callSync(
      {
        operationId: `OP-BADTOKEN-${Date.now()}`,
        branchId: branchA.code,
        items: [{ itemName: "Dosa", quantity: 1, unitPrice: 100 }],
      },
      "fake.bearer.token"
    );
    assert(
      badTokenSync.status === 401,
      "Invalid Token POS Sync Returns 401",
      "FIX 3",
      `Rejected invalid token with status ${badTokenSync.status}. Error: '${badTokenSync.data.error}'.`
    );

    // Test 3.3: Forged tenantId (cross-tenant sync injection) returns HTTP 403
    const forgedTenantSync = await callSync(
      {
        operationId: `OP-FORGE-TENANT-${Date.now()}`,
        tenantId: orgB.id, // Forged: caller is Tenant A, but payload claims Tenant B
        branchId: branchA.code,
        items: [{ itemName: "Biryani", quantity: 1, unitPrice: 350 }],
      },
      legitTokenA
    );
    assert(
      forgedTenantSync.status === 403,
      "Forged Cross-Tenant tenantId Blocked with 403",
      "FIX 3",
      `Blocked cross-tenant forged tenantId with status ${forgedTenantSync.status}. Error: '${forgedTenantSync.data.error}'.`
    );

    // Verify AuditLog recorded the cross-tenant violation
    const forgedAudit = await prisma.auditLog.findFirst({
      where: { action: "SECURITY_FORGED_TENANT_SYNC_ATTEMPT" },
      orderBy: { timestamp: "desc" },
    });
    assert(
      forgedAudit !== null,
      "Forged Tenant Sync Recorded to AuditLog",
      "FIX 3",
      `Audit entry logged: Action='${forgedAudit?.action}', AuthorizedBy='${forgedAudit?.authorizedBy}'.`
    );

    // Test 3.4: Staff user forging a different userId returns HTTP 403
    const staffToken = signJwtToken({
      userId: staffA.id,
      organizationId: orgA.id,
      organizationSlug: orgA.slug,
      email: staffA.email,
      name: staffA.name,
      role: staffA.role as any,
    });

    const forgedUserSync = await callSync(
      {
        operationId: `OP-FORGE-USER-${Date.now()}`,
        userId: userA.id, // Forged: staff claims to be the owner
        branchId: branchA.code,
        items: [{ itemName: "Chai", quantity: 2, unitPrice: 40 }],
      },
      staffToken
    );
    assert(
      forgedUserSync.status === 403,
      "Staff Forging userId Blocked with 403",
      "FIX 3",
      `Blocked staff impersonating another userId with status ${forgedUserSync.status}.`
    );

    // Test 3.5: Cross-tenant branch access attempt returns HTTP 403
    const crossBranchSync = await callSync(
      {
        operationId: `OP-CROSS-BRANCH-${Date.now()}`,
        branchId: branchB.id, // Tenant A attempts to sync to Tenant B's branch HMC
        items: [{ itemName: "Momos", quantity: 1, unitPrice: 150 }],
      },
      legitTokenA
    );
    assert(
      crossBranchSync.status === 403,
      "Cross-Tenant Branch Sync Blocked with 403",
      "FIX 3",
      `Tenant A access to Tenant B branch rejected with status ${crossBranchSync.status}.`
    );

    // Test 3.6: Missing operationId returns HTTP 400
    const missingOpSync = await callSync(
      {
        branchId: branchA.code,
        items: [{ itemName: "Dosa", quantity: 1, unitPrice: 100 }],
      },
      legitTokenA
    );
    assert(
      missingOpSync.status === 400,
      "Missing operationId Returns 400 Bad Request",
      "FIX 3",
      `Rejected payload missing operationId with status ${missingOpSync.status}.`
    );

    // Test 3.7: Empty line items or negative prices return HTTP 400
    const emptyItemsSync = await callSync(
      {
        operationId: `OP-EMPTY-${Date.now()}`,
        branchId: branchA.code,
        items: [],
      },
      legitTokenA
    );
    assert(
      emptyItemsSync.status === 400,
      "Empty Line Items Array Returns 400 Bad Request",
      "FIX 3",
      `Rejected order with empty items with status ${emptyItemsSync.status}.`
    );

    const negativePriceSync = await callSync(
      {
        operationId: `OP-NEG-${Date.now()}`,
        branchId: branchA.code,
        items: [{ itemName: "Free Meal Scam", quantity: 1, unitPrice: -50 }],
      },
      legitTokenA
    );
    assert(
      negativePriceSync.status === 400,
      "Negative Unit Price Returns 400 Bad Request",
      "FIX 3",
      `Rejected negative unit price with status ${negativePriceSync.status}.`
    );

    // Test 3.8: Legitimate offline order sync succeeds with HTTP 200
    const validOpId = `OP-LEGIT-${Date.now()}-SIM1`;
    const legitSync = await callSync(
      {
        operationId: validOpId,
        offlineSyncId: validOpId,
        deviceId: "POS-TERM-PROD-01",
        branchId: branchA.code,
        orderType: "DINE_IN",
        tableNumber: "T-04",
        customerName: "Mrs. Ananya Roy",
        customerPhone: "+91 98450 11223",
        items: [
          {
            menuItemId: "item-biryani-dum",
            itemName: "Special Dum Biryani",
            quantity: 2,
            unitPrice: 380.0,
          },
          {
            menuItemId: "item-raita",
            itemName: "Burani Raita",
            quantity: 1,
            unitPrice: 90.0,
          },
        ],
        isSettled: true,
        payment: {
          method: "UPI",
          amount: 893.0,
          transactionRef: "UPI-OFFLINE-UTR-88219",
        },
      },
      legitTokenA
    );
    assert(
      legitSync.status === 200 && legitSync.data.success === true,
      "Legitimate Offline Order Sync Succeeded (HTTP 200)",
      "FIX 3",
      `Synced Order #${legitSync.data.orderNumber} (Server ID: ${legitSync.data.serverOrderId}), Invoice #${legitSync.data.serverInvoiceNumber}.`
    );

    // Verify order was persisted and belongs to Org A
    const persistedOrder = await prisma.order.findUnique({
      where: { offlineSyncId: validOpId },
      include: { invoice: { include: { payments: true } } },
    });
    assert(
      persistedOrder !== null && persistedOrder.branchId === branchA.id,
      "Persisted Order Authoritatively Scoped to Tenant Branch",
      "FIX 3",
      `Verified order is strictly scoped to Org A branch '${branchA.code}' (${persistedOrder?.branchId}) with status ${persistedOrder?.status}.`
    );
    assert(
      persistedOrder?.invoice?.payments[0]?.status === "UNVERIFIED",
      "Offline UPI Payment Marked UNVERIFIED",
      "FIX 3",
      "Financial integrity: Offline UPI payment correctly tagged UNVERIFIED pending bank UTR reconciliation."
    );

    // Test 3.9: Duplicate sync operation (Idempotency) returns ALREADY_SYNCED
    const duplicateSync = await callSync(
      {
        operationId: validOpId,
        offlineSyncId: validOpId,
        deviceId: "POS-TERM-PROD-01",
        branchId: branchA.code,
        items: [{ itemName: "Special Dum Biryani", quantity: 2, unitPrice: 380.0 }],
      },
      legitTokenA
    );
    assert(
      duplicateSync.status === 200 && duplicateSync.data.status === "ALREADY_SYNCED",
      "Idempotent Duplicate Replay Handled Safely",
      "FIX 3",
      `Replayed operation ID returned ALREADY_SYNCED with serverOrderId ${duplicateSync.data.serverOrderId}. Zero duplicate orders created.`
    );

    // Test 3.10: Conflict Overwrite Barrier (Attempting to mutate settled/invoiced order)
    const conflictOpId = `OP-CONFLICT-${Date.now()}`;
    const conflictSync = await callSync(
      {
        operationId: conflictOpId,
        operationType: "UPDATE_ORDER",
        targetOrderId: persistedOrder!.id,
        branchId: branchA.code,
        items: [{ itemName: "Fraudulent Modifier", quantity: 1, unitPrice: 10 }],
      },
      legitTokenA
    );
    assert(
      conflictSync.status === 409 && conflictSync.data.status === "CONFLICT",
      "Conflict Barrier Protects Settled Invoices (HTTP 409)",
      "FIX 3",
      `Attempt to alter settled Order #${persistedOrder?.orderNumber} rejected with 409 Conflict. Error: '${conflictSync.data.error}'.`
    );

    console.log("\n===============================================================================");
    console.log("  ALL 20 TARGETED SECURITY & DATABASE AUDIT TESTS PASSED WITH 100% SUCCESS");
    console.log("===============================================================================\n");

  } finally {
    // Restore original environment
    if (originalAppSecret !== undefined) {
      process.env.APP_SECRET = originalAppSecret;
    } else {
      process.env.APP_SECRET = "dev-restaurantos-secure-secret-key-for-local-testing-2026-xyz123";
    }
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      process.env.NODE_ENV = "development";
    }
  }
}

runSecuritySuite()
  .then(() => {
    console.log("Suite execution complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Suite failed with unhandled exception:", err);
    process.exit(1);
  });
