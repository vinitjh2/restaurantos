"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SutraUniverseLogo } from "@/components/SutraUniverseLogo";

export const PageHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <SutraUniverseLogo variant="icon" className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-950 leading-none">
                SUTRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">UNIVERSE</span>
              </span>
            </div>
            <span className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
              Next-Gen Business OS Suite
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal</span>
          </Link>

          <a
            href="https://kiosksutra.sutrauniverse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-2xs transition-all items-center gap-1.5"
          >
            <span>🌯</span>
            <span>KioskSutra</span>
            <ExternalLink className="w-3 h-3 text-amber-700" />
          </a>
        </div>
      </div>
    </header>
  );
};
