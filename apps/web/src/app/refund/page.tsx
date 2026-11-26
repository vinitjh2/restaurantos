import React from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/compliance/PageHeader";
import { PageFooter } from "@/components/compliance/PageFooter";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy · DineSutra",
  description:
    "Official Refund, Return, and Subscription Cancellation terms for DineSutra Restaurant OS, operated by SutraUniverse Technologies, Kolkata.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PageHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Transparent &amp; Fair Billing</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Our 100% transparent commitment to restaurant owners. Zero hidden penalties, hassle-free online cancellations.
            </p>
          </div>

          {/* Refund Content Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1. 14-Day Risk-Free Trial Guarantee</span>
              </h2>
              <p>
                Every new restaurant merchant joining DineSutra receives a <strong>14-day fully featured free trial</strong>. You can test our touch POS, setup Table QR codes, run kitchen display tickets, and evaluate the AI CCTV radar on your floor.
              </p>
              <p>
                If at any point during these 14 days you decide DineSutra is not the right fit for your restaurant, you can cancel your subscription inside the portal with a single click under <strong>Settings → Subscription → Cancel Plan</strong>. No questions asked, and no subscription fee will be charged to your card or UPI mandate.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>2. ₹1 Test Mandate Auto-Refund</span>
              </h2>
              <p>
                When setting up an automated recurring payment instrument via RBI e-mandate, an authentication charge of ₹1 is debited to ensure security and bank route verification.
              </p>
              <p>
                This ₹1 token fee is <strong>automatically reversed and refunded</strong> to your original bank account within <strong>24 to 48 hours</strong> by our payment processing partner.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>3. Monthly &amp; Annual Subscription Cancellations</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Monthly Plans:</strong> You may cancel anytime before your next monthly billing cycle. Your account will remain fully operational until the end of the paid month, after which no further renewals will be debited.
                </li>
                <li>
                  <strong className="text-slate-200">Annual Plans:</strong> If you cancel an annual plan within 7 calendar days of your billing date, you are eligible for a full refund minus nominal payment gateway processing charges.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>4. Refund Processing Timeline</span>
              </h2>
              <p>
                Once an eligible refund is initiated by our finance desk:
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">UPI / Net Banking / Debit Card:</span>
                  <span className="font-bold text-white">3 to 5 Banking Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Credit Card:</span>
                  <span className="font-bold text-white">5 to 7 Working Days (or next statement)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">₹1 Verification Token Charge:</span>
                  <span className="font-bold text-emerald-400">24 to 48 Hours (Auto-reversed)</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs">
                All refunds are routed strictly back to the original source payment instrument as per Reserve Bank of India (RBI) directives.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>5. How to Request Billing Assistance</span>
              </h2>
              <p>
                If you encounter duplicate transactions, technical billing anomalies, or have questions regarding your invoices, contact our Kolkata billing team directly:
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs text-slate-300">
                <p><strong className="text-white">Billing Support:</strong> Vinit Kumar Jha — SutraUniverse (DineSutra)</p>
                <p><strong className="text-white">Email:</strong> support@sutrauniverse.com (Subject: Billing / Refund Request)</p>
                <p><strong className="text-white">Phone / WhatsApp:</strong> +91 6289450230</p>
                <p><strong className="text-white">Operating Hours:</strong> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
