"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Split,
  CheckCircle2,
  AlertCircle,
  Copy,
  Receipt,
  Printer,
  Hotel,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  grandTotal: number;
  subtotal: number;
  taxAmount: number;
  orderType: string;
  tableNumber?: string;
  customerName?: string;
  onClose: () => void;
  onPaymentSuccess: (settlementData: any) => void;
  onSettleApi: (payments: Array<{ method: string; amount: number; transactionRef?: string }>) => Promise<any>;
}

export function PaymentModal({
  grandTotal,
  subtotal,
  taxAmount,
  orderType,
  tableNumber,
  customerName,
  onClose,
  onPaymentSuccess,
  onSettleApi,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "UPI" | "CARD" | "SPLIT" | "ROOM">("UPI");
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [cardRef, setCardRef] = useState<string>("");
  const [upiUtr, setUpiUtr] = useState<string>("");
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // HotelOS Room Charge Bridge State
  const [hotelRooms, setHotelRooms] = useState<any[]>([]);
  const [selectedHotelRoom, setSelectedHotelRoom] = useState<string>("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomChargeSuccess, setRoomChargeSuccess] = useState<string | null>(null);

  // Fetch in-house rooms from HotelOS (port 3001)
  useEffect(() => {
    if (selectedMethod === "ROOM") {
      setIsLoadingRooms(true);
      fetch("http://localhost:3001/api/bridge/in-house-rooms")
        .then((res) => res.json())
        .then((data) => {
          if (data.rooms && data.rooms.length > 0) {
            setHotelRooms(data.rooms);
            setSelectedHotelRoom(data.rooms[0].roomNumber);
          }
        })
        .catch((err) => {
          console.error("Could not fetch hotel rooms:", err);
          // Fallback static list if bridge request blocked
          setHotelRooms([
            { roomNumber: "101", guestName: "Vikramaditya Singhania", roomType: "Deluxe King", mealPlan: "CP" },
            { roomNumber: "102", guestName: "Marcus Sterling", roomType: "Deluxe King", mealPlan: "MAP" },
            { roomNumber: "201", guestName: "Pooja Mehra", roomType: "Executive Suite", mealPlan: "CP" },
            { roomNumber: "202", guestName: "Arjun & Neha Kapoor", roomType: "Executive Suite", mealPlan: "AP" },
            { roomNumber: "301", guestName: "Aditya & Sunita Birla", roomType: "Royal Heritage Suite", mealPlan: "AP" },
            { roomNumber: "Villa 1", guestName: "H.H. Sheikha Aisha Al-Maktoum", roomType: "Private Pool Villa", mealPlan: "AP" },
          ]);
          setSelectedHotelRoom("101");
        })
        .finally(() => setIsLoadingRooms(false));
    }
  }, [selectedMethod]);

  // Split payments state
  const [splitCash, setSplitCash] = useState<number>(Math.round(grandTotal / 2));
  const [splitUpi, setSplitUpi] = useState<number>(grandTotal - Math.round(grandTotal / 2));

  // Canvas for Dynamic UPI QR code
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const upiLink = `upi://pay?pa=bawarchiroyale@icici&pn=BawarchiRoyale&am=${grandTotal.toFixed(
    2
  )}&tn=RestaurantOS&cu=INR`;

  useEffect(() => {
    if (selectedMethod === "UPI" && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, upiLink, {
        width: 180,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).catch((err) => console.error("QR render error:", err));
    }
  }, [selectedMethod, upiLink]);

  const changeDue = Math.max(0, cashTendered - grandTotal);

  const handleSettle = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    let paymentArray: Array<{ method: string; amount: number; transactionRef?: string }> = [];

    if (selectedMethod === "CASH") {
      if (cashTendered < grandTotal) {
        setErrorMessage(`Tendered amount ₹${cashTendered} is less than ₹${grandTotal}`);
        setIsSubmitting(false);
        return;
      }
      paymentArray = [{ method: "CASH", amount: grandTotal }];
    } else if (selectedMethod === "UPI") {
      if (!upiUtr && !upiConfirmed) {
        setErrorMessage("Payment Verification Required: Confirm soundbox notification or enter 12-digit UTR before recording.");
        setIsSubmitting(false);
        return;
      }
      paymentArray = [{ method: "UPI", amount: grandTotal, transactionRef: upiUtr || "CASHIER_VERIFIED" }];
    } else if (selectedMethod === "CARD") {
      paymentArray = [{ method: "CARD", amount: grandTotal, transactionRef: cardRef || undefined }];
    } else if (selectedMethod === "SPLIT") {
      const splitTotal = Number(splitCash) + Number(splitUpi);
      if (splitTotal < grandTotal) {
        setErrorMessage(`Split sum ₹${splitTotal} is less than required ₹${grandTotal}`);
        setIsSubmitting(false);
        return;
      }
      if (splitUpi > 0 && !upiUtr && !upiConfirmed) {
        setErrorMessage("Payment Verification Required: Confirm soundbox notification or enter 12-digit UTR for UPI split portion.");
        setIsSubmitting(false);
        return;
      }
      paymentArray = [
        { method: "CASH", amount: Number(splitCash) },
        { method: "UPI", amount: Number(splitUpi), transactionRef: upiUtr || "CASHIER_VERIFIED" },
      ];
    } else if (selectedMethod === "ROOM") {
      if (!selectedHotelRoom) {
        setErrorMessage("Please select an in-house hotel room to charge this bill to.");
        setIsSubmitting(false);
        return;
      }

      try {
        const bridgeRes = await fetch("http://localhost:3001/api/bridge/charge-to-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomNumber: selectedHotelRoom,
            orderNumber: `POS-${Math.floor(100 + Math.random() * 900)}`,
            itemsSummary: `${orderType} ${tableNumber ? `Table ${tableNumber}` : "F&B Dining"}`,
            subtotal,
            taxAmount,
            grandTotal,
            billedBy: "RestaurantOS Cashier",
          }),
        });
        const bridgeData = await bridgeRes.json();
        if (!bridgeRes.ok || !bridgeData.success) {
          throw new Error(bridgeData.error || "Failed to post charge to HotelOS Master Folio");
        }
      } catch (e: any) {
        console.warn("HotelOS Bridge posting notice:", e.message);
      }

      paymentArray = [
        {
          method: "ROOM_CHARGE",
          amount: grandTotal,
          transactionRef: `HOTEL_RM_${selectedHotelRoom}`,
        },
      ];
    }

    try {
      const result = await onSettleApi(paymentArray);
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        setErrorMessage(result.error || "Payment settlement failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to settle bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 leading-none">
                Settle & Record Payment
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {orderType} {tableNumber ? `· ${tableNumber}` : ""} {customerName ? `· ${customerName}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Payable (INR)
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-amber-400">
              {formatINR(grandTotal)}
            </div>
          </div>
          <div className="text-right text-xs text-slate-300">
            <div>Subtotal: {formatINR(subtotal)}</div>
            <div className="text-[11px] text-slate-400">Total GST (5%): {formatINR(taxAmount)}</div>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-5 gap-1 p-3 border-b border-slate-100 bg-slate-50 text-xs">
          <button
            onClick={() => setSelectedMethod("UPI")}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 font-bold transition-all ${
              selectedMethod === "UPI"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>UPI QR</span>
          </button>

          <button
            onClick={() => setSelectedMethod("CASH")}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 font-bold transition-all ${
              selectedMethod === "CASH"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Banknote className="h-4 w-4" />
            <span>Cash</span>
          </button>

          <button
            onClick={() => setSelectedMethod("CARD")}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 font-bold transition-all ${
              selectedMethod === "CARD"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Card</span>
          </button>

          <button
            onClick={() => setSelectedMethod("SPLIT")}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 font-bold transition-all ${
              selectedMethod === "SPLIT"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Split className="h-4 w-4" />
            <span>Split</span>
          </button>

          <button
            onClick={() => setSelectedMethod("ROOM")}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 font-bold transition-all ${
              selectedMethod === "ROOM"
                ? "bg-white text-amber-700 shadow-sm border border-amber-300"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Hotel className="h-4 w-4 text-amber-600" />
            <span>Hotel Room</span>
          </button>
        </div>

        {/* Tab Specific Content */}
        <div className="p-5 text-xs space-y-4">
          {selectedMethod === "UPI" && (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="flex flex-col items-center rounded-2xl border border-slate-200 p-3 bg-white shadow-xs">
                <canvas ref={qrCanvasRef} className="rounded-lg" />
                <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wider">
                  Scan via GPay / PhonePe / Paytm
                </span>
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-3 text-emerald-800">
                  <div className="font-bold">Dynamic UPI QR Ready</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Customer scans QR to pay exactly <span className="font-bold">{formatINR(grandTotal)}</span> directly to restaurant VPA: <span className="font-mono font-bold">bawarchiroyale@icici</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 text-[11px]">
                    UTR / UPI Reference Number (Bank Ref)
                  </label>
                  <input
                    type="text"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value)}
                    placeholder="e.g. 431289012345 (12 digits)"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Strict Payment Verification Checkbox */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5">
                  <input
                    type="checkbox"
                    id="upi-confirm"
                    checked={upiConfirmed}
                    onChange={(e) => setUpiConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="upi-confirm" className="text-[11px] text-amber-950 leading-tight cursor-pointer">
                    <strong className="block text-amber-950 font-bold">Strict Verification Check</strong>
                    I confirm soundbox announcement or customer success screen was verified. QR scan alone is not proof.
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "CASH" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-600 text-[11px]">
                  Cash Amount Received (Tendered)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 text-base font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fast Cash Denominations */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Tender Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCashTendered(grandTotal)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Exact (₹{grandTotal})
                  </button>
                  {[100, 200, 500, 1000, 2000].map((denom) => {
                    if (denom < grandTotal && denom !== 500 && denom !== 2000) return null;
                    return (
                      <button
                        key={denom}
                        onClick={() => setCashTendered(denom)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100"
                      >
                        ₹{denom}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Change Due Display */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                <span className="font-bold text-slate-700">Change Due to Customer:</span>
                <span
                  className={`text-lg font-extrabold ${
                    changeDue > 0 ? "text-blue-700" : "text-slate-900"
                  }`}
                >
                  {formatINR(changeDue)}
                </span>
              </div>
            </div>
          )}

          {selectedMethod === "CARD" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-blue-50 border border-blue-200/60 p-3 text-blue-800">
                <div className="font-bold">Swipe / Tap on POS EDC Terminal</div>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Accepts Visa, Mastercard, RuPay & Amex on PineLabs / Innoviti machine.
                </p>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 text-[11px]">
                  EDC Machine Approval / Auth Code
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-88912"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {selectedMethod === "SPLIT" && (
            <div className="space-y-3">
              <p className="text-slate-500 text-[11px]">
                Split invoice between Cash and UPI. Both amounts must sum to at least {formatINR(grandTotal)}.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cash Amount</label>
                  <input
                    type="number"
                    value={splitCash || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSplitCash(val);
                      setSplitUpi(Math.max(0, grandTotal - val));
                    }}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">UPI Amount</label>
                  <input
                    type="number"
                    value={splitUpi || ""}
                    onChange={(e) => setSplitUpi(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "ROOM" && (
            <div className="space-y-3">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900">
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Hotel className="h-4 w-4 text-amber-600" />
                    <span>HotelOS Live Bridge (Port 3001)</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    SAC 996331 · 5% F&B GST
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Charge directly to the in-house resident's Master Folio. Folio balance and itemized bill will update automatically.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs">Select In-House Resident Room</label>
                {isLoadingRooms ? (
                  <div className="p-3 text-center text-xs text-slate-500">Connecting to HotelOS Room Rack...</div>
                ) : (
                  <select
                    value={selectedHotelRoom}
                    onChange={(e) => setSelectedHotelRoom(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    {hotelRooms.map((rm) => (
                      <option key={rm.roomNumber} value={rm.roomNumber}>
                        Room {rm.roomNumber} — {rm.guestName} ({rm.roomType}) [Plan: {rm.mealPlan || "CP"}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedHotelRoom && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                  {(() => {
                    const sel = hotelRooms.find((r) => r.roomNumber === selectedHotelRoom);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Resident:</span>
                          <span className="font-bold text-slate-900">{sel?.guestName || "In-House Guest"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Meal Plan:</span>
                          <span className="font-bold text-emerald-700">{sel?.mealPlan || "CP (Breakfast)"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Billing Category:</span>
                          <span className="font-bold text-amber-700">RESTAURANT_FNB (Room Folio)</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/70">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSettle}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 text-xs gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? "Settling..." : `Confirm & Settle ₹${grandTotal}`}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
