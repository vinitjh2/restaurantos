"use client";

import { useState } from "react";
import {
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Search,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unifiedPrinter } from "@/lib/hardware/unified-printer";

export default function MobilePOSPage() {
  const [cart, setCart] = useState([
    { id: "1", name: "Murgh Dum Biryani", price: 350, quantity: 2 },
    { id: "2", name: "Butter Garlic Naan", price: 65, quantity: 3 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = Math.round(subtotal + tax);

  const handleSettleAndPrint = async () => {
    setIsProcessing(true);
    try {
      const invoiceNumber = `IND/2026-27/${Date.now().toString().slice(-5)}`;
      const receiptData = {
        restaurantName: "Bawarchi Royale",
        branchName: "Indiranagar Flagship",
        address: "100 Feet Rd, Indiranagar, Bengaluru",
        phone: "+91 80 4123 4567",
        gstin: "29AABCU9603R1ZM",
        invoiceNumber,
        orderNumber: `ORD-IND-${Date.now().toString().slice(-4)}`,
        orderType: "DINE_IN",
        tableNumber: "T-03",
        date: new Date().toLocaleString("en-IN"),
        items: cart.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          total: i.price * i.quantity,
        })),
        subtotal,
        discount: 0,
        taxableAmount: subtotal,
        cgst: tax / 2,
        sgst: tax / 2,
        grandTotal,
        paymentMethod,
      };

      // Dispatch to unified cross-platform printer driver
      await unifiedPrinter.printReceipt(receiptData);
      setSuccessReceipt(invoiceNumber);
      setCart([]);
    } catch (e: any) {
      alert("Billing error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4 pb-24 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">Handheld POS</h1>
          <p className="text-[11px] text-slate-500">Android & Mobile Register</p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          Table T-03
        </Badge>
      </header>

      {successReceipt ? (
        <div className="my-auto text-center space-y-4 py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 animate-bounce" />
          <h2 className="text-lg font-bold text-slate-900">Payment Succeeded!</h2>
          <p className="text-xs text-slate-500">
            Invoice <span className="font-mono font-bold text-slate-800">{successReceipt}</span>{" "}
            issued & dispatched to 58mm/80mm thermal printer.
          </p>
          <Button
            onClick={() => setSuccessReceipt(null)}
            className="w-full max-w-xs mx-auto rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
          >
            New Order
          </Button>
        </div>
      ) : (
        <div className="flex-1 space-y-4 mt-3">
          {/* Order Summary Lines */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-600">Active Order Lines</span>
              <span className="text-xs text-slate-400">{cart.length} items</span>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <div className="text-[11px] text-slate-400">
                    {item.quantity} × {formatINR(item.price)}
                  </div>
                </div>
                <div className="font-extrabold text-slate-900">
                  {formatINR(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (5%):</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                <span>Payable:</span>
                <span className="text-amber-700">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Payment Tender</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("UPI")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === "UPI"
                    ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <QrCode className="h-5 w-5 mb-1 text-amber-600" />
                UPI QR
              </button>

              <button
                onClick={() => setPaymentMethod("CASH")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === "CASH"
                    ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <Banknote className="h-5 w-5 mb-1 text-emerald-600" />
                Cash
              </button>

              <button
                onClick={() => setPaymentMethod("CARD")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === "CARD"
                    ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <CreditCard className="h-5 w-5 mb-1 text-indigo-600" />
                Card
              </button>
            </div>
          </div>

          {/* Settle & Print Button */}
          <Button
            onClick={handleSettleAndPrint}
            disabled={isProcessing || cart.length === 0}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold shadow-md"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing & Printing..." : `Settle & Print (${formatINR(grandTotal)})`}
          </Button>
        </div>
      )}
    </div>
  );
}
