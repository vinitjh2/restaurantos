"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  CreditCard,
  Building2,
  RefreshCw,
  Sparkles,
  X,
  AlertCircle,
  Check,
  Info
} from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface SutraMandateSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (mandateData: any) => void;
  planCode?: string;
  planName?: string;
  monthlyPrice?: number;
}

export const SutraMandateSetupModal: React.FC<SutraMandateSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  planCode = "GROWTH",
  planName = "Growth Plan",
  monthlyPrice = 1499,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"UPI_AUTOPAY" | "CARD" | "NETBANKING">("UPI_AUTOPAY");
  const [upiId, setUpiId] = useState("owner@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 4210");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthorizeMandate = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);

      // Step 1: Penny drop
      setProcessStep("Initiating ₹1 Penny Drop Verification...");
      await new Promise((r) => setTimeout(r, 900));

      // Step 2: Instant Refund
      setProcessStep("₹1 Authenticated & Instant Refund Dispatched...");
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Register Mandate
      setProcessStep("Registering Recurring Mandate for Day 14...");
      const res = await fetch("/api/subscription/mandate/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          paymentMethod: selectedMethod,
          upiId: selectedMethod === "UPI_AUTOPAY" ? upiId : undefined,
          cardNumber: selectedMethod === "CARD" ? cardNumber : undefined,
          bankName: selectedMethod === "NETBANKING" ? bankName : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Mandate registration failed");
      }

      setProcessStep("Mandate Active! Unlocking 14-Day Free Trial...");
      await new Promise((r) => setTimeout(r, 700));

      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to setup mandate");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 my-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Banner: 14 Days Free */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>14 Days Completely Free Trial</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Enroll Payment & Start Free Trial
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Authorize a <strong>refundable ₹1 verification</strong> to setup your recurring mandate. No monthly fees are charged during your 14-day trial.
          </p>
        </div>

        {/* 14-Day Free Guarantee Strip */}
        <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-sm font-bold">
            🛡️
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900 block">Our Zero-Risk Guarantee:</span>
            ₹1 is temporarily charged and <strong>instantly refunded</strong>. If you cancel anytime within the 14 days, you will never be charged a single rupee.
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
            Select Mandate Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod("UPI_AUTOPAY")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedMethod === "UPI_AUTOPAY"
                  ? "border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-1 ring-rose-500"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Smartphone className={`w-5 h-5 ${selectedMethod === "UPI_AUTOPAY" ? "text-rose-600" : "text-slate-400"}`} />
              <span className="text-xs font-bold">UPI Autopay</span>
              <span className="text-[9px] text-emerald-700 font-extrabold uppercase">Fastest</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("CARD")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedMethod === "CARD"
                  ? "border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-1 ring-rose-500"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <CreditCard className={`w-5 h-5 ${selectedMethod === "CARD" ? "text-rose-600" : "text-slate-400"}`} />
              <span className="text-xs font-bold">Card Mandate</span>
              <span className="text-[9px] text-slate-500 font-medium">Visa / MC / RuPay</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("NETBANKING")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedMethod === "NETBANKING"
                  ? "border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-1 ring-rose-500"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Building2 className={`w-5 h-5 ${selectedMethod === "NETBANKING" ? "text-rose-600" : "text-slate-400"}`} />
              <span className="text-xs font-bold">e-NACH Bank</span>
              <span className="text-[9px] text-slate-500 font-medium">Top 40 Banks</span>
            </button>
          </div>

          {/* Method Input Fields */}
          <div className="pt-2">
            {selectedMethod === "UPI_AUTOPAY" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okaxis or name@paytm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "CARD" && (
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "NETBANKING" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Due Today (Penny Drop Verification):</span>
            <span className="font-bold text-slate-900">₹1.00 <span className="text-[10px] text-emerald-700 font-bold">(Instantly Refunded)</span></span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>14-Day Free Trial Window:</span>
            <span className="font-bold text-emerald-600">₹0.00 for next 14 days</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>First Recurring Auto-Debit (Day 14):</span>
            <span className="font-bold text-slate-900">{formatINR(monthlyPrice)}/month</span>
          </div>
        </div>

        {/* Pre-debit Alert Promise */}
        <div className="mt-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center gap-2 text-[11px] text-indigo-950 font-medium">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>We send an automated SMS & WhatsApp reminder 24h prior to any renewal. Cancel anytime in 1 click.</span>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleAuthorizeMandate}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-75 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{processStep || "Authenticating Mandate..."}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Authorize ₹1 (Refundable) & Start 14-Day Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
