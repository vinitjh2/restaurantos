'use client';

import React, { useEffect, useState } from 'react';
import { cfdBridge, type CFDMessage } from '@/lib/hardware/customer-display';
import { IndianRupee, Utensils, CheckCircle2 } from 'lucide-react';

export default function CustomerFacingDisplayPage() {
  const [data, setData] = useState<CFDMessage>({
    type: 'IDLE',
  });

  useEffect(() => {
    const unsubscribe = cfdBridge.subscribe((msg) => {
      setData(msg);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-8 font-sans">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">RESTAURANT<span className="text-orange-500">OS</span></h1>
            <p className="text-sm text-slate-400">Welcome to our dining experience</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">CUSTOMER DISPLAY</div>
          <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2 justify-end">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Register Connected
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-8">
        {data.type === 'IDLE' ? (
          <div className="col-span-12 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
              <Utensils className="w-12 h-12 text-slate-600 animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-200 mb-2">Welcome!</h2>
            <p className="text-lg text-slate-400 max-w-md">Your order items will appear here as the cashier enters them.</p>
          </div>
        ) : data.type === 'ORDER_COMPLETED' ? (
          <div className="col-span-12 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center mb-6 text-emerald-400">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Payment Received!</h2>
            <p className="text-xl text-emerald-300 mb-6 font-semibold">Thank you for dining with us</p>
            {data.changeDue !== undefined && data.changeDue > 0 && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
                <span className="text-sm text-slate-400 uppercase tracking-wider">Change Due Back</span>
                <div className="text-4xl font-black text-emerald-400 mt-1">₹{data.changeDue.toFixed(2)}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Left: Itemized Bill */}
            <div className="col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
                  Current Order Items ({data.items?.length || 0})
                </h3>
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                  {data.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 font-bold text-sm flex items-center justify-center border border-orange-500/30">
                          {item.quantity}x
                        </span>
                        <span className="text-lg font-semibold text-slate-100">{item.name}</span>
                      </div>
                      <span className="text-lg font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotals */}
              <div className="border-t border-slate-800 pt-4 mt-4 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{(data.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Taxes (5.0%)</span>
                  <span className="text-white font-medium">₹{(data.taxAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right: Payment & UPI QR Code */}
            <div className="col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">TOTAL AMOUNT DUE</span>
                <div className="text-5xl font-black text-white mt-2 flex items-center justify-center gap-1">
                  <IndianRupee className="w-9 h-9 text-orange-500" />
                  <span>{(data.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Dynamic UPI QR Code display */}
              {data.upiQrDataUrl ? (
                <div className="my-6 p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
                  <img src={data.upiQrDataUrl} alt="UPI QR Code" className="w-48 h-48 rounded-lg" />
                  <span className="text-xs font-bold text-slate-800 mt-2 uppercase tracking-wider">Scan with any UPI App</span>
                  <span className="text-[10px] text-slate-500">Google Pay • PhonePe • Paytm • BHIM</span>
                </div>
              ) : (
                <div className="my-8 text-center text-slate-500">
                  <p className="text-sm">Scan QR or Pay at Counter</p>
                </div>
              )}

              <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400">
                Please verify your items before completing payment.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/80 pt-4 flex justify-between text-xs text-slate-500">
        <span>Powered by RestaurantOS Terminal Engine</span>
        <span>GST Compliant Billing</span>
      </div>
    </div>
  );
}
