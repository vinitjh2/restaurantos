"use client";

import React from "react";
import Link from "next/link";
import { SutraUniverseLogo } from "@/components/SutraUniverseLogo";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export const PageFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-950 p-1 flex items-center justify-center shrink-0">
                <SutraUniverseLogo variant="icon" className="w-full h-full" />
              </div>
              <span className="font-black text-slate-900 text-base">SutraUniverse</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mb-4">
              Next-generation cloud operating systems engineered in Kolkata. Owned and operated by <strong className="text-slate-900 font-bold">Vinit Kumar Jha</strong> (Trade Name: <strong className="text-indigo-900 font-bold">SutraUniverse</strong>). Serving 20 Lakh+ food stalls, restaurants, and retail merchants. Zero platform commission, ₹0 hardware barriers.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Headquarters: Kolkata, West Bengal, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="mailto:support@sutrauniverse.com" className="hover:text-indigo-600">
                  support@sutrauniverse.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="tel:+916289450230" className="hover:text-indigo-600">
                  +91 6289450230 (Mon–Sat, 10 AM – 7 PM IST)
                </a>
              </div>
            </div>
          </div>

          {/* Quick Ecosystem Apps */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              Flagship Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a
                  href="https://kiosksutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 flex items-center gap-1.5"
                >
                  <span>🌯</span> KioskSutra (Food Stall OS)
                </a>
              </li>
              <li>
                <a
                  href="https://dinesutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 flex items-center gap-1.5"
                >
                  <span>🍽️</span> DineSutra (Restaurant OS)
                </a>
              </li>
              <li>
                <a
                  href="https://ranksutra.sutrauniverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 flex items-center gap-1.5"
                >
                  <span>📍</span> RankSutra (Local SEO Radar)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/about" className="hover:text-indigo-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600">
                  Contact Us &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600">
                  Privacy Policy (DPDP 2023)
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-indigo-600">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Vinit Kumar Jha (Operating as SutraUniverse). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Encrypted &amp; PCI-DSS / NPCI Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
