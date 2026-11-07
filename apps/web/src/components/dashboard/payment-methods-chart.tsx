"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DEMO_PAYMENT_METHOD_DISTRIBUTION } from "@/lib/demo-data";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function PaymentMethodsChart() {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <CardTitle>Payment Method Breakdown</CardTitle>
        </div>
        <CardDescription>UPI dominates 58% of tender settlements</CardDescription>
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
                        <div className="text-emerald-400 font-bold">{formatINR(data.amount)}</div>
                        <div className="text-[10px] text-slate-400">{data.value}% of gross revenue</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={DEMO_PAYMENT_METHOD_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {DEMO_PAYMENT_METHOD_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-pm-${index}`} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-slate-900">₹1.48L</span>
            <span className="text-[10px] text-slate-400 font-medium">Total Tendered</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {DEMO_PAYMENT_METHOD_DISTRIBUTION.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
              <div className="flex flex-col truncate">
                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formatINR(item.amount)} ({item.value}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
