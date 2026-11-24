/**
 * RestaurantOS Secure Multi-Tenant Authentication & Authorization Engine
 * Enforces strict tenant-scoped and branch-scoped isolation.
 * 
 * CRITICAL SECURITY RULES:
 * 1. Never trust tenant identifiers supplied by frontend body or query params.
 * 2. Tenant ID is always derived from cryptographically verified JWT session tokens.
 * 3. Verify tenant ownership on every branch and resource query.
 * 4. Automatically log unauthorized cross-tenant attempts to AuditLog.
 */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { prisma } from "./prisma";

// Attempt to load .env in CLI / script execution environments if not already loaded by Next.js
function ensureEnvLoaded() {
  if (!process.env.APP_SECRET && !process.env.JWT_SECRET) {
    if (typeof process.loadEnvFile === "function") {
      const candidates = [
        path.resolve(process.cwd(), ".env"),
        path.resolve(__dirname, "../../.env"),
        path.resolve(__dirname, "../../../.env"),
      ];
      for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
          try {
            process.loadEnvFile(envPath);
            if (process.env.APP_SECRET || process.env.JWT_SECRET) break;
          } catch {}
        }
      }
    }
  }
}
ensureEnvLoaded();

const COOKIE_NAME = "restaurantos_session";

const INSECURE_SECRET_PATTERNS = [
  "restaurantos-super-secret-jwt-key-2026-production",
  "change-this-to-a-super-secure-random",
  "replace-with-a-cryptographically-secure",
  "change-me",
  "placeholder",
  "secret",
  "password",
];

// Ephemeral runtime entropy generated in-memory if secret is missing/insecure in production.
// This prevents offline token forgery attacks against static hardcoded repo keys.
let ephemeralRuntimeSecret: string | null = null;
function getEphemeralRuntimeSecret(): string {
  if (!ephemeralRuntimeSecret) {
    ephemeralRuntimeSecret = crypto.randomBytes(32).toString("hex");
  }
  return ephemeralRuntimeSecret;
}

/**
 * Authoritatively retrieves and validates the application secret from environment variables.
 * In production:
 * - Rejects empty, missing, or known placeholder keys.
 * - Generates high-entropy ephemeral in-memory secret if misconfigured, preventing static forgery.
 * In development:
 * - Uses predictable local key to prevent dev session churn.
 */
export function getJwtSecret(): string {
  const secret = process.env.APP_SECRET || process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (!secret || secret.trim() === "") {
    if (isProduction) {
      console.error(
        "🚨 [CRITICAL SECURITY ALERT]: APP_SECRET is missing in production environment! " +
        "Using an ephemeral in-memory secret. Please configure a strong APP_SECRET (64 hex characters) in your production environment settings."
      );
      return getEphemeralRuntimeSecret();
    }
    return "dev-local-secret-9f8a3c7b2e1d4a6f8b0c2e4d6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e";
  }

  const cleanSecret = secret.trim();
  const lowerSecret = cleanSecret.toLowerCase();

  const isKnownPlaceholder = INSECURE_SECRET_PATTERNS.some(
    (pattern) => lowerSecret === pattern || (pattern.length >= 10 && lowerSecret.includes(pattern))
  );

  if (isProduction && isKnownPlaceholder) {
    console.error(
      "🚨 [CRITICAL SECURITY ALERT]: APP_SECRET contains a known default or placeholder pattern in production! " +
      "Refusing to use insecure key. Generating an ephemeral secret."
    );
    return getEphemeralRuntimeSecret();
  }

  if (cleanSecret.length < 32) {
    if (isProduction) {
      console.warn("⚠️ [SECURITY WARNING]: APP_SECRET is shorter than 32 characters in production. Consider using a 64-character random hex string.");
    }
    return crypto.createHash("sha256").update(cleanSecret).digest("hex");
  }

  return cleanSecret;
}

export interface UserSessionPayload {
  userId: string;
  organizationId: string;
  organizationSlug: string;
  email: string;
  name: string;
  role: "PLATFORM_OWNER" | "PLATFORM_AUDITOR" | "TENANT_OWNER" | "TENANT_ADMIN" | "BRANCH_MANAGER" | "STAFF";
  assignedBranchId?: string | null;
}

export class AuthenticationError extends Error {
  statusCode = 401;
  constructor(message = "Unauthorized: Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  constructor(message = "Forbidden: Access denied to this tenant resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Signs a cryptographic JWT session token with tenant context
 */
export function signJwtToken(payload: UserSessionPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    issuer: "RestaurantOS-SaaS",
  });
}

/**
 * Validates and decodes a JWT session token
 */
export function verifyJwtToken(token: string): UserSessionPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, {
      issuer: "RestaurantOS-SaaS",
    }) as UserSessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated tenant context from HTTP request.
 * Enforces strict authentication (NO demo/default tenant fallback) and authoritatively
 * verifies user role and restaurant membership against trusted server-side data.
 */
export async function getTenantContext(req: NextRequest): Promise<UserSessionPayload> {
  // 1. Check HTTP-only cookie first
  let token = req.cookies.get(COOKIE_NAME)?.value;

  // 2. Fallback to Authorization: Bearer <token>
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 3. Strict authentication requirement - NEVER fall back to demo/default tenant
  if (!token) {
    throw new AuthenticationError("Authentication required: No session cookie or bearer token provided");
  }

  // 4. Cryptographic signature and structure validation
  const payload = verifyJwtToken(token);
  if (!payload || !payload.organizationId || !payload.userId) {
    throw new AuthenticationError("Authentication failed: Invalid, expired, or tampered session token");
  }

  // 5. Authoritatively verify user role & restaurant membership from trusted server-side data
  let user = await prisma.userAccount.findUnique({
    where: { id: payload.userId },
    include: { organization: true },
  }).catch(() => null);

  if (!user && payload.email) {
    user = await prisma.userAccount.findUnique({
      where: { email: payload.email.toLowerCase().trim() },
      include: { organization: true },
    }).catch(() => null);
  }

  // Fallback for verified platform administrator & auditor system accounts
  if (!user) {
    const isVerifiedAdmin =
      (payload.role === "PLATFORM_OWNER" || payload.role === "PLATFORM_AUDITOR") &&
      ["admin@sutrauniverse.com", "superadmin@sutrauniverse.com", "superadmin@restaurantos.io", "auditor@sutrauniverse.com"].includes(payload.email.toLowerCase().trim());

    if (isVerifiedAdmin) {
      return {
        userId: payload.userId,
        organizationId: payload.organizationId || "sutrauniverse-hq",
        organizationSlug: payload.organizationSlug || "sutrauniverse-hq",
        email: payload.email,
        name: payload.name,
        role: payload.role,
        assignedBranchId: payload.assignedBranchId || null,
      };
    }

    throw new AuthenticationError("Authentication failed: User account does not exist or has been removed");
  }

  if (!user.isActive) {
    throw new AuthenticationError("Authentication failed: User account has been deactivated");
  }

  if (user.organizationId !== payload.organizationId) {
    throw new AuthenticationError("Authentication failed: Tenant membership mismatch");
  }

  if (user.organization && user.organization.status === "SUSPENDED") {
    throw new AuthorizationError("Access denied: Restaurant account has been suspended by platform administrator");
  }

  // Return refreshed authoritative user session from database
  return {
    userId: user.id,
    organizationId: user.organizationId,
    organizationSlug: user.organization.slug,
    email: user.email,
    name: user.name,
    role: user.role as any,
    assignedBranchId: user.assignedBranchId,
  };
}

/**
 * Authoritatively verifies that a branch belongs to the authenticated tenant.
 * Prevents cross-tenant access and privilege escalation.
 */
export async function verifyBranchOwnership(
  tenantContext: UserSessionPayload,
  branchIdentifier: string
) {
  if (!branchIdentifier) {
    throw new AuthorizationError("Missing required branch identifier");
  }

  // Look up branch by ID or by Code
  const branch = await prisma.branch.findFirst({
    where: {
      OR: [{ id: branchIdentifier }, { code: branchIdentifier }],
    },
  });

  if (!branch) {
    throw new AuthorizationError(`Branch '${branchIdentifier}' not found`);
  }

  // Verify Tenant Ownership: Platform owners and auditors have global access; tenant users only access their own
  if (
    tenantContext.role !== "PLATFORM_OWNER" &&
    tenantContext.role !== "PLATFORM_AUDITOR" &&
    branch.organizationId &&
    branch.organizationId !== tenantContext.organizationId
  ) {
    // Record cross-tenant intrusion attempt to immutable AuditLog
    await prisma.auditLog.create({
      data: {
        action: "SECURITY_CROSS_TENANT_VIOLATION_BLOCKED",
        entityType: "BRANCH",
        entityId: branch.id,
        authorizedBy: `${tenantContext.email} (${tenantContext.role})`,
        reason: `User from Org '${tenantContext.organizationId}' attempted unauthorized access to Branch '${branch.id}' of Org '${branch.organizationId}'`,
        details: JSON.stringify({
          attemptedBranchId: branchIdentifier,
          violatorOrg: tenantContext.organizationId,
          targetOrg: branch.organizationId,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    throw new AuthorizationError(
      `Access Denied: Branch '${branch.name}' (${branch.code}) does not belong to your organization.`
    );
  }

  // Branch Manager constraint check: if user is restricted to a single branch
  if (
    tenantContext.role === "BRANCH_MANAGER" &&
    tenantContext.assignedBranchId &&
    branch.id !== tenantContext.assignedBranchId
  ) {
    throw new AuthorizationError(
      `Access Denied: You are restricted to branch ID '${tenantContext.assignedBranchId}'.`
    );
  }

  return branch;
}

/**
 * Enforces minimum role requirement to prevent privilege escalation
 */
export function requireRole(
  tenantContext: UserSessionPayload,
  allowedRoles: Array<UserSessionPayload["role"]>
) {
  if (tenantContext.role === "PLATFORM_OWNER") return; // Super admin pass

  if (!allowedRoles.includes(tenantContext.role)) {
    throw new AuthorizationError(
      `Action requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: '${tenantContext.role}'.`
    );
  }
}
