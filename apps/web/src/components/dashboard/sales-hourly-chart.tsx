"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DEMO_HOURLY_SALES } from "@/lib/demo-data";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";

export function SalesHourlyChart() {
  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <CardTitle>Sales by Hour (Today)</CardTitle>
          </div>
          <CardDescription>
            Peak rush recorded between 1:00 PM – 2:30 PM & 8:00 PM – 9:45 PM
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Peak: ₹32.4K @ 8 PM</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={DEMO_HOURLY_SALES}
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
                tickFormatter={(value) => `₹${value / 1000}k`}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
                        <div className="text-[11px] font-medium text-slate-400">{data.time}</div>
                        <div className="text-sm font-bold text-amber-400">
                          {formatINR(data.sales)}
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          {data.orders} Completed Orders
                        </div>
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
        </div>
      </CardContent>
    </Card>
  );
}
