"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Building2,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ChefHat,
  RefreshCw,
  Store,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OwnerMobileDashboard() {
  const [timeFilter, setTimeFilter] = useState<"TODAY" | "THIS_WEEK" | "THIS_MONTH">("TODAY");
  const [loading, setLoading] = useState(false);

  // Live KPI Data
  const [kpis, setKpis] = useState({
    liveSalesToday: 48920,
    salesGrowthPct: 14.8,
    totalOrders: 64,
    averageBill: 764,
    revenue: 48920,
    expenses: 16400,
    netProfit: 32520,
    profitMarginPct: 66.5,
  });

  // Popular Dishes Ranking
  const [popularDishes] = useState([
    { rank: 1, name: "Murgh Dum Biryani", sold: 38, revenue: 13300, category: "Biryani" },
    { rank: 2, name: "Paneer Butter Masala", sold: 26, revenue: 8320, category: "Mains" },
    { rank: 3, name: "Butter Garlic Naan", sold: 74, revenue: 4810, category: "Breads" },
    { rank: 4, name: "Dal Makhani Royale", sold: 18, revenue: 4680, category: "Mains" },
    { rank: 5, name: "Amritsari Sweet Lassi", sold: 29, revenue: 2610, category: "Beverages" },
  ]);

  // Multi-Branch Performance
  const [branches] = useState([
    {
      code: "IND",
      name: "Indiranagar Flagship",
      revenue: 28450,
      orders: 37,
      status: "OPTIMAL",
      targetPct: 112,
    },
    {
      code: "KOR",
      name: "Koramangala Hub",
      revenue: 14620,
      orders: 19,
      status: "GOOD",
      targetPct: 98,
    },
    {
      code: "WHF",
      name: "Whitefield Cloud Kitchen",
      revenue: 5850,
      orders: 8,
      status: "GROWING",
      targetPct: 84,
    },
  ]);

  // Active Staff Telemetry
  const [activeStaff] = useState([
    { name: "Pooja Hegde", role: "Head Cashier", shiftOrders: 28, clockedIn: "09:30 AM", status: "ACTIVE" },
    { name: "Rahul Verma", role: "Captain / Waiter", shiftOrders: 19, clockedIn: "10:15 AM", status: "ACTIVE" },
    { name: "Chef Murugan", role: "Head Chef", kitchenStation: "Main Kitchen", clockedIn: "08:00 AM", status: "COOKING" },
    { name: "Vikram Sen", role: "Bartender", shiftOrders: 17, clockedIn: "11:00 AM", status: "ACTIVE" },
  ]);

  // Urgent Inventory Alerts
  const [inventoryAlerts] = useState([
    { id: "1", item: "Amul Butter", remaining: "2.4 Kg", reorder: "10 Kg", severity: "CRITICAL" },
    { id: "2", item: "Fresh Cooking Cream", remaining: "4 Liters", reorder: "12 Liters", severity: "WARNING" },
    { id: "3", item: "Basmati Biryani Rice (Batch B-92)", expiry: "Expires in 3 days", severity: "EXPIRY" },
  ]);

  const refreshData = async () => {
    setLoading(true);
    // Simulates quick live refresh
    setTimeout(() => {
      setKpis((prev) => ({
        ...prev,
        liveSalesToday: prev.liveSalesToday + Math.floor(Math.random() * 800),
        totalOrders: prev.totalOrders + 1,
      }));
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xs">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Owner Dashboard</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Bawarchi Royale Group</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="h-8 gap-1 rounded-xl text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-amber-600 ${loading ? "animate-spin" : ""}`} />
            <span>Live</span>
          </Button>
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="flex border-b border-slate-200 bg-white px-4 py-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setTimeFilter("TODAY")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            timeFilter === "TODAY" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeFilter("THIS_WEEK")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            timeFilter === "THIS_WEEK" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFilter("THIS_MONTH")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            timeFilter === "THIS_MONTH" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          This Month
        </button>
      </div>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Live Sales & Revenue Primary Card */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Gross Sales Today
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{kpis.salesGrowthPct}%
            </span>
          </div>

          <div className="text-3xl font-black tracking-tight">{formatINR(kpis.liveSalesToday)}</div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-700/80 pt-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Orders</span>
              <span className="text-sm font-bold text-white">{kpis.totalOrders} bills</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Avg Bill (AOV)</span>
              <span className="text-sm font-bold text-amber-400">{formatINR(kpis.averageBill)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Est Net Profit</span>
              <span className="text-sm font-bold text-emerald-400">{formatINR(kpis.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Revenue vs Expenses Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-amber-600" />
            Financial P&L Pulse
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Billed Revenue:</span>
              <span className="font-extrabold text-slate-900">{formatINR(kpis.revenue)}</span>
            </div>
            <div className="flex justify-between items-center text-rose-600">
              <span>Operating & Food Expenses:</span>
              <span className="font-extrabold">-{formatINR(kpis.expenses)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 font-bold text-emerald-700">
              <span>Operating Profit (EBITDA):</span>
              <span className="text-sm">{formatINR(kpis.netProfit)} ({kpis.profitMarginPct}%)</span>
            </div>
          </div>
        </div>

        {/* Urgent Inventory Alerts */}
        {inventoryAlerts.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Urgent Inventory Alerts
              </h2>
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                {inventoryAlerts.length} Action Needed
              </Badge>
            </div>

            <div className="space-y-1.5">
              {inventoryAlerts.map((al) => (
                <div
                  key={al.id}
                  className="rounded-xl border border-rose-200/80 bg-white p-2.5 text-xs flex items-center justify-between shadow-3xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{al.item}</span>
                    <span className="text-[11px] text-rose-700">
                      {al.remaining ? `Only ${al.remaining} left (Min: ${al.reorder})` : al.expiry}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      al.severity === "CRITICAL"
                        ? "border-rose-400 text-rose-700 bg-rose-50"
                        : "border-amber-400 text-amber-800 bg-amber-50"
                    }`}
                  >
                    {al.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branch Performance Comparison */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-amber-600" />
            Branch Performance Comparison
          </h2>

          <div className="space-y-2">
            {branches.map((b) => (
              <div
                key={b.code}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{b.name}</span>
                  <span className="text-amber-800">{formatINR(b.revenue)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{b.orders} orders processed</span>
                  <span className="text-emerald-700 font-semibold">{b.targetPct}% of daily target</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${Math.min(100, b.targetPct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Dishes Ranking */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-600" />
            Top-Selling Menu Items
          </h2>

          <div className="divide-y divide-slate-100">
            {popularDishes.map((dish) => (
              <div key={dish.rank} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                    {dish.rank}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{dish.name}</span>
                    <span className="text-[10px] text-slate-400">{dish.category} • {dish.sold} sold</span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">{formatINR(dish.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Staff Telemetry */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-amber-600" />
            On-Duty Staff Activity
          </h2>

          <div className="space-y-2">
            {activeStaff.map((staff) => (
              <div
                key={staff.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{staff.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {staff.role} • Clocked in {staff.clockedIn}
                  </span>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                    {staff.status}
                  </Badge>
                  {staff.shiftOrders && (
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                      {staff.shiftOrders} orders
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
