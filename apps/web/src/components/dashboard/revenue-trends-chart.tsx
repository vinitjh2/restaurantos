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
} from "recharts";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { DashboardPeriodicPoint } from "@/types/dashboard";

interface RevenueTrendsChartProps {
  data?: DashboardPeriodicPoint[];
}

export function RevenueTrendsChart({ data = [] }: RevenueTrendsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <CardTitle>Daily Revenue Trend</CardTitle>
          </div>
          <CardDescription>
            {data.length > 0
              ? "Settled sales grouped by day across your outlets"
              : "Revenue trends will populate once bills are settled"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full pt-4">
          {!mounted ? (
            <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">
              Loading revenue trends...
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              No daily revenue records available in this timeframe yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
                          <div className="text-[11px] font-medium text-slate-400">{pt.date}</div>
                          <div className="text-sm font-bold text-blue-400">{formatINR(pt.revenue)}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5">{pt.orders} Orders settled</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
