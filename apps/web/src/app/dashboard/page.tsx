"use client";

import { useCallback, useEffect, useState } from "react";
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
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ChefHat,
  UtensilsCrossed,
  Coins,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/formatters";
import type { DashboardAnalyticsResponse } from "@/types/dashboard";

type TimeRange = "today" | "yesterday" | "7d" | "30d";

export default function DashboardOverviewPage() {
  const { currentUser, getActiveBranch } = useRestaurantStore();
  const activeBranch = getActiveBranch();

  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("Good morning");

  const loadAnalytics = useCallback(async (range: TimeRange) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/analytics?timeRange=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnalytics(json);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard analytics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastRefreshed(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, []);

  useEffect(() => {
    loadAnalytics(timeRange);
  }, [timeRange, loadAnalytics]);

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
    loadAnalytics(timeRange);
  };

  const floor = analytics?.floorTelemetry || {
    occupiedTables: 0,
    billedTables: 0,
    cleaningTables: 0,
    availableTables: 0,
    totalTables: 0,
  };
  const usedTables = floor.occupiedTables + floor.billedTables;
  const occupancyPct = floor.totalTables > 0 ? Math.round((usedTables / floor.totalTables) * 100) : 0;
  const kds = analytics?.kdsTelemetry || { activeKots: 0, avgPrepSeconds: 0, stationsSummary: "No pending KOTs" };
  const savings = analytics?.directSavings || { directOrdersCount: 0, commissionSaved: 0 };
  const cash = analytics?.cashTillTelemetry || {
    hasOpenShift: false,
    shiftLabel: "No Shift Started",
    expectedCash: 0,
    openingBalance: 0,
    cashDrops: 0,
    cashVariance: 0,
  };
  const topDish = analytics?.topSellingDishes?.[0];
  const fssaiLabel = activeBranch.fssaiNumber || activeBranch.fssai || "Not configured";
  const gstinLabel = activeBranch.gstin || "Not configured";

  return (
    <div className="space-y-8 pb-16">
      {/* 1. EXECUTIVE HERO COMMAND BAR */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-2xl shadow-slate-950/20 sm:p-8">
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
                  {cash.shiftLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span suppressHydrationWarning>{currentTime || "--:--"}</span>
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                  Synced: {lastRefreshed}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {greeting}, {currentUser?.name || "Restaurant Owner"}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl" suppressHydrationWarning>
                Live operational telemetry for <strong className="text-white font-semibold">{activeBranch.name}</strong>{" "}
                (Branch Code: <span className="font-mono text-amber-300">{activeBranch.code}</span> · GSTIN:{" "}
                <span className="font-mono text-slate-300">{gstinLabel}</span>)
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

            <Link
              href="/kitchen"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-500/30 hover:text-white"
            >
              <ChefHat className="h-4 w-4 text-amber-400" />
              <span>Kitchen KDS</span>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-slate-950">
                {kds.activeKots}
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
              <span>Cloud Database: Tenant Isolated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME FLOOR & SHIFT RADARS */}
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
                {usedTables} / {floor.totalTables}{" "}
                <span className="text-sm font-normal text-slate-500">Tables ({occupancyPct}%)</span>
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

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
            <span>{floor.occupiedTables} Seated</span>
            <span>{floor.billedTables} Billed</span>
            <span>{floor.availableTables} Open</span>
          </div>
        </div>

        {/* Radar 2: Kitchen KDS Velocity */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ChefHat className="h-3.5 w-3.5 text-amber-600" />
                <span>Kitchen Queue</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {kds.activeKots} <span className="text-sm font-normal text-slate-500">Active KOTs</span>
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

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
            <span className="truncate">{kds.stationsSummary}</span>
          </div>
        </div>

        {/* Radar 3: Direct Commission Saved */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Commission Saved</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-emerald-600">
                {formatINR(savings.commissionSaved)}{" "}
                <span className="text-sm font-normal text-slate-500">Kept</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span className="font-semibold text-emerald-700">{savings.directOrdersCount} Direct Orders</span>
            <span className="text-slate-400 font-medium">Zero 3rd-party commission</span>
          </div>
        </div>

        {/* Radar 4: Cash Drawer Balance */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Coins className="h-3.5 w-3.5 text-violet-600" />
                <span>Counter Cash Till</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {formatINR(cash.expectedCash)}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
            <span>Float: {formatINR(cash.openingBalance)}</span>
            <span>Var: {formatINR(cash.cashVariance)}</span>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONAL SUMMARY STRIP */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/70 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Live Outlet Intelligence
                </span>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.2 text-[10px] font-bold text-amber-900">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-amber-950/80 mt-1 leading-relaxed">
                {analytics && analytics.metrics.totalOrders > 0 ? (
                  <>
                    <strong>{analytics.metrics.totalOrders} orders</strong> settled totaling{" "}
                    <strong>{formatINR(analytics.metrics.grossSales)}</strong>.
                    {topDish ? (
                      <>
                        {" "}Top dish: <strong>{topDish.name}</strong> ({topDish.count} portions).
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Welcome to <strong>{activeBranch.name}</strong>! Your workspace is clean and isolated. Add dishes in{" "}
                    <strong>Menu</strong> or open <strong>POS Terminal</strong> to record your first order.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/50 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Setup Menu</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY FINANCIAL & REVENUE METRICS */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Key Financial &amp; Performance Indicators
          </h2>
          <p className="text-[11px] text-slate-400">
            Scoped strictly to {activeBranch.name} with Indian GST reconciliation
          </p>
        </div>
        <DashboardStatCards analytics={analytics} loading={loading} />
      </section>

      {/* 5. PRIMARY REVENUE & HOURLY RUSH CHARTS */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <SalesHourlyChart data={analytics?.hourlySales || []} />
        <RevenueTrendsChart data={analytics?.periodicSales || []} />
      </section>

      {/* 6. DISTRIBUTION, CHANNELS & PAYMENT BREAKDOWN */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <OrderDistributionChart data={analytics?.orderTypeDistribution || []} />
        <PaymentMethodsChart data={analytics?.paymentMethods || []} />
        <TopDishesChart data={analytics?.topSellingDishes || []} />
      </section>

      {/* 7. OPERATIONAL TABLES & REAL-TIME ALERTS */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentOrdersTable />
        <PopularMenuItems data={analytics?.topSellingDishes || []} />
        <LowStockAlerts />
      </section>

      {/* 8. AUDIT FEED & STATUTORY COMPLIANCE GUARD */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentActivityFeed activities={analytics?.recentActivities || []} />

        <div className="col-span-1 xl:col-span-2 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                <span>Indian F&amp;B Statutory &amp; Compliance Guard</span>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                GST Ready
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Outlet billing conforms to CGST (2.5%) + SGST (2.5%) under SAC{" "}
              <strong className="text-slate-900 font-mono">996331</strong>. FSSAI License:{" "}
              <strong className="text-slate-900 font-mono">{fssaiLabel}</strong>.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Branch Code</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{activeBranch.code}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Statutory GSTIN</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5 truncate">{gstinLabel}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">FSSAI Number</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5 truncate">{fssaiLabel}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              All voids, discounts, and billing changes are recorded to tamper-evident audit logs.
            </span>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
            >
              <span>View GSTR-1 Ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
