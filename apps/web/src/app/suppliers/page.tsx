"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  X,
  RefreshCw,
  Search,
  CreditCard,
  History,
  DollarSign,
  ShieldCheck,
  Star,
  Receipt,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  paymentTermsDays: number;
  creditBalance: number;
  rating: number;
  purchaseOrders?: Array<{ id: string; poNumber: string; totalAmount: number; status: string }>;
  invoices?: Array<{ id: string; invoiceNumber: string; totalAmount: number; balanceDue: number; status: string }>;
  payments?: Array<{ id: string; amount: number; paymentMethod: string; paymentDate: string }>;
}

interface PaymentRecord {
  id: string;
  supplierId: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  paymentDate: string;
  paidBy: string;
  supplier: {
    name: string;
    phone: string;
  };
  invoice?: {
    invoiceNumber: string;
  };
}

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "PAYMENTS">("DIRECTORY");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalPayables, setTotalPayables] = useState(0);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Modals
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    category: "Dairy Products",
    contactPerson: "",
    phone: "",
    email: "",
    gstin: "",
    address: "",
    paymentTermsDays: 15,
  });

  const [paymentForm, setPaymentForm] = useState({
    supplierId: "",
    amount: 1000,
    paymentMethod: "BANK_TRANSFER",
    transactionRef: "",
    paidBy: "Finance Lead",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, paymentsRes] = await Promise.all([
        fetch("/api/procurement/suppliers"),
        fetch("/api/procurement/payments"),
      ]);

      const supData = await suppliersRes.json();
      const payData = await paymentsRes.json();

      if (supData.success) {
        setSuppliers(supData.suppliers || []);
        setTotalPayables(supData.totalPayables || 0);
      }
      if (payData.success) {
        setPayments(payData.payments || []);
      }
    } catch (err: any) {
      console.error("Error loading suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Add Supplier
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Supplier registered successfully");
        setShowAddSupplierModal(false);
        setNewSupplier({
          name: "",
          category: "Dairy Products",
          contactPerson: "",
          phone: "",
          email: "",
          gstin: "",
          address: "",
          paymentTermsDays: 15,
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to add supplier");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to add supplier");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Payment Modal
  const openPaymentForSupplier = (s: Supplier) => {
    setSelectedSupplierForPayment(s);
    setPaymentForm({
      supplierId: s.id,
      amount: s.creditBalance > 0 ? s.creditBalance : 5000,
      paymentMethod: "BANK_TRANSFER",
      transactionRef: `UTR-${Date.now().toString().slice(-6)}`,
      paidBy: "Finance Lead",
    });
    setShowPaymentModal(true);
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Supplier payment recorded successfully");
        setShowPaymentModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to record payment");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Supplier CRM & Vendor Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered raw material vendors, GSTINs, payment terms and credit balance settlement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddSupplierModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Payables Outstanding</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">{formatINR(totalPayables)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Unsettled vendor invoices across all suppliers</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Suppliers</span>
            <Truck className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{suppliers.length} Vendors</div>
          <div className="mt-1 text-[11px] text-slate-500">Dairy, Poultry, Vegetables, Spices & Packaging</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Vendor Payments Settled</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">{payments.length} Transactions</div>
          <div className="mt-1 text-[11px] text-slate-500">Recorded via Bank Transfer, UPI & Cheques</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "DIRECTORY"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Vendor Directory ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PAYMENTS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "PAYMENTS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Payment Ledger ({payments.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor by name, category or contact person..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: SUPPLIERS DIRECTORY */}
      {activeTab === "DIRECTORY" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              No suppliers found matching your query.
            </div>
          ) : (
            filteredSuppliers.map((s) => {
              const hasBalance = s.creditBalance > 0;
              return (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                      <span className="text-[11px] text-slate-500">{s.category}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 text-[11px] font-bold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{s.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {s.contactPerson && (
                      <div className="text-slate-700 font-medium text-[11px]">Contact: {s.contactPerson}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="line-clamp-1">{s.address}</span>
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-slate-400">
                      GSTIN: {s.gstin || "Unregistered"} | Net {s.paymentTermsDays} Days
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500">Payable Balance:</span>
                      <div className={`font-bold text-sm ${hasBalance ? "text-rose-600" : "text-emerald-600"}`}>
                        {formatINR(s.creditBalance)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openPaymentForSupplier(s)}
                      className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800 gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span>Pay Vendor</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT LEDGER */}
      {activeTab === "PAYMENTS" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Payment Date</th>
                  <th className="py-3 px-4 font-semibold">Supplier / Vendor</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold">Transaction Ref / UTR</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount Settled</th>
                  <th className="py-3 px-4 font-semibold">Paid By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No vendor payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.supplier?.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold">
                          {p.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {p.transactionRef || "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 text-sm">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.paidBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD SUPPLIER */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                <span>Register New Supplier / Vendor</span>
              </h2>
              <button onClick={() => setShowAddSupplierModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Dairy Fresh Farms LLP"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Poultry & Fresh Meats">Poultry & Fresh Meats</option>
                    <option value="Vegetables & Daily Produce">Vegetables & Produce</option>
                    <option value="Grains, Pulses & Spices">Grains & Spices</option>
                    <option value="Oils & Ghee">Oils & Ghee</option>
                    <option value="Food Packaging Materials">Packaging Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="+91 98201 12345"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="orders@vendor.com"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newSupplier.gstin}
                    onChange={(e) => setNewSupplier({ ...newSupplier, gstin: e.target.value })}
                    placeholder="27AABBD1234F1Z8"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Terms (Days)</label>
                  <input
                    type="number"
                    value={newSupplier.paymentTermsDays}
                    onChange={(e) => setNewSupplier({ ...newSupplier, paymentTermsDays: parseInt(e.target.value, 10) || 15 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Warehouse / Supply Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="e.g. APMC Market Yard, Vashi, Navi Mumbai, MH"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSupplierModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Registering..." : "Save Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {showPaymentModal && selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Record Vendor Payment</span>
                </h2>
                <span className="text-[11px] text-slate-500">To: {selectedSupplierForPayment.name}</span>
              </div>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-slate-600">Current Credit Balance:</span>
                <span className="font-bold text-rose-600 text-sm">
                  {formatINR(selectedSupplierForPayment.creditBalance)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Paid By</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.paidBy}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidBy: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transaction Ref / UTR #</label>
                <input
                  type="text"
                  required
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  placeholder="e.g. UTR-HDFC-992144"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Processing..." : "Confirm & Record Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
