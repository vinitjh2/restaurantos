import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — SutraUniverse",
  description:
    "Refund and cancellation policy for SutraUniverse SaaS applications including the 14-day free trial guarantee and ₹1 mandate refund.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PageHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Customer Fair Play Guarantee
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs text-slate-500 m-0">
              Clear, transparent, zero-surprise subscription policies • Effective Date: November 17, 2026
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 not-prose">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-xs font-bold text-emerald-950 mb-1">14-Day Free Trial</h3>
              <p className="text-[11px] text-emerald-800">
                Cancel anytime during the 14 days with 0 subscription charge.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <RotateCcw className="w-5 h-5 text-amber-600 mb-2" />
              <h3 className="text-xs font-bold text-amber-950 mb-1">₹1 Mandate Refund</h3>
              <p className="text-[11px] text-amber-800">
                The ₹1 test verification is automatically refunded within 24–48 hours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-2" />
              <h3 className="text-xs font-bold text-indigo-950 mb-1">1-Click Cancel</h3>
              <p className="text-[11px] text-indigo-800">
                No lengthy phone calls or retention hurdles. Cancel directly in-app.
              </p>
            </div>
          </div>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">1. 14-Day Free Evaluation Guarantee</h2>
              <p>
                Every new merchant subscribing to KioskSutra, DineSutra, or any SutraUniverse product receives an unconditional <strong>14-day free trial</strong> from the moment of account creation. 
              </p>
              <p>
                During this 14-day window, you can run live QR orders, print counter tokens, and test cook kitchen display systems. If you decide the software does not suit your business, you can cancel before Day 14 concludes, and <strong>your bank account will not be charged the monthly subscription fee</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">2. ₹1 Refundable Mandate Verification</h2>
              <p>
                To prevent fraud and authenticate genuine merchant bank accounts, our payment gateway processes a nominal <strong>₹1 verification debit</strong> when setting up the UPI Autopay e-mandate.
              </p>
              <p>
                This ₹1 fee is <strong>100% refundable</strong> and is reversed automatically by the banking gateway within <strong>24 to 48 hours</strong> back into your source UPI bank account.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">3. Monthly Recurring Cancellations</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cancel Anytime:</strong> You may cancel your subscription at any point through your Owner Dashboard or by writing to <code>support@sutrauniverse.com</code> from your registered email.</li>
                <li><strong>No Mid-Cycle Interruption:</strong> When you cancel an active paid subscription, your service remains fully operational until the end of your prepaid billing period. No further debits will occur after that date.</li>
                <li><strong>No Lock-in Contracts:</strong> We do not hold stall owners to mandatory annual contracts. All subscriptions run strictly month-to-month.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">4. Subscription Refund Eligibility</h2>
              <p>
                Because our software provides a full 14-day free evaluation prior to any billing, paid subscription charges are generally non-refundable once an active billing cycle has begun. However, we issue full refunds under the following exceptional circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Double / Erroneous Billing:</strong> In the rare event of duplicate debit transactions caused by payment gateway or banking network timeouts, the duplicate charge will be refunded immediately.</li>
                <li><strong>Unresolved Critical Outages:</strong> If our cloud infrastructure experiences verified server downtime exceeding 48 continuous hours during your billing cycle, a pro-rated or full month refund will be credited upon request.</li>
                <li><strong>Timely Cancellation Proof:</strong> If you requested cancellation prior to the renewal date but technical delays led to an auto-debit, we will reverse the charge in full.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">5. Refund Processing Timelines</h2>
              <p>
                Approved refunds are initiated within <strong>24 hours</strong> of review. In accordance with Reserve Bank of India (RBI) payment clearing guidelines, funds will reflect in your originating UPI bank account or card within <strong>3 to 5 business days</strong> depending on your issuing bank.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">6. How to Request a Refund or Cancel</h2>
              <p>
                To initiate a cancellation or request assistance regarding an unexpected charge, reach out directly to our support desk in Kolkata:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium space-y-1 mt-2">
                <p><strong>Email:</strong> support@sutrauniverse.com (Subject: &quot;Subscription Cancellation / Refund Request&quot;)</p>
                <p><strong>WhatsApp Support:</strong> +91 6289450230</p>
                <p><strong>Required Details:</strong> Registered phone number, Stall name, and Payment Transaction ID</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
