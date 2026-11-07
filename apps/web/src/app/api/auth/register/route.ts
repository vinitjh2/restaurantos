import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/lib/server/auth-context";

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
      subscriptionPlan, // STARTER, PROFESSIONAL, ENTERPRISE
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

    // Auto-generate clean URL slug if not provided
    const cleanSlug = (slug || restaurantName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check email uniqueness
    const existingUser = await prisma.userAccount.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check slug uniqueness
    const existingOrg = await prisma.organization.findUnique({ where: { slug: cleanSlug } });
    const finalSlug = existingOrg ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    const passwordHash = await bcrypt.hash(password, 10);
    const branchCode = (restaurantName.slice(0, 3) + Date.now().toString().slice(-2)).toUpperCase();

    // Atomic transaction: Create Organization + Owner Account + Initial Outlet Branch
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const organization = await tx.organization.create({
        data: {
          name: restaurantName.trim(),
          slug: finalSlug,
          businessType: businessType || "RESTAURANT",
          contactEmail: email.toLowerCase().trim(),
          contactPhone: phone || null,
          currency: "INR",
          status: "ACTIVE",
          subscriptionPlan: subscriptionPlan || "PROFESSIONAL",
          subscriptionRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day initial trial
        },
      });

      // 2. Create Owner UserAccount
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

      // 3. Create Initial Flagship Branch
      const initialBranch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: branchName || `${restaurantName} — Main Outlet`,
          code: branchCode,
          address: address || "Commercial High Street",
          city: city || "Bengaluru",
          state: state || "Karnataka",
          pincode: pincode || "560001",
          phone: phone || "+91 98000 00000",
          gstin: gstin || "29AABCU9603R1ZM",
          fssaiNumber: fssaiNumber || "11223344000123",
          cgstRate: 2.5,
          sgstRate: 2.5,
          igstRate: 5.0,
          isTaxInclusive: false,
          currentFiscalYr: "2026-27",
        },
      });

      // 4. Create default table seats for initial branch
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

      // 5. Create default shift schedule
      await tx.shiftSchedule.create({
        data: {
          name: "General Service Shift",
          startTime: "10:00",
          endTime: "22:00",
          lateThresholdMins: 15,
          daysOfWeek: "MON,TUE,WED,THU,FRI,SAT,SUN",
          isActive: true,
        },
      });

      // 6. Record Audit Log
      await tx.auditLog.create({
        data: {
          action: "ORGANIZATION_REGISTERED",
          entityType: "ORGANIZATION",
          entityId: organization.id,
          authorizedBy: userAccount.email,
          details: `Registered tenant '${organization.name}' with initial branch '${initialBranch.name}' (${initialBranch.code})`,
        },
      });

      return { organization, userAccount, initialBranch };
    });

    // Generate JWT token
    const token = signJwtToken({
      userId: result.userAccount.id,
      organizationId: result.organization.id,
      organizationSlug: result.organization.slug,
      email: result.userAccount.email,
      name: result.userAccount.name,
      role: result.userAccount.role as any,
      assignedBranchId: null,
    });

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: `Restaurant '${result.organization.name}' registered successfully!`,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
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

    response.cookies.set("restaurantos_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
