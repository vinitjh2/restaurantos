"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Eye, ArrowUpRight, RefreshCw } from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  orderType: string;
  tableNumber?: string | null;
  customerName: string;
  itemsSummary: string;
  grandTotal: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentOrders() {
      try {
        const res = await fetch("/api/orders?limit=6");
        const json = await res.json();
        if (json.success && json.orders) {
          setOrders(json.orders);
        }
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecentOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PREPARING":
        return <Badge variant="warning">Cooking (KOT)</Badge>;
      case "SERVED":
        return <Badge variant="info">Served</Badge>;
      case "PAID":
        return <Badge variant="success">Paid & Settled</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case "DINE_IN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "QR_DIGITAL":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERY":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "TAKEAWAY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <CardTitle>Recent Orders & Live Bills</CardTitle>
          </div>
          <CardDescription>Real-time order feed across all stations & channels</CardDescription>
        </div>
        <Link
          href="/orders"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>View All Orders</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
            Loading live orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-1 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Table / Source</th>
                  <th className="pb-3 font-semibold">Ordered Items</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 pr-1 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-1 font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getOrderTypeBadge(
                          order.orderType
                        )}`}
                      >
                        {order.orderType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {order.tableNumber ? `Table ${order.tableNumber}` : order.orderType}
                    </td>
                    <td className="py-3 text-slate-500 max-w-[200px] truncate" title={order.itemsSummary}>
                      {order.itemsSummary || "Line items"}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      {formatINR(order.grandTotal)}
                    </td>
                    <td className="py-3 text-center">{getStatusBadge(order.status)}</td>
                    <td className="py-3 pr-1 text-right">
                      <Link
                        href="/orders"
                        className="inline-flex items-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
