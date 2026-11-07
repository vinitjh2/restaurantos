import { EventEmitter } from "events";

export interface KDSEventPayload {
  type: "KOT_CREATED" | "KOT_STATUS_UPDATED" | "ITEM_STATUS_UPDATED" | "KOT_REPRINTED" | "KOT_CANCELLED";
  kot: any;
  timestamp: string;
}

// Global Singleton EventEmitter across HMR in development
const globalForKDS = global as unknown as { kdsEventEmitter?: EventEmitter };

export const kdsEmitter = globalForKDS.kdsEventEmitter || new EventEmitter();
kdsEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalForKDS.kdsEventEmitter = kdsEmitter;
}

export function broadcastKDSEvent(type: KDSEventPayload["type"], kot: any) {
  const payload: KDSEventPayload = {
    type,
    kot,
    timestamp: new Date().toISOString(),
  };
  kdsEmitter.emit("kds_event", payload);
}
