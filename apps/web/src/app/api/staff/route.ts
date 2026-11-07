import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { DEFAULT_ROLE_PERMISSIONS, SystemRole } from "@/lib/server/rbac-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const where: any = {};
    if (role && role !== "All") where.role = role;

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        _count: {
          select: { attendance: true, leaves: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      staff: staffList.map((s) => ({
        ...s,
        pinConfigured: Boolean(s.pinCode),
        pinCode: undefined, // mask PIN in general GET list
      })),
    });
  } catch (error: any) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, pinCode, hourlyRate, monthlySalary, customPermissions } = body;

    if (!name || !phone || !role || !pinCode) {
      return NextResponse.json(
        { success: false, error: "Name, phone, role and 4-digit PIN are required" },
        { status: 400 }
      );
    }

    if (pinCode.length !== 4 || isNaN(Number(pinCode))) {
      return NextResponse.json(
        { success: false, error: "PIN must be exactly 4 numeric digits" },
        { status: 400 }
      );
    }

    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role as SystemRole] || [];
    const finalPermissions = customPermissions && customPermissions.length > 0
      ? customPermissions
      : defaultPerms;

    const staff = await prisma.staff.create({
      data: {
        name,
        email: email || null,
        phone,
        role: role.toUpperCase(),
        pinCode,
        hourlyRate: Number(hourlyRate) || 0,
        monthlySalary: Number(monthlySalary) || 0,
        permissions: JSON.stringify(finalPermissions),
        isActive: true,
      },
    });

    // Also sync with legacy User table for compatibility with POS overrides
    await prisma.user.upsert({
      where: { id: staff.id },
      update: { name, role: role.toUpperCase(), pinCode, isActive: true },
      create: { id: staff.id, name, role: role.toUpperCase(), pinCode, isActive: true },
    });

    return NextResponse.json({
      success: true,
      staff: { ...staff, pinCode: undefined },
      message: `${name} registered as ${role} with configured permissions!`,
    });
  } catch (error: any) {
    console.error("Save staff error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
