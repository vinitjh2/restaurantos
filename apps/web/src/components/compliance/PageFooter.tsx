"use client";

import React from "react";
import Link from "next/link";
import { DineSutraLogo } from "@/components/DineSutraLogo";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export const PageFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <DineSutraLogo variant="full" className="h-8 w-auto" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mb-4 font-medium">
              Enterprise Restaurant &amp; Bar Operating System engineered in Kolkata. Owned and operated by <strong className="text-white font-bold">Vinit Kumar Jha</strong> (operating under brand <strong className="text-amber-400 font-bold">SutraUniverse</strong>). High-speed touch POS, AI CCTV Vision radar, multi-station KDS, and direct QR ordering. 100% direct revenue with zero aggregator commission.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Headquarters: Kolkata, West Bengal, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <a href="mailto:support@sutrauniverse.com" className="hover:text-rose-400">
                  support@sutrauniverse.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <a href="tel:+916289450230" className="hover:text-rose-400">
                  +91 6289450230 (Mon–Sat, 10 AM – 7 PM IST)
                </a>
              </div>
            </div>
          </div>

          {/* Quick Ecosystem Apps */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              SutraUniverse Suite
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 flex items-center gap-1.5"
                >
                  <span>🌌</span> SutraUniverse Hub
                </a>
              </li>
              <li>
                <a
                  href="https://kiosksutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 flex items-center gap-1.5"
                >
                  <span>🌯</span> KioskSutra (Food Stall OS)
                </a>
              </li>
              <li>
                <a
                  href="https://staysutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 flex items-center gap-1.5"
                >
                  <span>🏨</span> StaySutra (Cloud Hotel PMS)
                </a>
              </li>
              <li>
                <a
                  href="https://ranksutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 flex items-center gap-1.5"
                >
                  <span>📍</span> RankSutra (Local SEO Radar)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-rose-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-rose-400">
                  Contact Us &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-rose-400">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-rose-400">
                  Refund &amp; Cancellation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Strip */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 · IT Act 2000 · SAC 996331/996332 GST · RBI e-Mandate Compliant</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Vinit Kumar Jha (Operating as SutraUniverse / DineSutra). All rights reserved. Kolkata, India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
