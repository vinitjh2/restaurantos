"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import type { DashboardPaymentSlice } from "@/types/dashboard";

interface PaymentMethodsChartProps {
  data?: DashboardPaymentSlice[];
}

export function PaymentMethodsChart({ data = [] }: PaymentMethodsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalTendered = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <CardTitle>Payment Method Breakdown</CardTitle>
        </div>
        <CardDescription>
          {data.length > 0
            ? "Live settlement split across UPI, Cards, and Cash"
            : "Settlement tenders appear once bills are paid"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="h-[220px] w-full flex items-center justify-center text-slate-300 text-xs">
            Loading payment methods...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl text-center px-4">
            <span className="font-bold text-slate-700 text-lg">₹0</span>
            <span>No customer payments collected yet.</span>
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
                            <div className="text-emerald-400 font-bold">{formatINR(slice.amount)}</div>
                            <div className="text-[10px] text-slate-400">{slice.value}% of tender</div>
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
                      <Cell key={`cell-pm-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-900">{formatINR(totalTendered)}</span>
                <span className="text-[10px] text-slate-400 font-medium">Total Tendered</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {data.map((item, idx) => (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
