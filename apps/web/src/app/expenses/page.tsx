"use client";

import { useState, useEffect } from "react";
import {
  CircleDollarSign,
  Plus,
  Search,
  Tag,
  Calendar,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowDownCircle,
  ShieldCheck,
  DollarSign,
  Wallet,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES } from "@/lib/server/accounting-engine";

interface ExpenseItem {
  id: string;
  branchId: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  vendor?: string;
  authorizedBy: string;
  date: string;
  receiptRef?: string;
}

interface CashShift {
  id: string;
  branchId: string;
  openedBy: string;
  closedBy?: string;
  openingTime: string;
  closingTime?: string;
  openingBalance: number;
  cashSales: number;
  cashDrops: number;
  cashRefunds: number;
  expectedCash: number;
  actualClosingCash?: number;
  cashVariance: number;
  status: "OPEN" | "CLOSED";
  notes?: string;
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "CASH_DRAWER">("EXPENSES");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);

  // Modals
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCashDropModal, setShowCashDropModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    category: "Kitchen LPG",
    description: "",
    amount: 1000,
    paymentMode: "CASH",
    vendor: "",
    authorizedBy: "Chef Manpreet",
    branchId: "IND",
    receiptRef: "",
  });

  const [openShiftForm, setOpenShiftForm] = useState({
    openedBy: "Rahul Sharma (Cashier)",
    openingBalance: 3000,
    branchId: "IND",
    notes: "Morning shift drawer opened",
  });

  const [cashDropForm, setCashDropForm] = useState({
    cashDropAmount: 5000,
    notes: "Safe vault transfer",
  });

  const [closeShiftForm, setCloseShiftForm] = useState({
    actualClosingCash: 0,
    closedBy: "Ananya Roy (Manager)",
    notes: "Evening shift reconciliation",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, shiftRes] = await Promise.all([
        fetch("/api/accounting/expenses"),
        fetch("/api/accounting/cash-register"),
      ]);

      const expData = await expRes.json();
      const shiftData = await shiftRes.json();

      if (expData.success) {
        setExpenses(expData.expenses || []);
        setTotalExpense(expData.totalExpense || 0);
      }
      if (shiftData.success) {
        setActiveShift(shiftData.activeShift || null);
        if (shiftData.activeShift) {
          setCloseShiftForm((prev) => ({
            ...prev,
            actualClosingCash: shiftData.activeShift.expectedCash || 0,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load expenses data:", err);
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

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Expense recorded");
        setShowAddExpenseModal(false);
        setExpenseForm({
          category: "Kitchen LPG",
          description: "",
          amount: 1000,
          paymentMode: "CASH",
          vendor: "",
          authorizedBy: "Chef Manpreet",
          branchId: "IND",
          receiptRef: "",
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to record expense");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Shift
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "OPEN", ...openShiftForm }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message);
        setShowOpenShiftModal(false);
        loadData();
      } else {
        notify("error", data.error);
      }
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Cash Drop
  const handleCashDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DROP", ...cashDropForm }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message);
        setShowCashDropModal(false);
        loadData();
      } else {
        notify("error", data.error);
      }
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Close Shift & Reconcile
  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLOSE", ...closeShiftForm }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message);
        setShowCloseShiftModal(false);
        loadData();
      } else {
        notify("error", data.error);
      }
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
            <CircleDollarSign className="h-5 w-5 text-rose-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Accounting, Expenses & Cash Drawer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational petty cash ledger, commercial LPG, utilities, cash drawer shift reconciliation and variance control
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
            onClick={() => setShowAddExpenseModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Expense</span>
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Operational Expenses</span>
            <CircleDollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">{formatINR(totalExpense)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Across {expenses.length} logged expense entries</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cash Register Status</span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {activeShift?.status === "OPEN" ? "Drawer OPEN" : "Shift Closed"}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Expected Cash: <span className="font-bold text-slate-800">{formatINR(activeShift?.expectedCash || 0)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Till Variance / Discrepancy</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className={`mt-2 text-xl font-bold ${activeShift?.cashVariance && activeShift.cashVariance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {activeShift?.cashVariance ? formatINR(activeShift.cashVariance) : "₹0 (Balanced)"}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Physical count reconciliation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("EXPENSES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "EXPENSES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>Operational Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CASH_DRAWER")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "CASH_DRAWER"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Cash Register Till & Drawer Shifts</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL EXPENSES */}
      {activeTab === "EXPENSES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expense description, vendor or category..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {["All", ...EXPENSE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                    categoryFilter === cat
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Expense Category</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Vendor / Beneficiary</th>
                    <th className="py-3 px-4 font-semibold">Date & User</th>
                    <th className="py-3 px-4 font-semibold">Tender Mode</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-semibold text-slate-800">
                          {exp.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{exp.description}</td>
                      <td className="py-3 px-4 text-slate-600">{exp.vendor || "Direct Vendor"}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{new Date(exp.date).toLocaleDateString("en-IN")}</div>
                        <span className="text-[10px] text-slate-400">By {exp.authorizedBy}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {exp.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatINR(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASH REGISTER SHIFTS */}
      {activeTab === "CASH_DRAWER" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  <span>Till Drawer Shift Reconciliation</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Branch: IND (Indiranagar) | Shift Operator: {activeShift?.openedBy || "None"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!activeShift || activeShift.status === "CLOSED" ? (
                  <Button
                    size="sm"
                    onClick={() => setShowOpenShiftModal(true)}
                    className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Open New Drawer Shift</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCashDropModal(true)}
                      className="gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      <ArrowDownCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Safe Cash Drop</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowCloseShiftModal(true)}
                      className="gap-1.5 text-xs bg-rose-600 text-white hover:bg-rose-700"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Reconcile & Close Shift</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Shift Metrics Breakdown */}
            {activeShift && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Opening Float</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatINR(activeShift.openingBalance)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cash Sales Received</span>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">
                    +{formatINR(activeShift.cashSales)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cash Drops (Safe)</span>
                  <div className="text-base font-bold text-amber-600 mt-0.5">
                    -{formatINR(activeShift.cashDrops)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected in Till</span>
                  <div className="text-base font-bold text-indigo-600 mt-0.5">
                    {formatINR(activeShift.expectedCash)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Variance (Discrepancy)</span>
                  <div className={`text-base font-bold mt-0.5 ${activeShift.cashVariance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {activeShift.cashVariance ? formatINR(activeShift.cashVariance) : "₹0"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-rose-600" />
                <span>Record Operational Expense</span>
              </h2>
              <button onClick={() => setShowAddExpenseModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. 2x Commercial Indane 19Kg LPG Refill"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Tender</label>
                  <select
                    value={expenseForm.paymentMode}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="CASH">Cash (Petty Till)</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    placeholder="e.g. Indane Gas Agency"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Authorized By</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.authorizedBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, authorizedBy: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddExpenseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Logging..." : "Confirm Expense"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OPEN SHIFT */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="h-4 w-4 text-emerald-600" />
                <span>Open Cash Drawer Shift</span>
              </h2>
              <button onClick={() => setShowOpenShiftModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Cash Float (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={openShiftForm.openingBalance}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, openingBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opened By (Staff Name)</label>
                <input
                  type="text"
                  required
                  value={openShiftForm.openedBy}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, openedBy: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowOpenShiftModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Opening..." : "Confirm Open Drawer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CASH DROP */}
      {showCashDropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-amber-600" />
                <span>Safe Vault Cash Drop</span>
              </h2>
              <button onClick={() => setShowCashDropModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCashDrop} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount to Transfer to Safe (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={cashDropForm.cashDropAmount}
                  onChange={(e) => setCashDropForm({ ...cashDropForm, cashDropAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Drop Reason / Remarks</label>
                <input
                  type="text"
                  value={cashDropForm.notes}
                  onChange={(e) => setCashDropForm({ ...cashDropForm, notes: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCashDropModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-amber-600 text-white hover:bg-amber-700">
                  {submitting ? "Dropping..." : "Confirm Drop"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLOSE SHIFT */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-600" />
                <span>Close Shift & Reconcile Till</span>
              </h2>
              <button onClick={() => setShowCloseShiftModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Expected System Cash:</span>
                  <span className="font-bold text-slate-900">{formatINR(activeShift.expectedCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Physically Counted Cash in Till (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={closeShiftForm.actualClosingCash}
                  onChange={(e) => setCloseShiftForm({ ...closeShiftForm, actualClosingCash: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Closed By (Manager Name)</label>
                <input
                  type="text"
                  required
                  value={closeShiftForm.closedBy}
                  onChange={(e) => setCloseShiftForm({ ...closeShiftForm, closedBy: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCloseShiftModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-rose-600 text-white hover:bg-rose-700">
                  {submitting ? "Closing..." : "Close & Reconcile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
