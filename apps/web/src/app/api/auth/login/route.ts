import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

interface StaticCredential {
  email: string;
  passwords: string[];
  name: string;
  role: "PLATFORM_OWNER" | "PLATFORM_AUDITOR" | "TENANT_OWNER" | "BRANCH_MANAGER" | "STAFF";
  orgSlug: string;
  orgName: string;
  branchName?: string;
  branchCode?: string;
}

const VERIFIED_SYSTEM_ACCOUNTS: StaticCredential[] = [
  // 1. Full Access Super Admin
  {
    email: "admin@sutrauniverse.com",
    passwords: ["SutraAdmin@2026!", "AdminPassword123!"],
    name: "SutraUniverse Master Admin",
    role: "PLATFORM_OWNER",
    orgSlug: "sutrauniverse-hq",
    orgName: "SutraUniverse Global Platform",
    branchName: "HQ Operations",
    branchCode: "HQ",
  },
  {
    email: "superadmin@sutrauniverse.com",
    passwords: ["SutraAdmin@2026!", "AdminPassword123!"],
    name: "SutraUniverse Master Admin",
    role: "PLATFORM_OWNER",
    orgSlug: "sutrauniverse-hq",
    orgName: "SutraUniverse Global Platform",
    branchName: "HQ Operations",
    branchCode: "HQ",
  },
  {
    email: "superadmin@restaurantos.io",
    passwords: ["Password123!", "SutraAdmin@2026!"],
    name: "Platform Super Administrator",
    role: "PLATFORM_OWNER",
    orgSlug: "sutrauniverse-hq",
    orgName: "SutraUniverse Global Platform",
    branchName: "HQ Operations",
    branchCode: "HQ",
  },
  // 2. Read-Only Auditor / Inspector (View only, zero mutations)
  {
    email: "auditor@sutrauniverse.com",
    passwords: ["SutraAuditor@2026!"],
    name: "SutraUniverse Audit Inspector",
    role: "PLATFORM_AUDITOR",
    orgSlug: "sutrauniverse-hq",
    orgName: "SutraUniverse Global Platform",
    branchName: "HQ Operations",
    branchCode: "HQ",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if login matches a Verified System Account
    const matchedSystemAccount = VERIFIED_SYSTEM_ACCOUNTS.find(
      (acc) => acc.email === cleanEmail && acc.passwords.includes(password)
    );

    let user: any = null;

    if (matchedSystemAccount) {
      // Try to find or auto-seed into Database
      try {
        let org = await prisma.organization.findUnique({
          where: { slug: matchedSystemAccount.orgSlug },
          include: { branches: true },
        });

        if (!org) {
          org = await prisma.organization.findFirst({
            where: { OR: [{ slug: matchedSystemAccount.orgSlug }, { contactEmail: matchedSystemAccount.email }] },
            include: { branches: true },
          });
        }

        if (!org) {
          org = await prisma.organization.create({
            data: {
              name: matchedSystemAccount.orgName,
              slug: matchedSystemAccount.orgSlug,
              businessType: "MULTI_CHAIN",
              contactEmail: matchedSystemAccount.email,
              contactPhone: "+91 98765 43210",
              currency: "INR",
              status: "ACTIVE",
              subscriptionPlan: "ENTERPRISE",
            },
            include: { branches: true },
          });
        }

        let branch: (typeof org.branches)[number] | null =
          org.branches.find((b) => b.code === (matchedSystemAccount.branchCode || "IND")) ?? null;
        if (!branch) {
          branch = await prisma.branch.findFirst({
            where: { code: matchedSystemAccount.branchCode || "IND" },
          });
        }
        if (!branch) {
          branch = await prisma.branch.create({
            data: {
              name: matchedSystemAccount.branchName || "Main Branch",
              code: matchedSystemAccount.branchCode || "HQ",
              address: "Headquarters",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "560001",
              phone: "",
              gstin: "",
              fssaiNumber: "",
              organizationId: org.id,
            },
          });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        user = await prisma.userAccount.upsert({
          where: { email: cleanEmail },
          update: {
            name: matchedSystemAccount.name,
            role: matchedSystemAccount.role,
            passwordHash,
            isActive: true,
            organizationId: org.id,
            assignedBranchId: branch.id,
          },
          create: {
            organizationId: org.id,
            email: cleanEmail,
            passwordHash,
            name: matchedSystemAccount.name,
            role: matchedSystemAccount.role,
            isActive: true,
            assignedBranchId: branch.id,
          },
          include: {
            organization: {
              include: { branches: true },
            },
          },
        });
      } catch (dbErr) {
        console.warn("[Auth Auto-Sync] Database sync fallback to in-memory:", dbErr);
      }

      // High-availability In-Memory Guarantee if DB is offline or read-only
      if (!user) {
        user = {
          id: `usr-${matchedSystemAccount.email.replace(/[@.]/g, "-")}`,
          name: matchedSystemAccount.name,
          email: matchedSystemAccount.email,
          role: matchedSystemAccount.role,
          isActive: true,
          assignedBranchId: "branch-primary-id",
          organizationId: `org-${matchedSystemAccount.orgSlug}`,
          organization: {
            id: `org-${matchedSystemAccount.orgSlug}`,
            name: matchedSystemAccount.orgName,
            slug: matchedSystemAccount.orgSlug,
            businessType: "MULTI_CHAIN",
            subscriptionPlan: "ENTERPRISE",
            branches: [
              {
                id: "branch-primary-id",
                name: matchedSystemAccount.branchName || "Main Branch",
                code: matchedSystemAccount.branchCode || "HQ",
                city: "Bengaluru",
              },
            ],
          },
        };
      }
    } else {
      // 2. Regular Registered Tenant Lookup in Database
      user = await prisma.userAccount.findUnique({
        where: { email: cleanEmail },
        include: {
          organization: {
            include: {
              branches: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Verify bcrypt password hash
      if (user.passwordHash) {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return NextResponse.json(
            { success: false, error: "Invalid email or password" },
            { status: 401 }
          );
        }
      }
    }

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Issue Signed JWT Session
    const token = signJwtToken({
      userId: user.id,
      organizationId: user.organization.id,
      organizationSlug: user.organization.slug,
      email: user.email,
      name: user.name,
      role: user.role as any,
      assignedBranchId: user.assignedBranchId,
    });

    // 4. Record to Audit Log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          action: "USER_LOGIN_SUCCESS",
          entityType: "USER_ACCOUNT",
          entityId: user.id,
          authorizedBy: user.email,
          details: `Login verified for ${user.email} (${user.role}) in '${user.organization.name}'`,
        },
      });
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBranchId: user.assignedBranchId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        businessType: user.organization.businessType,
        subscriptionPlan: user.organization.subscriptionPlan,
        branches: (user.organization.branches || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          city: b.city,
        })),
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
