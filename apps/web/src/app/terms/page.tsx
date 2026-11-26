import React from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/compliance/PageHeader";
import { PageFooter } from "@/components/compliance/PageFooter";
import { ShieldCheck, FileText, Scale, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service · DineSutra",
  description:
    "Official Terms of Service and Merchant SaaS Agreement for DineSutra Restaurant Operating System, operated by SutraUniverse Technologies, Kolkata.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PageHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Merchant Master Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Effective Date: November 1, 2026 · Governing Entity: Vinit Kumar Jha — SutraUniverse (DineSutra), Kolkata, India.
            </p>
          </div>

          {/* Legal Content Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>1. Acceptance of Terms</span>
              </h2>
              <p>
                By creating an account, launching a restaurant tenant, or subscribing to <strong>DineSutra</strong> (accessible at dinesutra.sutrauniverse.com or authorized mobile/desktop clients), you enter into a legally binding contract with <strong>Vinit Kumar Jha</strong> operating under the trade name <strong>SutraUniverse (DineSutra)</strong> (&quot;SutraUniverse&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), headquartered in Kolkata, West Bengal, India.
              </p>
              <p>
                If you are registering on behalf of a restaurant, cafe, bar, hotel, or culinary enterprise, you represent and warrant that you hold full legal authority to bind that business entity to these Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Nature of Software &amp; 0% Commission Policy</span>
              </h2>
              <p>
                DineSutra operates strictly as a cloud-based Software-as-a-Service (SaaS) provider. We provide billing software, Kitchen Display Systems (KDS), Table QR ordering, and CCTV waiter alert vision technology.
              </p>
              <p>
                <strong>Zero Commission Guarantee:</strong> DineSutra is not a food aggregator. We do not intermediate guest transactions or levy percentage deductions (0% commission). All customer payments processed via UPI or direct payment gateways flow directly to your registered current account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>3. Subscription, 14-Day Free Trial &amp; ₹1 Verification Mandate</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">14-Day Full-Access Free Trial:</strong> All newly registered restaurant accounts receive 14 days of unrestricted access to all features (Captain POS, KDS, AI CCTV, Analytics) without charge.
                </li>
                <li>
                  <strong className="text-slate-200">₹1 Autopay Verification:</strong> During signup, an RBI-compliant e-mandate registration may charge a refundable token amount of ₹1 to verify your payment instrument. This ₹1 fee is automatically refunded back to your bank within 24 to 48 hours.
                </li>
                <li>
                  <strong className="text-slate-200">No Sneak Charges:</strong> You can cancel your subscription at any time within your 14-day trial period from the in-app subscription settings. No recurring subscription charges will be debited if cancelled prior to trial expiry.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>4. AI CCTV Floor Radar &amp; Privacy Compliance</span>
              </h2>
              <p>
                DineSutra includes optional computer vision modules designed to monitor table occupancy and detect seated guests who have waited longer than 5 minutes for service.
              </p>
              <p>
                You agree to use this feature exclusively within public dining room perimeters for service quality assurance. DineSutra never records biometric identity or facial recognition databases, in strict conformity with the Digital Personal Data Protection (DPDP) Act 2023. You agree to display appropriate signage notifying diners that security cameras are active on the premises.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>5. Tax Invoicing &amp; GST Compliance</span>
              </h2>
              <p>
                DineSutra provides automatic calculation of Goods and Services Tax (GST) compliant with SAC 996331 / 996332 (Restaurant Service). The restaurant merchant remains solely responsible for the legal accuracy of their declared GSTIN, tax rates (e.g. 5% non-ITC or 18% alcohol), FSSAI license numbers printed on receipts, and remittance of taxes to the appropriate government authorities.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-400" />
                <span>6. Governing Law &amp; Dispute Jurisdiction</span>
              </h2>
              <p>
                These Terms shall be interpreted and enforced strictly in accordance with the laws of the Republic of India, specifically including the Information Technology Act 2000 and the Indian Contract Act 1872. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Kolkata, West Bengal, India</strong>.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-500">
              <p>
                For legal inquiries, contract clarifications, or enterprise procurement agreements, please reach out to:
              </p>
              <p className="text-slate-300 font-bold">
                Legal &amp; Compliance Cell · SutraUniverse Technologies<br />
                Email: support@sutrauniverse.com · Phone: +91 6289450230<br />
                Kolkata, West Bengal, India
              </p>
            </section>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
