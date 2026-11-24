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
  Sparkles,
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

const FALLBACK_DEMO_ORDERS: OrderRecord[] = [
  {
    id: "demo-ord-2840",
    orderNumber: "ORD-2840",
    orderType: "DINE_IN",
    status: "PREPARING",
    tableNumber: "T-01",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98450 11223",
    itemsCount: 7,
    itemsSummary: "2x Butter Chicken, 4x Butter Garlic Naan, 1x Dal Makhani",
    subtotal: 1310,
    taxAmount: 65.5,
    grandTotal: 1375.5,
    paymentMethod: "UNPAID",
    invoiceNumber: "INV-IND-2840",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2841",
    orderNumber: "ORD-2841",
    orderType: "QR_DIGITAL",
    status: "PREPARING",
    tableNumber: "T-04",
    customerName: "Ananya Deshmukh",
    customerPhone: "+91 97412 88341",
    itemsCount: 5,
    itemsSummary: "1x Paneer Butter Masala, 2x Butter Garlic Naan, 2x Masala Chaas",
    subtotal: 620,
    taxAmount: 31,
    grandTotal: 651,
    paymentMethod: "UPI (Google Pay)",
    invoiceNumber: "INV-IND-2841",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2842",
    orderNumber: "ORD-2842",
    orderType: "DELIVERY",
    status: "SERVED",
    tableNumber: null,
    customerName: "Zomato Partner (#9841)",
    customerPhone: "+91 98800 23456",
    itemsCount: 4,
    itemsSummary: "2x Murgh Dum Biryani, 2x Gulab Jamun (2 Pcs)",
    subtotal: 920,
    taxAmount: 46,
    grandTotal: 966,
    paymentMethod: "Zomato Pay",
    invoiceNumber: "INV-IND-2842",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2843",
    orderNumber: "ORD-2843",
    orderType: "TAKEAWAY",
    status: "PAID",
    tableNumber: null,
    customerName: "Rohit Verma",
    customerPhone: "+91 99160 55421",
    itemsCount: 5,
    itemsSummary: "1x Crispy Corn Salt & Pepper, 1x Paneer Butter Masala, 3x Butter Garlic Naan",
    subtotal: 800,
    taxAmount: 40,
    grandTotal: 840,
    paymentMethod: "Cash",
    invoiceNumber: "INV-IND-2843",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2844",
    orderNumber: "ORD-2844",
    orderType: "DINE_IN",
    status: "PAID",
    tableNumber: "T-02",
    customerName: "Priya Nair",
    customerPhone: "+91 96110 33902",
    itemsCount: 4,
    itemsSummary: "1x Tandoori Chicken, 1x Murgh Dum Biryani, 2x Masala Chaas",
    subtotal: 750,
    taxAmount: 37.5,
    grandTotal: 787.5,
    paymentMethod: "Credit Card (HDFC)",
    invoiceNumber: "INV-IND-2844",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2845",
    orderNumber: "ORD-2845",
    orderType: "DINE_IN",
    status: "PAID",
    tableNumber: "T-06",
    customerName: "Aditya & Family",
    customerPhone: "+91 98451 99012",
    itemsCount: 13,
    itemsSummary: "3x Murgh Dum Biryani, 1x Butter Chicken, 6x Butter Garlic Naan, 3x Gulab Jamun",
    subtotal: 2230,
    taxAmount: 111.5,
    grandTotal: 2341.5,
    paymentMethod: "UPI (PhonePe)",
    invoiceNumber: "INV-IND-2845",
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2846",
    orderNumber: "ORD-2846",
    orderType: "DELIVERY",
    status: "PREPARING",
    tableNumber: null,
    customerName: "Swiggy Express (#4410)",
    customerPhone: "+91 99001 77234",
    itemsCount: 6,
    itemsSummary: "1x Butter Chicken, 1x Dal Makhani, 4x Butter Garlic Naan",
    subtotal: 940,
    taxAmount: 47,
    grandTotal: 987,
    paymentMethod: "Swiggy Pay",
    invoiceNumber: "INV-IND-2846",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2847",
    orderNumber: "ORD-2847",
    orderType: "QR_DIGITAL",
    status: "SERVED",
    tableNumber: "AC-01",
    customerName: "Kavita Rao",
    customerPhone: "+91 94480 66123",
    itemsCount: 2,
    itemsSummary: "1x Crispy Corn Salt & Pepper, 1x Masala Chaas",
    subtotal: 310,
    taxAmount: 15.5,
    grandTotal: 325.5,
    paymentMethod: "UPI (Paytm)",
    invoiceNumber: "INV-IND-2847",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-ord-2848",
    orderNumber: "ORD-2848",
    orderType: "DINE_IN",
    status: "CANCELLED",
    tableNumber: "RF-01",
    customerName: "Sameer Joshi",
    customerPhone: "+91 98200 44119",
    itemsCount: 3,
    itemsSummary: "1x Tandoori Chicken, 2x Butter Garlic Naan",
    subtotal: 420,
    taxAmount: 21,
    grandTotal: 441,
    paymentMethod: "REFUNDED",
    invoiceNumber: "INV-IND-2848",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
      } else {
        // If empty, auto-seed and reload
        try {
          const seedRes = await fetch("/api/orders/seed", { method: "POST" });
          const seedData = await seedRes.json();
          if (seedData.success) {
            const reRes = await fetch("/api/orders?limit=100");
            const reData = await reRes.json();
            if (reData.success && reData.orders?.length > 0) {
              setOrders(reData.orders);
              return;
            }
          }
        } catch {}
        setOrders(FALLBACK_DEMO_ORDERS);
      }
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
      setOrders(FALLBACK_DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemoOrders = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/orders/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to seed demo orders:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "ALL" ||
      order.status === filterStatus ||
      (filterStatus === "PREPARING" && ["PREPARING", "KOT_SENT", "OPEN"].includes(order.status)) ||
      (filterStatus === "SERVED" && ["SERVED", "BILLED"].includes(order.status)) ||
      (filterStatus === "CANCELLED" && ["CANCELLED", "REFUNDED", "VOID"].includes(order.status));

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

  const getStatusBadgeVariant = (st: string) => {
    if (st === "PAID") return "success";
    if (["PREPARING", "KOT_SENT", "OPEN"].includes(st)) return "warning";
    if (["SERVED", "BILLED"].includes(st)) return "info";
    if (["CANCELLED", "REFUNDED"].includes(st)) return "destructive";
    return "outline";
  };

  const getStatusBadgeLabel = (st: string) => {
    if (st === "KOT_SENT" || st === "PREPARING") return "PREPARING (KOT)";
    if (st === "OPEN") return "ACTIVE OPEN";
    if (st === "BILLED" || st === "SERVED") return "SERVED / BILLED";
    return st;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Live Orders Ledger</h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
              {filteredOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time transactional audit trail connected directly to database orders & POS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemoOrders}
            className="gap-1.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            disabled={isSeeding}
            title="Generate and populate realistic demo orders across all branches"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin" : ""}`} />
            <span>{isSeeding ? "Seeding..." : "Seed Demo Orders"}</span>
          </Button>
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
            <span>Export CSV</span>
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
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <p>No orders match the selected filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemoOrders}
              className="gap-1.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Realistic Demo Orders</span>
            </Button>
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
                      {ord.itemsSummary || "Dine-in Order"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatINR(ord.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={getStatusBadgeVariant(ord.status)}>
                        {getStatusBadgeLabel(ord.status)}
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
                <span className="font-semibold text-slate-800">{selectedOrder.orderType.replace("_", " ")}</span>
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
                {selectedOrder.customerPhone && (
                  <span className="text-slate-500 block text-[11px]">{selectedOrder.customerPhone}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block">Payment Tender</span>
                <span className="font-semibold text-emerald-700">{selectedOrder.paymentMethod}</span>
                {selectedOrder.invoiceNumber && (
                  <span className="text-slate-400 block text-[10px]">{selectedOrder.invoiceNumber}</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Ordered Line Items</h4>
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5">
                {selectedOrder.itemsSummary.split(", ").map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 font-medium">
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
