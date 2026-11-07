"use client";

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
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { getActiveBranch } = useRestaurantStore();
  const activeBranch = getActiveBranch();

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Breadcrumb & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Operations Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Shift #44
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>
            Real-time telemetry for <span className="font-semibold text-slate-800" suppressHydrationWarning>{activeBranch.name}</span> (Code: <span suppressHydrationWarning>{activeBranch.code}</span> · GSTIN: <span suppressHydrationWarning>{activeBranch.gstin}</span>)
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Generating GSTR-1 & Z-Report daily PDF snapshot...")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <FileDown className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Z-Report</span>
          </button>

          <Link
            href="/pos"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Store className="h-4 w-4 text-amber-400" />
            <span>Launch POS Terminal</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* 1. Metric Cards (8 Core Indicators) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Financial & Operating Metrics
          </h2>
          <span className="text-[11px] text-slate-400">Calculated strictly by NestJS billing engine</span>
        </div>
        <DashboardStatCards />
      </section>

      {/* 2. Primary Revenue & Hourly Rush Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <SalesHourlyChart />
        <RevenueTrendsChart />
      </section>

      {/* 3. Distribution, Volume & Payment Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <OrderDistributionChart />
        <PaymentMethodsChart />
        <TopDishesChart />
      </section>

      {/* 4. Operational Tables & Alerts */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentOrdersTable />
        <PopularMenuItems />
        <LowStockAlerts />
      </section>

      {/* 5. Real-Time Activity & Compliance Audit Feed */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RecentActivityFeed />
        <div className="col-span-1 xl:col-span-2 rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Indian F&B Statutory & Compliance Guard</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            All bills in this branch adhere to Section 9(1) CGST / SGST (2.5% + 2.5% = 5% restaurant composite service under SAC code <strong className="text-slate-800">996331</strong>). FSSAI license <strong className="text-slate-800">{activeBranch.fssai}</strong> printed on all customer thermal receipts.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <div className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">
              Prefix: {activeBranch.code}/2026-27/
            </div>
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              Tax Engine: Active
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
