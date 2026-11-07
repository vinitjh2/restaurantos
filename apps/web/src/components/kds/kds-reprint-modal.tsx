"use client";

import { useState } from "react";
import { Printer, X, ShieldAlert, Check } from "lucide-react";
import { formatIndianDate, formatTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { KDSTicket } from "./kds-order-card";

interface KDSReprintModalProps {
  ticket: KDSTicket;
  onClose: () => void;
  onConfirmReprint: (reason: string) => void;
}

export function KDSReprintModal({ ticket, onClose, onConfirmReprint }: KDSReprintModalProps) {
  const [reason, setReason] = useState("Lost thermal slip / Station reprint request");

  const handlePrint = () => {
    onConfirmReprint(reason);
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm leading-none">
              Reprint Ticket: {ticket.kotNumber}
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Audit Justification for Reprint *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Printable Ticket Preview */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 font-mono text-[11px] leading-tight text-slate-800 bg-white space-y-2">
            <div className="text-center border-b border-slate-200 pb-1.5">
              <span className="font-black text-sm block">** REPRINT: {ticket.kotNumber} **</span>
              <span className="text-[10px] text-slate-500">
                {ticket.tableNumber ? `TABLE: ${ticket.tableNumber}` : ticket.orderType}
              </span>
            </div>

            <div className="space-y-1">
              {ticket.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-bold">{it.itemName} {it.variantName ? `(${it.variantName})` : ""}</span>
                  <span className="font-extrabold">x{it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-200">
              Reprinted: {formatIndianDate()} {formatTime()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Send to ESC/POS Printer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
