"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/compliance/PageHeader";
import { PageFooter } from "@/components/compliance/PageFooter";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Headphones,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    restaurant: "",
    email: "",
    phone: "",
    city: "Kolkata",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PageHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              <span>We Are Here To Help</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Contact DineSutra Support
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Have questions regarding POS setups, thermal printer connections, QR code table stands, or enterprise custom rollouts? Reach out to our Kolkata engineering desk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-white">Official Communication</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Support Email
                      </span>
                      <a
                        href="mailto:support@sutrauniverse.com"
                        className="text-white font-bold hover:text-rose-400 text-sm transition-colors"
                      >
                        support@sutrauniverse.com
                      </a>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Guaranteed ticket response within 4 hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Phone &amp; WhatsApp Desk
                      </span>
                      <a
                        href="tel:+916289450230"
                        className="text-white font-bold hover:text-emerald-400 text-sm transition-colors"
                      >
                        +91 6289450230
                      </a>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Mon to Sat: 10:00 AM – 7:00 PM IST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Operating Location
                      </span>
                      <span className="text-white font-bold text-xs">
                        Kolkata, West Bengal, India
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        SutraUniverse Technologies Headquarters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Emergency Shift Support
                      </span>
                      <span className="text-white font-bold text-xs">
                        Critical Live Outage Hotlines
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Active subscribers get 24/7 priority routing via the in-app SOS button.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <a
                    href="https://api.whatsapp.com/send?phone=916289450230&text=Hi%20Sutra%20Universe,%20I%20need%20assistance%20with%20DineSutra%20Restaurant%20OS."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-xl">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Thank you for contacting DineSutra. A deployment specialist will review your restaurant details and contact you within 4 business hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-rose-400 hover:underline pt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Send Us An Inquiry</h3>
                    <p className="text-xs text-slate-400">
                      Fill in your details below and our restaurant solutions team will get in touch with you directly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Anirban Roy"
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Restaurant / Outlet Name
                        </label>
                        <input
                          type="text"
                          value={formData.restaurant}
                          onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                          placeholder="e.g. Park Street Bistro"
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. contact@yourbistro.in"
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Mobile / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 98300 12345"
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Kolkata"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        How can we help your restaurant? *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your table count, POS hardware, or specific questions..."
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
