"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";
import type { DashboardHourlyBucket } from "@/types/dashboard";

interface SalesHourlyChartProps {
  data?: DashboardHourlyBucket[];
}

export function SalesHourlyChart({ data = [] }: SalesHourlyChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const peakBucket = data.reduce<DashboardHourlyBucket | null>(
    (best, cur) => (!best || cur.sales > best.sales ? cur : best),
    null
  );

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <CardTitle>Sales by Hour</CardTitle>
          </div>
          <CardDescription>
            {data.length > 0
              ? "Live hourly settlement velocity from your POS & QR channels"
              : "Hourly sales velocity appears once orders are settled"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>
            {peakBucket && peakBucket.sales > 0
              ? `Peak: ${formatINR(peakBucket.sales)} @ ${peakBucket.time}`
              : "Peak: ₹0"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-4">
          {!mounted ? (
            <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">
              Loading sales telemetry...
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              No hourly sales recorded in this timeframe yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hourlySalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
                          <div className="text-[11px] font-medium text-slate-400">{pt.time}</div>
                          <div className="text-sm font-bold text-amber-400">{formatINR(pt.sales)}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5">{pt.orders} Completed Orders</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hourlySalesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
