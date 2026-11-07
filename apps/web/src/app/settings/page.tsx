"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  ShieldCheck,
  Printer,
  Percent,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [branchId, setBranchId] = useState("");
  const [name, setName] = useState("Bawarchi Royale - Indiranagar Flagship");
  const [gstin, setGstin] = useState("29AABCU9603R1ZM");
  const [fssaiNumber, setFssaiNumber] = useState("11223334000189");
  const [address, setAddress] = useState("100 Feet Road, HAL 2nd Stage, Indiranagar");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("560038");
  const [phone, setPhone] = useState("+91 80 4123 4567");
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [receiptFooter, setReceiptFooter] = useState("Thank you for dining with us! Follow @bawarchiroyale");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.branch) {
          const b = data.branch;
          setBranchId(b.id);
          setName(b.name || "");
          setGstin(b.gstin || "");
          setFssaiNumber(b.fssaiNumber || "");
          setAddress(b.address || "");
          setCity(b.city || "");
          setState(b.state || "");
          setPincode(b.pincode || "");
          setPhone(b.phone || "");
          setCgstRate(b.cgstRate ?? 2.5);
          setSgstRate(b.sgstRate ?? 2.5);
          setIsTaxInclusive(Boolean(b.isTaxInclusive));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          name,
          address,
          city,
          state,
          pincode,
          phone,
          gstin,
          fssaiNumber,
          cgstRate: Number(cgstRate),
          sgstRate: Number(sgstRate),
          isTaxInclusive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "Branch statutory compliance & tax settings persisted to database successfully!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to save configuration",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-700" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Restaurant Configuration & Compliance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Indian statutory licenses, GSTIN, FSSAI, and thermal print formats
          </p>
        </div>
        <Button
          type="submit"
          size="sm"
          className="gap-1.5 text-xs bg-slate-900 text-white"
          disabled={saving || loading}
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </Button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-600" />
          Loading compliance settings from database...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statutory Compliance Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Indian Statutory Licenses</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Registered Branch / Entity Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">FSSAI License Number (14 Digits)</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Indian GSTIN (Goods & Service Tax)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-slate-900 focus:bg-white focus:outline-none uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-700">Official Registered Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">City & State</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Indian GST Tax Slabs */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">GST Rates & Pricing Structure</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">CGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">SGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isTaxInclusive}
                    onChange={(e) => setIsTaxInclusive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Prices are Tax Inclusive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Thermal Receipt Print Configuration */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Printer className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Thermal Receipt Print Customization (3-Inch ESC/POS)</h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Custom Receipt Footer Message</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
