"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DineSutraLogo } from "@/components/DineSutraLogo";
import { SutraUniverseLogo } from "@/components/SutraUniverseLogo";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  UtensilsCrossed,
  ChefHat,
  BookOpen,
  Boxes,
  Receipt,
  Truck,
  Users,
  UserCheck,
  CalendarCheck,
  CircleDollarSign,
  BarChart3,
  GitFork,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/stores/restaurant-store";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "warning";
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "POS Terminal", href: "/pos", icon: Store, badge: "Live" },
      { title: "Live Orders", href: "/orders", icon: ShoppingBag, badge: "9", badgeVariant: "warning" },
      { title: "Tables & Floor", href: "/tables", icon: UtensilsCrossed },
      { title: "Kitchen (KDS)", href: "/kitchen", icon: ChefHat },
      { title: "Waiter Station", href: "/waiter", icon: UserCheck, badge: "Floor" },
    ],
  },
  {
    label: "Catalog & Stock",
    items: [
      { title: "Menu", href: "/menu", icon: BookOpen },
      { title: "Inventory", href: "/inventory", icon: Boxes, badge: "Low", badgeVariant: "destructive" },
      { title: "Purchases", href: "/purchases", icon: Receipt },
      { title: "Suppliers", href: "/suppliers", icon: Truck },
    ],
  },
  {
    label: "People & CRM",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Staff", href: "/staff", icon: UserCheck },
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Finance & Audit",
    items: [
      { title: "Reports & GST", href: "/reports", icon: BarChart3 },
      { title: "Expenses", href: "/expenses", icon: CircleDollarSign },
      { title: "Anti-Theft Security", href: "/security", icon: ShieldAlert, badge: "Alerts", badgeVariant: "destructive" },
    ],
  },
  {
    label: "Settings & Admin",
    items: [
      { title: "Restaurant Settings", href: "/settings", icon: Settings },
      { title: "Integrations", href: "/settings/integrations", icon: Layers },
      { title: "Branches", href: "/branches", icon: GitFork },
      { title: "Subscription", href: "/subscription", icon: CreditCard },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useRestaurantStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out z-30 select-none",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50/80 border border-rose-200/90 shadow-2xs p-1">
            <DineSutraLogo variant="icon" className="h-7 w-7" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                Dine<span className="text-amber-600">Sutra</span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1 flex items-center gap-1">
                <SutraUniverseLogo variant="icon" className="w-3 h-3" />
                <span>By SutraUniverse</span>
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu Scroll Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isSidebarCollapsed && (
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400/90 mb-1.5">
                {section.label}
              </h4>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-amber-400"
                      : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 hover:translate-x-0.5"
                  )}
                  title={isSidebarCollapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-xs font-semibold">{item.title}</span>
                  )}

                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                        item.badgeVariant === "destructive"
                          ? "bg-rose-100 text-rose-700"
                          : item.badgeVariant === "warning"
                          ? "bg-amber-100 text-amber-800"
                          : isActive
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Ecosystem Cross-Link: Stay Sutra Website */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-2">
          <a
            href="https://staysutra.sutrauniverse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 p-2.5 text-xs font-semibold text-indigo-900 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-bold">Stay Sutra</span>
            </div>
            <span className="rounded bg-indigo-100/90 px-1.5 py-0.5 text-[9px] font-bold text-indigo-800 group-hover:bg-indigo-200 transition-colors">
              Website ↗
            </span>
          </a>
        </div>
      )}

      {/* Footer System Status */}
      {!isSidebarCollapsed && (
        <div className="border-t border-slate-100 p-3 bg-slate-50/60 m-2 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-bold text-slate-800">DineSutra KOT Engine</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500">
            <span>SutraUniverse Cloud</span>
            <span className="font-mono font-bold text-amber-700">v2.4 Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
