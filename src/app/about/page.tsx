import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { ShieldCheck, Zap, Heart, Target, Users, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — SutraUniverse",
  description:
    "Learn about SutraUniverse's mission to empower India's 20 Lakh+ small merchants, food kiosks, and restaurants with zero-commission cloud operating systems.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PageHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Built for Bharat &amp; Global Commerce
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Democratizing Technology for Every Indian Merchant
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Headquartered in Kolkata, West Bengal, SutraUniverse is founded and operated by <strong className="text-slate-950 font-bold">Vinit Kumar Jha</strong>. We engineer high-speed, zero-commission cloud operating systems designed to eliminate food stall chaos, reduce kitchen delays, and empower micro-entrepreneurs.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To eliminate the 25–30% aggregator commission tax and ₹50,000+ hardware barriers that choke small street food stalls, chai joints, and independent restaurants across India. We believe every stall owner deserves digital independence with 100% direct UPI payments.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Zero Hardware Friction</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No bulky POS billing machines, no expensive thermal printers, and no proprietary swipe terminals. SutraUniverse applications run flawlessly on any smartphone, tablet, or browser with 0% downtime and under 15ms latency.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs mb-12">
          <h2 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-2">
            <span>Our Core Operating Principles</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm mb-3">
                0%
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">0% Commission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Money paid by customers via UPI goes 100% directly into the stall owner&apos;s bank account. We take ₹0 cut from your food sales.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm mb-3">
                100%
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Prepaid UPI Tokens</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Eliminates unpaid walkaways and counterfeit notes. Kitchens only cook after payment is verified by the UPI soundbox chime.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm mb-3">
                3+
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Multi-Lingual</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Engineered with native English, Hindi, and Bengali interfaces so stall cooks and managers can operate effortlessly without training.
              </p>
            </div>
          </div>
        </div>

        {/* Flagships Overview */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white mb-12 shadow-xl">
          <h2 className="text-xl font-black tracking-tight mb-3">The Flagship Sutra Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Our ecosystem connects hospitality, local discovery, and operational automation into unified suites:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xl block mb-2">🌯</span>
              <p className="font-bold text-white text-sm mb-1">KioskSutra</p>
              <p className="text-slate-300">Food stall operating system with high-speed QR ordering &amp; FIFO cook display.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xl block mb-2">🍽️</span>
              <p className="font-bold text-white text-sm mb-1">DineSutra</p>
              <p className="text-slate-300">Full-service restaurant OS with table management, captain POS, and AI CCTV.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xl block mb-2">📍</span>
              <p className="font-bold text-white text-sm mb-1">RankSutra</p>
              <p className="text-slate-300">AI GEO search and Google 3-Pack local ranking heatmap radar.</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center p-8 bg-amber-50 border border-amber-200 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Ready to modernize your food business?</h2>
          <p className="text-xs text-slate-600 mb-4">
            Try KioskSutra with our 14-day free trial. Zero hardware required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://kiosksutra.sutrauniverse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Launch KioskSutra Live
            </a>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
