"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Zap,
  Building2,
  Users,
  HardDrive,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  Smartphone,
  Send,
  Info,
  X,
  Lock,
  ArrowRight,
  Clock
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SutraMandateSetupModal } from "@/components/subscription/SutraMandateSetupModal";

interface UsageMetric {
  used: number;
  limit: number;
  percent: number;
}

interface SubscriptionData {
  organizationName: string;
  planCode: string;
  planName: string;
  monthlyPrice: number;
  annualPrice: number;
  status: string;
  billingCycle: string;
  renewalDate: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  mandateStatus: string;
  mandateMethod: string;
  mandateUpiId: string | null;
  mandateBank: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  accessValidUntil: string;
  isAccessActive: boolean;
  allowedModules: string[];
  hasAdvancedReporting: boolean;
  hasApiIntegrations: boolean;
  hasCustomDomain: boolean;
  usage: {
    branches: UsageMetric;
    employees: UsageMetric;
    storageMB: UsageMetric;
  };
}

interface PlanOption {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxBranches: number;
  maxEmployees: number;
  storageLimitMB: number;
  hasAdvancedReporting: boolean;
  hasApiIntegrations: boolean;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  date: string;
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<PlanOption | null>(null);

  // Mandate & Alert states
  const [isMandateModalOpen, setIsMandateModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Pre-debit alert test state
  const [testAlertLoading, setTestAlertLoading] = useState(false);
  const [testAlertResult, setTestAlertResult] = useState<any | null>(null);

  async function fetchSubscriptionInfo() {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/subscription");
      const json = await res.json();
      if (json.success) {
        setSubData(json.subscription);
        setPlans(json.availablePlans || []);
        setInvoices(json.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load subscription details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  // Handle Cancel Mandate
  const handleConfirmCancelMandate = async () => {
    try {
      setCancelLoading(true);
      const res = await fetch("/api/subscription/mandate/cancel", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccessMsg(data.message);
        setIsCancelConfirmOpen(false);
        await fetchSubscriptionInfo();
      } else {
        alert(data.error || "Failed to cancel mandate");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling mandate");
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle Test Pre-Debit Alert
  const handleTriggerTestPreDebitAlert = async () => {
    try {
      setTestAlertLoading(true);
      const res = await fetch("/api/subscription/mandate/test-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setTestAlertResult(data.alertSummary);
      } else {
        alert(data.error || "Failed to send test alert");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending test alert");
    } finally {
      setTestAlertLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active Subscription</Badge>;
      case "TRIALING":
        return <Badge variant="warning">14-Day Free Trial</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/50 flex items-center justify-center overflow-hidden p-0.5 shadow-xs shrink-0">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                DineSutra Subscription & Mandate Entitlements
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              14-Day Free Trial, UPI Autopay e-Mandate, period-end access retention, and automated pre-debit notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerTestPreDebitAlert}
            disabled={testAlertLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
            title="Dispatch a test 24h pre-debit notification"
          >
            {testAlertLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-rose-600" />}
            <span>Test Pre-Debit SMS</span>
          </button>

          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Platform Admin</span>
          </Link>
        </div>
      </div>

      {/* CANCELLATION PERIOD-END GUARANTEE BANNER */}
      {subData?.cancelAtPeriodEnd && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-amber-950">
                  Recurring Mandate Cancelled — Period-End Access Active
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  Protected
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Per our period-end policy, your restaurant retains <strong>100% full operational access until {new Date(subData.accessValidUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>. No auto-debit will take place.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMandateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shrink-0 transition-colors shadow-xs"
          >
            Re-Activate Mandate
          </button>
        </div>
      )}

      {/* SUCCESS CANCEL MESSAGE BANNER */}
      {cancelSuccessMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cancelSuccessMsg}</span>
          </div>
          <button onClick={() => setCancelSuccessMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading subscription entitlements...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Plan Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Plan
                  </span>
                  {subData?.status && getStatusBadge(subData.status)}
                  {subData?.isTrialActive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{subData.trialDaysRemaining} Days Free Remaining</span>
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  DineSutra {subData?.planName}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Plan Rate: {formatINR(subData?.monthlyPrice || 0)}/month · {subData?.organizationName}
                </div>
              </div>

              {/* Mandate & Renewal Schedule */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {subData?.isTrialActive ? "First Recurring Auto-Debit (End of Trial)" : "Next Scheduled Auto-Debit"}
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {subData?.renewalDate
                      ? new Date(subData.renewalDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Lifetime / On-demand"}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Mandate Status & Method
                  </span>
                  <span className="font-bold flex items-center gap-1 mt-0.5">
                    {subData?.cancelAtPeriodEnd ? (
                      <span className="text-amber-700 flex items-center gap-1 font-extrabold">
                        <Clock className="h-3.5 w-3.5" />
                        Cancelled (Valid till {subData.renewalDate ? new Date(subData.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "end"})
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {subData?.mandateMethod === "CARD" ? "Card e-Mandate" : "UPI Autopay Active"}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {subData?.mandateUpiId || subData?.mandateBank || "owner@okhdfcbank"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mandate Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Penny-Drop Verification: <strong className="text-slate-800">₹1.00 Refunded to Source</strong>. Next billing occurs only on scheduled date.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!subData?.cancelAtPeriodEnd ? (
                  <button
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                  >
                    Cancel Mandate
                  </button>
                ) : (
                  <button
                    onClick={() => setIsMandateModalOpen(true)}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Enroll New Mandate
                  </button>
                )}
              </div>
            </div>

            {/* Usage Quotas */}
            <div className="pt-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Plan Resource Quotas & Active Usage
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Branches Quota */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      Branch Outlets
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {subData?.usage.branches.used} / {subData?.usage.branches.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (subData?.usage.branches.percent || 0) > 85 ? "bg-rose-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${subData?.usage.branches.percent || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    {subData?.usage.branches.percent}% utilized
                  </span>
                </div>

                {/* Staff Seats Quota */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Staff Accounts
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {subData?.usage.employees.used} / {subData?.usage.employees.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${subData?.usage.employees.percent || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    {subData?.usage.employees.percent}% utilized
                  </span>
                </div>

                {/* Cloud Storage Quota */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <HardDrive className="h-4 w-4 text-amber-600" />
                      Storage Quota
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {subData?.usage.storageMB.used} MB / {subData?.usage.storageMB.limit} MB
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${subData?.usage.storageMB.percent || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    {subData?.usage.storageMB.percent}% utilized
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade & Tier Comparison */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Available Subscription Plans</h2>
                <p className="text-xs text-slate-500">
                  Select a plan that matches your restaurant footprint and operational scale
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`rounded-md px-3 py-1 transition-all ${
                    billingCycle === "MONTHLY"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("ANNUAL")}
                  className={`rounded-md px-3 py-1 transition-all flex items-center gap-1 ${
                    billingCycle === "ANNUAL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>Annual</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 rounded-sm">
                    2 Months Free
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p) => {
                const isCurrent = subData?.planCode === p.code;
                const price = billingCycle === "ANNUAL" ? p.annualPrice / 12 : p.monthlyPrice;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      isCurrent
                        ? "border-rose-600 bg-rose-50/20 shadow-sm ring-1 ring-rose-500"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                      <div className="my-4">
                        <span className="text-2xl font-black text-slate-900">{formatINR(price)}</span>
                        <span className="text-xs text-slate-400 font-medium">/mo</span>
                      </div>

                      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Up to {p.maxBranches} Branch Outlets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Up to {p.maxEmployees} Staff Accounts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{p.storageLimitMB} MB Cloud Storage</span>
                        </div>
                        {p.hasAdvancedReporting && (
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>AI CCTV Vision & Heatmaps</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                        >
                          Enrolled
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUpgradeModalPlan(p);
                            setIsMandateModalOpen(true);
                          }}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                        >
                          Switch Plan ➔
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MANDATE CANCEL MODAL */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Cancel Recurring Mandate?</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Under our period-end policy, your subscription will <strong>remain 100% active until {subData?.renewalDate ? new Date(subData.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "the end of the period"}</strong>.
                </p>
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div>• No auto-debit will occur at the end of the cycle.</div>
                  <div>• Your tables, KDS, POS, and sales data stay intact.</div>
                  <div>• You can reactivate anytime before or after expiry.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Keep Mandate
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelMandate}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {cancelLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancel Mandate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST PRE-DEBIT ALERT RESULT MODAL */}
      {testAlertResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-sm text-slate-900">Pre-Debit Alert Dispatched</span>
              </div>
              <button
                onClick={() => setTestAlertResult(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Dispatched To:</span>
                <span className="font-bold text-slate-900">{testAlertResult.recipient}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Channel:</span>
                <span className="font-bold text-emerald-800">{testAlertResult.channel} (Official RBI 24h Notice)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Debit Date:</span>
                <span className="font-bold text-slate-900">
                  {new Date(testAlertResult.scheduledDebitDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Delivered SMS / WhatsApp Message Body
              </span>
              <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800">
                {testAlertResult.messageContent}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setTestAlertResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUTRA MANDATE SETUP MODAL */}
      <SutraMandateSetupModal
        isOpen={isMandateModalOpen}
        onClose={() => setIsMandateModalOpen(false)}
        planName={upgradeModalPlan?.name || subData?.planName}
        monthlyPrice={upgradeModalPlan?.monthlyPrice || subData?.monthlyPrice}
        onSuccess={async (data) => {
          setIsMandateModalOpen(false);
          await fetchSubscriptionInfo();
          alert("14-Day Free Trial & Mandate successfully enrolled!");
        }}
      />
    </div>
  );
}
