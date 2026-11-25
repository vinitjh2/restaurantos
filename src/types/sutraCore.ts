/**
 * SutraCore Cross-Platform Event Contracts & Unified Types
 * Shared across KioskSutra, DineSutra, StaySutra, and RankSutra
 */

export type SutraApp = "KIOSK" | "DINE" | "STAY" | "RANK";

export interface SutraTenant {
  organizationId: string;
  name: string;
  plan: "STARTER" | "PRO" | "ENTERPRISE";
  createdAt: string;
}

export interface SutraLocation {
  locationId: string;
  organizationId: string;
  name: string;
  type: "RESTAURANT" | "HOTEL" | "CAFE" | "RESORT";
  currency: "INR" | "USD";
  taxRate: number;
}

// Unified Guest / Customer Profile across Dining and Hotel stays
export interface SutraCustomer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  roomNumber?: string; // If staying at StaySutra hotel
  totalSpend: number;
  loyaltyPoints: number;
  reputationScore?: number; // Monitored by RankSutra
}

// The Sutra Event Bus Payloads
export type SutraEventType =
  | "kiosk.order.created"
  | "dine.order.prepared"
  | "dine.bill.room_charge_requested"
  | "stay.folio.charge_settled"
  | "stay.guest.checked_out"
  | "dine.order.paid"
  | "rank.review.solicitation_queued";

export interface SutraEvent<T = any> {
  eventId: string;
  eventType: SutraEventType;
  timestamp: number;
  sourceApp: SutraApp;
  organizationId: string;
  locationId: string;
  payload: T;
}

/**
 * Lightweight in-memory & broadcast event dispatcher
 * Can connect to WebSockets, Redis, or Inngest/QStash
 */
type EventHandler<T = any> = (event: SutraEvent<T>) => void | Promise<void>;

class SutraEventBus {
  private handlers: Map<SutraEventType, EventHandler[]> = new Map();

  subscribe<T = any>(eventType: SutraEventType, handler: EventHandler<T>) {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);
    return () => {
      const updated = (this.handlers.get(eventType) || []).filter((h) => h !== handler);
      this.handlers.set(eventType, updated);
    };
  }

  async publish<T = any>(event: SutraEvent<T>) {
    const list = this.handlers.get(event.eventType) || [];
    for (const handler of list) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error processing event ${event.eventType}:`, err);
      }
    }
  }
}

export const sutraEvents = new SutraEventBus();
