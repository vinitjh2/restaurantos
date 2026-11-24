"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { DashboardStatCards } from "@/components/dashboard/stat-cards";
import { SalesHourlyChart } from "@/components/dashboard/sales-hourly-chart";
import { RevenueTrendsChart } from "@/components/dashboard/revenue-trends-chart";
import { OrderDistributionChart } from "@/components/dashboard/order-distribution-chart";
import { PaymentMethodsChart } from "@/components/dashboard/payment-methods-chart";
import { TopDishesChart } from "@/components/dashboard/top-dishes-chart";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { PopularMenuItems } from "@/components/dashboard/popular-menu-items";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity";
import {
  Store,
  FileDown,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ChefHat,
  UtensilsCrossed,
  Coins,
  CheckCircle2,
  RefreshCw,
  Flame,
  AlertTriangle,
  Layers,
  Smartphone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "today" | "yesterday" | "7d" | "30d";

export default function DashboardOverviewPage() {
  const { getActiveBranch } = useRestaurantStore();
  const activeBranch = getActiveBranch();

  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("Good morning");

  // Real-time clock and dynamic greeting
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. EXECUTIVE HERO COMMAND BAR */}
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-2xl shadow-slate-950/20 sm:p-8"
      >
        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-16 h-16 shrink-0 rounded-2xl bg-slate-950 border border-amber-500/50 items-center justify-center overflow-hidden shadow-2xl shadow-amber-500/20 p-1">
              <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  DineSutra Suite · SutraUniverse
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live Shift #44 · Active Service
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span suppressHydrationWarning>{currentTime || "11:30 AM"}</span>
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                  Synced: {lastRefreshed}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {greeting}, Restaurant General Manager
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl" suppressHydrationWarning>
                Live operational telemetry for <strong className="text-white font-semibold">{activeBranch.name}</strong>{" "}
                (Branch Code: <span className="font-mono text-amber-300">{activeBranch.code}</span> · GSTIN:{" "}
                <span className="font-mono text-slate-300">{activeBranch.gstin}</span>)
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
              title="Refresh live metrics"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => alert("Generating GSTR-1, Shift Z-Report & Sales Ledger Snapshot...")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-medium text-slate-100 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              <FileDown className="h-4 w-4 text-emerald-400" />
              <span>Export Z-Report</span>
            </button>

            <Link
              href="/landing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-orange-500/30 to-amber-500/30 px-3.5 py-2.5 text-xs font-bold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-500/40 hover:text-white"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Public Landing</span>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950 uppercase">
                New
              </span>
            </Link>

            <Link
              href="/kitchen"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-500/30 hover:text-white"
            >
              <ChefHat className="h-4 w-4 text-amber-400" />
              <span>Kitchen KDS</span>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-slate-950">
                6
              </span>
            </Link>

            <Link
              href="/pos"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110"
            >
              <Store className="h-4 w-4" />
              <span>Launch POS Terminal</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Time-Range Switcher Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Filter Timeframe:</span>
            <div className="inline-flex rounded-lg bg-white/10 p-0.5 backdrop-blur-md">
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "7d", label: "Last 7 Days" },
                  { key: "30d", label: "Month to Date" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTimeRange(tab.key)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-all",
                    timeRange === tab.key
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>SutraCloud Database: Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Thermal Receipt Spooler: Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME RESTAURANT "HEARTBEAT & FLOOR TELEMETRY" STRIP (4 VITAL RADARS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Radar 1: Floor & Table Occupancy */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <UtensilsCrossed className="h-3.5 w-3.5 text-blue-600" />
                <span>Floor Occupancy</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                18 / 24 <span className="text-sm font-normal text-slate-500">Tables (75%)</span>
              </div>
            </div>
            <Link
              href="/tables"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
              title="Open Floor Plan"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Segmented Table Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="bg-emerald-500 transition-all" style={{ width: "50%" }} title="Dine-in (12)" />
              <div className="bg-amber-500 transition-all" style={{ width: "17%" }} title="Billed (4)" />
              <div className="bg-blue-400 transition-all" style={{ width: "8%" }} title="Cleaning (2)" />
              <div className="bg-slate-200 transition-all" style={{ width: "25%" }} title="Available (6)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 12 Seated
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 4 Billed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> 6 Open
              </span>
            </div>
          </div>
        </div>

        {/* Radar 2: Kitchen KDS Velocity */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ChefHat className="h-3.5 w-3.5 text-amber-600" />
                <span>KDS Ticket Velocity</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                12m 30s <span className="text-sm font-normal text-emerald-600">Avg Prep</span>
              </div>
            </div>
            <Link
              href="/kitchen"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white"
              title="Open Kitchen Display"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Target &lt; 15 min
            </span>
            <span className="text-slate-500 font-medium">
              6 Active KOTs (4 Main · 2 Bar)
            </span>
          </div>
        </div>

        {/* Radar 3: Direct Commission Saved (WhatsApp + QR) */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Commission Saved Today</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-emerald-600">
                ₹18,450 <span className="text-sm font-normal text-slate-500">Kept</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span className="font-semibold text-emerald-700">74 Direct Orders</span>
            <span className="text-slate-400 font-medium">
              Zero 30% Swiggy/Zomato fee
            </span>
          </div>
        </div>

        {/* Radar 4: Cash Drawer Balance & Shift Till */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Coins className="h-3.5 w-3.5 text-violet-600" />
                <span>Counter Cash Till</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                ₹19,200 <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Balanced</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
            <span>Float: ₹5,000</span>
            <span>Safe Drops: ₹5,000</span>
            <span className="font-semibold text-slate-700">Var: ₹0.00</span>
          </div>
        </div>
      </section>

      {/* 3. AI OPERATIONS COPILOT & INTELLIGENCE ALERT BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/70 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  RestaurantOS Intelligence & Ops Insights
                </span>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.2 text-[10px] font-bold text-amber-900">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-amber-950/80 mt-1 leading-relaxed">
                Lunch rush peaked with <strong>48 orders/hr</strong> at 1:15 PM. <strong>Murgh Dum Biryani</strong> and{" "}
                <strong>Butter Chicken</strong> accounted for <strong>38.2%</strong> of today's total revenue.{" "}
                <span className="font-semibold text-rose-700">
                  ⚠️ Alert: Fresh Malai Paneer raw inventory is at 4.2 kg (threshold 5.0 kg).
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/50 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Review Inventory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY FINANCIAL & REVENUE METRICS (8 Core Indicators) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Key Financial & Performance Indicators
            </h2>
            <p className="text-[11px] text-slate-400">
              Audited by NestJS multi-tenant calculation engine with Indian GST reconciliation
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Real-Time TanStack Query Stream
          </span>
        </div>
        <DashboardStatCards />
      </section>

      {/* 5. PRIMARY REVENUE & HOURLY RUSH CHARTS */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <SalesHourlyChart />
        <RevenueTrendsChart />
      </section>

      {/* 6. DISTRIBUTION, CHANNELS & PAYMENT BREAKDOWN */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <OrderDistributionChart />
        <PaymentMethodsChart />
        <TopDishesChart />
      </section>

      {/* 7. OPERATIONAL TABLES & REAL-TIME ALERTS */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentOrdersTable />
        <PopularMenuItems />
        <LowStockAlerts />
      </section>

      {/* 8. AUDIT FEED & STATUTORY COMPLIANCE GUARD */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentActivityFeed />

        <div className="col-span-1 xl:col-span-2 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                <span>Indian F&B Statutory & Compliance Assurance</span>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                100% Tax Compliant
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              All transactions in this outlet strictly conform to Section 9(1) CGST (2.5%) and SGST (2.5%) = <strong>5.0% Composite Restaurant Service</strong> under SAC Code <strong className="text-slate-900 font-mono">996331</strong>. The 14-digit FSSAI license <strong className="text-slate-900 font-mono">{activeBranch.fssai}</strong> is automatically embedded on all 80mm ESC/POS thermal customer bills.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Invoice Sequence</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{activeBranch.code}/2026-27/00285</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Statutory GSTIN</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5 truncate">{activeBranch.gstin}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">UPI Dynamic QR</div>
                <div className="font-bold text-emerald-600 mt-0.5">Active on Bills</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              All voided items, bill discounts, and supervisor PIN overrides are logged to tamper-evident audit logs.
            </span>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
            >
              <span>View Full GSTR-1 Ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
