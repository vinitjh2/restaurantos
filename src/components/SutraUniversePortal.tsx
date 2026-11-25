"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Store,
  UtensilsCrossed,
  Hotel,
  Compass,
  Phone,
  Mail,
  MapPin,
  Layers,
  MonitorSmartphone,
  ChevronRight,
  Receipt,
  Eye,
  CalendarDays,
  X,
} from "lucide-react";
import { SutraUniverseLogo } from "@/components/SutraUniverseLogo";
import { KioskSutraLogo } from "@/components/KioskSutraLogo";
import { DineSutraLogo } from "@/components/DineSutraLogo";
import { RankSutraLogo } from "@/components/RankSutraLogo";
import { ActiveScreen } from "@/types";

interface SutraUniversePortalProps {
  onNavigate?: (screen: ActiveScreen) => void;
}

interface PlatformDetail {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  liveUrl?: string;
  badge: string;
  themeColor: string;
}

const PLATFORM_DETAILS: Record<string, PlatformDetail> = {
  kiosksutra: {
    id: "kiosksutra",
    name: "KioskSutra",
    tagline: "Smart Food Stall OS & High-Speed QR KDS",
    category: "Food Stalls & Quick-Service Counters",
    badge: "Live Production",
    themeColor: "amber",
    description:
      "Engineered specifically for India's 20 Lakh+ fast-food stalls, roll counters, and QSRs. Replaces chaotic manual ticketing with 100% UPI prepaid counter QR codes, automated digital tokens, and an offline-resilient kitchen display system (KDS).",
    features: [
      "100% UPI Prepaid QR ordering with automatic token generation",
      "Cook Kitchen Display System (KDS) with audio chimes & FIFO queue",
      "Counter POS for walk-in cash billing with instant 86 item kill-switch",
      "WhatsApp customer mobile CRM for festive promotions & repeat orders",
      "3-Language instant switcher (English, Hindi, Bengali)",
      "Zero hardware barriers: runs on any basic smartphone or Android tablet",
    ],
    specs: [
      { label: "Commission", value: "0%" },
      { label: "Hardware Cost", value: "₹0" },
      { label: "Average Prep Time", value: "4–8 min" },
      { label: "Direct Settlement", value: "Instant UPI" },
    ],
    liveUrl: "https://kiosksutra.sutrauniverse.com",
  },
  dinesutra: {
    id: "dinesutra",
    name: "DineSutra",
    tagline: "Restaurant Operating System & AI CCTV Vision Radar",
    category: "Fine Dining, Cafes & Multi-Floor Restaurants",
    badge: "Live Production",
    themeColor: "rose",
    description:
      "Enterprise cloud management for dining rooms, lounges, and bistros. Features table-specific QR ordering, patent-pending AI CCTV waiter alert radar, Captain handheld billing, multi-station KOT routing, and GST-compliant invoicing.",
    features: [
      "Table-specific dynamic QR ordering with live bill synchronization",
      "AI CCTV Floor Radar alerting captains when seated tables wait >5 minutes",
      "Captain handheld mobile POS with course management & split billing",
      "Multi-Station KOT routing (Pantry, Kitchen, Bar, Bakery) with chimes",
      "SAC 996331/996332 Indian GST breakdown (CGST 2.5% + SGST 2.5%)",
      "Automated WhatsApp digital food bills & customer review collection",
    ],
    specs: [
      { label: "Table Radar", value: "AI CCTV Vision" },
      { label: "Commission", value: "0%" },
      { label: "KOT Routing", value: "Multi-Station" },
      { label: "GST Compliance", value: "SAC 996331" },
    ],
    liveUrl: "https://dinesutra.sutrauniverse.com",
  },
  staysutra: {
    id: "staysutra",
    name: "StaySutra",
    tagline: "Cloud Property Management System (PMS)",
    category: "Hotels, Resorts & Heritage Havelis",
    badge: "Live Production",
    themeColor: "indigo",
    description:
      "Next-generation hotel property management system. Front desk teams manage reservations on a fluid 14-day visual tape chart, generate SAC 996311 GST folios, export Bureau of Immigration Form-C files, and run direct bookings with 0% OTA cuts.",
    features: [
      "14-Day Visual Tape Chart with drag-and-drop booking extensions",
      "Direct Booking Engine with 10-minute inventory holds & 0% OTA fees",
      "Automated foreign traveler Form-C FRRO Police XML generation",
      "Split guest folios with advance deposit tracking & SAC 996311 GST",
      "Housekeeping room turnover board (Clean, Dirty, Inspected, Maintenance)",
      "In-room digital concierge QR ordering for room service & amenities",
    ],
    specs: [
      { label: "Room Rack", value: "14-Day Tape Chart" },
      { label: "OTA Commission", value: "0%" },
      { label: "Police Compliance", value: "Form-C FRRO" },
      { label: "Hospitality GST", value: "SAC 996311" },
    ],
    liveUrl: "https://staysutra.sutrauniverse.com",
  },
  ranksutra: {
    id: "ranksutra",
    name: "RankSutra",
    tagline: "Local SEO & Generative Engine Optimization (GEO) Radar",
    category: "Local Discovery & AI Search Intelligence",
    badge: "Live Production",
    themeColor: "purple",
    description:
      "AI-native local discovery and search engine citation platform. Audits visibility across Google Gemini, ChatGPT Search, and Perplexity, visualizes Google Maps 3-Pack rankings on a 5km heatmap, and drives 5-star Google reviews via automated WhatsApp messaging.",
    features: [
      "Generative Engine Optimization (GEO) audit across Gemini & ChatGPT Search",
      "Interactive 5km Google Maps 3-Pack local ranking heatmap radar",
      "1-Click Schema.org LocalBusiness JSON-LD & /llms.txt knowledge graph export",
      "Automated WhatsApp review booster with negative feedback shielding",
      "EXIF GPS geotagged photo metadata injector for Google Business Profile",
      "60-second AI review auto-responder packed with high-intent local keywords",
    ],
    specs: [
      { label: "Maps Radar", value: "5km Heatmap" },
      { label: "GEO Citations", value: "4 AI Engines" },
      { label: "Google 3-Pack", value: "Rank #1 Focus" },
      { label: "Review Booster", value: "WhatsApp Automated" },
    ],
    liveUrl: "https://ranksutra.sutrauniverse.com",
  },
};

export const SutraUniversePortal: React.FC<SutraUniversePortalProps> = ({ onNavigate }) => {
  const [selectedApp, setSelectedApp] = useState<PlatformDetail | null>(null);

  const scrollToPlatforms = () => {
    const el = document.getElementById("flagship-platforms");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. CLEAN INSTITUTIONAL NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Lockup */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <SutraUniverseLogo variant="icon" className="w-full h-full" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-950 block leading-none">
                SUTRA<span className="text-indigo-600">UNIVERSE</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                Cloud Operating Systems
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button
              onClick={scrollToPlatforms}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Platforms
            </button>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">
              The Sutra Standard
            </a>
            <a href="#pipeline" className="hover:text-indigo-600 transition-colors">
              R&amp;D Pipeline
            </a>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-indigo-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors hidden sm:inline-block"
            >
              Inquire
            </Link>
            <button
              onClick={scrollToPlatforms}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 shadow-sm transition-all"
            >
              Explore Platforms
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AIRY, CONFIDENT HERO */}
      {/* ========================================================================= */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle Studio Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Business Operating Systems · Kolkata, India</span>
          </div>

          {/* Authoritative Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            Operating systems engineered for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
              real-world commerce.
            </span>
          </h1>

          {/* Clear Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            SutraUniverse builds cloud-native POS, kitchen display, and property management systems for Indian restaurants, food stalls, and hotels.
            <span className="block font-medium text-slate-800 mt-1">
              Zero aggregator commission. Zero hardware lock-in. Instant direct settlements.
            </span>
          </p>

          {/* Two Clean CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={scrollToPlatforms}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Flagship Platforms</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-300 shadow-xs transition-all"
            >
              <span>Schedule a Demo</span>
            </Link>
          </div>

          {/* Understated Trust Proof Line */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>0% Platform Commission</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>14-Day Free Trial Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct Bank Settlement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Runs on Any Smartphone / Tablet</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 4 LIVE FLAGSHIP PLATFORMS */}
      {/* ========================================================================= */}
      <section id="flagship-platforms" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
              Live Production Platforms
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-2 sm:mt-0 max-w-sm">
            Purpose-built operating systems ready for immediate deployment on your floor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: KioskSutra */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="h-12 flex items-center">
                  <KioskSutraLogo variant="full" className="h-10 w-auto" />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Cloud OS
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-700 block mb-1">
                  Food Stalls &amp; Quick-Service Counters
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Smart Food Stall OS &amp; High-Speed QR KDS
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Engineered for India&apos;s 20 Lakh+ fast-food stalls with 100% UPI prepaid counter QR ordering, audio-bell kitchen queues, and zero commission.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Prepaid UPI QR with automatic digital token generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cook Kitchen Display (KDS) with sound chime &amp; FIFO queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cash counter POS with instant 86 sold-out kill-switch</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <a
                href="https://kiosksutra.sutrauniverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <span>Launch KioskSutra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedApp(PLATFORM_DETAILS.kiosksutra)}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Specs
              </button>
            </div>
          </div>

          {/* Card 2: DineSutra */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="h-12 flex items-center">
                  <DineSutraLogo variant="full" className="h-10 w-auto" />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Cloud OS
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-rose-700 block mb-1">
                  Fine Dining, Cafes &amp; Multi-Floor Lounges
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  RestaurantOS &amp; AI Table Vision Radar
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Full dining room operations with dynamic table QR ordering, AI CCTV waiter alerts for unattended tables, captain POS, and multi-station KOT routing.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>AI CCTV Radar alerting staff when seated guests wait &gt;5m</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-Station KOT routing (Kitchen, Pantry, Bar, Bakery)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SAC 996331 GST split billing with automated WhatsApp receipts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <a
                href="https://dinesutra.sutrauniverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <span>Launch DineSutra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedApp(PLATFORM_DETAILS.dinesutra)}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Specs
              </button>
            </div>
          </div>

          {/* Card 3: StaySutra */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="h-12 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-sm">
                    <Hotel className="w-5 h-5 font-bold" />
                  </div>
                  <div>
                    <span className="font-black text-xl text-slate-950 block leading-none">
                      Stay<span className="text-amber-500">Sutra</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                      Cloud Hotel PMS
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Cloud OS
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-700 block mb-1">
                  Hotels, Boutique Resorts &amp; Homestays
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Cloud Property Management System (PMS)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Complete front-desk suite featuring an interactive 14-day tape chart, SAC 996311 GST folios, Form-C immigration exports, and 0% OTA commission direct bookings.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>14-Day Visual Tape Chart with room inventory drag-and-drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1-Click Form-C Foreign Guest XML export for Bureau of Immigration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SAC 996311 GST tier invoicing &amp; in-room digital concierge QR</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <a
                href="https://staysutra.sutrauniverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <span>Launch StaySutra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedApp(PLATFORM_DETAILS.staysutra)}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Specs
              </button>
            </div>
          </div>

          {/* Card 4: RankSutra */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="h-12 flex items-center">
                  <RankSutraLogo variant="full" size={36} />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Cloud OS
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-purple-700 block mb-1">
                  Local Storefronts, Restaurants &amp; Brands
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Local SEO &amp; Generative Engine Optimization
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Dominate Google Maps 3-Pack rankings and get cited by AI engines (Gemini &amp; ChatGPT). Features 5km rank heatmaps, /llms.txt export, and automated WhatsApp reviews.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Generative Search audit across Gemini, ChatGPT Search &amp; Perplexity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>5km 25-pin Google Maps 3-Pack rank visibility heatmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WhatsApp 5-star Google review booster with negative shield</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <a
                href="https://ranksutra.sutrauniverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <span>Launch RankSutra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedApp(PLATFORM_DETAILS.ranksutra)}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Specs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE SUTRA ARCHITECTURAL STANDARD */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-20 px-4 sm:px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Shared Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              The Sutra Standard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Every system we engineer adheres to four unwavering principles of operational freedom and financial integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">0% Commission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Why lose 20% to 35% of your hard-earned revenue to delivery apps and OTAs? Every rupee collected via UPI settles straight into your current account.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <MonitorSmartphone className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Zero Hardware Barriers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No expensive proprietary terminals. Use standard Android smartphones, iPads, thermal receipt printers, and existing CCTV security cameras.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Indian Compliance Native</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full adherence to the Digital Personal Data Protection (DPDP) Act 2023, SAC 996331/996311 GST schedules, and Bureau of Immigration Form-C reporting.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Offline Resilience</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for real-world India. Order punching, thermal KOT printing, and guest folios continue functioning seamlessly even during internet drops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. R&D STUDIO PIPELINE (CLEAN, MODEST ROADMAP) */}
      {/* ========================================================================= */}
      <section id="pipeline" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Innovation Horizon
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            R&amp;D Studio Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            SutraUniverse Technologies actively incubates strategic software across enterprise automation, gaming intelligence, and media.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">TBSutra</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                In Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time MMO alliance intelligence radar, scout telemetry, and troop march casualty optimizer for strategic commanders.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Sutra Conquest</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                In Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Persistent multiplayer strategy game featuring kingdom territorial expansion, guild diplomacy, and siege warfare.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">SchoolSutra</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                In Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-tenant campus ERP with biometric attendance, digital tuition fee collection, and automated WhatsApp parent alerts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">NovaShorts</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                In Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vertical drama and episodic micro-streaming engine with instant UPI micro-paywall unlock capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MODAL: SPECIFICATION VIEW */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  {selectedApp.category}
                </span>
                <h3 className="text-2xl font-black text-slate-950 mt-1">
                  {selectedApp.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedApp.tagline}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedApp.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 py-2">
                {selectedApp.specs.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{spec.label}</span>
                    <span className="block text-xs font-black text-slate-800">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-slate-800 block">Core Capabilities:</span>
                {selectedApp.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                {selectedApp.liveUrl && (
                  <a
                    href={selectedApp.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Launch Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 flex items-center justify-center shrink-0">
                <SutraUniverseLogo variant="icon" className="w-full h-full" />
              </div>
              <div>
                <span className="font-black text-slate-950 text-base">SutraUniverse Technologies</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-speed cloud operating systems engineered in Kolkata, West Bengal, India.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href="mailto:support@sutrauniverse.com" className="hover:text-indigo-600">
                  support@sutrauniverse.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href="tel:+916289450230" className="hover:text-indigo-600">
                  +91 6289450230
                </a>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Live Platforms
              </h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li>
                  <a href="https://kiosksutra.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                    KioskSutra (Food Stall OS)
                  </a>
                </li>
                <li>
                  <a href="https://dinesutra.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                    DineSutra (Restaurant OS)
                  </a>
                </li>
                <li>
                  <a href="https://staysutra.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                    StaySutra (Hotel PMS)
                  </a>
                </li>
                <li>
                  <a href="https://ranksutra.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                    RankSutra (Local SEO)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Company &amp; Legal
              </h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><Link href="/about" className="hover:text-slate-900">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900">Contact &amp; Support</Link></li>
                <li><Link href="/terms" className="hover:text-slate-900">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-slate-900">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Compliance Standards
              </h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><span>DPDP Act 2023 Compliant</span></li>
                <li><span>Information Technology Act 2000</span></li>
                <li><span>SAC 996331 &amp; 996311 GST</span></li>
                <li><span>RBI e-Mandate Compliant</span></li>
                <li><span>Bureau of Immigration Form-C</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                Headquarters
              </h4>
              <p className="text-slate-500 leading-relaxed text-xs">
                SutraUniverse Technologies<br />
                Kolkata, West Bengal, India<br />
                Support: Mon–Sat, 10 AM – 7 PM IST
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} SutraUniverse Technologies. All rights reserved.</span>
            <span>Made with precision in Kolkata for Bharat &amp; Global Commerce.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
