import { NextRequest, NextResponse } from "next/server";
import {
  ALL_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
  PERMISSION_METADATA,
  PERMISSIONS,
  SystemRole,
} from "@/lib/server/rbac-engine";
import {
  getRolePermissionsMap,
  saveRolePermissions,
  resetRolePermissions,
} from "@/lib/server/rbac-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/staff/roles
 * Returns current role configurations, factory defaults, and permission metadata.
 */
export async function GET(req: NextRequest) {
  try {
    const { activeRoles, roleDetails } = await getRolePermissionsMap();

    return NextResponse.json({
      success: true,
      roles: roleDetails,
      activeRolesMap: activeRoles,
      defaultRolesMap: DEFAULT_ROLE_PERMISSIONS,
      categories: PERMISSION_CATEGORIES,
      metadata: PERMISSION_METADATA,
      allRoles: ALL_ROLES,
      totalPermissions: Object.keys(PERMISSIONS).length,
    });
  } catch (error: any) {
    console.error("Failed to fetch role permissions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/roles
 * Update custom permissions for a role, or reset to factory defaults.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, permissions, action, updatedBy } = body;

    if (!role || !ALL_ROLES.includes(role.toUpperCase() as SystemRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role '${role}'. Valid roles are: ${ALL_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const sysRole = role.toUpperCase() as SystemRole;

    // Reset action
    if (action === "RESET") {
      const resetRole = await resetRolePermissions(sysRole);
      return NextResponse.json({
        success: true,
        message: `Role '${sysRole}' successfully reset to system factory defaults.`,
        role: resetRole,
      });
    }

    // Save action
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: "Permissions must be an array of permission strings" },
        { status: 400 }
      );
    }

    const updatedRole = await saveRolePermissions(
      sysRole,
      permissions,
      updatedBy || "Restaurant Owner"
    );

    return NextResponse.json({
      success: true,
      message: `Permissions for role '${sysRole}' updated successfully (${permissions.length} active permissions).`,
      role: updatedRole,
    });
  } catch (error: any) {
    console.error("Failed to update role permissions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update role permissions" },
      { status: 500 }
    );
  }
}
