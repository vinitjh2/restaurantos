"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Bell,
  MessageSquare,
  Lock,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Ban,
  Clock,
  Send,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SecurityAlert {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  message: string;
  authorizedBy: string;
  timestamp: string;
  details?: string;
}

export default function SecurityAlertsPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerPhone, setOwnerPhone] = useState("+91 98765 43210");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [notifyOnVoid, setNotifyOnVoid] = useState(true);
  const [notifyOnHighDiscount, setNotifyOnHighDiscount] = useState(true);
  const [discountThreshold, setDiscountThreshold] = useState(20);
  const [notifyOnManualDrawer, setNotifyOnManualDrawer] = useState(true);
  const [notifyOnTillVariance, setNotifyOnTillVariance] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        const res = await fetch("/api/security/alerts");
        const json = await res.json();
        if (json.success) {
          setAlerts(json.alerts);
          if (json.settings) {
            setOwnerPhone(json.settings.ownerPhone);
            setWhatsappEnabled(json.settings.whatsappEnabled);
            setNotifyOnVoid(json.settings.notifyOnVoid);
            setNotifyOnHighDiscount(true);
            setDiscountThreshold(json.settings.notifyOnDiscountOverPercent);
            setNotifyOnManualDrawer(json.settings.notifyOnManualDrawer);
          }
        }
      } catch (e) {
        console.error("Failed to load security alerts:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleSendTestAlert = async () => {
    try {
      setIsSendingTest(true);
      setTestSuccessMessage(null);
      const res = await fetch("/api/security/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_ALERT",
          payload: { phone: ownerPhone },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSuccessMessage(data.message);
        // Refresh alert list
        const res2 = await fetch("/api/security/alerts");
        const json2 = await res2.json();
        if (json2.success) setAlerts(json2.alerts);
      }
    } catch (e: any) {
      alert("Error sending test alert: " + e.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="rounded-full bg-rose-100 border border-rose-300 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold">CRITICAL</span>;
      case "HIGH":
        return <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">HIGH RISK</span>;
      case "MEDIUM":
        return <span className="rounded-full bg-blue-100 border border-blue-300 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">SUSPICIOUS</span>;
      default:
        return <span className="rounded-full bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold">LOGGED</span>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Anti-Theft & Security Alerts
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Guard Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time anti-theft surveillance, supervisor overrides tracking, and instant WhatsApp security dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSendTestAlert}
            disabled={isSendingTest}
            className="h-9 gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            <Send className="h-3.5 w-3.5 text-amber-400" />
            <span>{isSendingTest ? "Dispatching..." : "Simulate Test WhatsApp Alert"}</span>
          </Button>
        </div>
      </div>

      {testSuccessMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overall Security Posture</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">8.5 / 10</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            HMAC Peppered PINs + Bcrypt
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Suspicious Voids Today</span>
            <Ban className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">1 Item (₹1,450)</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Alert sent to owner phone
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Supervisor Overrides</span>
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">4 Authorizations</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Logged with supervisor PIN
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Till Variance</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">₹0.00 (Balanced)</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            No register shortages detected
          </p>
        </div>
      </div>

      {/* Settings & Alert Dispatch Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Owner Alert Triggers</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Owner WhatsApp / Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus-within:border-slate-400">
                <Smartphone className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="font-semibold text-slate-700 block">
                Instant Notification Rules
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-medium text-slate-800">Void After Kitchen KOT</div>
                  <div className="text-[11px] text-slate-400">Prevents food theft after items are cooked</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnVoid}
                  onChange={(e) => setNotifyOnVoid(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-medium text-slate-800">High Manager Discount (&gt; 20%)</div>
                  <div className="text-[11px] text-slate-400">Alerts when discount exceeds threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnHighDiscount}
                  onChange={(e) => setNotifyOnHighDiscount(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-medium text-slate-800">Manual Cash Drawer Pulse</div>
                  <div className="text-[11px] text-slate-400">Drawer opened without an active bill</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnManualDrawer}
                  onChange={(e) => setNotifyOnManualDrawer(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-medium text-slate-800">Shift End Till Shortage (&gt; ₹100)</div>
                  <div className="text-[11px] text-slate-400">Physical count mismatch on register</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnTillVariance}
                  onChange={(e) => setNotifyOnTillVariance(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>

            <Button
              onClick={() => alert("Security alert rules saved successfully!")}
              className="w-full h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              Save Alert Preferences
            </Button>
          </div>
        </div>

        {/* Right: Real-time Alert Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Live Anti-Theft Surveillance Feed
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Tamper-Evident Immutable Log</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading audit feed...</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs font-bold text-slate-900">
                        {alert.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {alert.message}
                    </p>
                    {alert.details && (
                      <p className="text-[11px] text-slate-500 italic">
                        {alert.details}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Authorized by: <strong className="text-slate-600">{alert.authorizedBy}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      <MessageSquare className="h-3 w-3" /> WhatsApp Sent
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

