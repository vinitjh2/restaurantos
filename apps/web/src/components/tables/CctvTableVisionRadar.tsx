"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Video,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Flame,
  UtensilsCrossed,
  ChefHat,
  UserCheck,
  RefreshCw,
  Play,
  Sliders,
  Settings,
  Layers,
  Activity,
  Wifi,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Info,
  Maximize2,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CctvTable {
  id: string;
  tableNumber: string;
  section: string;
  capacity: number;
  status: "FREE" | "SEATED" | "SLA_BREACH" | "DIRTY" | "CLEANING";
  guestCount: number;
  seatedSeconds: number; // Seconds since seated
  noWaiterAlert: boolean; // True if seated > 300s (5m) and waiter hasn't arrived
  waiterAssigned?: string;
  waiterArrived: boolean;
  orderStatus?: "UNATTENDED" | "ORDERED" | "EATING" | "BILL_REQUESTED";
  guestsDepartedSeconds?: number; // Seconds since table vacated
  // Polygon coordinates in percentage of camera feed (0-100)
  polygon: { x: number; y: number }[];
  center: { x: number; y: number };
}

export interface CctvPerson {
  id: string;
  type: "CUSTOMER" | "WAITER" | "BUSSER";
  label: string;
  box: { x: number; y: number; w: number; h: number }; // percentage
  tableId?: string;
  durationSeconds: number;
}

const INITIAL_CCTV_TABLES: CctvTable[] = [
  {
    id: "t-01",
    tableNumber: "T-01",
    section: "Main Hall",
    capacity: 2,
    status: "SEATED",
    guestCount: 2,
    seatedSeconds: 1240, // ~20m
    noWaiterAlert: false,
    waiterAssigned: "Waiter A",
    waiterArrived: true,
    orderStatus: "BILL_REQUESTED",
    polygon: [
      { x: 14, y: 32 },
      { x: 30, y: 32 },
      { x: 34, y: 52 },
      { x: 12, y: 52 },
    ],
    center: { x: 22, y: 42 },
  },
  {
    id: "t-02",
    tableNumber: "T-02",
    section: "Main Hall",
    capacity: 4,
    status: "SEATED",
    guestCount: 4,
    seatedSeconds: 680, // ~11m
    noWaiterAlert: false,
    waiterAssigned: "Waiter A",
    waiterArrived: true,
    orderStatus: "EATING",
    polygon: [
      { x: 38, y: 34 },
      { x: 58, y: 34 },
      { x: 62, y: 54 },
      { x: 36, y: 54 },
    ],
    center: { x: 48, y: 44 },
  },
  {
    id: "t-03",
    tableNumber: "T-03",
    section: "Main Hall",
    capacity: 4,
    status: "SLA_BREACH",
    guestCount: 3,
    seatedSeconds: 312, // 5 min 12 sec! (Breached 5m SLA)
    noWaiterAlert: true,
    waiterAssigned: undefined,
    waiterArrived: false,
    orderStatus: "UNATTENDED",
    polygon: [
      { x: 68, y: 35 },
      { x: 88, y: 35 },
      { x: 92, y: 56 },
      { x: 66, y: 56 },
    ],
    center: { x: 78, y: 45 },
  },
  {
    id: "t-04",
    tableNumber: "T-04",
    section: "Window Bay",
    capacity: 2,
    status: "FREE",
    guestCount: 0,
    seatedSeconds: 0,
    noWaiterAlert: false,
    waiterArrived: false,
    orderStatus: undefined,
    polygon: [
      { x: 16, y: 64 },
      { x: 34, y: 64 },
      { x: 38, y: 88 },
      { x: 14, y: 88 },
    ],
    center: { x: 25, y: 76 },
  },
  {
    id: "t-05",
    tableNumber: "T-05",
    section: "Window Bay",
    capacity: 6,
    status: "DIRTY",
    guestCount: 0,
    seatedSeconds: 0,
    guestsDepartedSeconds: 140, // Left 2m 20s ago
    noWaiterAlert: false,
    waiterArrived: false,
    orderStatus: undefined,
    polygon: [
      { x: 44, y: 65 },
      { x: 68, y: 65 },
      { x: 72, y: 90 },
      { x: 42, y: 90 },
    ],
    center: { x: 56, y: 78 },
  },
  {
    id: "t-06",
    tableNumber: "T-06",
    section: "Corner Booth",
    capacity: 4,
    status: "FREE",
    guestCount: 0,
    seatedSeconds: 0,
    noWaiterAlert: false,
    waiterArrived: false,
    orderStatus: undefined,
    polygon: [
      { x: 76, y: 66 },
      { x: 94, y: 66 },
      { x: 98, y: 89 },
      { x: 74, y: 89 },
    ],
    center: { x: 85, y: 77 },
  },
];

const INITIAL_CCTV_PERSONS: CctvPerson[] = [
  // Customers at T-01
  { id: "p-01", type: "CUSTOMER", label: "Customer [20:40]", box: { x: 16, y: 36, w: 7, h: 14 }, tableId: "t-01", durationSeconds: 1240 },
  { id: "p-02", type: "CUSTOMER", label: "Customer [20:40]", box: { x: 26, y: 37, w: 7, h: 13 }, tableId: "t-01", durationSeconds: 1240 },
  // Customers at T-02
  { id: "p-03", type: "CUSTOMER", label: "Customer [11:20]", box: { x: 41, y: 38, w: 7, h: 14 }, tableId: "t-02", durationSeconds: 680 },
  { id: "p-04", type: "CUSTOMER", label: "Customer [11:20]", box: { x: 51, y: 37, w: 8, h: 14 }, tableId: "t-02", durationSeconds: 680 },
  // Customers at T-03 (No Waiter!)
  { id: "p-05", type: "CUSTOMER", label: "Customer [05:12]", box: { x: 71, y: 39, w: 7, h: 14 }, tableId: "t-03", durationSeconds: 312 },
  { id: "p-06", type: "CUSTOMER", label: "Customer [05:12]", box: { x: 81, y: 40, w: 7, h: 14 }, tableId: "t-03", durationSeconds: 312 },
  // Waiter near T-02
  { id: "p-waiter-1", type: "WAITER", label: "Waiter A", box: { x: 48, y: 22, w: 8, h: 18 }, tableId: "t-02", durationSeconds: 45 },
];

// Peak Hours Analytics Data (From 0:30 in video)
const PEAK_HOURS_DATA = [
  { time: "11 AM", occupancy: 15, waiters: 2, avgTurnoverMin: 38 },
  { time: "12 PM", occupancy: 42, waiters: 4, avgTurnoverMin: 41 },
  { time: "1 PM", occupancy: 88, waiters: 7, avgTurnoverMin: 45 }, // Peak lunch
  { time: "2 PM", occupancy: 95, waiters: 8, avgTurnoverMin: 46 },
  { time: "3 PM", occupancy: 60, waiters: 5, avgTurnoverMin: 40 },
  { time: "4 PM", occupancy: 25, waiters: 2, avgTurnoverMin: 36 },
  { time: "5 PM", occupancy: 20, waiters: 2, avgTurnoverMin: 35 },
  { time: "6 PM", occupancy: 35, waiters: 3, avgTurnoverMin: 39 },
  { time: "7 PM", occupancy: 65, waiters: 6, avgTurnoverMin: 43 },
  { time: "8 PM", occupancy: 98, waiters: 9, avgTurnoverMin: 48 }, // Peak dinner
  { time: "9 PM", occupancy: 96, waiters: 9, avgTurnoverMin: 49 },
  { time: "10 PM", occupancy: 70, waiters: 6, avgTurnoverMin: 44 },
  { time: "11 PM", occupancy: 30, waiters: 3, avgTurnoverMin: 38 },
];

export function CctvTableVisionRadar() {
  const [tables, setTables] = useState<CctvTable[]>(INITIAL_CCTV_TABLES);
  const [persons, setPersons] = useState<CctvPerson[]>(INITIAL_CCTV_PERSONS);
  const [activeCam, setActiveCam] = useState<"CAM-01" | "CAM-02" | "CAM-03" | "CAM-04">("CAM-01");
  const [showPolygons, setShowPolygons] = useState(true);
  const [showPersons, setShowPersons] = useState(true);
  const [showTimers, setShowTimers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<CctvTable | null>(tables[2]); // Default to T-03 alert
  const [rtspUrl, setRtspUrl] = useState("rtsp://admin:pass@192.168.1.108:554/ch0_sub.264");
  const [isRtspModalOpen, setIsRtspModalOpen] = useState(false);
  const [simRunning, setSimRunning] = useState(true);
  const [activeTab, setActiveTab] = useState<"RADAR" | "ANALYTICS" | "RTSP">("RADAR");

  // Web Audio Ping Generator
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35); // drop to A4

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Web audio playback not allowed yet", e);
    }
  };

  // Clock & Timer Interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(
        now.toISOString().replace("T", " ").substring(0, 19) +
          "." +
          String(now.getMilliseconds()).padStart(3, "0")
      );

      // Advance table timers if simulation is running
      if (simRunning) {
        setTables((prev) =>
          prev.map((t) => {
            if (t.status === "SEATED" || t.status === "SLA_BREACH") {
              const newSeconds = t.seatedSeconds + 1;
              const isBreach = !t.waiterArrived && newSeconds >= 300; // 5 min SLA
              return {
                ...t,
                seatedSeconds: newSeconds,
                status: isBreach ? "SLA_BREACH" : "SEATED",
                noWaiterAlert: isBreach,
              };
            }
            if (t.status === "DIRTY" && t.guestsDepartedSeconds !== undefined) {
              return {
                ...t,
                guestsDepartedSeconds: t.guestsDepartedSeconds + 1,
              };
            }
            return t;
          })
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [simRunning]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 1-Click Interactive Scenarios (As demonstrated in the video)
  const handleScenarioWalkIn = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === "T-04"
          ? {
              ...t,
              status: "SEATED",
              guestCount: 2,
              seatedSeconds: 2,
              noWaiterAlert: false,
              waiterArrived: false,
              orderStatus: "UNATTENDED",
            }
          : t
      )
    );
    setPersons((prev) => [
      ...prev.filter((p) => p.tableId !== "t-04"),
      { id: "p-t04-a", type: "CUSTOMER", label: "Customer [0:02]", box: { x: 20, y: 70, w: 7, h: 14 }, tableId: "t-04", durationSeconds: 2 },
      { id: "p-t04-b", type: "CUSTOMER", label: "Customer [0:02]", box: { x: 28, y: 70, w: 7, h: 14 }, tableId: "t-04", durationSeconds: 2 },
    ]);
  };

  const handleScenarioTriggerSlaBreach = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === "T-03"
          ? {
              ...t,
              status: "SLA_BREACH",
              seatedSeconds: 305, // 5 min 5 sec
              noWaiterAlert: true,
              waiterArrived: false,
              orderStatus: "UNATTENDED",
            }
          : t
      )
    );
    playAlertChime();
  };

  const handleScenarioWaiterArrived = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === "T-03"
          ? {
              ...t,
              status: "SEATED",
              noWaiterAlert: false,
              waiterArrived: true,
              waiterAssigned: "Waiter A",
              orderStatus: "EATING",
            }
          : t
      )
    );
    setPersons((prev) => [
      ...prev.filter((p) => p.id !== "p-waiter-3"),
      { id: "p-waiter-3", type: "WAITER", label: "Captain A", box: { x: 74, y: 25, w: 8, h: 18 }, tableId: "t-03", durationSeconds: 15 },
    ]);
  };

  const handleScenarioGuestsDepart = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === "T-02"
          ? {
              ...t,
              status: "DIRTY",
              guestCount: 0,
              seatedSeconds: 0,
              guestsDepartedSeconds: 12,
              noWaiterAlert: false,
              waiterArrived: false,
              orderStatus: undefined,
            }
          : t
      )
    );
    setPersons((prev) => prev.filter((p) => p.tableId !== "t-02"));
    playAlertChime();
  };

  const handleScenarioTableCleaned = (tableNum = "T-05") => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === tableNum
          ? {
              ...t,
              status: "FREE",
              guestCount: 0,
              seatedSeconds: 0,
              guestsDepartedSeconds: undefined,
              noWaiterAlert: false,
              waiterArrived: false,
              orderStatus: undefined,
            }
          : t
      )
    );
  };

  // Convert polygon points to SVG points string
  const getPolygonPoints = (pts: { x: number; y: number }[]) => {
    return pts.map((p) => `${p.x * 10},${p.y * 6}`).join(" ");
  };

  const alertTables = tables.filter((t) => t.status === "SLA_BREACH" || t.status === "DIRTY");
  const occupiedTables = tables.filter((t) => t.status === "SEATED" || t.status === "SLA_BREACH");

  return (
    <div className="space-y-5">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-amber-500/50 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/10 p-0.5 shrink-0">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-xl" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-xs">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight">
                DineSutra AI CCTV Table Vision Radar
              </h1>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                <span>🔥</span>
                <span>YOLOv11 Real-Time CV</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Zero New Hardware (Existing CCTV)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated 5-minute waiter SLA alerts, instant dirty table bussing triggers & peak turn forecasting.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-700">
            <button
              onClick={() => setActiveTab("RADAR")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                activeTab === "RADAR" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-300 hover:text-white"
              )}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live CCTV Radar</span>
            </button>
            <button
              onClick={() => setActiveTab("ANALYTICS")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                activeTab === "ANALYTICS" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-300 hover:text-white"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Peak Hours & Staffing</span>
            </button>
            <button
              onClick={() => setActiveTab("RTSP")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                activeTab === "RTSP" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-300 hover:text-white"
              )}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>RTSP Streams</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs gap-1.5"
            title={soundEnabled ? "Mute audio SLA alerts" : "Unmute audio alerts"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio Alert On" : "Muted"}</span>
          </Button>
        </div>
      </div>

      {/* SLA ALERT BANNER (If any table breached 5-min threshold) */}
      {tables.some((t) => t.status === "SLA_BREACH") && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>⚠️ Service SLA Breach Alert (No Waiter &gt; 5 Minutes)</span>
                <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">ACTION REQUIRED</span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                CCTV detected Table T-03 seated with 3 guests for over 5 minutes with no waiter arrival!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleScenarioWaiterArrived}
              className="bg-white hover:bg-slate-100 text-red-950 text-xs font-black shadow-md border-0"
            >
              <span>Assign Captain Now</span>
            </Button>
          </div>
        </div>
      )}

      {/* MAIN RADAR VIEW */}
      {activeTab === "RADAR" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* LEFT: LIVE CCTV VIDEO CANVAS WITH COMPUTER VISION OVERLAY (8 COLS) */}
          <div className="xl:col-span-8 space-y-3">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
              {/* CCTV OSD HEADER */}
              <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-mono font-bold text-red-400">REC</span>
                  </div>
                  <div className="font-mono font-bold text-white tracking-wide">
                    {activeCam} • [1080P RESTAURANT HALL]
                  </div>
                  <span className="bg-slate-800 text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
                    YOLOv11x-Pose 14ms
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold">25.0 FPS</span>
                  <span className="hidden sm:inline">4.8 Mbps</span>
                  <span className="text-amber-300 font-bold">{currentTimeStr || "2026-11-14 19:15:00.000"}</span>
                </div>
              </div>

              {/* CAMERA FEED & INTERACTIVE OVERLAY CANVAS */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden select-none">
                {/* Simulated Restaurant Room Background Grid */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 opacity-95">
                  {/* Perspective Floor Grid */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.25), transparent 70%), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
                      backgroundSize: "100% 100%, 40px 40px, 40px 40px",
                    }}
                  />
                  {/* Overhead Dining Lighting simulation */}
                  <div className="absolute top-[30%] left-[22%] w-32 h-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                  <div className="absolute top-[32%] left-[48%] w-32 h-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                  <div className="absolute top-[33%] left-[78%] w-32 h-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                  <div className="absolute top-[68%] left-[25%] w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                  <div className="absolute top-[70%] left-[56%] w-40 h-40 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                  <div className="absolute top-[68%] left-[85%] w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                </div>

                {/* SVG POLYGONS FOR TABLE ZONES */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  {showPolygons &&
                    tables.map((t) => {
                      let strokeColor = "#10b981"; // Free green
                      let fillColor = "rgba(16, 185, 129, 0.15)";
                      if (t.status === "SEATED") {
                        strokeColor = "#ef4444"; // Seated red
                        fillColor = "rgba(239, 68, 68, 0.25)";
                      } else if (t.status === "SLA_BREACH") {
                        strokeColor = "#f43f5e"; // Flashing red
                        fillColor = "rgba(244, 63, 94, 0.35)";
                      } else if (t.status === "DIRTY") {
                        strokeColor = "#f59e0b"; // Dirty amber
                        fillColor = "rgba(245, 158, 11, 0.25)";
                      }

                      return (
                        <g key={t.id} className="cursor-pointer" onClick={() => setSelectedTable(t)}>
                          <polygon
                            points={getPolygonPoints(t.polygon)}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={t.status === "SLA_BREACH" ? "3" : "2"}
                            strokeDasharray={t.status === "FREE" ? "6,4" : undefined}
                            className={cn(
                              "transition-all duration-300 hover:opacity-80",
                              t.status === "SLA_BREACH" && "animate-pulse"
                            )}
                          />
                        </g>
                      );
                    })}

                  {/* Optical Vector from Waiter to Table (Tracking Service Ray) */}
                  <line
                    x1="480"
                    y1="220"
                    x2="480"
                    y2="280"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                </svg>

                {/* PERSON BOUNDING BOXES (YOLO DETECTIONS) */}
                {showPersons &&
                  persons.map((p) => {
                    const isWaiter = p.type === "WAITER";
                    const isBusser = p.type === "BUSSER";
                    const borderColor = isWaiter
                      ? "border-red-500 bg-red-500/10 text-red-300"
                      : isBusser
                      ? "border-purple-500 bg-purple-500/10 text-purple-300"
                      : "border-cyan-400 bg-cyan-400/10 text-cyan-200";

                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "absolute border-2 rounded-xs transition-all pointer-events-none flex flex-col justify-between font-mono text-[9px] font-bold",
                          borderColor
                        )}
                        style={{
                          left: `${p.box.x}%`,
                          top: `${p.box.y}%`,
                          width: `${p.box.w}%`,
                          height: `${p.box.h}%`,
                        }}
                      >
                        <span className="bg-slate-950/90 px-1 py-0.5 rounded-br-xs self-start leading-none">
                          {p.label}
                        </span>
                        {isWaiter && (
                          <span className="bg-red-600 text-white px-1 py-0.5 rounded-tr-xs self-end text-[8px] leading-none">
                            WAITING / ATTENDING
                          </span>
                        )}
                      </div>
                    );
                  })}

                {/* TABLE ON-SCREEN LABELS & STATUS TIMERS */}
                {tables.map((t) => {
                  let badgeBg = "bg-emerald-600 text-white";
                  let title = `${t.tableNumber} • FREE`;
                  let sub = `${t.capacity} Seats Available`;

                  if (t.status === "SEATED") {
                    badgeBg = "bg-red-600 text-white";
                    title = `${t.tableNumber} • ${t.guestCount} GUESTS`;
                    sub = `Seated: ${formatTime(t.seatedSeconds)}`;
                  } else if (t.status === "SLA_BREACH") {
                    badgeBg = "bg-rose-600 text-white animate-pulse border border-rose-300";
                    title = `⚠️ ${t.tableNumber} • NO WAITER`;
                    sub = `WAIT TIME: ${formatTime(t.seatedSeconds)} (> 5:00)`;
                  } else if (t.status === "DIRTY") {
                    badgeBg = "bg-amber-600 text-slate-950 font-black";
                    title = `${t.tableNumber} • DIRTY (NEEDS BUSSER)`;
                    sub = `Left ${Math.floor((t.guestsDepartedSeconds || 0) / 60)}m ago`;
                  }

                  return (
                    <div
                      key={`lbl-${t.id}`}
                      onClick={() => setSelectedTable(t)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{
                        left: `${t.center.x}%`,
                        top: `${t.center.y}%`,
                      }}
                    >
                      <div
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-lg transition-transform group-hover:scale-110 flex flex-col items-center",
                          badgeBg
                        )}
                      >
                        <span className="leading-tight text-[11px] font-black">{title}</span>
                        {showTimers && (
                          <span className="text-[9px] opacity-90 font-mono mt-0.5 font-semibold">
                            {sub}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* THERMAL HEATMAP OVERLAY (OPTIONAL TOGGLE) */}
                {showHeatmap && (
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
                    style={{
                      background: `radial-gradient(circle at 78% 45%, rgba(239, 68, 68, 0.6) 0%, transparent 20%), radial-gradient(circle at 48% 44%, rgba(245, 158, 11, 0.5) 0%, transparent 25%), radial-gradient(circle at 22% 42%, rgba(234, 179, 8, 0.4) 0%, transparent 20%)`,
                    }}
                  />
                )}

                {/* CAMERA WATERMARK & VIGNETTE */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] border border-slate-800/50" />
                <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-500 font-bold flex items-center gap-2">
                  <span>DineSutra AI Computer Vision Suite v2.4</span>
                  <span>•</span>
                  <span>RTSP://Hikvision-NVR-Ch01</span>
                </div>
              </div>

              {/* CAMERA BAR CONTROLS */}
              <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Camera Feed Switcher */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(["CAM-01", "CAM-02", "CAM-03", "CAM-04"] as const).map((cam) => (
                    <button
                      key={cam}
                      onClick={() => setActiveCam(cam)}
                      className={cn(
                        "px-3 py-1 rounded-lg font-mono font-bold transition-all text-xs",
                        activeCam === cam
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      )}
                    >
                      {cam}
                    </button>
                  ))}
                </div>

                {/* CV Layer Toggles */}
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs flex-wrap">
                  <button
                    onClick={() => setShowPolygons(!showPolygons)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all",
                      showPolygons
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    )}
                  >
                    Polygons
                  </button>
                  <button
                    onClick={() => setShowPersons(!showPersons)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all",
                      showPersons
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    )}
                  >
                    Bounding Boxes
                  </button>
                  <button
                    onClick={() => setShowTimers(!showTimers)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all",
                      showTimers
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    )}
                  >
                    Timers
                  </button>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all",
                      showHeatmap
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    )}
                  >
                    Heatmap
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE SCENARIO SIMULATOR STRIP (Allows user to test all video features with 1 click!) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Interactive AI Scenario Sandbox (Click to Test)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Simulates CCTV Vision Events from Sarthak&apos;s Video
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleScenarioWalkIn}
                  className="text-xs font-bold border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-800"
                >
                  <span>🚶 1. Walk-in Seated</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleScenarioTriggerSlaBreach}
                  className="text-xs font-bold border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800"
                >
                  <span>⚠️ 2. Breach 5m SLA</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleScenarioWaiterArrived}
                  className="text-xs font-bold border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-800"
                >
                  <span>🍽️ 3. Waiter Arrives</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleScenarioGuestsDepart}
                  className="text-xs font-bold border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-800"
                >
                  <span>🏃 4. Guests Depart</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleScenarioTableCleaned("T-05")}
                  className="text-xs font-bold border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-800"
                >
                  <span>✨ 5. Table Sanitized</span>
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE HOST FLOOR STAND, ALERT CARDS & INSPECTION (4 COLS) */}
          <div className="xl:col-span-4 space-y-4">
            {/* ACTIVE AI INCIDENT ALERTS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                    Live CCTV Incident Feed ({alertTables.length})
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>

              {alertTables.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-bold text-slate-700">All Tables Attended & Clean</p>
                  <p className="text-[11px] mt-0.5">Zero waiter SLA breaches or pending bussing tasks.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertTables.map((t) => {
                    const isSla = t.status === "SLA_BREACH";
                    return (
                      <div
                        key={`alert-${t.id}`}
                        className={cn(
                          "p-3 rounded-xl border text-xs space-y-2 transition-all",
                          isSla
                            ? "bg-rose-50/80 border-rose-200 text-rose-950"
                            : "bg-amber-50/80 border-amber-200 text-amber-950"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">{t.tableNumber}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                              {t.section}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-md font-mono",
                              isSla ? "bg-rose-600 text-white" : "bg-amber-600 text-slate-950"
                            )}
                          >
                            {isSla ? `⚠️ NO WAITER: ${formatTime(t.seatedSeconds)}` : "DIRTY TABLE"}
                          </span>
                        </div>

                        <p className="text-[11px] font-medium leading-relaxed">
                          {isSla
                            ? `Customers seated with ${t.guestCount} guests. 5-minute wait time exceeded with no captain detected in zone.`
                            : `Party left ${Math.floor((t.guestsDepartedSeconds || 0) / 60)}m ago. CCTV confirmed empty table awaiting busser.`}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {isSla ? (
                            <Button
                              size="sm"
                              onClick={handleScenarioWaiterArrived}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold h-7 px-3 rounded-lg"
                            >
                              Dispatch Captain
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleScenarioTableCleaned(t.tableNumber)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-7 px-3 rounded-lg"
                            >
                              ✓ Busser Cleaned
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ENTRANCE QUEUE & SMART WAITLIST FORECASTER (As shown in video at 0:28) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                    Host Stand • Queue Turn Forecaster
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  AI Prediction
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                AI correlates live CCTV dining stage with historical turn-time to predict which table opens first for waiting guests:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-extrabold text-slate-900">Table T-01 (2-Seater)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-black text-emerald-700">Free in ~3 mins</div>
                    <div className="text-[9px] text-slate-400">Bill Settled</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-extrabold text-slate-900">Table T-02 (4-Seater)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-black text-amber-700">Free in ~14 mins</div>
                    <div className="text-[9px] text-slate-400">Dessert Stage</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="font-extrabold text-slate-900">Table T-06 (4-Seater)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-black text-emerald-600">Available Now</div>
                    <div className="text-[9px] text-slate-400">Ready to seat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SELECTED TABLE DEEP INSPECTOR */}
            {selectedTable && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-md border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-amber-400">{selectedTable.tableNumber}</span>
                    <span className="text-xs text-slate-400">({selectedTable.section})</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-md uppercase font-mono",
                      selectedTable.status === "FREE"
                        ? "bg-emerald-500 text-slate-950"
                        : selectedTable.status === "SLA_BREACH"
                        ? "bg-rose-500 text-white animate-pulse"
                        : selectedTable.status === "DIRTY"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {selectedTable.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Capacity &amp; Covers</span>
                    <span className="font-bold text-slate-200">
                      {selectedTable.guestCount} / {selectedTable.capacity} Guests
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">CCTV Dwell Time</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatTime(selectedTable.seatedSeconds)}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Assigned Captain</span>
                    <span className="font-bold text-slate-200">
                      {selectedTable.waiterAssigned || "None (Unattended)"}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Order Phase</span>
                    <span className="font-bold text-slate-200">
                      {selectedTable.orderStatus || "Idle"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border-0"
                    onClick={() => {
                      if (selectedTable.status === "DIRTY") {
                        handleScenarioTableCleaned(selectedTable.tableNumber);
                      } else if (selectedTable.status === "SLA_BREACH") {
                        handleScenarioWaiterArrived();
                      } else {
                        alert(`Opening POS bill ledger for Table ${selectedTable.tableNumber}`);
                      }
                    }}
                  >
                    {selectedTable.status === "DIRTY"
                      ? "Mark Table Cleaned"
                      : selectedTable.status === "SLA_BREACH"
                      ? "Acknowledge SLA Alert"
                      : "Open Table POS Bill"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PEAK HOURS & STAFFING ANALYTICS TAB (From 0:30 in video) */}
      {activeTab === "ANALYTICS" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Average Table Turn Time</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>42 mins</span>
                <span className="text-xs font-bold text-emerald-600">↓ 23% Faster</span>
              </div>
              <span className="text-[11px] text-slate-400">vs 55m manual industry baseline</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Average Waiter Response SLA</span>
              <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
                <span>2m 14s</span>
                <span className="text-xs font-bold text-emerald-600">97.2% SLA</span>
              </div>
              <span className="text-[11px] text-slate-400">Threshold: &lt; 5 minutes</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Peak Lunch Rush Covers</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>142 covers</span>
                <span className="text-xs font-bold text-amber-600">1:00 - 3:00 PM</span>
              </div>
              <span className="text-[11px] text-slate-400">Requires 7-8 active waiters</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Peak Dinner Rush Covers</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>198 covers</span>
                <span className="text-xs font-bold text-purple-600">8:00 - 10:30 PM</span>
              </div>
              <span className="text-[11px] text-slate-400">Requires 9-10 active waiters</span>
            </div>
          </div>

          {/* OCCUPANCY VS STAFFING RECHARTS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>CCTV Peak Hours Occupancy &amp; AI Staffing Optimization</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Correlates hour-by-hour table occupancy (%) with recommended waiter shift headcount.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-3 h-3 rounded-md bg-amber-500"></span> Occupancy Rate (%)
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-3 h-3 rounded-md bg-indigo-500"></span> Waiters Scheduled
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PEAK_HOURS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#occupancyGrad)"
                    name="Occupancy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* RTSP STREAM CONFIGURATION TAB */}
      {activeTab === "RTSP" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Connect Existing Restaurant CCTV Cameras (RTSP / ONVIF)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              DineSutra connects directly to any standard NVR / DVR without requiring proprietary camera hardware.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Camera 01 RTSP Stream URL
              </label>
              <input
                type="text"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-amber-500"
                placeholder="rtsp://admin:password@192.168.1.108:554/ch0_sub.264"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Compatible with CP Plus, Dahua, Hikvision, Uniview, Honeywell, and Axis ONVIF profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block">AI Inference Model</span>
                <span className="text-slate-500 text-[11px]">YOLOv11x-Pose &amp; ByteTrack Object Tracking</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block">Waiter SLA Alert Timeout</span>
                <span className="text-slate-500 text-[11px]">300 Seconds (5 Minutes Standard)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                onClick={() => alert("RTSP camera configuration saved successfully!")}
              >
                Save RTSP Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}