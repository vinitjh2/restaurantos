"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Award,
  Gift,
  Tag,
  Phone,
  Mail,
  Calendar,
  MapPin,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  X,
  CreditCard,
  History,
  Sparkles,
  Percent,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  address?: string;
  customerNotes?: string;
  totalSpend: number;
  totalVisits: number;
  averageOrderValue: number;
  lastVisit?: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  gstin?: string;
  loyaltyTx?: Array<{
    id: string;
    points: number;
    type: string;
    balanceAfter: number;
    notes?: string;
    createdAt: string;
  }>;
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  timesUsed: number;
  usageLimit: number;
  isActive: boolean;
}

interface GiftVoucher {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  customerName?: string;
  customerPhone?: string;
  expiryDate: string;
  status: string;
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "LOYALTY" | "COUPONS" | "VOUCHERS">("CUSTOMERS");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [vouchers, setVouchers] = useState<GiftVoucher[]>([]);
  const [metrics, setMetrics] = useState({ totalCustomers: 0, totalLifetimeSpend: 0, averageAOV: 0 });

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddVoucherModal, setShowAddVoucherModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: "",
    address: "",
    customerNotes: "",
    gstin: "",
  });

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    title: "",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValue: 500,
    maxDiscount: 200,
    usageLimit: 100,
  });

  const [newVoucher, setNewVoucher] = useState({
    initialAmount: 1000,
    customerName: "",
    customerPhone: "",
    recipientEmail: "",
    expiryDays: 180,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [custRes, couponRes, voucherRes] = await Promise.all([
        fetch("/api/crm/customers"),
        fetch("/api/crm/coupons"),
        fetch("/api/crm/vouchers"),
      ]);

      const custData = await custRes.json();
      const couponData = await couponRes.json();
      const voucherData = await voucherRes.json();

      if (custData.success) {
        setCustomers(custData.customers || []);
        if (custData.metrics) setMetrics(custData.metrics);
      }
      if (couponData.success) setCoupons(couponData.coupons || []);
      if (voucherData.success) setVouchers(voucherData.vouchers || []);
    } catch (err: any) {
      console.error("Error loading CRM data:", err);
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

  // Add Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Customer profile created successfully");
        setShowAddCustomerModal(false);
        setNewCustomer({
          name: "",
          phone: "",
          email: "",
          birthday: "",
          address: "",
          customerNotes: "",
          gstin: "",
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to create customer");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/crm/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Coupon created");
        setShowAddCouponModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to create coupon");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Gift Voucher
  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/crm/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoucher),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Voucher issued");
        setShowAddVoucherModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to issue voucher");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to issue voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()));
    const matchesTier = tierFilter === "All" || c.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
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
            <Users className="h-5 w-5 text-violet-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Customer CRM & Loyalty</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dine-in patron profiles, tier-based points accumulation, promotional coupons and digital gift vouchers
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
            onClick={() => setShowAddCouponModal(true)}
            className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <Tag className="h-3.5 w-3.5 text-indigo-600" />
            <span>New Coupon</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddVoucherModal(true)}
            className="gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            <Gift className="h-3.5 w-3.5 text-amber-600" />
            <span>Issue Voucher</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddCustomerModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Customer</span>
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered Patrons</span>
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{metrics.totalCustomers} Customers</div>
          <div className="mt-1 text-[11px] text-slate-500">Tracked across visits and orders</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cumulative Patron Spend</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">{formatINR(metrics.totalLifetimeSpend)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Lifetime verified restaurant billing</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Order Value (AOV)</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{formatINR(metrics.averageAOV)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Across Bronze, Silver, Gold & Platinum tiers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("CUSTOMERS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "CUSTOMERS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Customer Directory ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LOYALTY")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "LOYALTY"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Reward Tiers & Multipliers</span>
        </button>

        <button
          onClick={() => setActiveTab("COUPONS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "COUPONS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Coupons & Promos ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("VOUCHERS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "VOUCHERS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Gift className="h-3.5 w-3.5" />
          <span>Digital Gift Vouchers ({vouchers.length})</span>
        </button>
      </div>

      {/* Search and Tier Filter */}
      {activeTab === "CUSTOMERS" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patron name, phone or GSTIN..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["All", "Platinum", "Gold", "Silver", "Bronze"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  tierFilter === tier
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: CUSTOMER DIRECTORY */}
      {activeTab === "CUSTOMERS" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer Details</th>
                  <th className="py-3 px-4 font-semibold">Contact & Location</th>
                  <th className="py-3 px-4 font-semibold text-center">Loyalty Tier</th>
                  <th className="py-3 px-4 font-semibold text-right">Points Balance</th>
                  <th className="py-3 px-4 font-semibold text-center">Visits</th>
                  <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 font-semibold text-right">AOV</th>
                  <th className="py-3 px-4 font-semibold">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No customer profiles match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        {c.gstin && (
                          <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                            GST: {c.gstin}
                          </span>
                        )}
                        {c.customerNotes && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1">{c.customerNotes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">{c.phone}</div>
                        {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            c.loyaltyTier === "Platinum"
                              ? "bg-purple-50 text-purple-700 border-purple-300"
                              : c.loyaltyTier === "Gold"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : c.loyaltyTier === "Silver"
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : "bg-orange-50 text-orange-700 border-orange-300"
                          }`}
                        >
                          {c.loyaltyTier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600 font-mono text-sm">
                        {c.loyaltyPoints.toLocaleString("en-IN")} pts
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {c.totalVisits}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatINR(c.totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatINR(c.averageOrderValue)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {c.lastVisit
                          ? new Date(c.lastVisit).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REWARD TIERS */}
      {activeTab === "LOYALTY" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-2">
              <Badge className="bg-orange-600 text-white">Bronze Member</Badge>
              <div className="text-xl font-bold text-slate-900">₹0 – ₹9,999</div>
              <p className="text-xs text-slate-600">Standard 1x points earn rate (1 point per ₹100 spent).</p>
            </div>
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2">
              <Badge className="bg-slate-700 text-white">Silver Member</Badge>
              <div className="text-xl font-bold text-slate-900">₹10,000+</div>
              <p className="text-xs text-slate-600">1.25x point multiplier + complimentary dessert on birthday.</p>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 space-y-2">
              <Badge className="bg-amber-600 text-white">Gold VIP</Badge>
              <div className="text-xl font-bold text-slate-900">₹25,000+</div>
              <p className="text-xs text-slate-600">1.5x points multiplier + 5% direct bill discount + priority booking.</p>
            </div>
            <div className="rounded-xl border border-purple-300 bg-purple-50/40 p-4 space-y-2">
              <Badge className="bg-purple-700 text-white">Platinum Elite</Badge>
              <div className="text-xl font-bold text-slate-900">₹50,000+</div>
              <p className="text-xs text-slate-600">2x points multiplier + 10% bill discount + VIP chef's table priority.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS */}
      {activeTab === "COUPONS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((cp) => (
            <div key={cp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm tracking-wide bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                    {cp.code}
                  </h3>
                  <div className="text-xs font-semibold text-slate-800 mt-1.5">{cp.title}</div>
                </div>
                <Badge variant={cp.isActive ? "success" : "secondary"}>
                  {cp.isActive ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  Discount:{" "}
                  <span className="font-bold text-slate-900">
                    {cp.discountType === "PERCENTAGE" ? `${cp.discountValue}%` : formatINR(cp.discountValue)}
                  </span>
                </div>
                <div>Min Order: <span className="font-semibold text-slate-700">{formatINR(cp.minOrderValue)}</span></div>
                {cp.maxDiscount > 0 && (
                  <div>Max Cap: <span className="font-semibold text-slate-700">{formatINR(cp.maxDiscount)}</span></div>
                )}
                <div>
                  Redemptions:{" "}
                  <span className="font-semibold text-slate-700">
                    {cp.timesUsed} / {cp.usageLimit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: VOUCHERS */}
      {activeTab === "VOUCHERS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Digital Gift Card</span>
                  <div className="font-bold text-slate-900 font-mono text-sm">{v.code}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                  {v.status}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="text-lg font-bold text-slate-900">{formatINR(v.currentBalance)}</div>
                <div>Beneficiary: <span className="font-semibold text-slate-800">{v.customerName || "Patron"}</span></div>
                <div className="text-[10px] text-slate-400">
                  Expires: {new Date(v.expiryDate).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-600" />
                <span>Register Patron Profile</span>
              </h2>
              <button onClick={() => setShowAddCustomerModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="e.g. Suresh Nambiar"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+91 98801 23456"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="patron@gmail.com"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Birthday</label>
                  <input
                    type="date"
                    value={newCustomer.birthday}
                    onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">B2B GSTIN (Optional)</label>
                <input
                  type="text"
                  value={newCustomer.gstin}
                  onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
                  placeholder="29AAACI1234F1Z8"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Address / Locality</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="e.g. Koramangala 3rd Block, Bengaluru"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Preferences & Notes</label>
                <textarea
                  rows={2}
                  value={newCustomer.customerNotes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, customerNotes: e.target.value })}
                  placeholder="e.g. Prefers quiet corner booth, nut allergy, loves tandoori"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCustomerModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Saving..." : "Register Patron"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD COUPON */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-600" />
                <span>Create Promotional Coupon</span>
              </h2>
              <button onClick={() => setShowAddCouponModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Rupees (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Min Bill (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newCoupon.title}
                  onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  placeholder="e.g. 20% Festive Weekend Discount"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCouponModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {submitting ? "Saving..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ISSUE VOUCHER */}
      {showAddVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-600" />
                <span>Issue Digital Gift Card</span>
              </h2>
              <button onClick={() => setShowAddVoucherModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Voucher Amount (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={newVoucher.initialAmount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, initialAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    value={newVoucher.customerName}
                    onChange={(e) => setNewVoucher({ ...newVoucher, customerName: e.target.value })}
                    placeholder="e.g. Priya Menon"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Beneficiary Phone</label>
                  <input
                    type="tel"
                    value={newVoucher.customerPhone}
                    onChange={(e) => setNewVoucher({ ...newVoucher, customerPhone: e.target.value })}
                    placeholder="+91 98450 99887"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={newVoucher.expiryDays}
                  onChange={(e) => setNewVoucher({ ...newVoucher, expiryDays: parseInt(e.target.value, 10) || 180 })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddVoucherModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-amber-600 text-white hover:bg-amber-700">
                  {submitting ? "Issuing..." : "Issue Gift Card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
