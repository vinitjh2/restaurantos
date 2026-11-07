/**
 * RestaurantOS Modular Third-Party Integrations Engine
 * Core types, statuses and provider contracts.
 */

export type IntegrationStatus =
  | "DISCONNECTED"
  | "CREDENTIALS_CONFIGURED"
  | "SANDBOX_VERIFIED"
  | "OPERATIONAL"
  | "AUTHENTICATION_ERROR";

export type IntegrationProvider =
  | "RAZORPAY"
  | "WHATSAPP"
  | "ZOMATO"
  | "SWIGGY"
  | "ACCOUNTING";

export interface IntegrationHealthCheck {
  provider: IntegrationProvider;
  name: string;
  category: "PAYMENTS" | "MESSAGING" | "FOOD_DELIVERY" | "ACCOUNTING";
  status: IntegrationStatus;
  isLiveOperational: boolean;
  credentialsPresent: boolean;
  endpoint: string;
  lastTestedAt?: string;
  message: string;
  testDetails?: any;
}

export interface WhatsAppNotificationPayload {
  recipientPhone: string;
  customerName: string;
  templateName: "ORDER_RECEIPT" | "KITCHEN_READY" | "TABLE_RESERVATION" | "LOYALTY_REWARD";
  parameters: Record<string, string | number>;
}

export interface DeliveryPlatformOrder {
  platform: "ZOMATO" | "SWIGGY";
  platformOrderId: string;
  customerName: string;
  customerPhoneMasked?: string;
  deliveryAddress: string;
  items: Array<{
    platformItemId: string;
    name: string;
    quantity: number;
    price: number;
    customizations?: string[];
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  orderTime: string;
}
