import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { DEFAULT_ROLE_PERMISSIONS, SystemRole } from "@/lib/server/rbac-engine";
import { hashPin } from "@/lib/server/pin-security";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const where: any =
      tenantCtx.role === "PLATFORM_OWNER"
        ? {}
        : { organizationId: tenantCtx.organizationId };
    if (role && role !== "All") where.role = role.toUpperCase();

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
    const tenantCtx = await getTenantContext(req);
    const body = await req.json();
    const { name, email, phone, role, pinCode, hourlyRate, monthlySalary, customPermissions } = body;

    if (!name || !phone || !role || !pinCode) {
      return NextResponse.json(
        { success: false, error: "Name, phone, role and 4-digit PIN are required" },
        { status: 400 }
      );
    }

    if (String(pinCode).length !== 4 || isNaN(Number(pinCode))) {
      return NextResponse.json(
        { success: false, error: "PIN must be exactly 4 numeric digits" },
        { status: 400 }
      );
    }

    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role as SystemRole] || [];
    const finalPermissions = customPermissions && customPermissions.length > 0
      ? customPermissions
      : defaultPerms;

    // Cryptographically hash the 4-digit PIN with server pepper and bcrypt before storing
    const hashedPin = await hashPin(pinCode);

    const staff = await prisma.staff.create({
      data: {
        organizationId: tenantCtx.organizationId,
        branchId: tenantCtx.assignedBranchId || null,
        name,
        email: email || null,
        phone,
        role: role.toUpperCase(),
        pinCode: hashedPin,
        hourlyRate: Number(hourlyRate) || 0,
        monthlySalary: Number(monthlySalary) || 0,
        permissions: JSON.stringify(finalPermissions),
        isActive: true,
      },
    });

    // Also sync with legacy User table for compatibility with POS overrides
    await prisma.user.upsert({
      where: { id: staff.id },
      update: { name, role: role.toUpperCase(), pinCode: hashedPin, isActive: true },
      create: { id: staff.id, name, role: role.toUpperCase(), pinCode: hashedPin, isActive: true },
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phone, role, pinCode, hourlyRate, monthlySalary, permissions, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID is required" }, { status: 400 });
    }

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role.toUpperCase();
    if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
    if (monthlySalary !== undefined) updateData.monthlySalary = Number(monthlySalary);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Permissions handling: can be array or string
    if (permissions !== undefined) {
      if (Array.isArray(permissions)) {
        updateData.permissions = JSON.stringify(permissions);
      } else if (typeof permissions === "string") {
        updateData.permissions = permissions;
      }
    }

    // Optional PIN update
    if (pinCode) {
      const cleanPin = String(pinCode).trim();
      if (cleanPin.length !== 4 || isNaN(Number(cleanPin))) {
        return NextResponse.json(
          { success: false, error: "PIN must be exactly 4 numeric digits" },
          { status: 400 }
        );
      }
      updateData.pinCode = await hashPin(cleanPin);
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    // Sync legacy User table
    await prisma.user.upsert({
      where: { id },
      update: {
        name: updatedStaff.name,
        role: updatedStaff.role,
        ...(updateData.pinCode ? { pinCode: updateData.pinCode } : {}),
        isActive: updatedStaff.isActive,
      },
      create: {
        id: updatedStaff.id,
        name: updatedStaff.name,
        role: updatedStaff.role,
        pinCode: updatedStaff.pinCode,
        isActive: updatedStaff.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff member '${updatedStaff.name}' updated successfully!`,
      staff: { ...updatedStaff, pinCode: undefined },
    });
  } catch (error: any) {
    console.error("Update staff error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID is required" }, { status: 400 });
    }

    const staff = await prisma.staff.delete({ where: { id } });

    // Also remove from User table
    try {
      await prisma.user.delete({ where: { id } });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Staff member '${staff.name}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete staff error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
