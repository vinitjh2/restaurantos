"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DEMO_ORDER_TYPE_DISTRIBUTION } from "@/lib/demo-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

export function OrderDistributionChart() {
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
        <div className="relative h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-white shadow-xl text-xs">
                        <div className="font-semibold">{data.name}</div>
                        <div className="text-amber-400 font-bold">{data.value}% of orders</div>
                        <div className="text-[10px] text-slate-400">{data.count} orders today</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={DEMO_ORDER_TYPE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {DEMO_ORDER_TYPE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">284</span>
            <span className="text-[10px] text-slate-400 font-medium">Orders Today</span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {DEMO_ORDER_TYPE_DISTRIBUTION.map((item, idx) => (
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
      </CardContent>
    </Card>
  );
}
