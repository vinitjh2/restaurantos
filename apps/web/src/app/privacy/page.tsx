import React from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/compliance/PageHeader";
import { PageFooter } from "@/components/compliance/PageFooter";
import { ShieldCheck, Lock, EyeOff, Server, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy · DineSutra",
  description:
    "Privacy Policy for DineSutra Restaurant OS in strict compliance with India's Digital Personal Data Protection (DPDP) Act 2023 and IT Act 2000.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PageHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              How SutraUniverse Technologies protects the data of restaurants, staff, and dining guests.
            </p>
          </div>

          {/* Privacy Content Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>1. Overview &amp; Data Fiduciary Commitment</span>
              </h2>
              <p>
                This Privacy Policy outlines how <strong>SutraUniverse Technologies</strong> (&quot;SutraUniverse&quot;, &quot;we&quot;, &quot;our&quot;), having its principal place of operations in Kolkata, West Bengal, India, processes, stores, and protects personal and commercial data collected through <strong>DineSutra</strong>.
              </p>
              <p>
                We adhere uncompromisingly to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-rose-400" />
                <span>2. Information We Collect</span>
              </h2>
              <p>We collect only the minimum information necessary to execute restaurant service:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Merchant Account Data:</strong> Restaurant legal name, owner/manager name, email, phone number, GSTIN, FSSAI registration, and branch address.
                </li>
                <li>
                  <strong className="text-slate-200">Dining Guest Data (Optional):</strong> Mobile number provided willingly by guests for receiving digital GST e-bills or promotional discount coupons via WhatsApp.
                </li>
                <li>
                  <strong className="text-slate-200">Operational Records:</strong> Table orders, Kitchen KOT tickets, menu items, sales revenue, and inventory ledger records.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>3. Zero Payment Instrument Storage Guarantee</span>
              </h2>
              <p>
                DineSutra never stores, inspects, or processes sensitive payment card credentials, CVV codes, bank login passwords, or UPI PINs. All online payments, QR collections, and recurring subscriptions are facilitated via RBI-authorized, PCI-DSS Level 1 certified payment aggregators (PhonePe PG).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>4. AI CCTV Radar Data Privacy</span>
              </h2>
              <p>
                When a restaurant activates DineSutra&apos;s AI CCTV radar:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Video streams from RTSP security cameras are analyzed in real-time strictly to determine table occupancy and wait duration.</li>
                <li>No facial recognition, biometric profiling, or personal identification is conducted.</li>
                <li>Raw video feeds are processed locally or in encrypted volatile memory without retaining long-term guest surveillance footage on DineSutra cloud servers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>5. No Data Selling / Commercial Monetization</span>
              </h2>
              <p>
                We do not sell, rent, monetize, or broker merchant customer lists, diner contact databases, or food consumption trends to third-party ad networks, competing restaurant chains, or data brokers. Your guest records belong solely to your restaurant establishment.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-400" />
                <span>6. Grievance Officer &amp; Redressal Mechanism</span>
              </h2>
              <p>
                In compliance with the Information Technology Act, 2000 and Rule 5(9) of the IT Rules, 2011, you may direct any data privacy inquiries, consent withdrawals, or deletion requests to our Grievance Officer:
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs text-slate-300">
                <p><strong className="text-white">Grievance Officer:</strong> Vinit Kumar Jha (Data Privacy Desk)</p>
                <p><strong className="text-white">Organization:</strong> SutraUniverse (DineSutra)</p>
                <p><strong className="text-white">Email:</strong> support@sutrauniverse.com</p>
                <p><strong className="text-white">Phone / WhatsApp:</strong> +91 6289450230</p>
                <p><strong className="text-white">Location:</strong> Kolkata, West Bengal, India</p>
                <p><strong className="text-white">Resolution Window:</strong> Acknowledged within 24 hours, resolved within 15 working days.</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
