"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DineSutraLogo } from "@/components/DineSutraLogo";

export const PageHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-auto flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <DineSutraLogo variant="full" className="h-9 w-auto" />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal</span>
          </Link>

          <a
            href="https://sutrauniverse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all items-center gap-1.5"
          >
            <span>🌌</span>
            <span>SutraUniverse Hub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
