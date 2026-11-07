"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChefHat,
  Bell,
  RefreshCw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Volume2,
  AlertTriangle,
  Flame,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// KDS Components & Hooks
import { KDSOrderCard, KDSTicket } from "@/components/kds/kds-order-card";
import { KDSStatsBar } from "@/components/kds/kds-stats-bar";
import { KDSReprintModal } from "@/components/kds/kds-reprint-modal";
import { useKDSStream, KDSEventData } from "@/hooks/use-kds-stream";
import { playKitchenChime } from "@/lib/kds-audio";

const STATIONS = [
  "All",
  "Main Kitchen",
  "Bakery",
  "Bar",
  "Beverage Counter",
];

export default function KitchenPage() {
  const [selectedStation, setSelectedStation] = useState<string>("All");
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [stationCounts, setStationCounts] = useState<Record<string, number>>({
    All: 0,
    "Main Kitchen": 0,
    Bakery: 0,
    Bar: 0,
    "Beverage Counter": 0,
  });
  const [stats, setStats] = useState({
    avgPrepMinutes: 12.4,
    completedCount: 38,
    onTimeRate: 94.2,
    activeCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reprintTarget, setReprintTarget] = useState<KDSTicket | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerAlert(msg);
    setTimeout(() => setBannerAlert(null), 5000);
  };

  // 1. Fetch tickets from backend
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `/api/kds/tickets?station=${encodeURIComponent(selectedStation)}`;
      const res = await fetch(url).then((r) => r.json());
      if (res.success) {
        setTickets(res.tickets);
        setStationCounts(res.stationCounts);
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to fetch KDS tickets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 2. Real-Time Event Stream Listener (Socket.IO / SSE)
  const handleRealtimeEvent = useCallback(
    (event: KDSEventData) => {
      console.log("Real-time KDS event received:", event.type, event.kot);

      if (event.type === "KOT_CREATED") {
        showBanner(`🔔 NEW ORDER: ${event.kot.kotNumber} (${event.kot.tableNumber || event.kot.orderType})`);
        fetchTickets();
      } else if (event.type === "KOT_STATUS_UPDATED" || event.type === "ITEM_STATUS_UPDATED") {
        fetchTickets();
      } else if (event.type === "KOT_REPRINTED") {
        showBanner(`🖨️ ${event.kot.kotNumber} reprinted for ${event.kot.station}`);
      }
    },
    [fetchTickets]
  );

  const { isConnected } = useKDSStream(handleRealtimeEvent, soundEnabled);

  // 3. Status Transition Bumper
  const handleUpdateStatus = async (kotId: string, newStatus: string) => {
    try {
      // Optimistic UI update
      setTickets((prev) =>
        prev.map((t) => (t.id === kotId ? { ...t, status: newStatus as any } : t))
      );

      const res = await fetch("/api/kds/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kotId, newStatus }),
      }).then((r) => r.json());

      if (res.success) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Update status error:", err);
      fetchTickets();
    }
  };

  // 4. Item-Level Bump
  const handleUpdateItemStatus = async (kotId: string, itemId: string, newStatus: string) => {
    try {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === kotId) {
            return {
              ...t,
              items: t.items.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it)),
            };
          }
          return t;
        })
      );

      await fetch("/api/kds/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kotId, itemId, newStatus }),
      });

      fetchTickets();
    } catch (err) {
      console.error("Update item status error:", err);
    }
  };

  // 5. Reprint API
  const handleConfirmReprint = async (reason: string) => {
    if (!reprintTarget) return;

    try {
      await fetch("/api/kds/reprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kotId: reprintTarget.id,
          reason,
          authorizedBy: "Kitchen Chef",
        }),
      });
      showBanner(`KOT ${reprintTarget.kotNumber} logged for reprint.`);
    } catch (err) {
      console.error("Reprint error:", err);
    }
  };

  // 6. Fullscreen Mode Toggle for Kitchen Touch Tablets
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Visual Flash Banner for New Orders */}
      {bannerAlert && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-white shadow-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2 font-black text-sm">
            <Flame className="h-5 w-5 animate-bounce" />
            <span>{bannerAlert}</span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="rounded bg-black/20 px-2 py-0.5 text-xs font-bold hover:bg-black/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & Kitchen Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Kitchen Display System (KDS)
            </h1>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Touch Terminal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time station order queue with auditory alerts, item bump checks, and live timers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            className="gap-1.5 text-xs h-9 font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-1.5 text-xs h-9 font-bold"
            title="Toggle Kitchen Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>
        </div>
      </div>

      {/* Preparation Time Statistics & Real-Time Telemetry Bar */}
      <KDSStatsBar
        stats={stats}
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Station Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {STATIONS.map((stationName) => {
          const isSelected = selectedStation === stationName;
          const count = stationCounts[stationName] || 0;

          return (
            <button
              key={stationName}
              onClick={() => setSelectedStation(stationName)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{stationName === "All" ? "All Stations (Expo)" : stationName}</span>
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                  isSelected
                    ? "bg-amber-400 text-slate-950"
                    : count > 0
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 shadow-xs">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">All Kitchen Orders Cleared!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No pending tickets for <span className="font-bold text-slate-700">{selectedStation}</span>. When POS fires a KOT, it will appear here instantly with an audible chime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <KDSOrderCard
              key={ticket.id}
              ticket={ticket}
              onUpdateStatus={handleUpdateStatus}
              onUpdateItemStatus={handleUpdateItemStatus}
              onReprint={(t) => setReprintTarget(t)}
            />
          ))}
        </div>
      )}

      {/* KOT Reprint Modal */}
      {reprintTarget && (
        <KDSReprintModal
          ticket={reprintTarget}
          onClose={() => setReprintTarget(null)}
          onConfirmReprint={handleConfirmReprint}
        />
      )}
    </div>
  );
}
