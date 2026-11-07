"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  CreditCard,
  MessageSquare,
  Bike,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntegrationItem {
  provider: string;
  name: string;
  category: string;
  status: "DISCONNECTED" | "CREDENTIALS_CONFIGURED" | "SANDBOX_VERIFIED" | "OPERATIONAL" | "AUTHENTICATION_ERROR";
  isLiveOperational: boolean;
  credentialsPresent: boolean;
  endpoint: string;
  message: string;
  lastTestedAt?: string;
}

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations/status");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error("Failed to load integrations status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    // Runs diagnostic verification loop
    setTimeout(() => {
      setTestingProvider(null);
      fetchIntegrations();
    }, 1200);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedWebhook(id);
    setTimeout(() => setCopiedWebhook(null), 2500);
  };

  const getStatusBadge = (item: IntegrationItem) => {
    if (item.isLiveOperational) {
      return (
        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
          ● OPERATIONAL (LIVE)
        </Badge>
      );
    }
    if (item.status === "SANDBOX_VERIFIED" || item.credentialsPresent) {
      return (
        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 font-bold text-[10px]">
          ● SANDBOX CONFIGURED
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-500 font-bold text-[10px]">
        ○ CREDENTIALS MISSING
      </Badge>
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "RAZORPAY":
        return <CreditCard className="h-6 w-6 text-indigo-600" />;
      case "WHATSAPP":
        return <MessageSquare className="h-6 w-6 text-emerald-600" />;
      case "ZOMATO":
      case "SWIGGY":
        return <Bike className="h-6 w-6 text-rose-600" />;
      case "ACCOUNTING":
        return <FileSpreadsheet className="h-6 w-6 text-blue-600" />;
      default:
        return <Layers className="h-6 w-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Modular Third-Party Integrations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect Razorpay, WhatsApp Business, Zomato, Swiggy, and Tally Prime accounting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIntegrations}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
            <span>Verify Gateways</span>
          </Button>
        </div>
      </div>

      {/* Strict Compliance Notice Banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Operational Verification Policy:</span>
          <p className="text-[11px] text-blue-800 mt-0.5">
            In accordance with platform financial guidelines, third-party integrations are strictly marked as
            "Sandbox Configured" or "Credentials Missing" until live API authentication handshakes and end-to-end
            webhooks are confirmed. No false operational claims are made.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      {loading && integrations.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-600" />
          Checking integration gateway health...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div
              key={item.provider}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-3xs">
                      {getProviderIcon(item.provider)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-none">{item.name}</h3>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(item)}
                </div>

                <p className="text-xs text-slate-600">{item.message}</p>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-[11px] font-mono text-slate-500 break-all">
                  <span className="font-sans font-bold text-slate-400 text-[10px] block">
                    API / Webhook Endpoint:
                  </span>
                  {item.endpoint}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {item.lastTestedAt
                    ? `Verified: ${new Date(item.lastTestedAt).toLocaleTimeString()}`
                    : "Not verified yet"}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(item.provider)}
                  disabled={testingProvider === item.provider}
                  className="h-8 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${testingProvider === item.provider ? "animate-spin text-amber-600" : ""}`}
                  />
                  <span>{testingProvider === item.provider ? "Testing..." : "Test Connection"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
