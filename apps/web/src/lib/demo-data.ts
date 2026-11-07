/**
 * RestaurantOS Realistic Demo Dataset
 * 
 * IMPORTANT: This module is strictly for UI development and preview.
 * Production components dynamically swap this with real TanStack Query API hooks.
 */

export interface RestaurantBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  gstin: string;
  fssai: string;
}

export const DEMO_RESTAURANTS = [
  { id: "org_1", name: "Bawarchi Royale Hospitality" },
  { id: "org_2", name: "Chai & Chaat Bistro" },
];

export const DEMO_BRANCHES: RestaurantBranch[] = [
  {
    id: "br_1",
    name: "Indiranagar Flagship",
    code: "IND-01",
    city: "Bengaluru",
    gstin: "29AABCU9603R1ZM",
    fssai: "11223334000189",
  },
  {
    id: "br_2",
    name: "Koramangala 4th Block",
    code: "KOR-02",
    city: "Bengaluru",
    gstin: "29AABCU9603R1ZM",
    fssai: "11223334000214",
  },
  {
    id: "br_3",
    name: "Whitefield Tech Park",
    code: "WTF-03",
    city: "Bengaluru",
    gstin: "29AABCU9603R1ZM",
    fssai: "11223334000305",
  },
];

export const DEMO_STATS = {
  grossSalesToday: 148650,
  grossSalesChange: 14.2,
  netSalesToday: 136280,
  netSalesChange: 12.8,
  totalOrdersToday: 284,
  ordersChange: 8.5,
  avgOrderValue: 523,
  aovChange: 5.1,
  pendingOrders: 9,
  cancelledOrders: 2,
  totalExpensesToday: 38400,
  estimatedProfitToday: 97880,
};

export const DEMO_HOURLY_SALES = [
  { time: "11 AM", sales: 4200, orders: 8 },
  { time: "12 PM", sales: 12800, orders: 24 },
  { time: "01 PM", sales: 26400, orders: 48 },
  { time: "02 PM", sales: 21900, orders: 39 },
  { time: "03 PM", sales: 7800, orders: 15 },
  { time: "04 PM", sales: 5400, orders: 12 },
  { time: "05 PM", sales: 6900, orders: 16 },
  { time: "06 PM", sales: 9800, orders: 20 },
  { time: "07 PM", sales: 16500, orders: 31 },
  { time: "08 PM", sales: 32400, orders: 58 },
  { time: "09 PM", sales: 29800, orders: 52 },
  { time: "10 PM", sales: 18200, orders: 32 },
  { time: "11 PM", sales: 6650, orders: 11 },
];

export const DEMO_WEEKLY_REVENUE = [
  { day: "Mon", revenue: 94500, orders: 192 },
  { day: "Tue", revenue: 102400, orders: 210 },
  { day: "Wed", revenue: 115800, orders: 234 },
  { day: "Thu", revenue: 118200, orders: 240 },
  { day: "Fri", revenue: 168400, orders: 312 },
  { day: "Sat", revenue: 214500, orders: 418 },
  { day: "Sun", revenue: 238900, orders: 456 },
];

export const DEMO_MONTHLY_REVENUE = [
  { month: "Jan", revenue: 38.4, target: 36.0 },
  { month: "Feb", revenue: 41.2, target: 38.0 },
  { month: "Mar", revenue: 44.8, target: 42.0 },
  { month: "Apr", revenue: 46.5, target: 44.0 },
  { month: "May", revenue: 52.1, target: 48.0 },
  { month: "Jun", revenue: 49.8, target: 50.0 },
  { month: "Jul", revenue: 54.2, target: 52.0 },
  { month: "Aug", revenue: 58.6, target: 55.0 },
  { month: "Sep", revenue: 61.3, target: 58.0 },
  { month: "Oct", revenue: 68.9, target: 65.0 },
  { month: "Nov", revenue: 74.2, target: 70.0 },
  { month: "Dec", revenue: 82.5, target: 75.0 },
];

export const DEMO_ORDER_TYPE_DISTRIBUTION = [
  { name: "Dine-In", value: 52, count: 148, fill: "#3b82f6" },
  { name: "Takeaway", value: 18, count: 51, fill: "#10b981" },
  { name: "Delivery (Zomato/Swiggy)", value: 22, count: 62, fill: "#f59e0b" },
  { name: "QR Self-Order", value: 8, count: 23, fill: "#8b5cf6" },
];

export const DEMO_PAYMENT_METHOD_DISTRIBUTION = [
  { name: "UPI (GPay / PhonePe)", value: 58, amount: 86217, fill: "#10b981" },
  { name: "Credit / Debit Card", value: 22, amount: 32703, fill: "#3b82f6" },
  { name: "Cash", value: 14, amount: 20811, fill: "#f59e0b" },
  { name: "Aggregator Credit", value: 6, amount: 8919, fill: "#8b5cf6" },
];

export const DEMO_TOP_DISHES = [
  { name: "Murgh Dum Biryani", category: "Biryani", count: 142, revenue: 49700, diet: "NON_VEG" },
  { name: "Butter Chicken", category: "Main Course", count: 118, revenue: 43660, diet: "NON_VEG" },
  { name: "Paneer Butter Masala", category: "Main Course", count: 96, revenue: 30720, diet: "VEG" },
  { name: "Garlic Naan (Butter)", category: "Breads", count: 240, revenue: 19200, diet: "VEG" },
  { name: "Tandoori Chicken (Full)", category: "Tandoor", count: 48, revenue: 23040, diet: "NON_VEG" },
  { name: "Dal Makhani", category: "Dal", count: 82, revenue: 20500, diet: "VEG" },
  { name: "Crispy Corn Pepper Salt", category: "Starters", count: 65, revenue: 15600, diet: "VEG" },
];

export interface RecentOrder {
  id: string;
  orderNumber: string;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "QR_DIGITAL";
  tableOrChannel: string;
  itemsSummary: string;
  totalAmount: number;
  status: "OPEN" | "PREPARING" | "SERVED" | "PAID" | "CANCELLED";
  paymentStatus: "PAID" | "UNPAID" | "PARTIAL";
  paymentMethod?: string;
  time: string;
}

export const DEMO_RECENT_ORDERS: RecentOrder[] = [
  {
    id: "ord_101",
    orderNumber: "#284",
    orderType: "DINE_IN",
    tableOrChannel: "Table 12 (Balcony)",
    itemsSummary: "2x Butter Chicken, 4x Garlic Naan, 1x Dal Makhani",
    totalAmount: 1280,
    status: "PREPARING",
    paymentStatus: "UNPAID",
    time: "2 mins ago",
  },
  {
    id: "ord_102",
    orderNumber: "#283",
    orderType: "QR_DIGITAL",
    tableOrChannel: "Table 4 (Indoor AC)",
    itemsSummary: "1x Paneer Tikka, 2x Cold Coffee",
    totalAmount: 540,
    status: "PREPARING",
    paymentStatus: "PAID",
    paymentMethod: "UPI (Google Pay)",
    time: "6 mins ago",
  },
  {
    id: "ord_103",
    orderNumber: "#282",
    orderType: "DELIVERY",
    tableOrChannel: "Zomato (#9841)",
    itemsSummary: "1x Chicken Dum Biryani, 1x Gulab Jamun (2 pcs)",
    totalAmount: 495,
    status: "SERVED",
    paymentStatus: "PAID",
    paymentMethod: "Zomato Pay",
    time: "11 mins ago",
  },
  {
    id: "ord_104",
    orderNumber: "#281",
    orderType: "TAKEAWAY",
    tableOrChannel: "Counter Pickup",
    itemsSummary: "2x Veg Hakka Noodles, 1x Chilli Paneer Dry",
    totalAmount: 620,
    status: "PAID",
    paymentStatus: "PAID",
    paymentMethod: "Cash",
    time: "18 mins ago",
  },
  {
    id: "ord_105",
    orderNumber: "#280",
    orderType: "DINE_IN",
    tableOrChannel: "Table 7 (Ground)",
    itemsSummary: "1x Tandoori Chicken, 2x Roti, 1x Fresh Lime Soda",
    totalAmount: 670,
    status: "PAID",
    paymentStatus: "PAID",
    paymentMethod: "Credit Card (HDFC)",
    time: "25 mins ago",
  },
  {
    id: "ord_106",
    orderNumber: "#279",
    orderType: "DINE_IN",
    tableOrChannel: "Table 9 (Family Section)",
    itemsSummary: "3x Murgh Biryani, 3x Mirchi Ka Salan, 1x Raita",
    totalAmount: 1190,
    status: "PAID",
    paymentStatus: "PAID",
    paymentMethod: "UPI (PhonePe)",
    time: "34 mins ago",
  },
];

export interface LowStockAlert {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  status: "CRITICAL" | "WARNING";
}

export const DEMO_LOW_STOCK: LowStockAlert[] = [
  {
    id: "stk_1",
    name: "Amul Pasteurised Butter",
    category: "Dairy",
    currentStock: 2.4,
    reorderLevel: 10.0,
    unit: "Kg",
    status: "CRITICAL",
  },
  {
    id: "stk_2",
    name: "Fresh Malai Paneer",
    category: "Dairy",
    currentStock: 3.5,
    reorderLevel: 15.0,
    unit: "Kg",
    status: "CRITICAL",
  },
  {
    id: "stk_3",
    name: "Boneless Chicken Breast",
    category: "Poultry",
    currentStock: 8.0,
    reorderLevel: 25.0,
    unit: "Kg",
    status: "WARNING",
  },
  {
    id: "stk_4",
    name: "Basmati Biryani Rice (Daawat)",
    category: "Grains",
    currentStock: 18.0,
    reorderLevel: 40.0,
    unit: "Kg",
    status: "WARNING",
  },
  {
    id: "stk_5",
    name: "Cooking Cream (Milky Mist)",
    category: "Dairy",
    currentStock: 4.0,
    reorderLevel: 12.0,
    unit: "Litre",
    status: "WARNING",
  },
];

export interface ActivityItem {
  id: string;
  type: "ORDER" | "BILL" | "KOT" | "INVENTORY" | "SHIFT" | "DISCOUNT";
  title: string;
  description: string;
  user: string;
  time: string;
  iconType: string;
}

export const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "act_1",
    type: "BILL",
    title: "Bill Settled ₹1,280",
    description: "Invoice #IND/2026-27/0284 settled via PhonePe UPI",
    user: "Rahul S (Cashier)",
    time: "Just now",
    iconType: "check",
  },
  {
    id: "act_2",
    type: "KOT",
    title: "New KOT Dispatched",
    description: "KOT #142 sent to Tandoor Station for Table 12",
    user: "Vikram (Captain)",
    time: "4 mins ago",
    iconType: "chef",
  },
  {
    id: "act_3",
    type: "DISCOUNT",
    title: "Manager Discount Applied (10%)",
    description: "₹140 discount on Table 8 (Reason: Corporate Tie-up)",
    user: "Ananya Roy (Manager)",
    time: "14 mins ago",
    iconType: "percent",
  },
  {
    id: "act_4",
    type: "SHIFT",
    title: "Cash Drawer Opened",
    description: "Shift #44 started with opening float of ₹5,000",
    user: "Rahul S (Cashier)",
    time: "11:00 AM",
    iconType: "wallet",
  },
  {
    id: "act_5",
    type: "INVENTORY",
    title: "GRN Received #PO-881",
    description: "Dairy Fresh delivered 20 Kg Milk & 15 Kg Curd",
    user: "Karthik (Inventory)",
    time: "09:30 AM",
    iconType: "truck",
  },
];
