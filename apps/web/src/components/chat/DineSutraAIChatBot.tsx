"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  HelpCircle,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  Minimize2,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actionLinks?: Array<{ label: string; href: string; isExternal?: boolean }>;
}

const QUICK_PROMPTS = [
  { label: "📹 AI CCTV Setup", query: "How does the AI CCTV Table Radar work without new hardware?" },
  { label: "⚡ Petpooja Comparison", query: "Why should I switch from Petpooja to DineSutra?" },
  { label: "💳 0% QR Ordering", query: "How do Table QR UPI payments work with zero commission?" },
  { label: "🖨️ Thermal Printer Setup", query: "Which thermal printers and ESC/POS hardware are supported?" },
  { label: "💰 Pricing & Plans", query: "What are the subscription plans and monthly pricing?" },
  { label: "🧾 Indian GST & FSSAI", query: "How does DineSutra handle GST SAC 996331 and FSSAI bills?" },
];

const KNOWLEDGE_RESPONSES: Array<{
  keywords: string[];
  reply: string;
  actionLinks?: Array<{ label: string; href: string; isExternal?: boolean }>;
}> = [
  {
    keywords: ["cctv", "camera", "rtsp", "vision", "hardware", "yolo", "hikvision", "radar"],
    reply:
      "DineSutra AI CCTV Table Radar connects directly to your existing CCTV RTSP streams (Hikvision, CP Plus, Dahua, etc.). Zero new cameras or sensors required!\n\nIt continuously monitors:\n• Table occupancy & seat turnover in real time\n• 5-minute waiter SLA alarms if seated guests remain unserved\n• Instant bussing alerts the second guests leave dirty tables\n• Entrance queue wait times & peak turnover forecasting.",
    actionLinks: [
      { label: "Try AI CCTV Radar Live", href: "/tables/cctv" },
      { label: "View Floor Plan", href: "/tables" },
    ],
  },
  {
    keywords: ["petpooja", "posist", "switch", "comparison", "compare", "better"],
    reply:
      "DineSutra eliminates the hidden fees and legacy clunkiness of Petpooja & Posist:\n\n1. 0% Commission on Table QR: All UPI funds route directly to your bank account (saving ₹40,000–₹1,20,000/mo).\n2. AI CCTV Intelligence built-in: No expensive sensor hardware.\n3. Peak Offline Resilience: If your internet drops during dinner rush, orders and KOTs print without missing a beat.\n4. Modern React PWA: Runs on any iPad, Android tablet, phone, or Windows PC.",
    actionLinks: [
      { label: "Compare Features", href: "/#comparison" },
      { label: "Book 10-Min Demo", href: "https://wa.me/918041234567?text=Hi%20DineSutra%2C%20I%20want%20to%20switch%20from%20Petpooja", isExternal: true },
    ],
  },
  {
    keywords: ["qr", "upi", "order", "ordering", "swiggy", "zomato", "commission"],
    reply:
      "With DineSutra Digital Table QR:\n• Guests scan the table acrylic standee using GPay, PhonePe, Paytm, or Camera.\n• High-definition digital menu opens instantly with veg/non-veg tags and modifier add-ons.\n• Order routes straight to Kitchen KOT and payments settle directly to your UPI VPA with 0% middleman deduction.",
    actionLinks: [
      { label: "Preview Table QR Order", href: "/qr-order" },
      { label: "Print Table Standees", href: "/tables" },
    ],
  },
  {
    keywords: ["printer", "print", "thermal", "escpos", "esc/pos", "receipt", "kot", "hardware"],
    reply:
      "DineSutra natively supports all standard 80mm (3-inch) and 58mm (2-inch) ESC/POS thermal printers via USB, Ethernet/LAN, and Bluetooth (TVS, Epson, Rugtek, Everycom, NGX).\n\nFeatures include:\n• Multi-station KOT routing (Kitchen, Bar, Bakery, Pantry)\n• High-speed auto-cutter commands\n• Automatic RJ12 cash till drawer solenoid pulses\n• GST-compliant thermal format with FSSAI & QR code.",
    actionLinks: [
      { label: "Launch Cashier POS", href: "/pos" },
      { label: "Configure Printers", href: "/settings" },
    ],
  },
  {
    keywords: ["price", "pricing", "cost", "plan", "subscription", "charge"],
    reply:
      "DineSutra offers transparent, value-first pricing:\n\n• Starter (₹999/mo): High-speed POS, 1 Kitchen KDS, GST billing, and QR menu.\n• Professional (₹2,499/mo): AI CCTV Vision Radar, Multi-Station KDS, recipe food costing & Captain handhelds.\n• Enterprise Custom: Multi-outlet chain franchise sync, central kitchen ERP & custom API integrations.",
    actionLinks: [
      { label: "View All Plan Tiers", href: "/#pricing" },
      { label: "Start Free 14-Day Trial", href: "/register" },
    ],
  },
  {
    keywords: ["gst", "fssai", "tax", "sac", "compliance", "invoice"],
    reply:
      "DineSutra is fully tailored for Indian tax compliance:\n• Statutory GST SAC 996331 pre-configured with 5% restaurant GST (2.5% CGST + 2.5% SGST auto-split).\n• Displays your mandatory 14-digit FSSAI food license on every bill and digital receipt.\n• Generates sequential B2C & B2B Tax Invoices with buyer GSTIN validation.",
    actionLinks: [
      { label: "Check Compliance Settings", href: "/settings" },
    ],
  },
  {
    keywords: ["contact", "human", "call", "whatsapp", "support", "talk", "phone", "number"],
    reply:
      "You can connect directly with our engineering and support leads anytime:\n\n📞 Phone: +91 80 4123 4567\n💬 WhatsApp: +91 98765 43210\n📧 Email: care@dinesutra.sutrauniverse.com\n\nOur restaurant specialists are available 24/7 during operational dinner hours.",
    actionLinks: [
      { label: "Chat on WhatsApp", href: "https://wa.me/918041234567?text=Hi%20DineSutra%20Support", isExternal: true },
      { label: "Call Support Helpline", href: "tel:+918041234567" },
    ],
  },
];

export function DineSutraAIChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Namaste! 🙏 Welcome to DineSutra AI Concierge. How can I help power your restaurant today? Ask me anything about our AI CCTV Table Radar, 0% Table QR, or hardware setup.",
      timestamp: "Just now",
      actionLinks: [
        { label: "📹 AI CCTV Radar Live", href: "/tables/cctv" },
        { label: "⚡ Switch from Petpooja", href: "/#comparison" },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window on message change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Show a greeting tooltip after 4 seconds if not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Hide on customer menu, customer display, POS, kitchen, or waiter handheld stations
  if (
    pathname.startsWith("/qr-order") ||
    pathname.startsWith("/cfd") ||
    pathname.startsWith("/pos") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/waiter") ||
    pathname.startsWith("/mobile")
  ) {
    return null;
  }

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Search knowledge base
    const lowerQuery = query.toLowerCase();
    const matched = KNOWLEDGE_RESPONSES.find((item) =>
      item.keywords.some((kw) => lowerQuery.includes(kw))
    );

    setTimeout(() => {
      let botReply = "";
      let botLinks: Array<{ label: string; href: string; isExternal?: boolean }> | undefined;

      if (matched) {
        botReply = matched.reply;
        botLinks = matched.actionLinks;
      } else {
        botReply =
          "Thank you for reaching out! DineSutra is an all-in-one restaurant OS featuring 0% UPI QR ordering, AI CCTV Table SLA Radar, multi-station KDS, and GST billing.\n\nWould you like a quick personalized walkthrough, or would you like to speak directly with our team?";
        botLinks = [
          { label: "Book 10-Min Live Demo", href: "https://wa.me/918041234567?text=Hi%20DineSutra%2C%20I%20would%20like%20a%20demo", isExternal: true },
          { label: "Launch Live POS Terminal", href: "/pos" },
          { label: "WhatsApp Support", href: "https://wa.me/918041234567", isExternal: true },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          actionLinks: botLinks,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: "Conversation refreshed. Ask me anything about DineSutra AI CCTV, 0% UPI QR ordering, or billing setup!",
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none font-sans">
      {/* 1. FLOATING GREETING TOOLTIP (Appears before user opens) */}
      {!isOpen && showTooltip && (
        <div className="absolute bottom-16 right-0 mb-2 w-64 bg-slate-950 text-white p-3 rounded-2xl border border-amber-500/40 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                DineSutra AI Concierge
              </span>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 mt-1.5 leading-snug">
            Need help with <strong>AI CCTV Radar</strong>, <strong>0% QR Menu</strong>, or hardware setup?
          </p>
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
              setHasUnread(false);
            }}
            className="mt-2.5 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1"
          >
            <span>Ask AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. MAIN FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
            setHasUnread(false);
          }}
          className="group relative flex items-center gap-3 bg-slate-950 hover:bg-slate-900 border-2 border-amber-500/60 text-white p-1.5 pr-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          title="Open DineSutra AI Customer Care"
        >
          {/* Glowing Aura Ring */}
          <span className="absolute -inset-1 rounded-full bg-amber-500/20 blur-md group-hover:bg-amber-500/30 transition-all animate-pulse" />

          {/* Gold Logo Medallion */}
          <div className="relative w-11 h-11 rounded-full bg-slate-900 border border-amber-400/80 overflow-hidden flex items-center justify-center p-0.5 shadow-md">
            <img
              src="/dinesutra-logo.svg"
              alt="DineSutra"
              className="h-full w-full object-cover scale-125 rounded-full"
            />
            {hasUnread && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            )}
          </div>

          <div className="relative flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">DineSutra AI</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                24/7
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Instant Care & Concierge</span>
          </div>
        </button>
      )}

      {/* 3. EXPANDED AI CHAT WINDOW */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[82vh] bg-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">
          {/* Header Bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-500/60 overflow-hidden p-0.5 shadow-md shrink-0">
                <img
                  src="/dinesutra-logo.svg"
                  alt="DineSutra"
                  className="h-full w-full object-cover scale-125 rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">DineSutra AI Concierge</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Responds in seconds · 24/7 Care</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleResetChat}
                className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition-colors"
                title="Restart conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition-colors"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Suggestion Chips Bar */}
          <div className="bg-slate-900/40 border-b border-slate-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                className="shrink-0 text-[10px] font-bold bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 px-2.5 py-1 rounded-full text-slate-300 transition-all whitespace-nowrap"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message History Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl whitespace-pre-line leading-relaxed shadow-sm",
                    m.sender === "user"
                      ? "bg-amber-500 text-slate-950 font-semibold rounded-br-xs"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs"
                  )}
                >
                  {m.text}

                  {/* Inline Action Links */}
                  {m.actionLinks && m.actionLinks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
                      {m.actionLinks.map((link, lIdx) =>
                        link.isExternal ? (
                          <a
                            key={lIdx}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-between text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-950/60 hover:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-all"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                          </a>
                        ) : (
                          <Link
                            key={lIdx}
                            href={link.href}
                            className="inline-flex items-center justify-between text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-950/60 hover:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-all"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="mr-auto flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-bl-xs text-slate-400 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-[11px]">DineSutra AI is formulating response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Escalation Banner */}
          <div className="bg-slate-900/60 border-t border-slate-800 px-3.5 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Need human engineer?</span>
            <a
              href="https://wa.me/918041234567?text=Hi%20DineSutra%2C%20I%20need%20urgent%20support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <span>WhatsApp Direct (+91 80 4123 4567)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* User Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AI CCTV, QR menu, printers..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 p-2 rounded-xl transition-all font-bold shadow-md active:scale-95 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
