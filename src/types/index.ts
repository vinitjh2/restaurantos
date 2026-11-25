export interface CustomizationOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "Kathi Rolls" | "Momos & Wontons" | "Kolkata Biryani" | "Chowmein & Rice" | "Crispy Fries & Snacks" | "Chai & Refreshments" | string;
  price: number;
  description: string;
  isVeg: boolean;
  isBestseller?: boolean;
  isAvailable: boolean;
  isReadymade?: boolean; // True for Biryani, Cold Drinks, Chai that need 0 cooking time and can be served immediately
  prepTimeMinutes: number;
  imageEmoji: string;
  availableSpiceLevels?: string[]; // ["Mild", "Medium", "Desi Spicy 🌶️", "Kolkata Fire 🔥"]
  allowedAddOns?: CustomizationOption[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  isReadymade?: boolean;
  selectedSpiceLevel?: string;
  selectedAddOns?: CustomizationOption[];
  specialNote?: string; // e.g. "No Onion, Extra Kasundi / Mustard"
}

export type OrderStatus = "PENDING_CONFIRMATION" | "COOKING" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PAID_UPI" | "PENDING_CASH_COUNTER" | "PAID_CASH";

export interface Order {
  id: string;
  tokenNumber: number; // e.g. 42
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "UPI" | "CASH";
  createdAt: number;
  cookingStartedAt?: number;
  readyAt?: number;
  completedAt?: number;
  source: "QR_CUSTOMER" | "COUNTER_MANUAL";
}

export interface KioskProfile {
  id: string;
  name: string;
  tagline: string;
  area: string;
  city: string;
  upiId: string;
  phone: string;
  isOpen: boolean;
  autoAcceptOrders: boolean;
  estimatedPrepTimeMin: number;
  counterTokenPrefix: string;
}

export type ActiveScreen =
  | "universe"
  | "landing"
  | "login"
  | "register"
  | "customer"
  | "kitchen"
  | "manager"
  | "owner"
  | "split";

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kioskName: string;
  city: string;
  area: string;
  cuisine: string;
  upiId: string;
  role: "OWNER" | "MANAGER" | "COOK";
  plan: "STARTER" | "PRO" | "FRANCHISE";
  createdAt: number;
}


