import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/compliance/PageHeader";
import { PageFooter } from "@/components/compliance/PageFooter";
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us · DineSutra — India's High-Speed Restaurant OS",
  description:
    "Learn about DineSutra, our mission to liberate Indian restaurants from predatory 25-35% aggregator commissions with Table QR ordering, AI CCTV waiter radar, and lightning-fast POS.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PageHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Engineered in Kolkata for India</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Empowering Dining Rooms with Speed, AI Vision &amp; 0% Commission
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              DineSutra is an enterprise-grade cloud operating system built for fine dining restaurants, bistros, cafes, and rooftop lounges. We eliminate long wait times, prevent missed service calls, and protect restaurant profit margins.
            </p>
          </div>

          {/* Mission & Problem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">The Restaurant Problem</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Indian restaurant owners face crippling 25% to 35% commission deductions from food delivery aggregators, alongside slow manual table ordering, stolen cash, and frustrated diners whose waves to busy waiters go unseen for 10-15 minutes.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">The DineSutra Solution</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                DineSutra gives restaurants their own 100% direct Table QR ordering system, instant Captain POS, multi-station Kitchen Display (KDS), and patent-pending AI CCTV Waiter Alert Radar that automatically nudges staff if a seated table is unattended for over 5 minutes.
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Our 4 Engineering Pillars
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <Sparkles className="w-4 h-4" />
                  <span>0% Commission Guarantee</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every rupee paid by your dining customers through UPI QR goes directly into your restaurant&apos;s current bank account in real-time. We never touch your funds.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Eye className="w-4 h-4" />
                  <span>AI CCTV Floor Radar</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect existing RTSP security cameras to detect guest seating, empty water glasses, and unattended tables without installing proprietary expensive sensors.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <Clock className="w-4 h-4" />
                  <span>Instant Offline-First POS</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Even during local internet cuts, captains can continue punching orders on Android tablets, running split bills, and generating 3-inch thermal KOT printouts instantly.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Complete Indian Compliance</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full GST breakdown (CGST 2.5% + SGST 2.5% under SAC 996331/996332), service charge toggles, and compliance with the Digital Personal Data Protection Act 2023.
                </p>
              </div>
            </div>
          </div>

          {/* Entity & Location */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 space-y-4 text-center">
            <h3 className="text-xl font-bold text-white">About the Organization</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              DineSutra is an operating system by <strong className="text-white">SutraUniverse Technologies</strong>, registered and operated in Kolkata, West Bengal, India. We are committed to building resilient, beautiful, and accessible software for India&apos;s culinary entrepreneurs.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kolkata Headquarters</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14-Day Risk-Free Trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated WhatsApp Support</span>
            </div>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-rose-500/20 transition-all"
              >
                <span>Start Free 14-Day Trial</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
