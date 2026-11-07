"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Store,
  Building2,
  Calendar,
  ChevronDown,
  Check,
  PlusCircle,
  ShieldCheck,
  LogOut,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { formatIndianDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

export function TopNav() {
  const {
    organizations,
    branches,
    currentOrgId,
    currentBranchId,
    setOrganization,
    setBranch,
    getActiveBranch,
  } = useRestaurantStore();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dateDisplay, setDateDisplay] = useState("Sat, 7 Nov 2026");

  useEffect(() => {
    setDateDisplay(formatIndianDate());
  }, []);

  const activeBranch = getActiveBranch();
  const activeOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Left: Organization & Branch Pickers */}
      <div className="flex items-center gap-3">
        {/* Restaurant / Brand Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setOrgDropdownOpen(!orgDropdownOpen);
              setBranchDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-amber-600" />
            <span className="max-w-[140px] truncate">{activeOrg.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Brand / Chain
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setOrganization(org.id);
                    setOrgDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span>{org.name}</span>
                  {org.id === currentOrgId && <Check className="h-3.5 w-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-slate-300 font-light">/</span>

        {/* Branch / Outlet Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setBranchDropdownOpen(!branchDropdownOpen);
              setOrgDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-blue-600" />
            <span className="max-w-[160px] truncate">{activeBranch.name}</span>
            <span className="rounded bg-blue-50 px-1 py-0.2 text-[9px] font-bold text-blue-700">
              {activeBranch.code}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Outlet Branch
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBranch(b.id);
                    setBranchDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 text-left"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{b.name}</div>
                    <div className="text-[10px] text-slate-400">
                      GSTIN: {b.gstin} · {b.city}
                    </div>
                  </div>
                  {b.id === currentBranchId && <Check className="h-4 w-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, dishes, tables, customers, bills (Ctrl + K)..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-12 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition-all"
          />
          <kbd className="absolute right-2.5 top-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Side: Date, Live POS Button, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Current Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs text-slate-600 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span suppressHydrationWarning>{dateDisplay}</span>
        </div>

        {/* PWA One-Click Install */}
        <PwaInstallButton />

        {/* Quick Launch POS Button */}
        <Link
          href="/pos"
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-amber-700 hover:to-orange-700 active:scale-[0.98] transition-all"
        >
          <Store className="h-3.5 w-3.5" />
          <span>Fast POS</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                  3 unread
                </Badge>
              </div>
              <div className="divide-y divide-slate-100 py-1 text-xs">
                <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="font-semibold text-slate-900">Low Stock Alert: Amul Butter</div>
                  <div className="text-[11px] text-slate-500">Only 2.4 Kg remaining. Reorder level: 10 Kg.</div>
                  <div className="text-[10px] text-amber-600 mt-0.5">8 mins ago</div>
                </div>
                <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="font-semibold text-slate-900">Table 12 Requesting Bill</div>
                  <div className="text-[11px] text-slate-500">Captain Vikram generated pre-bill of ₹1,280.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">14 mins ago</div>
                </div>
                <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="font-semibold text-slate-900">Zomato Order Ingested #9841</div>
                  <div className="text-[11px] text-slate-500">Auto-routed to Kitchen station.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">22 mins ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
              AR
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none">Ananya Roy</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">General Manager</span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">Ananya Roy</div>
                <div className="text-[11px] text-slate-400">manager@bawarchiroyale.in</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Admin & Tax Authority</span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                  onClick={() => setProfileOpen(false)}
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Restaurant Profile</span>
                </Link>
                <Link
                  href="/subscription"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                  onClick={() => setProfileOpen(false)}
                >
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>Subscription & Plans</span>
                </Link>
                <Link
                  href="/platform-admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-indigo-700 font-bold hover:bg-indigo-50"
                  onClick={() => setProfileOpen(false)}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Platform Super Admin</span>
                </Link>
                <Link
                  href="/staff"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                  onClick={() => setProfileOpen(false)}
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span>Shift / Cash Drawers</span>
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Lock Terminal / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
