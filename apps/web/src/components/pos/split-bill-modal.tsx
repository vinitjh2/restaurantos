"use client";

import { useState } from "react";
import { Split, X, Users, Check } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

interface SplitBillModalProps {
  grandTotal: number;
  onClose: () => void;
  onConfirmSplit: (splitCount: number, perPersonAmount: number) => void;
}

export function SplitBillModal({ grandTotal, onClose, onConfirmSplit }: SplitBillModalProps) {
  const [guestCount, setGuestCount] = useState<number>(2);

  const perPerson = Math.ceil(grandTotal / guestCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <Split className="h-4 w-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm leading-none">
              Split Bill Equally
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white">
            <span className="text-[11px] text-slate-400">Total Invoice Amount:</span>
            <span className="text-xl font-bold text-amber-400">{formatINR(grandTotal)}</span>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700">Number of Guests / Payers</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setGuestCount(n)}
                  className={`rounded-xl border py-2 font-bold transition-all ${
                    guestCount === n
                      ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {n} Guests
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Each Guest Pays:</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatINR(perPerson)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {guestCount} payments of {formatINR(perPerson)} = {formatINR(perPerson * guestCount)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirmSplit(guestCount, perPerson)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
          >
            Apply Split & Open Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
