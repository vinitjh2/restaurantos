"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Flame,
  BookMarked,
  CreditCard,
  ShieldCheck,
  HardDrive,
  Smartphone,
  Tablet,
  TrendingUp,
  Layers,
  QrCode,
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
    label: "Main",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "POS", href: "/pos", icon: Store, badge: "Live" },
      { title: "Orders", href: "/orders", icon: ShoppingBag, badge: "9", badgeVariant: "warning" },
      { title: "Tables", href: "/tables", icon: UtensilsCrossed },
      { title: "Kitchen Display", href: "/kitchen", icon: ChefHat },
      { title: "Waiter Station", href: "/waiter", icon: UserCheck, badge: "Floor" },
      { title: "Mobile Waiter", href: "/mobile/waiter", icon: Smartphone, badge: "Phone" },
      { title: "Customer QR Menu", href: "/qr-order", icon: QrCode, badge: "Self" },
      { title: "Mobile POS", href: "/mobile/pos", icon: Tablet, badge: "Handheld" },
      { title: "Owner Mobile", href: "/mobile/owner", icon: TrendingUp, badge: "Live" },
    ],
  },
  {
    label: "Catalog & Inventory",
    items: [
      { title: "Menu", href: "/menu", icon: BookOpen },
      { title: "Inventory", href: "/inventory", icon: Boxes, badge: "Low", badgeVariant: "destructive" },
      { title: "Purchases", href: "/purchases", icon: Receipt },
      { title: "Suppliers", href: "/suppliers", icon: Truck },
    ],
  },
  {
    label: "Customers & Staff",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Staff", href: "/staff", icon: UserCheck },
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Finance & Insights",
    items: [
      { title: "Expenses", href: "/expenses", icon: CircleDollarSign },
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Branches", href: "/branches", icon: GitFork },
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Integrations", href: "/settings/integrations", icon: Layers, badge: "Modular" },
      { title: "Subscription & Plan", href: "/subscription", icon: CreditCard, badge: "SaaS" },
      { title: "Sync Monitor", href: "/sync-monitor", icon: HardDrive, badge: "Offline" },
      { title: "Tutorial & Manual", href: "/tutorial", icon: BookMarked, badge: "PDF" },
    ],
  },
  {
    label: "Platform Owner",
    items: [
      { title: "Super Admin", href: "/platform-admin", icon: ShieldCheck, badge: "Master" },
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
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-amber-400 text-white shadow-sm shadow-orange-500/20">
            <Flame className="h-5 w-5 fill-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                Restaurant<span className="text-amber-600">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                Enterprise F&B
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
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
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

      {/* Footer System Status */}
      {!isSidebarCollapsed && (
        <div className="border-t border-slate-100 p-3 bg-slate-50/50 m-2 rounded-xl border">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-medium text-slate-600">KOT Gateway Connected</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Socket.IO latency: 14ms</p>
        </div>
      )}
    </aside>
  );
}
