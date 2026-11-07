"use client";

import { Printer, X, ChefHat, Check } from "lucide-react";
import { formatIndianDate, formatTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

interface KOTModalProps {
  kot: {
    kotNumber: string;
    orderType: string;
    tableNumber?: string;
    createdAt?: string;
    items: Array<{
      itemName: string;
      variantName?: string;
      quantity: number;
      cookingNotes?: string;
    }>;
  };
  onClose: () => void;
}

export function KOTTicketModal({ kot, onClose }: KOTModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-xs flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-3 bg-amber-50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <ChefHat className="h-4 w-4 text-amber-600" />
            <span>KOT Sent to Kitchen</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="h-7 text-xs bg-slate-900 text-white gap-1">
              <Printer className="h-3 w-3" />
              <span>Print KOT</span>
            </Button>
            <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KOT 80mm Print Layout */}
        <div className="p-4 font-mono text-[11px] leading-tight text-slate-900 bg-white space-y-3">
          <div className="text-center border-b-2 border-black pb-2">
            <div className="text-lg font-black">{kot.kotNumber}</div>
            <div className="text-sm font-bold mt-0.5">
              {kot.tableNumber ? `TABLE: ${kot.tableNumber}` : kot.orderType}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Time: {formatIndianDate()} {formatTime()}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b-2 border-black pb-3">
            <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-300 pb-1">
              <span>Qty</span>
              <span>Item & Specification</span>
            </div>

            {kot.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 pt-1">
                <span className="w-6 text-center font-black text-sm bg-slate-100 rounded">
                  {item.quantity}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-xs">{item.itemName}</span>
                  {item.variantName && (
                    <span className="text-[10px] text-slate-600 block">
                      [{item.variantName}]
                    </span>
                  )}
                  {item.cookingNotes && (
                    <span className="text-[10px] font-bold text-rose-600 block">
                      * NOTE: {item.cookingNotes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-1">
            Station: Main Kitchen / Tandoor
          </div>
        </div>
      </div>
    </div>
  );
}
