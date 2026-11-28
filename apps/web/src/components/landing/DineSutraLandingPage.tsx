"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Video,
  Smartphone,
  ChefHat,
  Store,
  QrCode,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  Star,
  Globe,
  Languages,
  MessageSquare,
  Receipt,
  Layers,
  UtensilsCrossed,
  TrendingUp,
  Percent,
  Zap,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Printer,
  BellRing,
  AlertTriangle,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DineSutraLogo } from "@/components/DineSutraLogo";
import { SutraUniverseLogo } from "@/components/SutraUniverseLogo";

type Language = "en" | "hi" | "bn";
type ColorTheme = "indigo" | "emerald" | "bordeaux";

interface ThemeConfig {
  id: ColorTheme;
  name: string;
  badge: string;
  primaryGrad: string;
  primaryTextGrad: string;
  primaryBg: string;
  primaryBorder: string;
  primaryText: string;
  heroBgGrad: string;
  cardHighlight: string;
  proCardBorder: string;
  btnPrimary: string;
  iconBg: string;
}

const THEMES: Record<ColorTheme, ThemeConfig> = {
  indigo: {
    id: "indigo",
    name: "Royal Obsidian & Indigo",
    badge: "Linear / Apple Tech",
    primaryGrad: "from-indigo-600 via-violet-600 to-purple-600",
    primaryTextGrad: "from-indigo-600 via-violet-600 to-purple-600",
    primaryBg: "bg-indigo-50",
    primaryBorder: "border-indigo-200",
    primaryText: "text-indigo-600",
    heroBgGrad: "from-slate-900 via-indigo-950 to-slate-950",
    cardHighlight: "from-indigo-50/70 to-violet-50/70",
    proCardBorder: "border-indigo-500",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25",
    iconBg: "from-indigo-600 via-violet-600 to-purple-600",
  },
  emerald: {
    id: "emerald",
    name: "Michelin Jade & Emerald",
    badge: "SevenRooms Luxury",
    primaryGrad: "from-emerald-600 via-teal-600 to-cyan-600",
    primaryTextGrad: "from-emerald-600 via-teal-600 to-cyan-600",
    primaryBg: "bg-emerald-50",
    primaryBorder: "border-emerald-200",
    primaryText: "text-emerald-600",
    heroBgGrad: "from-slate-950 via-slate-900 to-teal-950",
    cardHighlight: "from-emerald-50/70 to-teal-50/70",
    proCardBorder: "border-emerald-500",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25",
    iconBg: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  bordeaux: {
    id: "bordeaux",
    name: "Bordeaux Wine & Champagne",
    badge: "Fine Dining Restobar",
    primaryGrad: "from-rose-600 via-pink-600 to-amber-600",
    primaryTextGrad: "from-rose-600 via-pink-600 to-amber-600",
    primaryBg: "bg-rose-50",
    primaryBorder: "border-rose-200",
    primaryText: "text-rose-600",
    heroBgGrad: "from-slate-950 via-rose-950/80 to-slate-950",
    cardHighlight: "from-rose-50/70 to-amber-50/70",
    proCardBorder: "border-rose-500",
    btnPrimary: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25",
    iconBg: "from-rose-600 via-pink-600 to-amber-600",
  },
};

export function DineSutraLandingPage() {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>("indigo");
  const [lang, setLang] = useState<Language>("en");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"cctv" | "qr" | "kds" | "waiter" | "analytics">("cctv");

  const t = THEMES[currentTheme];

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      {/* 1. TOP ANNOUNCEMENT & REAL-TIME THEME SWITCHER */}
      <div className="bg-slate-950 text-white font-medium text-xs py-2.5 px-4 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-white text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase shadow-xs flex items-center gap-1 bg-gradient-to-r", t.primaryGrad)}>
              <span>✨</span>
              <span>AI CCTV RADAR LIVE</span>
            </span>
            <span className="text-slate-300">Automated 5-min waiter response &amp; instant bussing alerts on existing cameras.</span>
            <a href="#cctv-feature" className="text-white underline font-bold hover:text-slate-200 hidden md:inline">
              See Live Vision ➔
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-bold hidden sm:inline flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              <span>Theme:</span>
            </span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setCurrentTheme("indigo")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5",
                  currentTheme === "indigo" ? "bg-indigo-600 text-white font-black shadow-xs" : "text-slate-400 hover:text-slate-200"
                )}
                title="Royal Obsidian & Indigo (Modern SaaS Luxury)"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Indigo</span>
              </button>
              <button
                onClick={() => setCurrentTheme("emerald")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5",
                  currentTheme === "emerald" ? "bg-emerald-600 text-white font-black shadow-xs" : "text-slate-400 hover:text-slate-200"
                )}
                title="Michelin Jade & Emerald (Fresh Organic Luxury)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Emerald</span>
              </button>
              <button
                onClick={() => setCurrentTheme("bordeaux")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5",
                  currentTheme === "bordeaux" ? "bg-rose-600 text-white font-black shadow-xs" : "text-slate-400 hover:text-slate-200"
                )}
                title="Bordeaux Wine & Champagne (Fine Dining & Restobar)"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Bordeaux</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STICKY SAAS HEADER WITH LOGO & QUICK ACTIONS */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/80 shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1">
              <DineSutraLogo variant="icon" className="h-full w-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Dine<span className={t.primaryText}>Sutra</span>
              </span>
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-1 flex items-center gap-1">
                <SutraUniverseLogo variant="icon" className="w-3 h-3" />
                <span>By SutraUniverse</span>
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#cctv-feature" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <span>AI CCTV Radar</span>
              <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", t.primaryBg, t.primaryText, t.primaryBorder)}>
                New
              </span>
            </a>
            <a href="#kds-feature" className="hover:text-slate-900 transition-colors">Multi-KDS</a>
            <a href="#comparison" className="hover:text-slate-900 transition-colors">vs Petpooja</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setLang("en")}
                className={cn("px-2.5 py-1 rounded-lg transition-all text-[11px]", lang === "en" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800")}
              >
                EN
              </button>
              <button
                onClick={() => setLang("hi")}
                className={cn("px-2.5 py-1 rounded-lg transition-all text-[11px]", lang === "hi" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800")}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang("bn")}
                className={cn("px-2.5 py-1 rounded-lg transition-all text-[11px]", lang === "bn" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800")}
              >
                বাংলা
              </button>
            </div>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <span>Live App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className={cn("text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 bg-gradient-to-r", t.primaryGrad)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-14 pb-20 overflow-hidden bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            {/* Master Brand Vector Logo */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="px-6 py-3.5 rounded-3xl bg-white border-2 border-rose-200/90 shadow-xl flex items-center justify-center transition-transform group-hover:scale-105">
                  <DineSutraLogo variant="full" className="h-12 w-auto" />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950 text-rose-300 border border-rose-500/40 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-md">
                  Official Operating System
                </div>
              </div>
            </div>

            <div className={cn("inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs border", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <span className={cn("w-2 h-2 rounded-full animate-ping", currentTheme === "indigo" ? "bg-indigo-600" : currentTheme === "emerald" ? "bg-emerald-600" : "bg-rose-600")}></span>
              <span>Next-Generation Restaurant OS for Fine Dining, Cafes &amp; Restobars</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
              The Restaurant OS That{" "}
              <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", t.primaryTextGrad)}>
                Turns Tables 23% Faster
              </span>{" "}
              &amp; Never Leaves Guests Waiting.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Empower your dining floor with <strong>100% UPI Table QR ordering</strong>, multi-station KDS routing (Tandoor, Kitchen, Bar), Captain mobile punching, and{" "}
              <span className="text-slate-900 font-bold underline decoration-slate-300 decoration-2">
                real-time AI CCTV vision that alerts staff if a table waits over 5 minutes
              </span>
              . Zero new hardware. 0% Commission.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/tables/cctv"
                className={cn("inline-flex items-center gap-2 text-white text-sm font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 bg-gradient-to-r", t.primaryGrad)}
              >
                <span>🎥 Test AI CCTV Radar Live</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://api.whatsapp.com/send?phone=916289450230&text=Hi%20DineSutra%20Team,%20I%20want%20to%20see%20a%2010-min%20demo%20at%20my%20outlet."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold px-6 py-3.5 rounded-2xl shadow-md transition-all"
              >
                <span className="text-emerald-400 text-base">💬</span>
                <span>Book 10-Min In-Person Demo</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">0% Swiggy/Zomato Cuts</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Camera className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Existing CCTV Compatible</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">10-Minute Setup</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">GST SAC 996331 Ready</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE LIVE DEMO PREVIEW CONTAINER */}
          <div className="mt-14 bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                </div>
                <span className="text-xs font-bold text-slate-500 ml-2">DineSutra Suite Live Interactive Simulator</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("cctv")}
                  className={cn("px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5", activeTab === "cctv" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-600 hover:text-slate-900")}
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>AI CCTV Radar 🔥</span>
                </button>
                <button
                  onClick={() => setActiveTab("qr")}
                  className={cn("px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5", activeTab === "qr" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-600 hover:text-slate-900")}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Table QR Self-Order</span>
                </button>
                <button
                  onClick={() => setActiveTab("kds")}
                  className={cn("px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5", activeTab === "kds" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-600 hover:text-slate-900")}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Multi-Station KDS</span>
                </button>
                <button
                  onClick={() => setActiveTab("waiter")}
                  className={cn("px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5", activeTab === "waiter" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-600 hover:text-slate-900")}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Captain Handheld</span>
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={cn("px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5", activeTab === "analytics" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-600 hover:text-slate-900")}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Floor Heatmap &amp; Roster</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: AI CCTV RADAR */}
            {activeTab === "cctv" && (
              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 text-white relative overflow-hidden aspect-[16/10] border border-slate-800 flex flex-col justify-between shadow-2xl">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-red-400 font-bold">LIVE CAM-01 [MAIN DINING 1080P]</span>
                    </div>
                    <span className="text-emerald-400 font-bold">YOLOv11x-Pose • 25.0 FPS</span>
                  </div>

                  <div className="relative flex-1 my-2">
                    <div className="absolute top-[20%] left-[10%] w-[25%] h-[35%] border-2 border-emerald-500/80 bg-emerald-500/15 rounded-xl p-2 flex flex-col justify-between font-mono text-[10px]">
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-black self-start">T-01 • FREE</span>
                      <span className="text-emerald-300 text-[9px]">Ready to seat (4p)</span>
                    </div>
                    <div className="absolute top-[20%] left-[40%] w-[25%] h-[35%] border-2 border-indigo-500/80 bg-indigo-500/20 rounded-xl p-2 flex flex-col justify-between font-mono text-[10px]">
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded font-black self-start">T-02 • 4 GUESTS</span>
                      <span className="text-indigo-200 text-[9px]">Dwell Time: 18:42</span>
                    </div>
                    <div className="absolute top-[20%] left-[70%] w-[25%] h-[35%] border-2 border-rose-500 bg-rose-500/35 rounded-xl p-2 flex flex-col justify-between font-mono text-[10px] animate-pulse">
                      <span className="bg-rose-600 text-white px-2 py-0.5 rounded font-black self-start">⚠️ T-03 • NO WAITER!</span>
                      <span className="text-white font-bold bg-rose-950/80 px-1 py-0.5 rounded text-[9px]">WAIT: 05:14 (&gt; 5:00)</span>
                    </div>
                    <div className="absolute bottom-[5%] left-[30%] w-[35%] h-[35%] border-2 border-amber-500/80 bg-amber-500/25 rounded-xl p-2 flex flex-col justify-between font-mono text-[10px]">
                      <span className="bg-amber-600 text-slate-950 font-black px-2 py-0.5 rounded self-start">T-05 • DIRTY (NEEDS BUSSER)</span>
                      <span className="text-amber-200 text-[9px]">Guests departed 2m ago</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 rounded-lg p-2.5 text-xs flex items-center justify-between text-slate-300 font-mono border border-slate-800">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>1 Active SLA Alert • Table T-03 unattended</span>
                    </span>
                    <Link href="/tables/cctv" className="text-indigo-400 hover:text-indigo-300 underline font-bold">
                      Open Live Radar ➔
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="space-y-2">
                    <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                      Revolutionary Vision AI
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      Never Lose a Hungry Customer to 10-Minute Waiter Neglect.
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      DineSutra connects directly to your existing CCTV DVR (RTSP). AI detects when customers sit down, starts a timer, and alerts floor managers if no captain arrives within 5 minutes.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs font-bold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero new hardware — works with CP Plus, Dahua &amp; Hikvision</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant busser alert when guests leave to turn tables 23% faster</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Entrance queue wait-time forecaster based on eating stage</span>
                    </li>
                  </ul>

                  <Link
                    href="/tables/cctv"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-all w-full justify-center"
                  >
                    <span>Launch AI CCTV Radar Demo ➔</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: TABLE QR ORDERING */}
            {activeTab === "qr" && (
              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-600" />
                      <span className="font-extrabold text-slate-900 text-sm">Customer Mobile Self-Order (Table T-04)</span>
                    </div>
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full">
                      100% UPI Prepaid / Post-pay
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-extrabold text-slate-900 block">Murgh Dum Biryani</span>
                      <span className="text-[11px] text-slate-500 block">With fragrant saffron rice &amp; egg</span>
                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span className="text-slate-900">₹350</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ordered (x2)</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <span className="font-extrabold text-slate-900 block">Butter Garlic Naan</span>
                      <span className="text-[11px] text-slate-500 block">Crisp from traditional tandoor</span>
                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span className="text-slate-900">₹80</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ordered (x4)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-black text-slate-900 text-sm">Total: ₹1,020 (Incl. 5% GST)</span>
                      <span className="text-[10px] text-slate-400 block">Instant GPay / PhonePe UPI Settlement</span>
                    </div>
                    <Link
                      href="/qr-order?branch=IND&table=T-01"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black px-3.5 py-1.5 rounded-lg text-xs"
                    >
                      View Live QR Menu
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                    Frictionless Dining
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Guests Scan Table QR &amp; Order in Seconds. No Waiting for Menus.
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cut wait times during peak rush. Guests browse high-res dish photos, customize dietary modifiers, and send orders straight to the kitchen.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Supports both Prepaid UPI &amp; Traditional Pay-at-End</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct Waiter Call bell &amp; Water request buttons</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MULTI-STATION KDS */}
            {activeTab === "kds" && (
              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-200">KDS Station Routing • Table T-02 [KOT #2844]</span>
                    </div>
                    <span className="bg-slate-800 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                      Elapsed: 04:18
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                      <span className="text-amber-400 font-bold block text-[11px]">🔥 TANDOOR STATION</span>
                      <p className="text-white text-[11px]">4x Butter Garlic Naan</p>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">DONE</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                      <span className="text-indigo-400 font-bold block text-[11px]">🍳 MAIN CURRY STATION</span>
                      <p className="text-white text-[11px]">2x Butter Chicken (Extra gravy)</p>
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">COOKING (2m)</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                      <span className="text-teal-400 font-bold block text-[11px]">🍹 BAR / BEVERAGE</span>
                      <p className="text-white text-[11px]">2x Masala Chaas (Chilled)</p>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">DISPATCHED</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                    Kitchen Coordination
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Zero Missing Paper KOTs. Automatic Multi-Station Routing.
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Orders split automatically to their respective stations. Tandoor cooks see naan, Chinese chefs see noodles, and bartenders see mocktails.
                  </p>
                  <Link
                    href="/kitchen"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 underline"
                  >
                    <span>View Cook KDS Screen ➔</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: CAPTAIN HANDHELD */}
            {activeTab === "waiter" && (
              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="font-extrabold text-slate-900 text-xs">Captain Handheld Interface (Vikram)</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Section: AC Hall (Tables 1-8)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="font-black text-emerald-950 block text-sm">T-01</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Bill Settled</span>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                      <span className="font-black text-indigo-950 block text-sm">T-02</span>
                      <span className="text-[10px] text-indigo-700 font-bold">Course 2 (Mains)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-center animate-pulse">
                      <span className="font-black text-rose-950 block text-sm">⚠️ T-03</span>
                      <span className="text-[10px] text-rose-800 font-black">Needs Service!</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                    Captain Mobility
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Any Cheap Android Phone Becomes a Wireless Captain Terminal.
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Captains punch items directly at the table, modify food instructions, split bills, and receive instant vibration alerts when a CCTV timer flags an unattended table.
                  </p>
                  <Link
                    href="/waiter"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 hover:text-indigo-800 underline"
                  >
                    <span>Open Captain Tablet Screen ➔</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: ANALYTICS & ROSTER */}
            {activeTab === "analytics" && (
              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                    <span className="font-bold text-slate-200">Peak Hours &amp; Waiter Shift Optimization</span>
                    <span className="text-[10px] text-slate-400">Weekly Aggregated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/80 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Avg Table Turn Time</span>
                      <span className="text-xl font-black text-emerald-400">42 mins</span>
                      <span className="text-[9px] text-slate-400 block">vs 55m industry standard</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">5-Min SLA Adherence</span>
                      <span className="text-xl font-black text-indigo-400">97.4%</span>
                      <span className="text-[9px] text-slate-400 block">0 customer walkouts</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                    Staff Efficiency
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Schedule Exactly the Right Waiters for Peak Lunch &amp; Dinner.
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI analyzes your historical CCTV rush curves to forecast exactly how many cooks, bussers, and captains are required each hour, eliminating over-staffing waste.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURE PILLARS */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
            Engineered for Modern Hospitality
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Everything You Need to Run a Packed Dining Room with Half the Chaos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            From the moment guests walk through your door to their final WhatsApp receipt, DineSutra streamlines every touchpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">100% UPI Table QR Self-Ordering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Print elegant acrylic QR standees for every table. Guests scan with any camera app, view dynamic 4K food photos, customize spices, and pay via GPay/PhonePe with 0% commissions.
            </p>
          </div>

          <div id="cctv-feature" className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl hover:shadow-2xl transition-all space-y-3 group relative overflow-hidden">
            <span className={cn("absolute top-4 right-4 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs bg-gradient-to-r", t.primaryGrad)}>
              EXCLUSIVE AI
            </span>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-base font-extrabold text-white">AI CCTV Table Vision Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your existing CP Plus, Dahua, or Hikvision CCTV stream. YOLOv11 Computer Vision times every table, pings staff if a customer waits over 5 minutes, and alerts bussers the second guests exit.
            </p>
          </div>

          <div id="kds-feature" className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Multi-Station Kitchen Display (KDS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically route KOT items to distinct screens: Tandoor, Chinese wok, Main curry, Dessert, and Bar. Features kitchen bump bars, audio bell chimes, and FIFO order sequencing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Captain Mobile Handheld POS</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Equip your floor staff with wireless Android ordering. Punch courses (Starters first, Mains later), shift tables effortlessly, apply manager discounts, and print bills on belt thermal printers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">WhatsApp Invoices &amp; 5-Star Reviews</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-send PDF tax invoices to customer WhatsApp with 0 SMS fees. Automatically prompts satisfied diners to leave 5-star Google Maps reviews, boosting your local &apos;restaurants near me&apos; rank.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform", t.primaryBg, t.primaryBorder, t.primaryText)}>
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Split Billing &amp; Recipe Inventory BOM</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Split guest checks by item, by seat, or equal splits across Cash + UPI. Recipe bill-of-materials automatically deducts paneer, chicken, and butter from stock with 86 item killswitch.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMPETITIVE COMPARISON MATRIX */}
      <section id="comparison" className="py-20 bg-slate-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
              Honest Technology Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Why Modern Restaurants Are Switching to DineSutra
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              See how DineSutra compares against legacy desktop billing software and third-party delivery apps.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">Feature / Capability</th>
                  <th className="py-4 px-4 bg-slate-900 text-white border-x border-slate-800 font-black">
                    DineSutra (SutraUniverse)
                  </th>
                  <th className="py-4 px-4 text-slate-300">Petpooja</th>
                  <th className="py-4 px-4 text-slate-300">Posist (Restroworks)</th>
                  <th className="py-4 px-4 text-slate-300">Zomato / Swiggy Dineout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">AI CCTV Table Vision Radar</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Included (Zero Hardware)</span>
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">❌ Not Available</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ Not Available</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ Not Available</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Dine-in Commission Rate</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800">
                    0% (Keep 100% of revenue)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">0% (SaaS Fee)</td>
                  <td className="py-3.5 px-4 text-slate-400">0% (Heavy SaaS Fee)</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">15% - 25% Commission</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Table QR Self-Order &amp; Pay</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800">
                    ✓ Native UPI Instant QR
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Paid Add-on</td>
                  <td className="py-3.5 px-4 text-slate-400">Paid Enterprise Add-on</td>
                  <td className="py-3.5 px-4 text-amber-400">Requires App Install</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">5-Min Waiter SLA Alert</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800">
                    ✓ Automated CCTV Ping
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">❌ None</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ None</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ None</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Multi-Station Kitchen KDS</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800">
                    ✓ Unlimited Screen Routing
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Per-screen License Fee</td>
                  <td className="py-3.5 px-4 text-slate-400">Expensive Enterprise</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ No KDS</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">WhatsApp Tax Invoices</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-emerald-400 font-black border-x border-slate-800">
                    ✓ Auto PDF with Google Review
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Per-message SMS Credits</td>
                  <td className="py-3.5 px-4 text-slate-400">Third-Party Gateway</td>
                  <td className="py-3.5 px-4 text-rose-400">❌ App Only</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Starting Price</td>
                  <td className="py-3.5 px-4 bg-slate-900 text-slate-200 font-black border-x border-slate-800">
                    ₹1,499 / Month
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">₹10,000+ Upfront</td>
                  <td className="py-3.5 px-4 text-slate-400">₹35,000+ / Year</td>
                  <td className="py-3.5 px-4 text-rose-400">15–25% Per Bill</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. PRICING PLANS */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
            Simple, Transparent Indian Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Plans That Pay for Themselves in the First Weekend
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            No hidden setup fees. No hardware lock-in. Cancel anytime.
          </p>

          {/* 14-Day Free Trial & Mandate Guarantee Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold shadow-2xs mt-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>All Plans Include a 14-Day 100% Free Trial</strong> • ₹1 Refundable Verification • Zero charges during trial • Cancel anytime with period-end access.
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold mt-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn("px-4 py-2 rounded-xl transition-all", billingPeriod === "monthly" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800")}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={cn("px-4 py-2 rounded-xl transition-all flex items-center gap-1.5", billingPeriod === "annually" ? "bg-slate-900 text-white font-black shadow-xs" : "text-slate-500 hover:text-slate-800")}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                For Cafes &amp; Quick Dine-in
              </span>
              <h3 className="text-xl font-black text-slate-900">Starter</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {billingPeriod === "monthly" ? "₹1,499" : "₹1,199"}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <p className="text-xs text-slate-500">
                Ideal for cafes, dessert bistros, and small restaurants up to 15 tables.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 15 Tables with Dynamic QR Codes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% UPI Prepaid &amp; Post-pay Ordering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single-Station Kitchen Cook Display</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2 Captain Mobile Logins</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Digital Tax Invoices</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/register"
                className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-xs block"
              >
                Start 14-Day Free Trial
              </Link>
              <span className="text-[10px] text-slate-400 font-semibold text-center block mt-1.5">
                ₹1 refundable verification • ₹0 for 14 days
              </span>
            </div>
          </div>

          {/* Professional Plan (MOST POPULAR) */}
          <div className={cn("bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border-2 shadow-2xl flex flex-col justify-between space-y-6 relative transform lg:-translate-y-2", t.proCardBorder)}>
            <span className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md bg-gradient-to-r", t.primaryGrad)}>
              MOST POPULAR FOR RESTAURANTS
            </span>

            <div className="space-y-4 pt-1">
              <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
                Full-Service Dining &amp; Restobars
              </span>
              <h3 className="text-xl font-black text-white">Professional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {billingPeriod === "monthly" ? "₹2,499" : "₹1,999"}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <p className="text-xs text-slate-400">
                Complete operating system with AI CCTV Vision &amp; Multi-Station KDS.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-200 font-semibold pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Tables &amp; Floor Sections</span>
                </li>
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI CCTV Table Vision Radar (Up to 4 Cameras)</span>
                </li>
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5-Minute Waiter SLA Emergency Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Station KDS (Kitchen, Tandoor, Bar)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Captain Mobile App Logins</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Recipe Bill-of-Materials &amp; Low Stock Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Invoices with 5-Star Google Reviews</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/register"
                className={cn("w-full text-center font-black text-xs py-3.5 rounded-xl shadow-lg transition-all block", t.btnPrimary)}
              >
                Start 14-Day Free Trial (Most Popular)
              </Link>
              <span className="text-[10px] text-slate-300 font-semibold text-center block mt-1.5">
                ₹1 refundable verification • Full AI CCTV included
              </span>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Multi-Outlet &amp; Fine Dining Chains
              </span>
              <h3 className="text-xl font-black text-slate-900">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {billingPeriod === "monthly" ? "₹3,999" : "₹3,199"}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <p className="text-xs text-slate-500">
                For multi-branch restaurants, hotel dining rooms &amp; large food courts.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Professional Plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited CCTV Streams &amp; Multicam Views</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Central Kitchen &amp; Multi-Outlet Inventory Transfer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom ERP / Accounting Software Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated 24/7 Priority WhatsApp Support</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/register"
                className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-xs block"
              >
                Start 14-Day Enterprise Trial
              </Link>
              <span className="text-[10px] text-slate-400 font-semibold text-center block mt-1.5">
                Unlimited cameras & outlets • 14 days free
              </span>
            </div>
          </div>
        </div>

        {/* Mandate & Trial Assurance Bar */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/90 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-sm font-bold">
              ✓
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">₹1 Refundable Verification</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                ₹1 is temporarily authenticated via UPI Autopay / Card and instantly refunded to verify your bank mandate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-sm font-bold">
              🔔
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">24h Pre-Debit SMS Reminder</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                We alert you via SMS & WhatsApp 24–48 hours before Day 14. If you don't cancel, subscription auto-renews seamlessly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-sm font-bold">
              🛡️
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Period-End Access Guarantee</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                If you ever stop your mandate mid-month, your tables, KDS, and POS stay 100% active until the last day you paid for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AUTHENTIC LOCAL TESTIMONIALS */}
      <section className="py-20 bg-slate-100/80 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
              Validated on Indian Dining Floors
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by 50+ Restaurant &amp; Cafe Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Our Sunday lunch rush used to be utter chaos with waiters forgetting which table sat first. The AI CCTV waiter alert saved us countless customer walkouts, and table turn time dropped by 14 minutes!&rdquo;
              </p>
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">Subham Roy</span>
                <span className="text-[11px] text-slate-400">Owner, The Patuli Lounge &amp; Restobar (Kolkata)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Zero commissions on dine-in QR orders saved us over ₹48,000 last month alone compared to Zomato Dineout. Plus, sending WhatsApp bills got us 240+ five-star Google reviews in 60 days.&rdquo;
              </p>
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">Debasish Mukherjee</span>
                <span className="text-[11px] text-slate-400">Managing Partner, Garia Biryani &amp; Grill</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Routing KOTs to Tandoor and Bar separately eliminated kitchen yelling completely. Our captains punch on their own phones, and bills print instantly on our thermal counter printers.&rdquo;
              </p>
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">Ananya Banerjee</span>
                <span className="text-[11px] text-slate-400">Operations Head, Mocha Artisan Bistro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className={cn("text-xs font-black uppercase tracking-wider", t.primaryText)}>
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Do I need to buy expensive AI cameras for the Table Vision Radar?",
              a: "No! DineSutra connects directly to your existing CCTV cameras (CP Plus, Hikvision, Dahua, Uniview, etc.) via standard RTSP/ONVIF streams. The AI vision inference runs in real-time on our software without requiring a single new camera.",
            },
            {
              q: "Does DineSutra charge any commission on Table QR orders?",
              a: "Zero percent (0%). Unlike Swiggy Dineout or Zomato Gold which take 15% to 25% of your food bill, 100% of the customer's UPI payment settles directly into your own bank account.",
            },
            {
              q: "What happens if our restaurant internet goes down during peak rush?",
              a: "DineSutra runs on local offline-first architecture. Captains can continue punching KOTs and printing physical bills over your local Wi-Fi router even if the broadband internet is temporarily interrupted.",
            },
            {
              q: "Can customers split the bill between UPI and Cash?",
              a: "Yes. DineSutra has a dedicated split bill calculator allowing payments to be split by seat, by specific dish items, or by custom split amounts (e.g. ₹500 in Cash and ₹800 via GPay).",
            },
            {
              q: "Does it support thermal KOT printers and cash drawers?",
              a: "Yes. DineSutra supports all standard 80mm and 58mm ESC/POS thermal printers via USB, LAN, Wi-Fi, and Bluetooth, with automatic cash drawer kick triggers on bill settlement.",
            },
            {
              q: "How fast can we set up DineSutra at our outlet?",
              a: "Setup takes under 15 minutes. We upload your food menu, generate your table QR codes, and our team provides in-person or WhatsApp video onboarding for your staff.",
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 sm:p-5 text-left text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {activeFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {activeFaq === index && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FOOTER */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="mx-auto flex justify-center">
            <div className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center">
              <DineSutraLogo variant="full" className="h-9 w-auto" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Modernize Your Restaurant Floor Tonight?
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-medium">
            Join the restaurants across Kolkata and India that run smoother shifts, turn tables faster, and keep 100% of their earnings.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className={cn("font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all text-white bg-gradient-to-r", t.primaryGrad)}
            >
              Start Free 14-Day Trial
            </Link>

            <a
              href="https://api.whatsapp.com/send?phone=916289450230&text=Hi%20Sutra%20Universe,%20I%20want%20to%20schedule%20a%20demo%20of%20DineSutra%20today."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2"
            >
              <span>💬 WhatsApp: +91 62894 50230</span>
            </a>
          </div>

          <div className="pt-10 border-t border-slate-800/80 space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
              <Link href="/about" className="hover:text-rose-400 transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-rose-400 transition-colors">Contact &amp; Support</Link>
              <Link href="/terms" className="hover:text-rose-400 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-rose-400 transition-colors">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-rose-400 transition-colors">Refund &amp; Cancellation</Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <a href="https://sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">🌌 SutraUniverse</a>
              <a href="https://kiosksutra.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">🌯 KioskSutra</a>
              <a href="https://stay.sutrauniverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">🏨 StaySutra</a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 pt-4 border-t border-slate-800/40">
              <span>© {new Date().getFullYear()} Vinit Kumar Jha — SutraUniverse (DineSutra). All rights reserved. Kolkata, India.</span>
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-slate-300">Staff Portal</Link>
                <Link href="/tables/cctv" className="hover:text-slate-300">AI CCTV Radar</Link>
                <Link href="/pos" className="hover:text-slate-300">POS Billing</Link>
                <Link href="/kitchen" className="hover:text-slate-300">Kitchen KDS</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}