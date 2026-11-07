import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

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

    // 1. Look up UserAccount
    const user = await prisma.userAccount.findUnique({
      where: { email: email.toLowerCase().trim() },
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

    // 2. Verify Bcrypt Password Hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
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

    // 4. Log successful login to AuditLog
    await prisma.auditLog.create({
      data: {
        action: "TENANT_USER_LOGIN",
        entityType: "USER_ACCOUNT",
        entityId: user.id,
        authorizedBy: user.email,
        details: `Successful login to organization '${user.organization.name}'`,
      },
    });

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
        branches: user.organization.branches.map((b) => ({
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
