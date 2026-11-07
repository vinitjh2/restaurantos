"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  RefreshCw,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderRecord {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  tableNumber?: string | null;
  customerName: string;
  customerPhone?: string | null;
  itemsCount: number;
  itemsSummary: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  invoiceNumber?: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    const matchesType = filterType === "ALL" || order.orderType === filterType;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      order.orderNumber.toLowerCase().includes(searchLower) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(searchLower)) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.itemsSummary.toLowerCase().includes(searchLower);
    return matchesStatus && matchesType && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      "Order Number",
      "Type",
      "Table/Channel",
      "Customer",
      "Items",
      "Subtotal (INR)",
      "Tax (INR)",
      "Grand Total (INR)",
      "Status",
      "Payment",
      "Date",
    ];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.orderType}"`,
      `"${o.tableNumber || "Direct"}"`,
      `"${o.customerName}"`,
      `"${o.itemsSummary.replace(/"/g, '""')}"`,
      o.subtotal.toFixed(2),
      o.taxAmount.toFixed(2),
      o.grandTotal.toFixed(2),
      `"${o.status}"`,
      `"${o.paymentMethod}"`,
      `"${new Date(o.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RestaurantOS_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Live Orders Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time transactional audit trail connected directly to database orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="gap-1.5 text-xs"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5 text-xs"
            disabled={filteredOrders.length === 0}
          >
            <FileDown className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV ({filteredOrders.length})</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, table, customer, dish..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {["ALL", "DINE_IN", "TAKEAWAY", "DELIVERY", "QR_DIGITAL"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded px-2.5 py-1 font-semibold ${
                  filterType === type ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {["ALL", "PREPARING", "SERVED", "PAID", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded px-2.5 py-1 font-semibold ${
                  filterStatus === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading real-time orders from database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Channel</th>
                  <th className="py-3.5 px-4 font-semibold">Table / Guest</th>
                  <th className="py-3.5 px-4 font-semibold">Ordered Line Items</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Bill Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Payment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{ord.orderNumber}</div>
                      <span className="text-[10px] font-normal text-slate-400">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {ord.orderType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {ord.tableNumber ? `Table ${ord.tableNumber}` : ord.orderType}
                      </div>
                      <div className="text-[11px] text-slate-500">{ord.customerName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={ord.itemsSummary}>
                      {ord.itemsSummary || "No items"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatINR(ord.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          ord.status === "PAID"
                            ? "success"
                            : ord.status === "CANCELLED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(ord)}
                        className="h-7 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-slate-400 block">Channel / Type</span>
                <span className="font-semibold text-slate-800">{selectedOrder.orderType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Table / Destination</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : "Direct"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Tender</span>
                <span className="font-semibold text-emerald-700">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Ordered Line Items</h4>
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                {selectedOrder.itemsSummary.split(", ").map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Tax (5% CGST + SGST)</span>
                <span>{formatINR(selectedOrder.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t">
                <span>Grand Total</span>
                <span className="text-emerald-700">{formatINR(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
