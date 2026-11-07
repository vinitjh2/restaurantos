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
  "super-secret",
  "secret",
  "password",
  "12345678",
  "default-secret",
  "placeholder",
];

/**
 * Authoritatively retrieves and validates the application secret from environment variables.
 * Strictly prevents hardcoded fallbacks and insecure placeholders.
 */
export function getJwtSecret(): string {
  const secret = process.env.APP_SECRET || process.env.JWT_SECRET;

  if (!secret || secret.trim() === "") {
    throw new Error(
      "FATAL SECURITY CONFIGURATION ERROR: APP_SECRET environment variable is missing or empty. A secure cryptographic secret of at least 32 characters is required to operate RestaurantOS."
    );
  }

  if (secret.length < 32) {
    throw new Error(
      `FATAL SECURITY CONFIGURATION ERROR: APP_SECRET must be at least 32 characters in length for cryptographic integrity (currently ${secret.length} characters).`
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const lowerSecret = secret.toLowerCase();

  if (isProduction) {
    const isKnownPlaceholder = INSECURE_SECRET_PATTERNS.some(
      (pattern) => lowerSecret.includes(pattern) || lowerSecret === pattern
    );
    if (isKnownPlaceholder) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION ERROR: Insecure placeholder APP_SECRET detected in production environment. Generate a cryptographically random secret using 'openssl rand -base64 32'."
      );
    }
  }

  return secret;
}

export interface UserSessionPayload {
  userId: string;
  organizationId: string;
  organizationSlug: string;
  email: string;
  name: string;
  role: "PLATFORM_OWNER" | "TENANT_OWNER" | "TENANT_ADMIN" | "BRANCH_MANAGER" | "STAFF";
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
  const user = await prisma.userAccount.findUnique({
    where: { id: payload.userId },
    include: { organization: true },
  });

  if (!user) {
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

  // Verify Tenant Ownership: Platform owners have global access; tenant users only access their own
  if (
    tenantContext.role !== "PLATFORM_OWNER" &&
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
