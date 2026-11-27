"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";
import type { DashboardChannelSlice } from "@/types/dashboard";

interface OrderDistributionChartProps {
  data?: DashboardChannelSlice[];
}

export function OrderDistributionChart({ data = [] }: OrderDistributionChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-indigo-600" />
          <CardTitle>Order Type Distribution</CardTitle>
        </div>
        <CardDescription>Breakdown by service channel</CardDescription>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="h-[220px] w-full flex items-center justify-center text-slate-300 text-xs">
            Loading distribution...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl text-center px-4">
            <span className="font-bold text-slate-700 text-lg">0</span>
            <span>No orders placed yet in this timeframe.</span>
          </div>
        ) : (
          <>
            <div className="relative h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const slice = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-white shadow-xl text-xs">
                            <div className="font-semibold">{slice.name}</div>
                            <div className="text-amber-400 font-bold">{slice.value}% of orders</div>
                            <div className="text-[10px] text-slate-400">{slice.count} orders</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{totalOrders}</span>
                <span className="text-[10px] text-slate-400 font-medium">Orders</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-slate-700 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.value}% ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
