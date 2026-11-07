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
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
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
    fetchSubscriptionInfo();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active Subscription</Badge>;
      case "TRIALING":
        return <Badge variant="warning">Free Trial</Badge>;
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
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Subscription & Plan Entitlements
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your restaurant software tier, active billing cycle, and resource quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Platform Super Admin</span>
          </Link>
        </div>
      </div>

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
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  RestaurantOS {subData?.planName}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Billed at {formatINR(subData?.monthlyPrice || 0)}/month · {subData?.organizationName}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Next Renewal Date
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
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Payment Gateway
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Razorpay Auto-Pay
                  </span>
                </div>
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
                    key={p.code}
                    className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all relative ${
                      isCurrent
                        ? "border-2 border-indigo-600 bg-indigo-50/20 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Active Tier
                      </span>
                    )}

                    <div>
                      <span className="font-black text-lg text-slate-900 block">{p.name}</span>
                      <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-2xl font-black text-slate-900">
                          {formatINR(price)}
                          <span className="text-xs font-normal text-slate-400">/mo</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {billingCycle === "ANNUAL" ? `Billed ${formatINR(p.annualPrice)}/yr` : "Billed monthly"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Max {p.maxBranches} Outlets / Branches</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Max {p.maxEmployees} Staff Accounts</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{p.storageLimitMB} MB Cloud Storage</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Touch POS & KDS Real-Time Sync</span>
                        </div>
                        {p.hasAdvancedReporting && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Advanced P&L & GSTR-1 Analytics</span>
                          </div>
                        )}
                        {p.hasApiIntegrations && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Swiggy / Zomato Integrations</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {isCurrent ? (
                        <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                          Current Subscription
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setUpgradeModalPlan(p)}
                          className="w-full bg-slate-900 text-white text-xs gap-1.5"
                        >
                          <span>Switch to {p.name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoices & Payment History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Subscription Invoices & Receipts</h3>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past subscription invoices found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Invoice Number</th>
                      <th className="py-2.5 px-3">Billing Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatINR(inv.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={inv.status === "PAID" ? "success" : "destructive"}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {inv.paymentMethod} {inv.razorpayPaymentId ? `(${inv.razorpayPaymentId})` : ""}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px]"
                            onClick={() => alert(`Downloading Invoice ${inv.invoiceNumber}...`)}
                          >
                            PDF Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      {upgradeModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Upgrade to {upgradeModalPlan.name} Plan
              </h3>
              <button
                onClick={() => setUpgradeModalPlan(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              You are about to switch your subscription to the <span className="font-bold text-slate-900">{upgradeModalPlan.name}</span> tier ({formatINR(upgradeModalPlan.monthlyPrice)}/month).
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between text-slate-700">
                <span>Branch Outlets:</span>
                <span className="font-bold text-slate-900">Up to {upgradeModalPlan.maxBranches}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Staff Accounts:</span>
                <span className="font-bold text-slate-900">Up to {upgradeModalPlan.maxEmployees}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Cloud Storage:</span>
                <span className="font-bold text-slate-900">{upgradeModalPlan.storageLimitMB} MB</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Payment is securely settled via Razorpay Auto-Debit. An official tax invoice will be generated upon confirmation.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpgradeModalPlan(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  alert(`Razorpay Checkout initialized for ${upgradeModalPlan.name} (₹${upgradeModalPlan.monthlyPrice}). Complete checkout to activate.`);
                  setUpgradeModalPlan(null);
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
