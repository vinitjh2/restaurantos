"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessType: "Food Stall / Kiosk",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission or open mailto
    const subject = encodeURIComponent(`New Inquiry from ${formData.name} (${formData.businessType})`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nBusiness: ${formData.businessType}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:support@sutrauniverse.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PageHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            We&apos;re Here to Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">
            Contact SutraUniverse Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Have questions about onboarding your food stall, integrating UPI autopay, or enterprise deployments? Our support engineering team in Kolkata is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Direct Contact Channels
              </h2>

              {/* Merchant Legal Entity for Payment Gateway Compliance */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 mb-4">
                <span className="block font-bold text-indigo-700 uppercase text-[10px] tracking-wider mb-0.5">
                  Merchant Legal Entity / Account Holder
                </span>
                <p className="text-slate-950 font-black text-sm">Vinit Kumar Jha</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Operating Brand: <strong className="text-indigo-900 font-semibold">SutraUniverse</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Official Support Email</p>
                    <a
                      href="mailto:support@sutrauniverse.com"
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      support@sutrauniverse.com
                    </a>
                    <p className="text-[11px] text-slate-500 mt-0.5">Response SLA: &lt; 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Phone &amp; WhatsApp Support</p>
                    <a
                      href="tel:+916289450230"
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                    >
                      +91 6289450230
                    </a>
                    <a
                      href="https://wa.me/916289450230?text=Hi%20SutraUniverse%2C%20I%20have%20an%20inquiry%20about%20your%20software."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 mt-1"
                    >
                      <span>💬 Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Operating Headquarters</p>
                    <p className="text-sm font-bold text-slate-900">Kolkata, West Bengal, India</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">SutraUniverse Cloud Systems</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Working Hours</p>
                    <p className="text-xs font-bold text-slate-800">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sunday: Emergency On-Call Server Ops</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Onboarding Note */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950">
              <p className="font-bold mb-1 flex items-center gap-1.5">
                <span>⚡ Instant Stall Onboarding</span>
              </p>
              <p className="leading-relaxed text-amber-900/90">
                Are you a food kiosk or cafe owner looking to get your customized QR counter standee printed? WhatsApp us at <strong className="font-bold">+91 6289450230</strong> with your menu photo, and we will configure your live portal in 15 minutes!
              </p>
            </div>
          </div>

          {/* Inquiry Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-950 mb-1">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill in your details below and our technical desk will get back to you immediately.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-emerald-950 mb-1">Message Dispatched!</h3>
                  <p className="text-xs text-emerald-800 mb-4">
                    Thank you for reaching out. We have received your inquiry at support@sutrauniverse.com.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-emerald-900 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Business Application</label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-2 focus:outline-indigo-600 font-medium"
                      >
                        <option value="KioskSutra (Food Stall OS)">KioskSutra (Food Stall OS)</option>
                        <option value="DineSutra (Restaurant OS)">DineSutra (Restaurant OS)</option>
                        <option value="RankSutra (SEO Radar)">RankSutra (SEO Radar)</option>
                        <option value="Enterprise / Custom Partnership">Enterprise / Custom Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">How can we help? *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your stall/restaurant location, menu items, or requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-2 focus:outline-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
