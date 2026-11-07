"use client";

import { useState } from "react";
import { ShieldCheck, X, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupervisorModalProps {
  title: string;
  description: string;
  actionType: "CANCEL_ORDER" | "DISCOUNT" | "REFUND";
  onClose: () => void;
  onSuccess: (data: { pin: string; reason: string; discountPercent?: number; refundAmount?: number }) => void;
}

export function SupervisorPinModal({
  title,
  description,
  actionType,
  onClose,
  onSuccess,
}: SupervisorModalProps) {
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit supervisor PIN");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the audit trail");
      return;
    }

    onSuccess({
      pin,
      reason: reason.trim(),
      discountPercent: actionType === "DISCOUNT" ? discountPercent : undefined,
      refundAmount: actionType === "REFUND" ? refundAmount : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm leading-none">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-slate-500">{description}</p>

          {/* Action-specific inputs */}
          {actionType === "DISCOUNT" && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Manager Discount Percentage (%)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`flex-1 rounded-lg border py-1.5 font-bold transition-all ${
                      discountPercent === pct
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-extrabold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {actionType === "REFUND" && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Refund Amount (₹ INR)</label>
              <input
                type="number"
                value={refundAmount || ""}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                placeholder="Enter refund amount"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Audit Justification / Reason *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Guest complaint, Corporate tie-up, Order error"
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* 4-Digit PIN Display */}
          <div className="flex flex-col items-center space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Supervisor Security PIN (Default: 1234)
            </span>
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 font-mono text-lg font-bold ${
                    pin[idx]
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {pin[idx] ? "•" : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === "C") setPin("");
                  else if (btn === "⌫") handleBackspace();
                  else handleDigit(btn);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-center text-sm font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                {btn}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 font-semibold text-[11px]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Authorize Action
          </Button>
        </div>
      </div>
    </div>
  );
}
