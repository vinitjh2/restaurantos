"use client";

import { useState, useEffect } from "react";
import {
  GitFork,
  Plus,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertOctagon,
  X,
  Building2,
  Boxes,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BranchItem {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  gstin: string;
  fssaiNumber: string;
  revenue: number;
  ordersCount: number;
  status: string;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceBranchId: string;
  destBranchId: string;
  status: "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
  initiatedBy: string;
  receivedBy?: string;
  initiatedAt: string;
  receivedAt?: string;
  totalValue: number;
  notes?: string;
  items: Array<{
    id: string;
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    uom: string;
    unitCost: number;
    totalCost: number;
  }>;
}

interface IngredientOption {
  id: string;
  name: string;
  baseUom: string;
  currentStock: number;
  purchasePrice: number;
}

export default function BranchesPage() {
  const [activeTab, setActiveTab] = useState<"OUTLETS" | "TRANSFERS">("OUTLETS");
  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [enterpriseMetrics, setEnterpriseMetrics] = useState({
    totalBranches: 0,
    totalEnterpriseRevenue: 0,
    totalStaffAcrossChain: 0,
    totalTablesAcrossChain: 0,
  });

  // Modals
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    phone: "",
    gstin: "",
    fssaiNumber: "",
    cgstRate: 2.5,
    sgstRate: 2.5,
  });

  const [transferForm, setTransferForm] = useState({
    sourceBranchCode: "IND",
    destBranchCode: "KOR",
    initiatedBy: "Head Chef Manpreet",
    notes: "Inter-branch stock rebalance",
    items: [{ ingredientId: "", quantity: 5, uom: "KG" }],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchRes, transferRes, ingRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/branches/transfers"),
        fetch("/api/inventory/items"),
      ]);

      const branchData = await branchRes.json();
      const transferData = await transferRes.json();
      const ingData = await ingRes.json();

      if (branchData.success) {
        setBranches(branchData.branches || []);
        if (branchData.enterpriseMetrics) setEnterpriseMetrics(branchData.enterpriseMetrics);
      }
      if (transferData.success) {
        setTransfers(transferData.transfers || []);
      }
      if (ingData.success && ingData.items) {
        setIngredients(ingData.items);
        if (ingData.items.length > 0 && !transferForm.items[0]?.ingredientId) {
          setTransferForm((prev) => ({
            ...prev,
            items: [{ ingredientId: ingData.items[0].id, quantity: 5, uom: ingData.items[0].baseUom }],
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load branches data:", err);
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

  // Add Branch
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Branch added");
        setShowAddBranchModal(false);
        setNewBranch({
          name: "",
          code: "",
          address: "",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          phone: "",
          gstin: "",
          fssaiNumber: "",
          cgstRate: 2.5,
          sgstRate: 2.5,
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to add branch");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to add branch");
    } finally {
      setSubmitting(false);
    }
  };

  // Initiate Transfer
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/branches/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "INITIATE", ...transferForm }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Transfer initiated");
        setShowTransferModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to initiate transfer");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to initiate transfer");
    } finally {
      setSubmitting(false);
    }
  };

  // Acknowledge Receipt
  const handleReceiveTransfer = async (transferId: string) => {
    try {
      const res = await fetch("/api/branches/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RECEIVE", transferId, receivedBy: "Store Manager" }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Stock transfer received");
        loadData();
      } else {
        notify("error", data.error || "Failed to receive transfer");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to receive transfer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
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
            <GitFork className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Multi-Branch Outlets & Central Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage restaurant chain locations, independent GSTINs, cross-branch stock transfers and consolidated owner analytics
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
            variant="outline"
            size="sm"
            onClick={() => setShowTransferModal(true)}
            className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <Truck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Transfer Stock</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddBranchModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Outlet Branch</span>
          </Button>
        </div>
      </div>

      {/* Top Enterprise Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Enterprise Chain Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">
            {formatINR(enterpriseMetrics.totalEnterpriseRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across all active branches</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Outlets</span>
            <Store className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{enterpriseMetrics.totalBranches} Locations</div>
          <div className="mt-1 text-[11px] text-slate-500">Karnataka F&B territory</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Workforce Across Chain</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{enterpriseMetrics.totalStaffAcrossChain} Staff</div>
          <div className="mt-1 text-[11px] text-slate-500">Management, Chefs & Floor Captains</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Inter-Branch Transfers</span>
            <Truck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600">{transfers.length} Logged</div>
          <div className="mt-1 text-[11px] text-slate-500">Stock rebalancing in transit</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("OUTLETS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "OUTLETS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>Outlet Directory ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TRANSFERS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "TRANSFERS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Cross-Branch Stock Transfers ({transfers.length})</span>
        </button>
      </div>

      {/* TAB 1: OUTLET DIRECTORY */}
      {activeTab === "OUTLETS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {branches.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                    {b.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{b.name}</h3>
                  <span className="text-xs text-slate-500">{b.city}, {b.state}</span>
                </div>
                <Badge variant="success" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                  Online
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-mono text-slate-500">
                  GSTIN: <span className="font-bold text-slate-800">{b.gstin}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  FSSAI: <span className="font-bold text-slate-800">{b.fssaiNumber}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{b.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{b.phone}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</span>
                  <div className="font-bold text-slate-900 text-sm">{formatINR(b.revenue)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Orders Settled</span>
                  <div className="font-bold text-slate-800 text-sm text-right">{b.ordersCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STOCK TRANSFERS */}
      {activeTab === "TRANSFERS" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Transfer #</th>
                  <th className="py-3 px-4 font-semibold">Route (Origin → Destination)</th>
                  <th className="py-3 px-4 font-semibold">Transferred Materials</th>
                  <th className="py-3 px-4 font-semibold text-right">Transfer Valuation</th>
                  <th className="py-3 px-4 font-semibold">Timestamps</th>
                  <th className="py-3 px-4 font-semibold text-center">Transfer Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No cross-branch stock transfers logged yet.
                    </td>
                  </tr>
                ) : (
                  transfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-slate-900">{trf.transferNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{trf.sourceBranchId}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                            {trf.destBranchId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">
                          {trf.items?.map((it) => `${it.quantity} ${it.uom} of ${it.ingredientName}`).join(", ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(trf.totalValue)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <div>Dispatched: {new Date(trf.initiatedAt).toLocaleDateString("en-IN")}</div>
                        {trf.receivedAt && (
                          <div className="text-emerald-600">
                            Received: {new Date(trf.receivedAt).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={trf.status === "RECEIVED" ? "success" : "warning"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {trf.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {trf.status === "IN_TRANSIT" ? (
                          <Button
                            size="sm"
                            onClick={() => handleReceiveTransfer(trf.id)}
                            className="h-6 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                          >
                            <PackageCheck className="h-3 w-3" />
                            <span>Acknowledge Receipt</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Delivered & Credited</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD BRANCH */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="h-4 w-4 text-indigo-600" />
                <span>Register Outlet Branch</span>
              </h2>
              <button onClick={() => setShowAddBranchModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Outlet Name</label>
                  <input
                    type="text"
                    required
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    placeholder="e.g. RestaurantOS — Whitefield"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WTF"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Branch GSTIN</label>
                  <input
                    type="text"
                    required
                    value={newBranch.gstin}
                    onChange={(e) => setNewBranch({ ...newBranch, gstin: e.target.value.toUpperCase() })}
                    placeholder="29AABCR1234F1Z8"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">FSSAI License #</label>
                  <input
                    type="text"
                    required
                    value={newBranch.fssaiNumber}
                    onChange={(e) => setNewBranch({ ...newBranch, fssaiNumber: e.target.value })}
                    placeholder="11223344556677"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    placeholder="+91 80 4455 6677"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder="e.g. ITPL Main Road, Whitefield"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddBranchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Registering..." : "Save Outlet Branch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INITIATE STOCK TRANSFER */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span>Inter-Branch Stock Transfer</span>
              </h2>
              <button onClick={() => setShowTransferModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleInitiateTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Source Origin</label>
                  <select
                    value={transferForm.sourceBranchCode}
                    onChange={(e) => setTransferForm({ ...transferForm, sourceBranchCode: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Destination Branch</label>
                  <select
                    value={transferForm.destBranchCode}
                    onChange={(e) => setTransferForm({ ...transferForm, destBranchCode: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Selection */}
              <div className="space-y-2 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <span className="font-bold text-slate-900 text-[11px]">Select Material & Quantity</span>
                {transferForm.items.map((it, idx) => {
                  const selectedIng = ingredients.find((i) => i.id === it.ingredientId);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={it.ingredientId}
                        onChange={(e) => {
                          const newItems = [...transferForm.items];
                          const ing = ingredients.find((i) => i.id === e.target.value);
                          newItems[idx].ingredientId = e.target.value;
                          if (ing) newItems[idx].uom = ing.baseUom;
                          setTransferForm({ ...transferForm, items: newItems });
                        }}
                        className="flex-1 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (Stock: {ing.currentStock} {ing.baseUom})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.1"
                        value={it.quantity}
                        onChange={(e) => {
                          const newItems = [...transferForm.items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          setTransferForm({ ...transferForm, items: newItems });
                        }}
                        className="w-24 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white text-right font-bold"
                      />

                      <span className="w-12 text-xs font-mono font-bold text-slate-600">
                        {it.uom}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transfer Notes / Reason</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="e.g. Weekend banquet dairy stock rebalance"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {submitting ? "Dispatching..." : "Dispatch Stock Transfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
