"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DEMO_TOP_DISHES } from "@/lib/demo-data";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";

export function TopDishesChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-orange-600" />
            <CardTitle>Top-Selling Dishes (By Volume)</CardTitle>
          </div>
          <CardDescription>
            Murgh Dum Biryani & Butter Chicken leading lunchtime sales
          </CardDescription>
        </div>
        <span className="text-xs font-semibold text-slate-500">Live POS sync</span>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          {!mounted ? (
            <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">
              Loading dish analytics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DEMO_TOP_DISHES}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={130}
                tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl text-xs">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              data.diet === "VEG" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {data.name}
                        </div>
                        <div className="text-amber-400 font-bold mt-1">
                          {data.count} Portions Sold
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Gross Contribution: {formatINR(data.revenue)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
