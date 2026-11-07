"use client";

import { Clock, Play, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeldOrdersModalProps {
  heldOrders: Array<{
    id: string;
    orderNumber: string;
    orderType: string;
    tableNumber?: string | null;
    customerName?: string | null;
    orderData: string;
    heldAt: string;
  }>;
  onClose: () => void;
  onResume: (order: any) => void;
  onDelete: (id: string) => void;
}

export function HeldOrdersModal({
  heldOrders,
  onClose,
  onResume,
  onDelete,
}: HeldOrdersModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[80vh] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm leading-none">
              Held Orders & Tabs ({heldOrders.length})
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3">
          {heldOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600">No held orders</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use "Hold Order" on active cart to store it</p>
            </div>
          ) : (
            heldOrders.map((ord) => {
              let parsedData: any = {};
              try {
                parsedData = JSON.parse(ord.orderData);
              } catch (e) {}

              return (
                <div key={ord.id} className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-[10px] text-slate-700">
                        {ord.tableNumber || ord.orderType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {parsedData?.items?.length || 0} line items
                      {ord.customerName ? ` · Customer: ${ord.customerName}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onResume(ord)}
                      className="h-7 gap-1 bg-slate-900 text-white font-bold text-xs"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Resume</span>
                    </Button>
                    <button
                      onClick={() => onDelete(ord.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Held Tab"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
