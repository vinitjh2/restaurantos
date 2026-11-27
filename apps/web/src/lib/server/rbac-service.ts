import { prisma } from "@/lib/server/prisma";
import {
  ALL_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PermissionCode,
  SystemRole,
} from "@/lib/server/rbac-engine";

export interface RoleConfigItem {
  role: SystemRole;
  permissions: PermissionCode[];
  isCustomized: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
  assignedStaffCount: number;
}

/**
 * Fetch all role permission configurations for the tenant.
 * Merges stored database customizations with default role permissions.
 */
export async function getRolePermissionsMap(
  organizationId: string = ""
): Promise<{
  activeRoles: Record<SystemRole, PermissionCode[]>;
  roleDetails: RoleConfigItem[];
}> {
  try {
    // 1. Fetch any customized roles from database
    const customConfigs = await prisma.rolePermissionConfig.findMany({
      where: {
        OR: [{ organizationId }, { organizationId: null }],
      },
    });

    // 2. Fetch staff counts per role for operational insights
    const staffGroup = await prisma.staff.groupBy({
      by: ["role"],
      _count: { id: true },
      where: { isActive: true },
    });

    const staffCountMap: Record<string, number> = {};
    staffGroup.forEach((g) => {
      staffCountMap[g.role.toUpperCase()] = g._count.id;
    });

    const activeRoles: Record<SystemRole, PermissionCode[]> = { ...DEFAULT_ROLE_PERMISSIONS };
    const customMap = new Map<string, any>();

    customConfigs.forEach((c) => {
      customMap.set(c.role.toUpperCase(), c);
      try {
        const parsed = JSON.parse(c.permissions);
        if (Array.isArray(parsed)) {
          activeRoles[c.role.toUpperCase() as SystemRole] = parsed;
        }
      } catch (err) {
        console.error(`Error parsing permissions for role ${c.role}:`, err);
      }
    });

    const roleDetails: RoleConfigItem[] = ALL_ROLES.map((role) => {
      const custom = customMap.get(role);
      const isCustomized = Boolean(custom && custom.isCustomized);
      const perms = activeRoles[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
      return {
        role,
        permissions: perms,
        isCustomized,
        updatedBy: custom?.updatedBy || (isCustomized ? "Restaurant Owner" : "System Factory Default"),
        updatedAt: custom?.updatedAt ? custom.updatedAt.toISOString() : null,
        assignedStaffCount: staffCountMap[role] || 0,
      };
    });

    return { activeRoles, roleDetails };
  } catch (err) {
    console.error("Failed to load role permissions from database, falling back to defaults:", err);
    const roleDetails: RoleConfigItem[] = ALL_ROLES.map((role) => ({
      role,
      permissions: DEFAULT_ROLE_PERMISSIONS[role] || [],
      isCustomized: false,
      updatedBy: "System Factory Default",
      updatedAt: null,
      assignedStaffCount: 0,
    }));
    return { activeRoles: { ...DEFAULT_ROLE_PERMISSIONS }, roleDetails };
  }
}

/**
 * Save or update permissions for a specific role
 */
export async function saveRolePermissions(
  role: SystemRole,
  permissions: PermissionCode[],
  updatedBy: string = "Restaurant Owner",
  organizationId: string = ""
): Promise<RoleConfigItem> {
  const serialized = JSON.stringify(permissions);

  const saved = await prisma.rolePermissionConfig.upsert({
    where: {
      organizationId_role: {
        organizationId,
        role: role.toUpperCase(),
      },
    },
    update: {
      permissions: serialized,
      isCustomized: true,
      updatedBy,
    },
    create: {
      organizationId,
      role: role.toUpperCase(),
      permissions: serialized,
      isCustomized: true,
      updatedBy,
    },
  });

  const staffCount = await prisma.staff.count({
    where: { role: role.toUpperCase(), isActive: true },
  });

  return {
    role,
    permissions,
    isCustomized: true,
    updatedBy: saved.updatedBy,
    updatedAt: saved.updatedAt.toISOString(),
    assignedStaffCount: staffCount,
  };
}

/**
 * Reset a role to system factory defaults
 */
export async function resetRolePermissions(
  role: SystemRole,
  organizationId: string = ""
): Promise<RoleConfigItem> {
  try {
    await prisma.rolePermissionConfig.deleteMany({
      where: {
        role: role.toUpperCase(),
        organizationId,
      },
    });
  } catch (err) {
    console.error(`Error deleting custom role config for ${role}:`, err);
  }

  const staffCount = await prisma.staff.count({
    where: { role: role.toUpperCase(), isActive: true },
  });

  return {
    role,
    permissions: DEFAULT_ROLE_PERMISSIONS[role] || [],
    isCustomized: false,
    updatedBy: "System Factory Default",
    updatedAt: null,
    assignedStaffCount: staffCount,
  };
}
