"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Clock,
  Ban,
  ArrowDownRight,
  Sparkles,
  ArrowUpRight,
  UtensilsCrossed,
  ChefHat,
  Smartphone,
  Coins,
  CheckCircle2,
  Store,
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/formatters";
import { DEMO_STATS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function DashboardStatCards() {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/reports/analytics?timeRange=30d");
        const json = await res.json();
        if (json.success) {
          setLiveData(json);
        }
      } catch (err) {
        console.error("Failed to fetch live stat cards data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const grossSales = liveData?.summary?.grossSales || DEMO_STATS.grossSalesToday;
  const netSales = liveData?.summary?.netSales || DEMO_STATS.netSalesToday;
  const totalOrders = liveData?.summary?.paidInvoicesCount || DEMO_STATS.totalOrdersToday;
  const avgOrderValue = totalOrders > 0 ? grossSales / totalOrders : DEMO_STATS.avgOrderValue;
  const totalExpenses = liveData?.pnl?.operatingExpenses || DEMO_STATS.totalExpensesToday;
  const netProfit = liveData?.pnl?.netProfit || DEMO_STATS.estimatedProfitToday;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. BENTO HERO TILE: TODAY'S GROSS REVENUE (Col span 2) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="md:col-span-2 relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 p-6 sm:p-7 shadow-sm shadow-amber-500/10 backdrop-blur-md transition-all duration-300 hover:border-amber-400 hover:shadow-lg"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-10 h-28 w-28 rounded-full bg-orange-400/15 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30">
                  <IndianRupee className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                    Executive Revenue Stream
                  </span>
                  <div className="text-xs font-semibold text-slate-500">Today&apos;s Gross Realization</div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                +14.8% vs Yesterday
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900" suppressHydrationWarning>
                {formatINR(grossSales)}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                from <strong className="text-slate-800 font-bold">{totalOrders}</strong> settled orders
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/60 pt-4 text-xs">
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>Net Excl. Tax: <strong className="text-slate-900 font-bold">{formatINR(netSales)}</strong></span>
              <span>GST 5%: <strong className="text-emerald-700 font-bold">{formatINR(grossSales - netSales)}</strong></span>
            </div>

            <Link
              href="/pos"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span>New Bill / POS</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. OPERATING PROFIT (EBITDA) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-6 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-emerald-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Operating Profit</span>
            <div className="text-3xl font-black tracking-tight text-slate-900" suppressHydrationWarning>
              {formatINR(netProfit)}
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>EBITDA Margin</span>
            <span className="text-emerald-700 font-bold">26.4% (Healthy)</span>
          </div>
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "26.4%" }} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-3 text-[11px] text-slate-500">
          <span>Opex: {formatINR(totalExpenses)}</span>
          <span className="font-bold text-emerald-600">+18.9% MoM</span>
        </div>
      </motion.div>

      {/* 3. AVERAGE ORDER VALUE (AOV) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Order (AOV)</span>
            <div className="text-3xl font-black tracking-tight text-slate-900" suppressHydrationWarning>
              {formatINR(avgOrderValue)}
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-600 shadow-2xs">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Target Progress</span>
            <span className="text-violet-700 font-bold">108% of ₹500</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span>Upsell Naan & Dessert</span>
          <span className="font-bold text-violet-600">+4.2%</span>
        </div>
      </motion.div>

      {/* 4. ACTIVE KITCHEN TICKETS (KDS) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">KDS Active Tickets</span>
            <div className="text-3xl font-black tracking-tight text-amber-600" suppressHydrationWarning>
              {DEMO_STATS.pendingOrders} KOTs
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 shadow-2xs">
            <ChefHat className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Avg Prep: 12m 30s
          </span>
          <Link
            href="/kitchen"
            className="font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            Open KDS ↗
          </Link>
        </div>
      </motion.div>

      {/* 5. DIRECT COMMISSIONS SAVED */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-6 shadow-xs transition-all duration-300 hover:border-emerald-400 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Aggregator Fee Saved</span>
            <div className="text-3xl font-black tracking-tight text-emerald-700">
              ₹18,450
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 shadow-2xs">
            <Smartphone className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-3 text-xs">
          <span className="text-slate-600 font-medium">74 QR / WhatsApp Direct</span>
          <span className="font-bold text-emerald-700">0% Swiggy Fee</span>
        </div>
      </motion.div>

      {/* 6. COUNTER CASH TILL */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shift Cash In Till</span>
            <div className="text-3xl font-black tracking-tight text-slate-900">
              ₹38,200
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 shadow-2xs">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">Opening: ₹5,000</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Audited
          </span>
        </div>
      </motion.div>

      {/* 7. AUDITED VOIDS & DISCOUNTS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tamper-Proof Audit</span>
            <div className="text-3xl font-black tracking-tight text-slate-800">
              {liveData?.summary?.cancelledOrdersCount ?? DEMO_STATS.cancelledOrders} <span className="text-sm font-normal text-slate-500">Voids</span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 shadow-2xs">
            <Ban className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">Supervisor PIN override</span>
          <span className="font-bold text-slate-700">Logged</span>
        </div>
      </motion.div>
    </div>
  );
}
