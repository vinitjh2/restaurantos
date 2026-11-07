"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Printer, X, CheckCircle2, Download, Terminal, DollarSign } from "lucide-react";
import { formatINR, formatIndianDate, formatTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { buildReceipt80mm, buildReceipt58mm, getCashDrawerPulse } from "@/lib/hardware/escpos-printer";

interface ThermalReceiptModalProps {
  receiptData: {
    invoiceNumber: string;
    branch: {
      name: string;
      address: string;
      city: string;
      phone: string;
      gstin: string;
      fssaiNumber: string;
    };
    orderType: string;
    tableNumber?: string;
    customerName?: string;
    customerPhone?: string;
    customerGstin?: string;
    calculation: any;
    payments: Array<{ method: string; amount: number; transactionRef?: string }>;
    settledAt?: string;
  };
  onClose: () => void;
}

export function ThermalReceiptModal({ receiptData, onClose }: ThermalReceiptModalProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      const upiUrl = `upi://pay?pa=bawarchiroyale@icici&pn=BawarchiRoyale&am=${receiptData.calculation.grandTotal}&tn=${receiptData.invoiceNumber}&cu=INR`;
      QRCode.toCanvas(qrCanvasRef.current, upiUrl, {
        width: 110,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      }).catch((err) => console.error(err));
    }
  }, [receiptData]);

  const [drawerKicked, setDrawerKicked] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleKickDrawer = () => {
    const pulseBytes = getCashDrawerPulse();
    setDrawerKicked(true);
    setTimeout(() => setDrawerKicked(false), 2500);
    console.log("Triggered ESC/POS RJ12 Cash Drawer Solenoid:", pulseBytes);
  };

  const handleCopyRawEscPos = () => {
    const rawCmds = buildReceipt80mm({
      restaurantName: branch.name,
      branchName: `${branch.address}, ${branch.city}`,
      address: branch.address,
      phone: branch.phone,
      gstin: branch.gstin,
      fssai: branch.fssaiNumber,
      invoiceNumber: receiptData.invoiceNumber,
      orderNumber: receiptData.invoiceNumber,
      orderType: receiptData.orderType,
      tableNumber: receiptData.tableNumber,
      date: formatIndianDate(receiptData.settledAt || new Date()),
      customerName: receiptData.customerName,
      customerPhone: receiptData.customerPhone,
      customerGstin: receiptData.customerGstin,
      items: (calculation.items || []).map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.subtotal,
      })),
      subtotal: calculation.subtotal,
      discount: calculation.billDiscount || 0,
      taxableAmount: calculation.taxableAmount,
      cgst: calculation.cgstAmount,
      sgst: calculation.sgstAmount,
      grandTotal: calculation.grandTotal,
      roundOff: calculation.roundOff,
      paymentMethod: receiptData.payments?.[0]?.method || "CASH",
    });

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(rawCmds).then(() => {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      }).catch(() => {});
    }
  };

  const { branch, calculation } = receiptData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Tax Invoice Generated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleKickDrawer}
              className={`h-7 px-2 text-[10px] font-bold border-slate-200 ${
                drawerKicked ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-700"
              }`}
              title="Pulse RJ12 electronic cash drawer solenoid"
            >
              <DollarSign className="h-3 w-3 mr-0.5" />
              {drawerKicked ? "Drawer Kicked!" : "Kick Till"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyRawEscPos}
              className="h-7 px-2 text-[10px] font-bold border-slate-200 bg-white text-slate-700"
              title="Copy 80mm ESC/POS byte sequence"
            >
              <Terminal className="h-3 w-3 mr-0.5" />
              {copiedRaw ? "Copied Raw!" : "ESC/POS"}
            </Button>
            <Button size="sm" onClick={handlePrint} className="h-7 gap-1 text-xs bg-slate-900 text-white">
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
            <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3-Inch Thermal Receipt Container (Styled to match physical 80mm thermal printers) */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-tight text-slate-800 bg-white border border-slate-100 m-2 rounded-lg shadow-inner">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="text-sm font-black uppercase tracking-wider">{branch.name}</div>
            <div className="text-[10px] text-slate-600">{branch.address}, {branch.city}</div>
            <div className="text-[10px] text-slate-600">Ph: {branch.phone}</div>
            <div className="font-bold text-[10px] mt-1">GSTIN: {branch.gstin}</div>
            <div className="text-[10px]">FSSAI Lic No: {branch.fssaiNumber}</div>
          </div>

          {/* Invoice Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between font-bold">
              <span>TAX INVOICE:</span>
              <span>{receiptData.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>Date & Time:</span>
              <span>{formatIndianDate()} {formatTime()}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>Type: {receiptData.orderType}</span>
              {receiptData.tableNumber && <span className="font-bold text-slate-900">{receiptData.tableNumber}</span>}
            </div>
            {receiptData.customerName && (
              <div className="text-[10px] text-slate-700 pt-0.5">
                Customer: <span className="font-bold">{receiptData.customerName}</span>
                {receiptData.customerGstin && <div>Recipient GSTIN: {receiptData.customerGstin}</div>}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-200 pb-1 mb-1">
              <span className="w-6/12">Item (SAC 996331)</span>
              <span className="w-2/12 text-center">Qty</span>
              <span className="w-2/12 text-right">Price</span>
              <span className="w-2/12 text-right">Amt</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {calculation.lineItems.map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between">
                    <span className="w-6/12 font-medium truncate">
                      {item.name} {item.variantName ? `(${item.variantName})` : ""}
                    </span>
                    <span className="w-2/12 text-center">{item.quantity}</span>
                    <span className="w-2/12 text-right">{item.unitPrice}</span>
                    <span className="w-2/12 text-right font-bold">{item.grossLineTotal}</span>
                  </div>
                  {item.modifierOptions?.map((mod: any, mIdx: number) => (
                    <div key={mIdx} className="text-[9px] text-slate-500 pl-2">
                      + {mod.name} ({mod.price})
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Tax Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span>{formatINR(calculation.subtotal)}</span>
            </div>

            {calculation.billDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Discount:</span>
                <span>-{formatINR(calculation.billDiscount)}</span>
              </div>
            )}

            {calculation.packagingCharge > 0 && (
              <div className="flex justify-between">
                <span>Packaging Charge:</span>
                <span>{formatINR(calculation.packagingCharge)}</span>
              </div>
            )}

            <div className="flex justify-between font-medium pt-1 border-t border-slate-100">
              <span>Taxable Value:</span>
              <span>{formatINR(calculation.taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST @ 2.5%:</span>
              <span>{formatINR(calculation.cgstAmount, true)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST @ 2.5%:</span>
              <span>{formatINR(calculation.sgstAmount, true)}</span>
            </div>

            {calculation.roundOff !== 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Round-off:</span>
                <span>{calculation.roundOff > 0 ? `+${calculation.roundOff}` : `${calculation.roundOff}`}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-black border-t border-slate-300 pt-1.5 text-slate-900">
              <span>NET PAYABLE:</span>
              <span>{formatINR(calculation.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Tender Details */}
          <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
            {receiptData.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between font-bold">
                <span>PAID VIA {p.method}:</span>
                <span>{formatINR(p.amount)}</span>
              </div>
            ))}
          </div>

          {/* Footer & QR */}
          <div className="text-center pt-3 space-y-2">
            <div className="flex justify-center">
              <canvas ref={qrCanvasRef} />
            </div>
            <div className="text-[9px] text-slate-500 uppercase">
              Thank you for dining with us!
            </div>
            <div className="text-[8px] text-slate-400">
              Powered by RestaurantOS · F&B Enterprise
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
