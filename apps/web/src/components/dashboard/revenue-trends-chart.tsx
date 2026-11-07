"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DEMO_WEEKLY_REVENUE, DEMO_MONTHLY_REVENUE } from "@/lib/demo-data";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevenueTrendsChart() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <CardTitle>
              {view === "weekly" ? "Weekly Revenue (This Week)" : "Monthly Revenue (FY 2026-27)"}
            </CardTitle>
          </div>
          <CardDescription>
            {view === "weekly"
              ? "Friday & Weekend surge generated 60% of total weekly sales"
              : "Financial year performance vs targets (Values in ₹ Lakhs)"}
          </CardDescription>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setView("weekly")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-semibold transition-all",
              view === "weekly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-semibold transition-all",
              view === "monthly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Monthly
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full pt-4">
          {!mounted ? (
            <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">
              Loading revenue trends...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {view === "weekly" ? (
              <BarChart
                data={DEMO_WEEKLY_REVENUE}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
                          <div className="text-[11px] font-medium text-slate-400">{data.day}</div>
                          <div className="text-sm font-bold text-blue-400">
                            {formatINR(data.revenue)}
                          </div>
                          <div className="text-[10px] text-slate-300 mt-0.5">
                            {data.orders} Orders settled
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <BarChart
                data={DEMO_MONTHLY_REVENUE}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
                          <div className="text-[11px] font-medium text-slate-400">{data.month}</div>
                          <div className="text-sm font-bold text-emerald-400">
                            Actual: ₹{data.revenue} Lakhs
                          </div>
                          <div className="text-[10px] text-slate-300">
                            Target: ₹{data.target} Lakhs
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                />
                <Bar
                  dataKey="revenue"
                  name="Actual (₹ Lakhs)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={25}
                />
                <Bar
                  dataKey="target"
                  name="Target (₹ Lakhs)"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={25}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
