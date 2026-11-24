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

export type PermissionCategory =
  | "POS & Billing"
  | "Kitchen Display (KDS)"
  | "Inventory & Recipes"
  | "Procurement & Vendors"
  | "CRM & Guests"
  | "Staff & Security"
  | "Attendance & Shifts"
  | "Payroll & Compensation"
  | "Reports & Analytics";

export interface PermissionMeta {
  code: PermissionCode;
  label: string;
  description: string;
  category: PermissionCategory;
  isDangerous?: boolean;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "POS & Billing",
  "Kitchen Display (KDS)",
  "Inventory & Recipes",
  "Procurement & Vendors",
  "CRM & Guests",
  "Staff & Security",
  "Attendance & Shifts",
  "Payroll & Compensation",
  "Reports & Analytics",
];

export const PERMISSION_METADATA: Record<PermissionCode, PermissionMeta> = {
  [PERMISSIONS.POS_ACCESS]: {
    code: PERMISSIONS.POS_ACCESS,
    label: "Access POS Billing",
    description: "Launch touch POS register and take live customer orders",
    category: "POS & Billing",
  },
  [PERMISSIONS.POS_CREATE_ORDER]: {
    code: PERMISSIONS.POS_CREATE_ORDER,
    label: "Create & Punch Orders",
    description: "Add items to cart, select table, and fire KOT tickets",
    category: "POS & Billing",
  },
  [PERMISSIONS.POS_SETTLE_BILL]: {
    code: PERMISSIONS.POS_SETTLE_BILL,
    label: "Settle & Close Bills",
    description: "Accept payments (Cash, UPI, Cards) and issue receipts",
    category: "POS & Billing",
  },
  [PERMISSIONS.POS_BILL_DISCOUNT]: {
    code: PERMISSIONS.POS_BILL_DISCOUNT,
    label: "Apply Bill Discounts",
    description: "Grant percentage or flat cash discounts on guest bills",
    category: "POS & Billing",
    isDangerous: true,
  },
  [PERMISSIONS.POS_CANCEL_ORDER]: {
    code: PERMISSIONS.POS_CANCEL_ORDER,
    label: "Cancel / Void Orders",
    description: "Void active or running table orders before or after preparation",
    category: "POS & Billing",
    isDangerous: true,
  },
  [PERMISSIONS.POS_REFUND]: {
    code: PERMISSIONS.POS_REFUND,
    label: "Issue Cash/UPI Refunds",
    description: "Reverse settled payments and return cash/UPI tender to guests",
    category: "POS & Billing",
    isDangerous: true,
  },
  [PERMISSIONS.POS_TRANSFER_TABLE]: {
    code: PERMISSIONS.POS_TRANSFER_TABLE,
    label: "Transfer / Split Tables",
    description: "Move open orders to another table or split check into multiple bills",
    category: "POS & Billing",
  },
  [PERMISSIONS.POS_REPRINT_KOT]: {
    code: PERMISSIONS.POS_REPRINT_KOT,
    label: "Reprint KOT & Bills",
    description: "Reprint duplicate KOTs or past settled thermal receipts",
    category: "POS & Billing",
  },

  // KDS
  [PERMISSIONS.KDS_ACCESS]: {
    code: PERMISSIONS.KDS_ACCESS,
    label: "Access Kitchen KDS",
    description: "Open the real-time Kitchen Display System touch interface",
    category: "Kitchen Display (KDS)",
  },
  [PERMISSIONS.KDS_UPDATE_STATUS]: {
    code: PERMISSIONS.KDS_UPDATE_STATUS,
    label: "Bump Item & Ticket Status",
    description: "Mark kitchen items as Preparing, Ready, or Served",
    category: "Kitchen Display (KDS)",
  },
  [PERMISSIONS.KDS_REPRINT]: {
    code: PERMISSIONS.KDS_REPRINT,
    label: "Trigger Kitchen Reprints",
    description: "Request station chef reprint for lost kitchen tickets",
    category: "Kitchen Display (KDS)",
  },

  // Inventory & Recipes
  [PERMISSIONS.INVENTORY_VIEW]: {
    code: PERMISSIONS.INVENTORY_VIEW,
    label: "View Stock & Ingredients",
    description: "Check current warehouse and kitchen ingredient levels",
    category: "Inventory & Recipes",
  },
  [PERMISSIONS.INVENTORY_MANAGE]: {
    code: PERMISSIONS.INVENTORY_MANAGE,
    label: "Manage Inventory Items",
    description: "Create ingredients, update stock quantities, and adjust PAR levels",
    category: "Inventory & Recipes",
  },
  [PERMISSIONS.INVENTORY_ADJUST_WASTAGE]: {
    code: PERMISSIONS.INVENTORY_ADJUST_WASTAGE,
    label: "Log Spoilage & Wastage",
    description: "Record kitchen waste, burnt items, and spoilage write-offs",
    category: "Inventory & Recipes",
    isDangerous: true,
  },
  [PERMISSIONS.INVENTORY_RECIPE_EDIT]: {
    code: PERMISSIONS.INVENTORY_RECIPE_EDIT,
    label: "Edit Recipe BOM Yields",
    description: "Modify raw material consumption ratios and menu item costs",
    category: "Inventory & Recipes",
    isDangerous: true,
  },

  // Procurement
  [PERMISSIONS.PROCUREMENT_PO_CREATE]: {
    code: PERMISSIONS.PROCUREMENT_PO_CREATE,
    label: "Create Purchase Orders",
    description: "Draft and dispatch ingredient POs to registered suppliers",
    category: "Procurement & Vendors",
  },
  [PERMISSIONS.PROCUREMENT_GRN_RECEIVE]: {
    code: PERMISSIONS.PROCUREMENT_GRN_RECEIVE,
    label: "Receive Goods (GRN)",
    description: "Inspect vendor deliveries, log invoice prices, and update stock",
    category: "Procurement & Vendors",
  },
  [PERMISSIONS.PROCUREMENT_SUPPLIER_PAY]: {
    code: PERMISSIONS.PROCUREMENT_SUPPLIER_PAY,
    label: "Approve Vendor Payments",
    description: "Settle supplier invoices and record payout transactions",
    category: "Procurement & Vendors",
    isDangerous: true,
  },

  // CRM & Loyalty
  [PERMISSIONS.CRM_VIEW]: {
    code: PERMISSIONS.CRM_VIEW,
    label: "View Guest Profiles",
    description: "Search customer directory, dining history, and preferences",
    category: "CRM & Guests",
  },
  [PERMISSIONS.CRM_CUSTOMER_ADD]: {
    code: PERMISSIONS.CRM_CUSTOMER_ADD,
    label: "Add Customer Contact",
    description: "Register guest phone, name, and company GSTIN during billing",
    category: "CRM & Guests",
  },
  [PERMISSIONS.CRM_POINTS_REDEEM]: {
    code: PERMISSIONS.CRM_POINTS_REDEEM,
    label: "Redeem Loyalty Points",
    description: "Apply customer loyalty balance toward bill total",
    category: "CRM & Guests",
  },
  [PERMISSIONS.CRM_COUPONS_MANAGE]: {
    code: PERMISSIONS.CRM_COUPONS_MANAGE,
    label: "Manage Promo Coupons",
    description: "Create and configure discount coupons, BOGO and seasonal codes",
    category: "CRM & Guests",
  },

  // Staff & RBAC
  [PERMISSIONS.STAFF_VIEW]: {
    code: PERMISSIONS.STAFF_VIEW,
    label: "View Staff Directory",
    description: "View restaurant employee roster and roles",
    category: "Staff & Security",
  },
  [PERMISSIONS.STAFF_MANAGE]: {
    code: PERMISSIONS.STAFF_MANAGE,
    label: "Manage Staff & Permissions",
    description: "Add, edit, or deactivate employee profiles and assign permissions",
    category: "Staff & Security",
    isDangerous: true,
  },
  [PERMISSIONS.STAFF_PIN_OVERRIDE]: {
    code: PERMISSIONS.STAFF_PIN_OVERRIDE,
    label: "Authorize PIN Overrides",
    description: "Enter 4-digit supervisor PIN to approve voids and discounts",
    category: "Staff & Security",
    isDangerous: true,
  },

  // Attendance
  [PERMISSIONS.ATTENDANCE_CLOCK]: {
    code: PERMISSIONS.ATTENDANCE_CLOCK,
    label: "Clock-In / Clock-Out",
    description: "Log daily shift attendance and break times",
    category: "Attendance & Shifts",
  },
  [PERMISSIONS.ATTENDANCE_MANAGE]: {
    code: PERMISSIONS.ATTENDANCE_MANAGE,
    label: "Manage Shifts & Schedules",
    description: "Create shift rosters, assign staff shifts, and mark absentees",
    category: "Attendance & Shifts",
  },
  [PERMISSIONS.ATTENDANCE_APPROVE_LEAVES]: {
    code: PERMISSIONS.ATTENDANCE_APPROVE_LEAVES,
    label: "Approve Staff Leaves",
    description: "Authorize sick and casual leave requests",
    category: "Attendance & Shifts",
  },

  // Payroll
  [PERMISSIONS.PAYROLL_VIEW]: {
    code: PERMISSIONS.PAYROLL_VIEW,
    label: "View Payroll Records",
    description: "Inspect wage calculations, overtime hours, and salary ledger",
    category: "Payroll & Compensation",
    isDangerous: true,
  },
  [PERMISSIONS.PAYROLL_CALCULATE]: {
    code: PERMISSIONS.PAYROLL_CALCULATE,
    label: "Compute Monthly Payroll",
    description: "Run automated monthly salary calculations with deductions",
    category: "Payroll & Compensation",
    isDangerous: true,
  },
  [PERMISSIONS.PAYROLL_MARK_PAID]: {
    code: PERMISSIONS.PAYROLL_MARK_PAID,
    label: "Disburse & Mark Paid",
    description: "Confirm salary payment payouts to employee bank accounts",
    category: "Payroll & Compensation",
    isDangerous: true,
  },

  // Reports
  [PERMISSIONS.REPORTS_SALES]: {
    code: PERMISSIONS.REPORTS_SALES,
    label: "View Sales & Revenue Reports",
    description: "Access daily turnover, peak hour heatmaps, and category breakdowns",
    category: "Reports & Analytics",
  },
  [PERMISSIONS.REPORTS_FINANCIAL]: {
    code: PERMISSIONS.REPORTS_FINANCIAL,
    label: "View Financial P&L Audits",
    description: "Inspect net profit margins, tax summaries, and expense ledgers",
    category: "Reports & Analytics",
    isDangerous: true,
  },
  [PERMISSIONS.REPORTS_FOOD_COST]: {
    code: PERMISSIONS.REPORTS_FOOD_COST,
    label: "View Food Cost & Variances",
    description: "Analyze theoretical vs actual ingredient variance and wastage",
    category: "Reports & Analytics",
    isDangerous: true,
  },
};

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
 * Flexible overload: accepts (role, permission) OR (role, customPermissionsJson, requiredPermission, activeRolePermissions?)
 */
export function hasPermission(
  role: string,
  param2: string,
  param3?: PermissionCode,
  activeRolePermissions?: Record<string, PermissionCode[]>
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

  // 1. If individual custom permissions exist and are non-empty, check them first
  if (customPermissionsJson) {
    try {
      const userPerms: string[] = JSON.parse(customPermissionsJson);
      if (Array.isArray(userPerms) && userPerms.length > 0) {
        return userPerms.includes(requiredPermission) || userPerms.includes("*");
      }
    } catch {
      // Fallback to role-level permissions
    }
  }

  // 2. Otherwise fall back to role-level permissions (customized by Owner or default)
  const rolePerms =
    activeRolePermissions?.[sysRole] ||
    DEFAULT_ROLE_PERMISSIONS[sysRole] ||
    [];

  return rolePerms.includes(requiredPermission) || rolePerms.includes("*" as any);
}
