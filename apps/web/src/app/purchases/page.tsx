"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  PackageCheck,
  Truck,
  Calendar,
  AlertOctagon,
  X,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: string;
  totalAmount: number;
  notes?: string;
  supplier: {
    id: string;
    name: string;
    phone: string;
    gstin?: string;
  };
  items: Array<{
    id: string;
    ingredientId: string;
    orderedQuantity: number;
    receivedQuantity: number;
    unitCost: number;
    totalCost: number;
    ingredient: {
      name: string;
      baseUom: string;
    };
  }>;
  grns?: Array<{ id: string; grnNumber: string }>;
}

interface GRN {
  id: string;
  grnNumber: string;
  purchaseOrderId?: string;
  purchaseOrder?: { poNumber: string };
  supplierId: string;
  supplier: { name: string; phone?: string };
  receivedAt: string;
  receivedBy: string;
  vendorChallanNumber?: string;
  inspectionStatus: string;
  notes?: string;
  items: Array<{
    id: string;
    ingredientId: string;
    quantityReceived: number;
    unitCost: number;
    totalCost: number;
    batchNumber?: string;
    expiryDate?: string;
    ingredient: {
      name: string;
      baseUom: string;
    };
  }>;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  creditBalance: number;
}

interface Ingredient {
  id: string;
  name: string;
  baseUom: string;
  purchasePrice: number;
}

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<"POS" | "GRNS">("POS");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Modals
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [showReceiveGrnModal, setShowReceiveGrnModal] = useState(false);
  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [poForm, setPoForm] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [{ ingredientId: "", orderedQuantity: 10, unitCost: 100 }],
  });

  const [grnForm, setGrnForm] = useState({
    purchaseOrderId: "",
    supplierId: "",
    receivedBy: "Chef Manpreet",
    vendorChallanNumber: "",
    inspectionStatus: "PASSED",
    notes: "",
    items: [{ ingredientId: "", quantityReceived: 10, unitCost: 100, batchNumber: "", expiryDate: "" }],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [posRes, grnsRes, suppliersRes, ingredientsRes] = await Promise.all([
        fetch("/api/procurement/purchase-orders"),
        fetch("/api/procurement/grn"),
        fetch("/api/procurement/suppliers"),
        fetch("/api/inventory/items"),
      ]);

      const posData = await posRes.json();
      const grnsData = await grnsRes.json();
      const suppliersData = await suppliersRes.json();
      const ingredientsData = await ingredientsRes.json();

      if (posData.success) setOrders(posData.orders || []);
      if (grnsData.success) setGrns(grnsData.grns || []);
      if (suppliersData.success) {
        setSuppliers(suppliersData.suppliers || []);
        if (suppliersData.suppliers?.length > 0 && !poForm.supplierId) {
          setPoForm((prev) => ({ ...prev, supplierId: suppliersData.suppliers[0].id }));
        }
      }
      if (ingredientsData.success) {
        setIngredients(ingredientsData.items || []);
        if (ingredientsData.items?.length > 0 && !poForm.items[0]?.ingredientId) {
          setPoForm((prev) => ({
            ...prev,
            items: [
              {
                ingredientId: ingredientsData.items[0].id,
                orderedQuantity: 10,
                unitCost: ingredientsData.items[0].purchasePrice,
              },
            ],
          }));
        }
      }
    } catch (err: any) {
      console.error("Error loading purchases data:", err);
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

  // Create PO
  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poForm),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Purchase Order issued successfully");
        setShowCreatePoModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to create PO");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  // Open GRN Modal pre-filled from an active PO
  const openGrnForPo = (po: PurchaseOrder) => {
    setSelectedPoForGrn(po);
    setGrnForm({
      purchaseOrderId: po.id,
      supplierId: po.supplierId,
      receivedBy: "Head Chef Manpreet",
      vendorChallanNumber: `CHAL-${Date.now().toString().slice(-4)}`,
      inspectionStatus: "PASSED",
      notes: `Received against ${po.poNumber}`,
      items: po.items.map((it) => ({
        ingredientId: it.ingredientId,
        quantityReceived: it.orderedQuantity,
        unitCost: it.unitCost,
        batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
        expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
      })),
    });
    setShowReceiveGrnModal(true);
  };

  // Submit GRN
  const handleReceiveGrn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grnForm),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "GRN processed, stock credited, and invoice created!");
        setShowReceiveGrnModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to process GRN");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to process GRN");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    return (
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplier.name.toLowerCase().includes(search.toLowerCase())
    );
  });

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
            <Receipt className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchase Orders & GRN</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement workflow, vendor goods receipt (GRN), quality inspection and automated stock credit
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
            onClick={() => setShowCreatePoModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Purchase Order</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("POS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "POS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Purchase Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("GRNS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "GRNS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PackageCheck className="h-3.5 w-3.5" />
          <span>Goods Received Notes - GRN ({grns.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PO # or vendor name..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === "POS" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">PO #</th>
                  <th className="py-3 px-4 font-semibold">Vendor / Supplier</th>
                  <th className="py-3 px-4 font-semibold">Order Date</th>
                  <th className="py-3 px-4 font-semibold">Line Items</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => {
                    const isCompleted = po.status === "COMPLETED";
                    return (
                      <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-slate-900">{po.poNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{po.supplier?.name}</div>
                          <span className="text-[10px] text-slate-400">{po.supplier?.phone}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(po.orderDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{po.items?.length || 0} Items: </span>
                          <span className="text-slate-500 text-[11px]">
                            {po.items?.map((it) => `${it.ingredient.name} (${it.orderedQuantity}${it.ingredient.baseUom})`).join(", ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                          {formatINR(po.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isCompleted ? (
                            <Badge variant="success" className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border-amber-300">
                              Issued / Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isCompleted ? (
                            <Button
                              size="sm"
                              onClick={() => openGrnForPo(po)}
                              className="h-7 text-xs bg-indigo-600 text-white hover:bg-indigo-700 gap-1"
                            >
                              <PackageCheck className="h-3 w-3" />
                              <span>Receive GRN</span>
                            </Button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Goods Inwarded</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GOODS RECEIVED NOTES (GRN) */}
      {activeTab === "GRNS" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">GRN #</th>
                  <th className="py-3 px-4 font-semibold">PO Reference</th>
                  <th className="py-3 px-4 font-semibold">Vendor</th>
                  <th className="py-3 px-4 font-semibold">Received Date & User</th>
                  <th className="py-3 px-4 font-semibold">Vendor Challan</th>
                  <th className="py-3 px-4 font-semibold text-center">Quality Inspection</th>
                  <th className="py-3 px-4 font-semibold text-right">Items Inwarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No Goods Received Notes recorded yet.
                    </td>
                  </tr>
                ) : (
                  grns.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-slate-900">{grn.grnNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {grn.purchaseOrder?.poNumber || "Direct Inward"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{grn.supplier?.name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>
                          {new Date(grn.receivedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <span className="text-[10px] text-slate-400">By {grn.receivedBy}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {grn.vendorChallanNumber || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border-emerald-300"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
                          {grn.inspectionStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-800">
                          {grn.items?.map((it) => `${it.quantityReceived} ${it.ingredient?.baseUom || ""} of ${it.ingredient?.name || ""}`).join(", ")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-600" />
                <span>Issue New Purchase Order</span>
              </h2>
              <button onClick={() => setShowCreatePoModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Supplier</label>
                  <select
                    required
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">Purchase Order Items</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPoForm({
                        ...poForm,
                        items: [
                          ...poForm.items,
                          { ingredientId: ingredients[0]?.id || "", orderedQuantity: 10, unitCost: 100 },
                        ],
                      })
                    }
                    className="h-6 text-[10px] gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {poForm.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={it.ingredientId}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        const ing = ingredients.find((i) => i.id === e.target.value);
                        newItems[idx].ingredientId = e.target.value;
                        if (ing) newItems[idx].unitCost = ing.purchasePrice;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="flex-1 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.baseUom})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.1"
                      placeholder="Qty"
                      value={it.orderedQuantity}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].orderedQuantity = parseFloat(e.target.value) || 0;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-20 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white text-right"
                    />

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Cost (₹)"
                      value={it.unitCost}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].unitCost = parseFloat(e.target.value) || 0;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-24 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white text-right"
                    />

                    <div className="w-20 text-right font-mono font-bold text-slate-800 text-xs">
                      ₹{(it.orderedQuantity * it.unitCost).toFixed(2)}
                    </div>

                    {poForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = poForm.items.filter((_, i) => i !== idx);
                          setPoForm({ ...poForm, items: newItems });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="e.g. Delivery before 11:00 AM, refrigerated transport required"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreatePoModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Issuing..." : "Confirm & Issue PO"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECEIVE GRN */}
      {showReceiveGrnModal && selectedPoForGrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-emerald-600" />
                  <span>Goods Received Note (GRN) for {selectedPoForGrn.poNumber}</span>
                </h2>
                <span className="text-[11px] text-slate-500">Supplier: {selectedPoForGrn.supplier.name}</span>
              </div>
              <button onClick={() => setShowReceiveGrnModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleReceiveGrn} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor Challan #</label>
                  <input
                    type="text"
                    required
                    value={grnForm.vendorChallanNumber}
                    onChange={(e) => setGrnForm({ ...grnForm, vendorChallanNumber: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Received By</label>
                  <input
                    type="text"
                    required
                    value={grnForm.receivedBy}
                    onChange={(e) => setGrnForm({ ...grnForm, receivedBy: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quality Inspection</label>
                  <select
                    value={grnForm.inspectionStatus}
                    onChange={(e) => setGrnForm({ ...grnForm, inspectionStatus: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="PASSED">Passed Inspection</option>
                    <option value="CONDITIONALLY_ACCEPTED">Conditionally Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Items receiving table */}
              <div className="space-y-2 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <span className="font-bold text-slate-900 text-[11px]">Verify Received Quantities & Batch</span>
                {grnForm.items.map((it, idx) => {
                  const ing = ingredients.find((i) => i.id === it.ingredientId);
                  return (
                    <div key={idx} className="space-y-1.5 p-2 rounded-lg bg-white border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{ing?.name || "Ingredient"}</span>
                        <span>₹{(it.quantityReceived * it.unitCost).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500">Qty Received ({ing?.baseUom})</label>
                          <input
                            type="number"
                            step="0.01"
                            value={it.quantityReceived}
                            onChange={(e) => {
                              const newItems = [...grnForm.items];
                              newItems[idx].quantityReceived = parseFloat(e.target.value) || 0;
                              setGrnForm({ ...grnForm, items: newItems });
                            }}
                            className="w-full h-7 px-2 border rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Batch Number</label>
                          <input
                            type="text"
                            value={it.batchNumber}
                            onChange={(e) => {
                              const newItems = [...grnForm.items];
                              newItems[idx].batchNumber = e.target.value;
                              setGrnForm({ ...grnForm, items: newItems });
                            }}
                            className="w-full h-7 px-2 border rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Expiry Date</label>
                          <input
                            type="date"
                            value={it.expiryDate}
                            onChange={(e) => {
                              const newItems = [...grnForm.items];
                              newItems[idx].expiryDate = e.target.value;
                              setGrnForm({ ...grnForm, items: newItems });
                            }}
                            className="w-full h-7 px-2 border rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Receiving Remarks / Notes</label>
                <input
                  type="text"
                  value={grnForm.notes}
                  onChange={(e) => setGrnForm({ ...grnForm, notes: e.target.value })}
                  placeholder="e.g. Temperature checked at 4°C, seal intact."
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowReceiveGrnModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Processing Inward..." : "Accept & Credit Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
