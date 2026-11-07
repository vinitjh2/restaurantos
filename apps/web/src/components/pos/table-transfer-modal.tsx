"use client";

import { useState } from "react";
import { ArrowRightLeft, X, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableTransferModalProps {
  currentTable: string;
  availableTables: Array<{ id: string; tableNumber: string; floor: string; capacity: number }>;
  onClose: () => void;
  onTransfer: (targetTable: string) => void;
}

export function TableTransferModal({
  currentTable,
  availableTables,
  onClose,
  onTransfer,
}: TableTransferModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm leading-none">
              Transfer Table: {currentTable}
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-slate-500">
            Relocate active order and open KOT items from <span className="font-bold text-slate-900">{currentTable}</span> to an available vacant table:
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {availableTables.map((t) => {
              const isSelected = selectedTarget === t.tableNumber;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTarget(t.tableNumber)}
                  className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-bold text-sm">{t.tableNumber}</span>
                  <span className="text-[10px] text-slate-400">
                    {t.floor} · {t.capacity} Seats
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedTarget}
            onClick={() => {
              if (selectedTarget) onTransfer(selectedTarget);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            Transfer to {selectedTarget || "..."}
          </Button>
        </div>
      </div>
    </div>
  );
}
