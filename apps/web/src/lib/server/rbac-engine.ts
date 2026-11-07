export type SystemRole =
  | "OWNER"
  | "ADMINISTRATOR"
  | "MANAGER"
  | "CASHIER"
  | "WAITER"
  | "KITCHEN_STAFF"
  | "INVENTORY_MANAGER"
  | "ACCOUNTANT";

export const ALL_ROLES: SystemRole[] = [
  "OWNER",
  "ADMINISTRATOR",
  "MANAGER",
  "CASHIER",
  "WAITER",
  "KITCHEN_STAFF",
  "INVENTORY_MANAGER",
  "ACCOUNTANT",
];

export const PERMISSIONS = {
  // POS & Billing
  POS_ACCESS: "pos:access",
  POS_CREATE_ORDER: "pos:create_order",
  POS_SETTLE_BILL: "pos:settle_bill",
  POS_BILL_DISCOUNT: "pos:bill_discount",
  POS_CANCEL_ORDER: "pos:cancel_order",
  POS_REFUND: "pos:refund",
  POS_TRANSFER_TABLE: "pos:transfer_table",
  POS_REPRINT_KOT: "pos:reprint_kot",

  // KDS
  KDS_ACCESS: "kds:access",
  KDS_UPDATE_STATUS: "kds:update_status",
  KDS_REPRINT: "kds:reprint",

  // Inventory & Recipes
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_MANAGE: "inventory:manage",
  INVENTORY_ADJUST_WASTAGE: "inventory:adjust_wastage",
  INVENTORY_RECIPE_EDIT: "inventory:recipe_edit",

  // Procurement
  PROCUREMENT_PO_CREATE: "procurement:po_create",
  PROCUREMENT_GRN_RECEIVE: "procurement:grn_receive",
  PROCUREMENT_SUPPLIER_PAY: "procurement:supplier_pay",

  // CRM & Loyalty
  CRM_VIEW: "crm:view",
  CRM_CUSTOMER_ADD: "crm:customer_add",
  CRM_POINTS_REDEEM: "crm:points_redeem",
  CRM_COUPONS_MANAGE: "crm:coupons_manage",

  // Staff & RBAC
  STAFF_VIEW: "staff:view",
  STAFF_MANAGE: "staff:manage",
  STAFF_PIN_OVERRIDE: "staff:pin_override",

  // Attendance
  ATTENDANCE_CLOCK: "attendance:clock_in_out",
  ATTENDANCE_MANAGE: "attendance:manage_shifts",
  ATTENDANCE_APPROVE_LEAVES: "attendance:approve_leaves",

  // Payroll
  PAYROLL_VIEW: "payroll:view",
  PAYROLL_CALCULATE: "payroll:calculate",
  PAYROLL_MARK_PAID: "payroll:mark_paid",

  // Reports
  REPORTS_SALES: "reports:view_sales",
  REPORTS_FINANCIAL: "reports:view_pnl",
  REPORTS_FOOD_COST: "reports:view_food_cost",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Standard Default Role-Permission Mappings
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, PermissionCode[]> = {
  OWNER: Object.values(PERMISSIONS), // Owner has everything
  ADMINISTRATOR: Object.values(PERMISSIONS), // Administrator has everything

  MANAGER: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_CREATE_ORDER,
    PERMISSIONS.POS_SETTLE_BILL,
    PERMISSIONS.POS_BILL_DISCOUNT,
    PERMISSIONS.POS_CANCEL_ORDER,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_TRANSFER_TABLE,
    PERMISSIONS.POS_REPRINT_KOT,
    PERMISSIONS.KDS_ACCESS,
    PERMISSIONS.KDS_UPDATE_STATUS,
    PERMISSIONS.KDS_REPRINT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_ADJUST_WASTAGE,
    PERMISSIONS.INVENTORY_RECIPE_EDIT,
    PERMISSIONS.PROCUREMENT_PO_CREATE,
    PERMISSIONS.PROCUREMENT_GRN_RECEIVE,
    PERMISSIONS.CRM_VIEW,
    PERMISSIONS.CRM_CUSTOMER_ADD,
    PERMISSIONS.CRM_POINTS_REDEEM,
    PERMISSIONS.CRM_COUPONS_MANAGE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_PIN_OVERRIDE,
    PERMISSIONS.ATTENDANCE_CLOCK,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_APPROVE_LEAVES,
    PERMISSIONS.REPORTS_SALES,
    PERMISSIONS.REPORTS_FOOD_COST,
  ],

  CASHIER: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_CREATE_ORDER,
    PERMISSIONS.POS_SETTLE_BILL,
    PERMISSIONS.POS_TRANSFER_TABLE,
    PERMISSIONS.CRM_VIEW,
    PERMISSIONS.CRM_CUSTOMER_ADD,
    PERMISSIONS.CRM_POINTS_REDEEM,
    PERMISSIONS.ATTENDANCE_CLOCK,
  ],

  WAITER: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_CREATE_ORDER,
    PERMISSIONS.POS_TRANSFER_TABLE,
    PERMISSIONS.ATTENDANCE_CLOCK,
  ],

  KITCHEN_STAFF: [
    PERMISSIONS.KDS_ACCESS,
    PERMISSIONS.KDS_UPDATE_STATUS,
    PERMISSIONS.KDS_REPRINT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.ATTENDANCE_CLOCK,
  ],

  INVENTORY_MANAGER: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_ADJUST_WASTAGE,
    PERMISSIONS.INVENTORY_RECIPE_EDIT,
    PERMISSIONS.PROCUREMENT_PO_CREATE,
    PERMISSIONS.PROCUREMENT_GRN_RECEIVE,
    PERMISSIONS.REPORTS_FOOD_COST,
    PERMISSIONS.ATTENDANCE_CLOCK,
  ],

  ACCOUNTANT: [
    PERMISSIONS.PROCUREMENT_PO_CREATE,
    PERMISSIONS.PROCUREMENT_GRN_RECEIVE,
    PERMISSIONS.PROCUREMENT_SUPPLIER_PAY,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_CALCULATE,
    PERMISSIONS.PAYROLL_MARK_PAID,
    PERMISSIONS.REPORTS_SALES,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.REPORTS_FOOD_COST,
    PERMISSIONS.ATTENDANCE_CLOCK,
  ],
};

/**
 * Check if a staff member with a role and custom permissions has a required permission
 * Flexible overload: accepts (role, permission) OR (role, customPermissionsJson, requiredPermission)
 */
export function hasPermission(
  role: string,
  param2: string,
  param3?: PermissionCode
): boolean {
  let requiredPermission: PermissionCode;
  let customPermissionsJson: string | undefined;

  if (param3) {
    customPermissionsJson = param2;
    requiredPermission = param3;
  } else {
    requiredPermission = param2 as PermissionCode;
    customPermissionsJson = undefined;
  }

  if (!requiredPermission) return true;
  const sysRole = (role || "").toUpperCase() as SystemRole;

  if (sysRole === "OWNER" || sysRole === "ADMINISTRATOR") return true;

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[sysRole] || [];
  let userPerms: string[] = [];

  try {
    if (customPermissionsJson) {
      userPerms = JSON.parse(customPermissionsJson);
    }
  } catch {
    userPerms = [];
  }

  return (
    defaultPerms.includes(requiredPermission) ||
    userPerms.includes(requiredPermission) ||
    userPerms.includes("*")
  );
}
