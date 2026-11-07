"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Printer,
  Check,
  AlertTriangle,
  Flame,
  ChefHat,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface KDSItem {
  id: string;
  itemName: string;
  variantName?: string | null;
  quantity: number;
  station: string;
  status: string; // PENDING, COOKING, READY
  cookingNotes?: string | null;
}

export interface KDSTicket {
  id: string;
  kotNumber: string;
  orderId: string;
  tableNumber?: string | null;
  orderType: string;
  station: string;
  status: "NEW" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED";
  createdAt: string;
  acceptedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  items: KDSItem[];
  order?: {
    orderNumber: string;
    orderType: string;
    customerName?: string | null;
    customerNotes?: string | null;
  };
}

interface KDSOrderCardProps {
  ticket: KDSTicket;
  onUpdateStatus: (kotId: string, newStatus: string) => void;
  onUpdateItemStatus: (kotId: string, itemId: string, newStatus: string) => void;
  onReprint: (ticket: KDSTicket) => void;
}

export function KDSOrderCard({
  ticket,
  onUpdateStatus,
  onUpdateItemStatus,
  onReprint,
}: KDSOrderCardProps) {
  // Live Stopwatch / Elapsed seconds from createdAt
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const updateElapsed = () => {
      const created = new Date(ticket.createdAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - created) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [ticket.createdAt]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Rush & Urgency Slabs:
  // Normal: < 10 mins (600s)
  // Warning/Delayed: 10 - 20 mins (600 - 1200s)
  // Critical Rush: > 20 mins (> 1200s)
  const isCritical = elapsedSeconds > 1200 && ticket.status !== "READY" && ticket.status !== "SERVED";
  const isWarning =
    elapsedSeconds > 600 && elapsedSeconds <= 1200 && ticket.status !== "READY" && ticket.status !== "SERVED";

  // Card border styling
  const cardBorder = isCritical
    ? "border-2 border-rose-500 shadow-lg shadow-rose-500/10"
    : isWarning
    ? "border-2 border-amber-400 shadow-md shadow-amber-400/5"
    : ticket.status === "READY"
    ? "border-2 border-emerald-500 shadow-md shadow-emerald-500/5"
    : "border border-slate-200";

  // Next status action configuration
  const getNextAction = () => {
    switch (ticket.status) {
      case "NEW":
        return { label: "Accept Order", nextStatus: "ACCEPTED", color: "bg-blue-600 hover:bg-blue-700" };
      case "ACCEPTED":
        return { label: "Start Cooking", nextStatus: "PREPARING", color: "bg-amber-600 hover:bg-amber-700" };
      case "PREPARING":
        return { label: "Mark Ready for Pickup", nextStatus: "READY", color: "bg-emerald-600 hover:bg-emerald-700" };
      case "READY":
        return { label: "Serve / Complete", nextStatus: "SERVED", color: "bg-slate-900 hover:bg-slate-800" };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div
      className={`flex flex-col rounded-2xl bg-white overflow-hidden transition-all duration-200 select-none ${cardBorder}`}
    >
      {/* 1. Ticket Header */}
      <div
        className={`flex items-center justify-between p-3.5 border-b text-xs font-bold ${
          isCritical
            ? "bg-rose-500 text-white border-rose-600"
            : isWarning
            ? "bg-amber-500 text-white border-amber-600"
            : ticket.status === "READY"
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-slate-900 text-white border-slate-800"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight">{ticket.kotNumber}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                isCritical || isWarning || ticket.status === "READY"
                  ? "bg-white/20 text-white"
                  : "bg-amber-400 text-slate-950"
              }`}
            >
              {ticket.status}
            </span>
          </div>
          <div className="text-[11px] font-semibold opacity-90 mt-0.5">
            {ticket.tableNumber ? `TABLE: ${ticket.tableNumber}` : ticket.orderType}
            {ticket.order?.customerName ? ` · ${ticket.order.customerName}` : ""}
          </div>
        </div>

        {/* Live Elapsed Stopwatch Badge */}
        <div className="flex flex-col items-end">
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-extrabold font-mono shadow-xs ${
              isCritical
                ? "bg-white text-rose-700 animate-pulse"
                : isWarning
                ? "bg-white text-amber-800"
                : "bg-white/10 text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
          {isCritical && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-white mt-0.5 animate-bounce">
              ⚠️ RUSH DELAYED
            </span>
          )}
        </div>
      </div>

      {/* 2. Order Metadata Sub-Header */}
      <div className="flex items-center justify-between bg-slate-50 px-3.5 py-1.5 border-b border-slate-100 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">Station: {ticket.station}</span>
        <button
          onClick={() => onReprint(ticket)}
          className="flex items-center gap-1 rounded hover:bg-slate-200 px-1.5 py-0.5 text-slate-600 transition-colors"
          title="Reprint KOT"
        >
          <Printer className="h-3 w-3" />
          <span>Reprint</span>
        </button>
      </div>

      {/* 3. Items List with Item-Level Bump Checkboxes */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3.5 space-y-2.5 min-h-[170px]">
        {ticket.items.map((item) => {
          const isItemDone = item.status === "READY";
          return (
            <div
              key={item.id}
              onClick={() =>
                onUpdateItemStatus(ticket.id, item.id, isItemDone ? "PENDING" : "READY")
              }
              className={`flex items-start gap-2.5 pt-1.5 cursor-pointer rounded-lg p-1.5 transition-colors ${
                isItemDone ? "bg-slate-50/80 opacity-60 line-through" : "hover:bg-slate-50"
              }`}
            >
              {/* Item Qty Badge */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold shadow-xs ${
                  isItemDone
                    ? "bg-emerald-100 text-emerald-800 line-through"
                    : "bg-slate-900 text-white"
                }`}
              >
                x{item.quantity}
              </span>

              {/* Item Details */}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 leading-tight">
                    {item.itemName}
                  </span>
                  {item.station && item.station !== ticket.station && (
                    <span className="rounded bg-amber-50 border border-amber-200 px-1 py-0.2 text-[9px] font-bold text-amber-700">
                      {item.station}
                    </span>
                  )}
                </div>

                {item.variantName && (
                  <span className="text-[11px] text-slate-500 font-medium block">
                    [{item.variantName}]
                  </span>
                )}

                {item.cookingNotes && (
                  <div className="mt-1 flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>NOTE: {item.cookingNotes}</span>
                  </div>
                )}
              </div>

              {/* Individual Item Checked Indicator */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isItemDone
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isItemDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Touch Bump Bar Footer */}
      {nextAction && (
        <div className="border-t border-slate-100 p-2.5 bg-slate-50/70">
          <Button
            onClick={() => onUpdateStatus(ticket.id, nextAction.nextStatus)}
            className={`w-full h-10 gap-2 text-white font-extrabold text-xs shadow-sm active:scale-[0.98] transition-all ${nextAction.color}`}
          >
            <Check className="h-4 w-4" />
            <span>{nextAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </div>
      )}
    </div>
  );
}
