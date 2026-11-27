"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUpRight, Plus, RefreshCw, CheckCircle2 } from "lucide-react";

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  status: "CRITICAL" | "LOW" | string;
}

export function LowStockAlerts() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [totalInventoryItems, setTotalInventoryItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        setLoading(true);
        const res = await fetch("/api/inventory/items");
        const json = await res.json();
        if (json.success && Array.isArray(json.items)) {
          setTotalInventoryItems(json.items.length);
          const lowStockOnly: LowStockItem[] = json.items
            .filter((i: any) => i.currentStock <= (i.minimumStock ?? i.minStock ?? 0))
            .slice(0, 5)
            .map((i: any) => {
              const min = i.minimumStock ?? i.minStock ?? 0;
              return {
                id: i.id,
                name: i.name,
                category: i.category,
                currentStock: i.currentStock,
                reorderLevel: min,
                unit: i.baseUom || i.unit || "UNIT",
                status: i.currentStock <= min * 0.3 ? "CRITICAL" : "LOW",
              };
            });
          setItems(lowStockOnly);
        }
      } catch (err) {
        console.error("Failed to load live low stock:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLowStock();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <CardTitle>Low-Stock Alerts</CardTitle>
          </div>
          <CardDescription>Ingredients below reorder threshold</CardDescription>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          <span>Inventory</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-rose-500" />
            Checking stock levels...
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
            <div className="font-semibold text-slate-600">
              {totalInventoryItems > 0
                ? "All inventory stock healthy"
                : "No inventory items configured yet"}
            </div>
            <div>
              {totalInventoryItems > 0
                ? "No ingredients are below reorder threshold."
                : "Add raw ingredients in Inventory to track alerts."}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{item.name}</span>
                    <Badge
                      variant={item.status === "CRITICAL" ? "destructive" : "warning"}
                      className="text-[9px] px-1.5 py-0 uppercase"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Stock:{" "}
                    <span className="font-semibold text-rose-600">
                      {item.currentStock} {item.unit}
                    </span>{" "}
                    / Min: {item.reorderLevel} {item.unit} ({item.category})
                  </div>
                </div>

                <Link
                  href={`/purchases?reorder=${item.id}`}
                  className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-3 w-3 text-slate-500" />
                  <span>PO</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
