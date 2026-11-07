"use client";

import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Volume2,
  VolumeX,
  Radio,
  Flame,
} from "lucide-react";
import { playKitchenChime } from "@/lib/kds-audio";

interface KDSStatsBarProps {
  stats: {
    avgPrepMinutes: number;
    completedCount: number;
    onTimeRate: number;
    activeCount: number;
  };
  isConnected: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function KDSStatsBar({
  stats,
  isConnected,
  soundEnabled,
  onToggleSound,
}: KDSStatsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
      {/* Real-Time Connection Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-xs font-bold text-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            )}
          </span>
          <span className="font-semibold">
            {isConnected ? "Socket.IO Live Stream" : "Reconnecting..."}
          </span>
        </div>

        {/* Audio Notification Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            if (!soundEnabled) playKitchenChime();
          }}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
            soundEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
          title="Toggle Kitchen Chime"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span>{soundEnabled ? "Chime ON" : "Muted"}</span>
        </button>

        <button
          onClick={() => playKitchenChime()}
          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Test Bell
        </button>
      </div>

      {/* Live Operational Preparation Statistics */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Pending Tickets */}
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-1.5 text-amber-900 font-bold">
          <Flame className="h-4 w-4 text-amber-600" />
          <span>Active Queue: {stats.activeCount} Tickets</span>
        </div>

        {/* Average Prep Duration */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-slate-800 font-semibold">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Avg Prep: {stats.avgPrepMinutes}m</span>
        </div>

        {/* On-Time Rate */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-slate-800 font-semibold">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span>On-Time: {stats.onTimeRate}%</span>
        </div>

        {/* Completed Today */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-slate-800 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <span>Fulfilled Today: {stats.completedCount}</span>
        </div>
      </div>
    </div>
  );
}
