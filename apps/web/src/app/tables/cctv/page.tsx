"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { CctvTableVisionRadar } from "@/components/tables/CctvTableVisionRadar";

export default function CctvPage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/tables"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 2D Floor Plan</span>
        </Link>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-bold text-amber-700">AI CCTV Table Vision</span>
      </div>

      <CctvTableVisionRadar />
    </div>
  );
}
