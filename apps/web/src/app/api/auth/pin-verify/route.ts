import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hasPermission, PermissionCode } from "@/lib/server/rbac-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pinCode, action, requiredPermission, details } = body;

    if (!pinCode || pinCode.length !== 4) {
      return NextResponse.json(
        { success: false, authorized: false, error: "4-digit PIN is required" },
        { status: 400 }
      );
    }

    // 1. Look up staff by PIN code
    const staff = await prisma.staff.findFirst({
      where: {
        pinCode: String(pinCode).trim(),
        isActive: true,
      },
    });

    if (!staff) {
      // Check legacy User table fallback
      const user = await prisma.user.findFirst({
        where: { pinCode: String(pinCode).trim(), isActive: true },
      });

      if (!user) {
        // Log unauthorized attempt
        await prisma.auditLog.create({
          data: {
            action: "PIN_VERIFY_FAILED",
            entityType: "Auth",
            entityId: "PIN",
            authorizedBy: "UNKNOWN",
            reason: `Invalid PIN attempt for action: ${action || "GENERAL_ACCESS"}`,
          },
        });

        return NextResponse.json(
          { success: false, authorized: false, error: "Invalid PIN code. Access denied." },
          { status: 401 }
        );
      }

      // Legacy user has manager/admin permissions
      const isAuthorized = ["ADMIN", "MANAGER", "OWNER"].includes(user.role.toUpperCase());
      return NextResponse.json({
        success: true,
        authorized: isAuthorized,
        staff: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    }

    // 2. Check granular permission if specified
    const isAuthorized = requiredPermission
      ? hasPermission(staff.role, staff.permissions, requiredPermission as PermissionCode)
      : true;

    // 3. Log Audit Log for sensitive actions
    if (action) {
      await prisma.auditLog.create({
        data: {
          action: isAuthorized ? `ACTION_APPROVED_${action}` : `ACTION_REJECTED_${action}`,
          entityType: "Security",
          entityId: staff.id,
          authorizedBy: staff.name,
          reason: details || `PIN Authorization for ${action}`,
          details: JSON.stringify({ role: staff.role, isAuthorized }),
        },
      });
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          error: `Staff role '${staff.role}' lacks required permission '${requiredPermission}'`,
        },
        { status: 403 }
      );
    }

    let parsedPerms = [];
    try {
      parsedPerms = JSON.parse(staff.permissions);
    } catch (e) {
      parsedPerms = [];
    }

    return NextResponse.json({
      success: true,
      authorized: true,
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
        permissions: parsedPerms,
      },
      message: `Access verified for ${staff.name} (${staff.role})`,
    });
  } catch (error: any) {
    console.error("PIN verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
