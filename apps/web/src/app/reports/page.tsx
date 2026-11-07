"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  FileDown,
  Calendar,
  Printer,
  ShieldCheck,
  TrendingUp,
  Percent,
  CreditCard,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  PieChart,
  RefreshCw,
  Table as TableIcon,
  Filter,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"SALES" | "GST" | "PNL" | "AUDITS">("SALES");
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/analytics?timeRange=${timeRange}&branch=${selectedBranch}`);
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedBranch]);

  const handleExport = (type: string) => {
    window.open(`/api/reports/export?type=${type}&branch=${selectedBranch}`, "_blank");
  };

  const metrics = analyticsData?.metrics || {};
  const pnl = analyticsData?.pnlReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Advanced Analytics, P&L & GST Filing
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready GSTR-1 tax registers, multi-period P&L statement, sales rankings and CSV/Excel exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="gap-1.5 text-xs border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("daily-sales")}
            className="gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <FileDown className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Sales CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport("gst-register")}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export GSTR-1 Register</span>
          </Button>
        </div>
      </div>

      {/* Global Filters: Time Range & Branch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Period:</span>
          <div className="flex items-center gap-1">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "1y", label: "Full Year" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setTimeRange(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  timeRange === p.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Outlet Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="All">All Outlets (Consolidated)</option>
            <option value="IND">Indiranagar Flagship (IND)</option>
            <option value="KOR">Koramangala Kitchen & Bar (KOR)</option>
            <option value="HSR">HSR Cloud Kitchen (HSR)</option>
          </select>
        </div>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net Invoiced Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{formatINR(metrics.netSales || 0)}</div>
          <div className="mt-1 text-[11px] text-slate-500">{metrics.totalOrders || 0} orders settled</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>GST Collected (5%)</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-600">{formatINR(metrics.totalTaxes || 0)}</div>
          <div className="mt-1 text-[11px] text-slate-500">CGST + SGST (SAC 996331)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Food Cost COGS</span>
            <PieChart className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{metrics.foodCostPercent || 30.5}%</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Optimal target: 28% – 32%</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net Operating Profit</span>
            <Percent className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">
            {formatINR(metrics.netOperatingProfit || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Net Margin: <span className="font-bold text-emerald-700">{metrics.netMarginPercent || 0}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("SALES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "SALES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Sales & Item Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab("GST")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "GST"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Statutory GSTR-1 Register</span>
        </button>

        <button
          onClick={() => setActiveTab("PNL")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "PNL"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Profit & Loss Statement (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDITS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "AUDITS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Audits, Voids & Refunds</span>
        </button>
      </div>

      {/* TAB 1: SALES & ITEM RANKINGS */}
      {activeTab === "SALES" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Selling Dishes Table */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Top-Selling Dishes by Revenue</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("item-sales")}
                className="h-7 text-xs gap-1"
              >
                <FileDown className="h-3 w-3" />
                <span>Export Dishes CSV</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3 text-right">Qty Sold</th>
                    <th className="py-2.5 px-3 text-right">Gross Sales</th>
                    <th className="py-2.5 px-3 text-right">Avg Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyticsData?.topSellingDishes?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No sales recorded in selected timeframe.
                      </td>
                    </tr>
                  ) : (
                    analyticsData?.topSellingDishes?.map((item: any) => (
                      <tr key={item.name} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(item.revenue)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatINR(item.quantity > 0 ? item.revenue / item.quantity : 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Payment Methods Mix</h3>
            <div className="space-y-3 pt-1">
              {analyticsData?.paymentMethods?.map((pm: any) => (
                <div key={pm.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{pm.method}</span>
                    <span className="font-bold text-slate-900">{formatINR(pm.amount)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (pm.amount / (metrics.netSales || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY GST REPORT */}
      {activeTab === "GST" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Taxable Value</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatINR(metrics.totalTaxable || 0)}</div>
              <span className="text-[10px] text-slate-400">SAC 996331 Composite</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">CGST Collected (2.5%)</span>
              <div className="text-xl font-bold text-blue-600 mt-1">{formatINR(metrics.cgstCollected || 0)}</div>
              <span className="text-[10px] text-slate-400">Central GST</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">SGST Collected (2.5%)</span>
              <div className="text-xl font-bold text-blue-600 mt-1">{formatINR(metrics.sgstCollected || 0)}</div>
              <span className="text-[10px] text-slate-400">State GST (Karnataka 29)</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total GST Filing Liability</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{formatINR(metrics.totalTaxes || 0)}</div>
              <span className="text-[10px] text-slate-400">CGST + SGST (GSTR-1)</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">GSTR-1 Tax Register Summary</h3>
                <span className="text-[11px] text-slate-500">Sequential invoices with Indian GSTIN & SAC code tracking</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleExport("gst-register")}
                className="gap-1.5 text-xs bg-slate-900 text-white"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Download GSTR-1 CSV</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIT AND LOSS STATEMENT */}
      {activeTab === "PNL" && pnl && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Profit & Loss Statement (P&L)</h2>
              <span className="text-xs text-slate-500">
                Period: {pnl.period.start} → {pnl.period.end} | Branch: {selectedBranch}
              </span>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
              Net Profit Margin: {pnl.netProfitMarginPercent}%
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section 1: Revenue */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span>1. Operating Revenue</span>
                <span>{formatINR(pnl.revenue.netSales)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Sales Billing:</span>
                  <span className="font-mono">{formatINR(pnl.revenue.grossSales)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Discounts Given (Item + Bill):</span>
                  <span className="font-mono">-{formatINR(pnl.revenue.discountsGiven)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-1">
                  <span>Net Sales Revenue:</span>
                  <span className="font-mono">{formatINR(pnl.revenue.netSales)}</span>
                </div>
              </div>
            </div>

            {/* Section 2: COGS */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="text-rose-600">-{formatINR(pnl.costOfGoodsSold.totalCOGS)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Raw Ingredient Depletion (Recipe BOM):</span>
                  <span className="font-mono">{formatINR(pnl.costOfGoodsSold.ingredientConsumption)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kitchen Wastage & Spoilage Write-Off:</span>
                  <span className="font-mono">{formatINR(pnl.costOfGoodsSold.wastageAndLosses)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-1">
                  <span>Gross Profit (Net Sales - COGS):</span>
                  <span className="font-mono text-emerald-600">{formatINR(pnl.grossProfit)}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Operating Expenses */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span>3. Operating Expenses</span>
                <span className="text-rose-600">-{formatINR(pnl.operatingExpenses.totalOperatingExpenses)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Kitchen Commercial LPG Refills:</span>
                  <span className="font-mono">{formatINR(pnl.operatingExpenses.kitchenLPG)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity & Utility Bills:</span>
                  <span className="font-mono">{formatINR(pnl.operatingExpenses.utilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Premise Property Lease / Rent:</span>
                  <span className="font-mono">{formatINR(pnl.operatingExpenses.rentAndProperty)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food Packaging & Tamper-proof Boxes:</span>
                  <span className="font-mono">{formatINR(pnl.operatingExpenses.packaging)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment Servicing & Maintenance:</span>
                  <span className="font-mono">{formatINR(pnl.operatingExpenses.maintenance)}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Labor */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span>4. Labor & Workforce Costs</span>
                <span className="text-rose-600">-{formatINR(pnl.laborCosts.totalLaborCost)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Staff Salaries (Attendance Pro-rated):</span>
                  <span className="font-mono">{formatINR(pnl.laborCosts.staffSalaries)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Pay (1.5x Hourly Rate):</span>
                  <span className="font-mono">{formatINR(pnl.laborCosts.overtimePay)}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Net Profit */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-bold text-sm text-slate-900">
              <div>
                <span>NET OPERATING PROFIT:</span>
                <span className="text-xs text-slate-500 font-normal block">
                  Net Sales minus COGS, Operating Expenses and Payroll
                </span>
              </div>
              <span className="text-base text-emerald-700 font-bold font-mono">
                {formatINR(pnl.netOperatingProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITS, VOIDS & REFUNDS */}
      {activeTab === "AUDITS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Cancelled / Voided Orders ({metrics.cancelledOrdersCount || 0})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Orders voided after KOT dispatch require mandatory supervisor PIN authorization and audit logging.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
              <span>Customer Refunds Issued: {formatINR(metrics.totalRefunds || 0)}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Processed with manager authorization and payment tender reconciliation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
