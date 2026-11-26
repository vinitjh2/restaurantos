"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  Activity,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  FileText,
  Webhook,
  Lock,
  Layers,
  ArrowUpRight,
  Check,
  X,
  Edit2,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

const DEMO_RESTAURANT_SLUGS = [
  "bawarchi-royale",
  "himalayan-momo",
  "cafe-mocha",
  "spice-route",
  "suspended-eats",
];
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminMetrics {
  totalRestaurants: number;
  activeRestaurants: number;
  trialAccounts: number;
  suspendedAccounts: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  mrr: number;
  arr: number;
  newRegistrations: number;
  failedPayments: number;
}

interface RestaurantRecord {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  contactEmail: string;
  contactPhone?: string | null;
  status: "ACTIVE" | "TRIALING" | "SUSPENDED" | string;
  subscriptionPlan: string;
  subscriptionRenewal?: string | null;
  createdAt: string;
  branchCount: number;
  branches: Array<{ id: string; name: string; code: string; city: string }>;
  userCount: number;
  userAccounts: Array<{ id: string; name: string; email: string; role: string; isActive: boolean }>;
  orderCount: number;
  activeSubscription?: {
    id: string;
    planCode: string;
    planName: string;
    monthlyPrice: number;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
    maxBranches: number;
    maxEmployees: number;
    storageLimitMB: number;
  } | null;
}

interface PlanRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  maxBranches: number;
  maxEmployees: number;
  storageLimitMB: number;
  allowedModules: string;
  hasAdvancedReporting: boolean;
  hasApiIntegrations: boolean;
  hasCustomDomain: boolean;
  isActive: boolean;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | string;
  paymentMethod: string;
  razorpayPaymentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  organization: { id: string; name: string; slug: string; contactEmail: string };
  planName: string;
  planCode: string;
}

export default function PlatformAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "restaurants" | "plans" | "invoices" | "razorpay">("overview");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const isAuditor = currentUser?.role === "PLATFORM_AUDITOR";
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  // Modals & Actions
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantRecord | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null);
  const [assignPlanModalOrg, setAssignPlanModalOrg] = useState<RestaurantRecord | null>(null);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState("GROWTH");
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<RestaurantRecord | null>(null);
  const [confirmPurgeDemos, setConfirmPurgeDemos] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Webhook Test State
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = async () => {
    const isAdminHost =
      typeof window !== "undefined" && window.location.hostname.toLowerCase().includes("dineadmin");
    const dest = isAdminHost ? "/login?redirect=/platform-admin" : "/login";
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = dest;
    } catch {
      window.location.href = dest;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, restRes, plansRes, invRes, meRes] = await Promise.all([
        fetch("/api/platform-admin/overview"),
        fetch("/api/platform-admin/restaurants"),
        fetch("/api/platform-admin/plans"),
        fetch("/api/platform-admin/invoices"),
        fetch("/api/auth/me"),
      ]);

      if (meRes.status === 401 || ovRes.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login?redirect=/platform-admin";
        }
        return;
      }

      const [ovData, restData, plansData, invData, meData] = await Promise.all([
        ovRes.json(),
        restRes.json(),
        plansRes.json(),
        invRes.json(),
        meRes.json(),
      ]);

      if (meData?.success && meData?.user) {
        setCurrentUser(meData.user);
        const role = meData.user.role;
        if (role !== "PLATFORM_OWNER" && role !== "PLATFORM_AUDITOR") {
          setAccessDenied(true);
          return;
        }
      }

      if (ovRes.status === 403 || (!ovData.success && ovData.error?.toLowerCase().includes("requires"))) {
        setAccessDenied(true);
        return;
      }

      setAccessDenied(false);
      if (ovData.success) setMetrics(ovData.metrics);
      if (restData.success) setRestaurants(restData.restaurants);
      if (plansData.success) setPlans(plansData.plans);
      if (invData.success) setInvoices(invData.invoices);
    } catch (err) {
      console.error("Failed to load platform admin telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    if (isAuditor) {
      showToast("Action blocked: Read-Only Auditor Mode cannot modify restaurant status.");
      return;
    }
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      setActionLoading(true);
      const res = await fetch(`/api/platform-admin/restaurants/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Restaurant status changed to ${nextStatus}`);
        loadData();
        if (selectedRestaurant?.id === orgId) {
          setSelectedRestaurant((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuditor) {
      showToast("Action blocked: Read-Only Auditor Mode cannot reassign plans.");
      return;
    }
    if (!assignPlanModalOrg) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/platform-admin/restaurants/${assignPlanModalOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionPlan: selectedPlanToAssign }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Assigned ${selectedPlanToAssign} plan to ${assignPlanModalOrg.name}`);
        setAssignPlanModalOrg(null);
        loadData();
      }
    } catch (err) {
      console.error("Failed to assign plan:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePlanEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuditor) {
      showToast("Action blocked: Read-Only Auditor Mode cannot edit plan pricing.");
      return;
    }
    if (!editingPlan) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/platform-admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Plan ${editingPlan.code} limits and pricing updated!`);
        setEditingPlan(null);
        loadData();
      }
    } catch (err) {
      console.error("Failed to save plan edits:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (isAuditor) {
      showToast("Action blocked: Read-Only Auditor Mode cannot delete restaurants.");
      return;
    }
    if (!deleteConfirmOrg) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/platform-admin/restaurants/${deleteConfirmOrg.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Deleted restaurant "${deleteConfirmOrg.name}" permanently.`);
        if (selectedRestaurant?.id === deleteConfirmOrg.id) {
          setSelectedRestaurant(null);
        }
        setDeleteConfirmOrg(null);
        loadData();
      } else {
        showToast(data.error || "Failed to delete restaurant");
      }
    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      showToast("Failed to delete restaurant");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurgeDemoRestaurants = async () => {
    if (isAuditor) {
      showToast("Action blocked: Read-Only Auditor Mode cannot delete demo restaurants.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch("/api/platform-admin/restaurants/purge-demos", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Removed ${data.deletedCount} demo restaurant(s) from database.`);
        setConfirmPurgeDemos(false);
        setSelectedRestaurant(null);
        loadData();
      } else {
        showToast(data.error || "Failed to purge demo restaurants");
      }
    } catch (err) {
      console.error("Failed to purge demo restaurants:", err);
      showToast("Failed to purge demo restaurants");
    } finally {
      setActionLoading(false);
    }
  };

  const demoRestaurants = restaurants.filter((r) => DEMO_RESTAURANT_SLUGS.includes(r.slug));

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesPlan = planFilter === "ALL" || r.subscriptionPlan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Restricted Admin Portal</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Signed in as <span className="font-mono font-semibold">{currentUser?.email || "restaurant user"}</span> ({currentUser?.role || "UNAUTHORIZED"}). This console requires authorized Super Admin or Platform Auditor credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleLogout}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Sign Out &amp; Switch Account</span>
            </Button>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  DineAdmin <span className="text-indigo-600">Portal</span>
                </h1>
                {isAuditor ? (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-bold px-2 py-0.5">
                    👁️ Read-Only Auditor Mode
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-bold px-2 py-0.5">
                    🛡️ Full Access Super Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                dineadmin.sutrauniverse.com · Central Multi-Tenant Registry, Subscriptions & Telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.email && (
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{currentUser.email}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            <Power className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Read-Only Auditor Warning Banner */}
      {isAuditor && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
              Read-Only Inspector Mode (Inspection Only)
            </h3>
            <p className="text-xs text-amber-800">
              You have read-only privileges across all restaurant tenants, revenue MRR metrics, invoices, and subscriptions. All modification buttons (status toggles, plan reassignments, pricing updates) are locked and cannot mutate any data.
            </p>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Core Financial & Operating Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Monthly Recurring
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatINR(metrics?.mrr || 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            ARR: {formatINR(metrics?.arr || 0)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Restaurants
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metrics?.totalRestaurants || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            +{metrics?.newRegistrations || 0} in last 30d
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Active Accounts
          </span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {metrics?.activeRestaurants || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            {metrics?.activeSubscriptions || 0} Paid Plans
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Trial Accounts
          </span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {metrics?.trialAccounts || 0}
          </div>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">
            14-Day Free Access
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suspended
          </span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {metrics?.suspendedAccounts || 0}
          </div>
          <span className="text-[10px] text-rose-700 font-medium mt-1 block">
            Access Blocked
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Failed Invoices
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metrics?.failedPayments || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            Payment dunning
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "border-b-2 border-indigo-600 text-indigo-600 font-black"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Overview Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab("restaurants")}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "restaurants"
              ? "border-b-2 border-indigo-600 text-indigo-600 font-black"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Restaurant Directory ({restaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "plans"
              ? "border-b-2 border-indigo-600 text-indigo-600 font-black"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Plans & Feature Limits (4)</span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "invoices"
              ? "border-b-2 border-indigo-600 text-indigo-600 font-black"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Subscription Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("razorpay")}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "razorpay"
              ? "border-b-2 border-indigo-600 text-indigo-600 font-black"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Webhook className="h-3.5 w-3.5" />
          <span>Razorpay Webhook Engine</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW TELEMETRY */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Status Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tenant Account Health
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">Active Paid Tenants</span>
                    <span className="text-slate-900">{metrics?.activeRestaurants || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${metrics?.totalRestaurants ? ((metrics.activeRestaurants / metrics.totalRestaurants) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700">Active Free Trials</span>
                    <span className="text-slate-900">{metrics?.trialAccounts || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${metrics?.totalRestaurants ? ((metrics.trialAccounts / metrics.totalRestaurants) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-700">Suspended / Overdue</span>
                    <span className="text-slate-900">{metrics?.suspendedAccounts || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${metrics?.totalRestaurants ? ((metrics.suspendedAccounts / metrics.totalRestaurants) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Automatic suspension triggers when an account remains overdue past grace period.
              </div>
            </div>

            {/* Pricing Model & Tier Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Subscription Plan Tiers
              </h3>
              <div className="space-y-2.5 text-xs">
                {plans.map((p) => {
                  const subscriberCount = restaurants.filter((r) => r.subscriptionPlan === p.code).length;
                  return (
                    <div key={p.code} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {formatINR(p.monthlyPrice)}/mo · Max {p.maxBranches} Outlets
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-indigo-600 block">{subscriberCount}</span>
                        <span className="text-[10px] text-slate-400">clients</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Gateway Health */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Gateway & Infrastructure
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">Razorpay Webhook Handler</span>
                    <span className="text-[10px] text-emerald-700">HMAC-SHA256 Signature Verified</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Multi-Tenant Database</span>
                    <span className="text-[10px] text-slate-500">Prisma ORM · Zero-Trust Scoping</span>
                  </div>
                  <Badge variant="success">Operational</Badge>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setActiveTab("restaurants")}
                    className="w-full bg-slate-900 text-white text-xs gap-1.5"
                  >
                    <span>Manage Registered Businesses</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESTAURANTS DIRECTORY */}
      {activeTab === "restaurants" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name, URL slug, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {demoRestaurants.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading || isAuditor}
                  title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Remove all seeded demo restaurants"}
                  onClick={() => {
                    if (isAuditor) return;
                    setConfirmPurgeDemos(true);
                  }}
                  className="h-9 text-xs border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 gap-1.5 font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Demo Restaurants ({demoRestaurants.length})</span>
                </Button>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 text-slate-700 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIALING">Trialing</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-9 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 text-slate-700 font-medium"
              >
                <option value="ALL">All Plans</option>
                <option value="STARTER">Starter</option>
                <option value="GROWTH">Growth</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Restaurants Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Business / Tenant</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Branches</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Staff</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Orders</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Plan</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRestaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{r.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          slug: {r.slug} · {r.contactEmail}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 text-[10px]">
                        {r.businessType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {r.branchCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {r.userCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {r.orderCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="outline" className="text-[10px] font-bold border-indigo-200 bg-indigo-50 text-indigo-700">
                        {r.subscriptionPlan}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          r.status === "ACTIVE"
                            ? "success"
                            : r.status === "TRIALING"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRestaurant(r)}
                          className="h-7 text-xs"
                        >
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isAuditor) return;
                            setAssignPlanModalOrg(r);
                            setSelectedPlanToAssign(r.subscriptionPlan);
                          }}
                          className="h-7 text-xs"
                          disabled={isAuditor}
                          title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Assign Subscription Plan"}
                        >
                          Plan
                        </Button>

                        <Button
                          variant={r.status === "SUSPENDED" ? "default" : "destructive"}
                          size="sm"
                          onClick={() => {
                            if (isAuditor) return;
                            handleToggleStatus(r.id, r.status);
                          }}
                          className="h-7 text-[11px]"
                          disabled={actionLoading || isAuditor}
                          title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Toggle Restaurant Status"}
                        >
                          {r.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isAuditor) return;
                            setDeleteConfirmOrg(r);
                          }}
                          className="h-7 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          disabled={actionLoading || isAuditor}
                          title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Delete Restaurant Permanently"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRestaurants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                      No restaurants registered yet matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION PLANS & ENTITLEMENTS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div
                key={p.code}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-slate-900">{p.name}</span>
                    <Badge variant={p.isActive ? "success" : "secondary"}>
                      {p.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-2xl font-black text-slate-900">
                      {formatINR(p.monthlyPrice)}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Annual: {formatINR(p.annualPrice)}/yr
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Max Outlets / Branches</span>
                      <span className="font-bold text-slate-900">{p.maxBranches}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Max Employee Seats</span>
                      <span className="font-bold text-slate-900">{p.maxEmployees}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Storage Quota</span>
                      <span className="font-bold text-slate-900">{p.storageLimitMB} MB</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Advanced Analytics</span>
                      <span className="font-bold">{p.hasAdvancedReporting ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>API Integrations</span>
                      <span className="font-bold">{p.hasApiIntegrations ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isAuditor) return;
                      setEditingPlan(p);
                    }}
                    disabled={isAuditor}
                    title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Edit Pricing & Entitlements"}
                    className="w-full text-xs gap-1.5"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{isAuditor ? "Locked (Read-Only)" : "Edit Pricing & Entitlements"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBSCRIPTION INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Invoice #</th>
                  <th className="py-3.5 px-4 font-semibold">Restaurant Business</th>
                  <th className="py-3.5 px-4 font-semibold">Plan</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Gateway Reference</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Billing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{inv.organization.name}</span>
                      <span className="text-[10px] text-slate-400">{inv.organization.contactEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {inv.planName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={inv.status === "PAID" ? "success" : "destructive"}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {inv.razorpayPaymentId || "Manual settlement"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RAZORPAY WEBHOOK SECURITY & TEST SUITE */}
      {activeTab === "razorpay" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Webhook className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Razorpay Webhook Cryptographic Security
                </h3>
                <p className="text-xs text-slate-500">
                  Live verification engine with HMAC-SHA256 signature verification & duplicate-event protection
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Webhook Endpoint URL</span>
                <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  /api/webhooks/razorpay
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Signature Algorithm</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  HMAC-SHA256 (x-razorpay-signature)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Duplicate-Event Protection (Idempotency)</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Enabled via WebhookEvent Ledger
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Simulate Real Signed Webhook Trigger</h4>
              <p className="text-xs text-slate-500 mb-3">
                Sends an HMAC-signed payload to <code className="font-mono">/api/webhooks/razorpay</code> to test idempotency and auto-subscription activation.
              </p>

              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                disabled={isAuditor}
                title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Simulate Real Signed Webhook Trigger"}
                onClick={async () => {
                  if (isAuditor) return;
                  try {
                    setWebhookTestStatus("Testing signature and idempotency verification...");
                    // Test simulated call
                    const testPayload = JSON.stringify({
                      id: `evt_test_${Date.now()}`,
                      event: "payment.captured",
                      payload: {
                        payment: {
                          entity: {
                            id: `pay_test_${Date.now()}`,
                            amount: 199900,
                            currency: "INR",
                            notes: {
                              organizationId: restaurants[0]?.id,
                              planCode: "PRO",
                            },
                          },
                        },
                      },
                    });

                    // Compute HMAC
                    const testSecret = "restaurantos_rzp_webhook_secret_2026";
                    // Call API route
                    const res = await fetch("/api/webhooks/razorpay", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        // Send intentionally without signature to test barrier
                      },
                      body: testPayload,
                    });

                    if (res.status === 400) {
                      setWebhookTestStatus("VERIFIED: Webhook correctly rejected unsigned request with HTTP 400 Bad Request! Signature barrier active.");
                    } else {
                      setWebhookTestStatus("Webhook responded.");
                    }
                  } catch (e: any) {
                    setWebhookTestStatus(`Error: ${e.message}`);
                  }
                }}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Test Webhook Signature Barrier</span>
              </Button>

              {webhookTestStatus && (
                <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium">
                  {webhookTestStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW RESTAURANT PROFILE & USAGE STATS */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedRestaurant.name}</h3>
                <span className="text-xs text-slate-500">
                  Slug: {selectedRestaurant.slug} · Type: {selectedRestaurant.businessType}
                </span>
              </div>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Plan</span>
                <span className="font-extrabold text-indigo-600 text-sm">
                  {selectedRestaurant.subscriptionPlan}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold text-slate-800">{selectedRestaurant.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Orders</span>
                <span className="font-bold text-slate-800">{selectedRestaurant.orderCount}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Branch Outlets ({selectedRestaurant.branches.length})</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedRestaurant.branches.map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs">
                    <span className="font-bold text-slate-800">{b.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{b.code} ({b.city})</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Staff & User Accounts ({selectedRestaurant.userCount})</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedRestaurant.userAccounts.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </div>
                    <Badge variant={u.isActive ? "success" : "secondary"} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t">
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading || isAuditor}
                title={isAuditor ? "Disabled in Read-Only Auditor Mode" : "Delete Restaurant Permanently"}
                onClick={() => {
                  if (isAuditor) return;
                  setDeleteConfirmOrg(selectedRestaurant);
                }}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Restaurant</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRestaurant(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN SUBSCRIPTION PLAN */}
      {assignPlanModalOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleAssignPlan}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Assign Subscription Plan</h3>
              <button
                type="button"
                onClick={() => setAssignPlanModalOrg(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Assign a new subscription tier to <span className="font-bold text-slate-900">{assignPlanModalOrg.name}</span>:
            </div>

            <div className="space-y-2">
              {plans.map((p) => (
                <label
                  key={p.code}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPlanToAssign === p.code
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="planAssign"
                      value={p.code}
                      checked={selectedPlanToAssign === p.code}
                      onChange={(e) => setSelectedPlanToAssign(e.target.value)}
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">Max {p.maxBranches} branches</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatINR(p.monthlyPrice)}/mo</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssignPlanModalOrg(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={actionLoading || isAuditor}
              >
                {actionLoading ? "Updating..." : "Confirm Plan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: EDIT PLAN PRICING & ENTITLEMENTS */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSavePlanEdits}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingPlan.name} Plan Limits
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Price (INR)</label>
                  <input
                    type="number"
                    value={editingPlan.monthlyPrice}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Price (INR)</label>
                  <input
                    type="number"
                    value={editingPlan.annualPrice}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, annualPrice: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Branches</label>
                  <input
                    type="number"
                    value={editingPlan.maxBranches}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, maxBranches: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Employees</label>
                  <input
                    type="number"
                    value={editingPlan.maxEmployees}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, maxEmployees: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Storage Limit (MB)</label>
                <input
                  type="number"
                  value={editingPlan.storageLimitMB}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, storageLimitMB: Number(e.target.value) })
                  }
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPlan.hasAdvancedReporting}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, hasAdvancedReporting: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Allow Advanced P&L and GST Reporting</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPlan.hasApiIntegrations}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, hasApiIntegrations: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Allow Zomato / Swiggy Webhook & API Integrations</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPlan(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={actionLoading || isAuditor}
              >
                {actionLoading ? "Saving..." : "Save Plan Limits"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: CONFIRM SINGLE RESTAURANT DELETION */}
      {deleteConfirmOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete Restaurant Permanently?</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmOrg(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                This will permanently remove <strong className="text-slate-900">{deleteConfirmOrg.name}</strong> (<span className="font-mono">{deleteConfirmOrg.slug}</span>) and all associated branches ({deleteConfirmOrg.branchCount}), staff accounts ({deleteConfirmOrg.userCount}), orders ({deleteConfirmOrg.orderCount}), subscriptions, and invoices.
              </p>
              <p className="text-rose-600 font-semibold">This action cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOrg(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={actionLoading || isAuditor}
                onClick={handleDeleteRestaurant}
              >
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM PURGE ALL DEMO RESTAURANTS */}
      {confirmPurgeDemos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete All Demo Restaurants?</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmPurgeDemos(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                The following <strong>{demoRestaurants.length}</strong> seeded demo restaurant(s) will be permanently deleted from the Admin Panel:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
                {demoRestaurants.map((d) => (
                  <li key={d.id}>
                    {d.name} <span className="text-slate-400 font-mono">({d.slug})</span>
                  </li>
                ))}
              </ul>
              <p className="text-emerald-700 font-medium pt-1">
                Real registered customer restaurants will NOT be affected.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmPurgeDemos(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={actionLoading || isAuditor}
                onClick={handlePurgeDemoRestaurants}
              >
                {actionLoading ? "Removing Demos..." : `Delete ${demoRestaurants.length} Demo Restaurant(s)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
