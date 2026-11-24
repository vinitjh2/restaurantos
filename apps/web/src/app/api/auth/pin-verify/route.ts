import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hasPermission, PermissionCode } from "@/lib/server/rbac-engine";
import { getRolePermissionsMap } from "@/lib/server/rbac-service";
import { findStaffByPin, findSupervisorByPin } from "@/lib/server/pin-security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pinCode, action, requiredPermission, details } = body;

    const cleanPin = String(pinCode || "").trim();
    if (!cleanPin || cleanPin.length !== 4) {
      return NextResponse.json(
        { success: false, authorized: false, error: "4-digit PIN is required" },
        { status: 400 }
      );
    }

    // 1. Look up staff by cryptographically verified PIN (with peppered bcrypt & auto-migration)
    const staff = await findStaffByPin(cleanPin);

    if (!staff) {
      // Check legacy User supervisor fallback
      const legacySupervisor = await findSupervisorByPin(cleanPin);

      if (!legacySupervisor) {
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
      const isAuthorized = ["ADMIN", "MANAGER", "OWNER"].includes(legacySupervisor.role.toUpperCase());
      return NextResponse.json({
        success: true,
        authorized: isAuthorized,
        staff: {
          id: legacySupervisor.id,
          name: legacySupervisor.name,
          role: legacySupervisor.role,
        },
      });
    }

    // 2. Check granular permission if specified (fetching owner's customized role permissions)
    let isAuthorized = true;
    if (requiredPermission) {
      const { activeRoles } = await getRolePermissionsMap();
      isAuthorized = hasPermission(
        staff.role,
        staff.permissions,
        requiredPermission as PermissionCode,
        activeRoles
      );
    }

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
