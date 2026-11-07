"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { playKitchenChime } from "@/lib/kds-audio";

export interface KDSEventData {
  type: "KOT_CREATED" | "KOT_STATUS_UPDATED" | "ITEM_STATUS_UPDATED" | "KOT_REPRINTED" | "KOT_CANCELLED";
  kot: any;
  timestamp: string;
}

export function useKDSStream(onEventCallback?: (event: KDSEventData) => void, soundEnabled: boolean = true) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<KDSEventData | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/kds/events");
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "CONNECTED") {
          setIsConnected(true);
          return;
        }

        const kdsEvent = data as KDSEventData;
        setLastEvent(kdsEvent);

        // Sound chime for new incoming orders
        if (kdsEvent.type === "KOT_CREATED" && soundEnabled) {
          playKitchenChime();
        }

        if (onEventCallback) {
          onEventCallback(kdsEvent);
        }
      } catch (err) {
        // ignore heartbeat ping errors
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, [onEventCallback, soundEnabled]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastEvent };
}
