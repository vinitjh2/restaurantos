"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Clock,
  Ban,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { DEMO_STATS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface StatItem {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  accentBorder?: string;
}

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

  const stats: StatItem[] = [
    {
      title: "Gross Sales",
      value: formatINR(grossSales),
      change: "+14.8%",
      isPositive: true,
      subtext: liveData ? "Live ledger total" : "vs yesterday",
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentBorder: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Net Sales (Excl. Tax)",
      value: formatINR(netSales),
      change: "+12.4%",
      isPositive: true,
      subtext: `Taxes: ${formatINR(liveData?.summary?.totalTaxCollected || 12370)}`,
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Settled Orders",
      value: `${totalOrders}`,
      change: "+8.1%",
      isPositive: true,
      subtext: "Across all stations",
      icon: ShoppingBag,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Average Order Value",
      value: formatINR(avgOrderValue),
      change: "+4.2%",
      isPositive: true,
      subtext: "Target: ₹500.00",
      icon: Receipt,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Active Orders",
      value: `${DEMO_STATS.pendingOrders}`,
      change: "Active",
      isPositive: true,
      subtext: "In KDS queue",
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Cancelled / Voided",
      value: `${liveData?.summary?.cancelledOrdersCount ?? DEMO_STATS.cancelledOrders}`,
      change: "Audited",
      isPositive: false,
      subtext: "Audit reasons logged",
      icon: Ban,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      title: "Operating Expenses",
      value: formatINR(totalExpenses),
      change: "-4.2%",
      isPositive: true,
      subtext: "Procurement & payroll",
      icon: ArrowDownRight,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Operating Profit",
      value: formatINR(netProfit),
      change: "+18.9%",
      isPositive: true,
      subtext: "EBITDA margin",
      icon: Sparkles,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      accentBorder: "border-l-4 border-l-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300",
              stat.accentBorder
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 tracking-wide">
                  {stat.title}
                </span>
                <div className="text-2xl font-bold tracking-tight text-slate-900" suppressHydrationWarning>
                  {stat.value}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  stat.iconBg
                )}
              >
                <IconComponent className={cn("h-5 w-5", stat.iconColor)} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-bold",
                  stat.isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {stat.change}
              </span>
              <span className="text-slate-400 font-medium truncate ml-2">
                {stat.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
