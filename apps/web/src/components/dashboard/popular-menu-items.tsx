"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_TOP_DISHES } from "@/lib/demo-data";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Flame, ArrowUpRight } from "lucide-react";

interface TopDish {
  name: string;
  category: string;
  count: number;
  revenue: number;
  diet?: string;
}

export function PopularMenuItems() {
  const [dishes, setDishes] = useState<TopDish[]>(DEMO_TOP_DISHES.slice(0, 5));

  useEffect(() => {
    async function fetchTopDishes() {
      try {
        const res = await fetch("/api/reports/analytics?timeRange=30d");
        const json = await res.json();
        if (json.success && json.topSellingItems && json.topSellingItems.length > 0) {
          const mapped: TopDish[] = json.topSellingItems.slice(0, 5).map((item: any) => ({
            name: item.name,
            category: item.category || "Main Course",
            count: item.quantity,
            revenue: item.revenue,
            diet: item.name.toLowerCase().includes("chicken") || item.name.toLowerCase().includes("mutton") || item.name.toLowerCase().includes("biryani") ? "NON_VEG" : "VEG",
          }));
          setDishes(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch top dishes:", err);
      }
    }
    fetchTopDishes();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500" />
            <CardTitle>Popular Menu Items</CardTitle>
          </div>
          <CardDescription>Top revenue drivers by kitchen station</CardDescription>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
        >
          <span>Catalog</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {dishes.map((dish, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-3 w-3 items-center justify-center rounded-xs border p-0.5 ${
                        dish.diet === "VEG"
                          ? "border-emerald-600 bg-white"
                          : "border-rose-600 bg-white"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          dish.diet === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                        }`}
                      />
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{dish.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {dish.category} · {dish.count} orders
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">{formatINR(dish.revenue)}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">High Margin</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
