/**
 * RestaurantOS High-Security PIN Engine
 * 
 * Cryptographic Architecture:
 * 1. 4-digit PINs are peppered with an HMAC derived from the server's secret before hashing.
 *    This ensures that even if an attacker dumps the database, they cannot brute-force the 
 *    10,000 PIN combinations without the server-side environment secret.
 * 2. Peppered PINs are salted and hashed using bcrypt (10 rounds).
 * 3. Transparent Migration: Existing legacy plaintext PINs in the database will match seamlessly
 *    and are automatically upgraded to peppered bcrypt hashes upon first successful verification.
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";
import { getJwtSecret } from "./auth-context";

/**
 * Computes an HMAC pepper for a PIN using the authoritative application secret
 */
function getPepperedPin(rawPin: string): string {
  const secret = getJwtSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`restaurantos_secure_pin_${rawPin.trim()}`)
    .digest("hex");
}

/**
 * Hashes a 4-digit PIN using peppered bcrypt
 */
export async function hashPin(rawPin: string): Promise<string> {
  const peppered = getPepperedPin(rawPin);
  return await bcrypt.hash(peppered, 10);
}

/**
 * Verifies a candidate PIN against a stored hash or legacy plaintext string
 */
export async function verifyCandidatePin(
  candidatePin: string,
  storedValue: string
): Promise<{ matches: boolean; needsUpgrade: boolean }> {
  if (!storedValue || !candidatePin) {
    return { matches: false, needsUpgrade: false };
  }

  const cleanCandidate = String(candidatePin).trim();
  const cleanStored = String(storedValue).trim();

  // If stored value is already a bcrypt hash
  if (cleanStored.startsWith("$2a$") || cleanStored.startsWith("$2b$") || cleanStored.startsWith("$2y$")) {
    const peppered = getPepperedPin(cleanCandidate);
    const matches = await bcrypt.compare(peppered, cleanStored);
    return { matches, needsUpgrade: false };
  }

  // Legacy plaintext match
  if (cleanStored === cleanCandidate) {
    return { matches: true, needsUpgrade: true };
  }

  return { matches: false, needsUpgrade: false };
}

/**
 * Finds an active Staff member matching the provided PIN.
 * Automatically upgrades legacy plaintext PINs to peppered bcrypt on match.
 */
export async function findStaffByPin(
  rawPin: string,
  options?: { branchId?: string; roleIn?: string[] }
) {
  if (!rawPin || String(rawPin).trim().length !== 4) return null;

  const where: any = { isActive: true };
  if (options?.branchId) {
    where.branchId = options.branchId;
  }
  if (options?.roleIn && options.roleIn.length > 0) {
    where.role = { in: options.roleIn };
  }

  const activeStaff = await prisma.staff.findMany({ where });

  // Evaluate matches in parallel
  const results = await Promise.all(
    activeStaff.map(async (staff) => {
      const { matches, needsUpgrade } = await verifyCandidatePin(rawPin, staff.pinCode);
      return { staff, matches, needsUpgrade };
    })
  );

  const matched = results.find((r) => r.matches);
  if (!matched) return null;

  // Asynchronously upgrade legacy plaintext PIN in the background
  if (matched.needsUpgrade) {
    hashPin(rawPin)
      .then((newHash) => {
        prisma.staff
          .update({
            where: { id: matched.staff.id },
            data: { pinCode: newHash },
          })
          .catch((err) => console.error("Error auto-migrating staff PIN to hash:", err));
      })
      .catch((err) => console.error("Error generating new PIN hash for migration:", err));
  }

  return matched.staff;
}

/**
 * Finds a supervisor (Manager or Admin) matching the supervisor PIN.
 * Checks both Staff and legacy User tables.
 */
export async function findSupervisorByPin(rawPin: string) {
  if (!rawPin || String(rawPin).trim().length !== 4) return null;

  // 1. Check Staff table for Managers/Owners/Administrators
  const staffSupervisor = await findStaffByPin(rawPin, {
    roleIn: ["OWNER", "ADMINISTRATOR", "MANAGER"],
  });
  if (staffSupervisor) {
    return {
      id: staffSupervisor.id,
      name: staffSupervisor.name,
      role: staffSupervisor.role,
      isStaff: true,
    };
  }

  // 2. Check legacy User table fallback
  const legacyUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ["ADMIN", "MANAGER", "OWNER"] },
    },
  });

  const results = await Promise.all(
    legacyUsers.map(async (user) => {
      const { matches, needsUpgrade } = await verifyCandidatePin(rawPin, user.pinCode);
      return { user, matches, needsUpgrade };
    })
  );

  const matched = results.find((r) => r.matches);
  if (!matched) return null;

  // Upgrade legacy User PIN if needed
  if (matched.needsUpgrade) {
    hashPin(rawPin)
      .then((newHash) => {
        prisma.user
          .update({
            where: { id: matched.user.id },
            data: { pinCode: newHash },
          })
          .catch((err) => console.error("Error auto-migrating legacy user PIN:", err));
      })
      .catch((err) => console.error("Error hashing PIN for legacy user:", err));
  }

  return {
    id: matched.user.id,
    name: matched.user.name,
    role: matched.user.role,
    isStaff: false,
  };
}

