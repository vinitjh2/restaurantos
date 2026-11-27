export interface DashboardHourlyBucket {
  time: string;
  sales: number;
  orders: number;
}

export interface DashboardPeriodicPoint {
  date: string;
  label: string;
  revenue: number;
  sales: number;
  orders: number;
}

export interface DashboardChannelSlice {
  name: string;
  key: string;
  value: number;
  count: number;
  fill: string;
}

export interface DashboardPaymentSlice {
  name: string;
  method: string;
  amount: number;
  value: number;
  fill: string;
}

export interface DashboardTopDish {
  name: string;
  category: string;
  count: number;
  quantity: number;
  revenue: number;
  diet: "VEG" | "NON_VEG";
}

export interface DashboardActivity {
  id: string;
  type: "BILL" | "KOT" | "DISCOUNT" | "SHIFT" | "INVENTORY" | "SYSTEM";
  title: string;
  description: string;
  time: string;
  user: string;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  timeRange: string;
  branchCode: string;
  metrics: {
    grossSales: number;
    netSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalTaxable: number;
    cgstCollected: number;
    sgstCollected: number;
    totalTaxes: number;
    totalDiscounts: number;
    totalRefunds: number;
    cancelledOrdersCount: number;
    operatingExpenses: number;
    cogs: number;
    wastageLoss: number;
    foodCostPercent: number;
    netOperatingProfit: number;
    netMarginPercent: number;
  };
  floorTelemetry: {
    occupiedTables: number;
    billedTables: number;
    cleaningTables: number;
    availableTables: number;
    totalTables: number;
  };
  kdsTelemetry: {
    activeKots: number;
    avgPrepSeconds: number;
    stationsSummary: string;
  };
  directSavings: {
    directOrdersCount: number;
    commissionSaved: number;
  };
  cashTillTelemetry: {
    hasOpenShift: boolean;
    shiftLabel: string;
    expectedCash: number;
    openingBalance: number;
    cashDrops: number;
    cashVariance: number;
  };
  periodicSales: DashboardPeriodicPoint[];
  hourlySales: DashboardHourlyBucket[];
  orderTypeDistribution: DashboardChannelSlice[];
  paymentMethods: DashboardPaymentSlice[];
  topSellingDishes: DashboardTopDish[];
  recentActivities: DashboardActivity[];
  pnlReport: any;
}
