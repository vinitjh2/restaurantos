'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  BookOpen,
  Store,
  ChefHat,
  Boxes,
  Truck,
  Users,
  ShieldCheck,
  CalendarCheck,
  CircleDollarSign,
  GitFork,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Terminal,
  Receipt,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState('all');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Banner / Hero */}
      <div className="bg-slate-950 text-white border-b border-slate-800 py-10 px-6 sm:px-12 print:bg-white print:text-black print:border-b-2">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-950/30 font-bold px-3 py-1">
                OPERATOR HANDBOOK v1.0
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-950/30 font-bold px-3 py-1">
                GST 5% COMPLIANT
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white print:text-black">
              Restaurant<span className="text-orange-500">OS</span> Complete Tutorial
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl print:text-slate-600">
              The official operator guide and training manual for cashiers, waitstaff, kitchen captains, inventory managers, and restaurant owners.
            </p>
          </div>

          {/* Action Buttons: Direct Download PDF & Print */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <a
              href="/downloads/RestaurantOS_Owner_Beginner_Manual.pdf"
              download="RestaurantOS_Owner_Beginner_Manual.pdf"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Owner Beginner Guide (PDF)
            </a>
            <a
              href="/downloads/RestaurantOS-User-Tutorial.pdf"
              download="RestaurantOS-Official-User-Tutorial.pdf"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Technical Manual
            </a>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2 px-5 py-3 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Table of Contents */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10 grid grid-cols-12 gap-8">
        {/* Left Sticky Table of Contents (3 cols on desktop) */}
        <aside className="col-span-12 lg:col-span-4 print:hidden">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Table of Contents</h3>
            </div>
            <nav className="space-y-1 text-xs font-semibold">
              {[
                { id: 'module-1', title: '1. Dashboard & Navigation', icon: Store },
                { id: 'module-2', title: '2. POS Billing & Order Channels', icon: Store },
                { id: 'module-3', title: '3. Tables, Modifiers & Bill Splits', icon: Receipt },
                { id: 'module-4', title: '4. Kitchen Display System (KDS)', icon: ChefHat },
                { id: 'module-5', title: '5. Recipes & Stock Deduction (BOM)', icon: Boxes },
                { id: 'module-6', title: '6. Procurement & Goods Received', icon: Truck },
                { id: 'module-7', title: '7. Customer CRM & Loyalty Points', icon: Users },
                { id: 'module-8', title: '8. Staff RBAC & 4-Digit PIN Security', icon: ShieldCheck },
                { id: 'module-9', title: '9. Shift Attendance & Payroll', icon: CalendarCheck },
                { id: 'module-10', title: '10. Cash Register Till Shifts', icon: CircleDollarSign },
                { id: 'module-11', title: '11. Multi-Branch Operations', icon: GitFork },
                { id: 'module-12', title: '12. Offline Mode & Hardware Setup', icon: WifiOff },
                { id: 'shortcuts', title: 'Keyboard Shortcuts Cheat Sheet', icon: Terminal },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center justify-between p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.title}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </a>
              ))}
            </nav>

            {/* Quick Download Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80 text-center space-y-2">
              <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">Official Offline Copy</span>
              <p className="text-[11px] text-orange-800">Keep a printed A4 copy at the manager station for new staff onboarding.</p>
              <a
                href="/downloads/RestaurantOS-User-Tutorial.pdf"
                download
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF (44 KB)
              </a>
            </div>
          </div>
        </aside>

        {/* Right Tutorial Modules (8 cols on desktop) */}
        <main className="col-span-12 lg:col-span-8 space-y-12">
          {/* MODULE 1 */}
          <section id="module-1" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 1</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Dashboard & Global Navigation</h2>
              </div>
              <Store className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              RestaurantOS features a centralized enterprise layout. The left sidebar grants instant access to all 16 operational modules, while the top bar allows one-click switching between branches (Indiranagar, Koramangala, HSR Layout).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 mb-1">Executive Metric Cards</h4>
                <p className="text-xs text-slate-500">Real-time calculations for Gross Sales, Net Sales, Total Orders, Average Order Value (AOV), Pending Table Bills, and Operational Expenses.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 mb-1">Rush Hour Tracking</h4>
                <p className="text-xs text-slate-500">Interactive 24-hour Recharts graph pinpointing lunch and dinner rushes to optimize kitchen prep and staff allocation.</p>
              </div>
            </div>
          </section>

          {/* MODULE 2 */}
          <section id="module-2" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 2</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Point of Sale (POS) Billing & Order Channels</h2>
              </div>
              <Receipt className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Supported Order Channels:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <span className="p-2.5 rounded-xl border border-slate-200 font-semibold text-center bg-slate-50">Dine-In (Tables)</span>
                <span className="p-2.5 rounded-xl border border-slate-200 font-semibold text-center bg-slate-50">Takeaway (Counter)</span>
                <span className="p-2.5 rounded-xl border border-slate-200 font-semibold text-center bg-slate-50">Delivery (Distance)</span>
                <span className="p-2.5 rounded-xl border border-slate-200 font-semibold text-center bg-slate-50">Pickup (Scheduled)</span>
              </div>
            </div>

            <div className="rounded-2xl bg-orange-50/60 border border-orange-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-orange-900 font-bold text-xs">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                <span>Speed Billing Instructions:</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-orange-800 space-y-1">
                <li>Search menu items by dish name, short code (e.g. <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">PBM</code>), or scan item barcode.</li>
                <li>Tap items to configure portion sizes (Half, Full, Large) and modifiers (Extra Butter, Spice Level).</li>
                <li>Add specific guest instructions (e.g. &quot;Less spicy, no coriander&quot;).</li>
                <li>Tap <strong>Send KOT</strong> to route tickets to the kitchen, or <strong>Settle Bill</strong> to accept payment.</li>
              </ol>
            </div>
          </section>

          {/* MODULE 3 */}
          <section id="module-3" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 3</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Table Floor Actions, Discounts & Split Checks</h2>
              </div>
              <QrCode className="w-8 h-8 text-slate-300" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Essential Cashier Actions</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Hold & Resume Order:</strong> Pause an ongoing order to bill a counter customer; resume anytime with zero item loss.</li>
                  <li><strong>Table Transfer:</strong> Shift guests from Table 1 to Table 4 without voiding open tickets.</li>
                  <li><strong>Split Bill:</strong> Divide items evenly or tender separate receipts for split groups.</li>
                  <li><strong>Supervisor PIN Overrides:</strong> Discounts above 10% or order cancellations require a 4-digit manager PIN.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strict Indian UPI Verification Rule:</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Generating a dynamic UPI QR code is <strong>NEVER proof of payment</strong>. Cashiers must physically confirm soundbox announcement or customer success screen, then record the 12-digit bank UTR or tick the confirmation checkbox before settling.
                </p>
              </div>
            </div>
          </section>

          {/* MODULE 4 */}
          <section id="module-4" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 4</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Kitchen Display System (KDS) Station Workflow</h2>
              </div>
              <ChefHat className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              KDS replaces paper tickets with interactive digital cards on kitchen tablets. Items automatically route to designated preparation stations:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold">Main Kitchen<span className="block font-normal text-slate-500 text-[10px]">Curries, Biryanis</span></div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold">Bar<span className="block font-normal text-slate-500 text-[10px]">Cocktails, Spirits</span></div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold">Bakery<span className="block font-normal text-slate-500 text-[10px]">Desserts, Breads</span></div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold">Beverage Counter<span className="block font-normal text-slate-500 text-[10px]">Chai, Shakes</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Urgency Color Escalation Tiers:</h4>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">Normal: &lt; 10 Mins (Green)</span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold">Warning: 10–20 Mins (Orange)</span>
                <span className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 font-bold">Critical Rush: &gt; 20 Mins (Red Flashing)</span>
              </div>
            </div>
          </section>

          {/* MODULE 5 */}
          <section id="module-5" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 5</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Recipe Management & BOM Stock Deduction</h2>
              </div>
              <Boxes className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every dish is linked to a Bill of Materials (BOM) recipe. When an order is settled, raw material inventory automatically decrements:
            </p>
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-1">
              <span className="text-orange-400 font-bold">// Example BOM Deduction for Paneer Butter Masala (1 Serving)</span>
              <div>• Malai Paneer: -200g (₹48.00)</div>
              <div>• Amul Butter: -30g (₹18.00)</div>
              <div>• Fresh Cream: -40ml (₹12.00)</div>
              <div>• Tomato Gravy Base: -100g (₹10.50)</div>
              <div>• Spices & Seasoning: Batch (₹4.00)</div>
              <div className="text-emerald-400 font-bold pt-1">Total Recipe Cost: ₹92.50 | Selling Price: ₹340.00 | Gross Margin: 72.8%</div>
            </div>
          </section>

          {/* MODULE 6 */}
          <section id="module-6" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 6</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Procurement, Purchase Orders & Goods Received</h2>
              </div>
              <Truck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Maintain structured procurement with formal vendor ledgers, Purchase Orders (PO), and Goods Received Notes (GRN) with QA inspection:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1. Purchase Order</span>
                <span className="text-slate-500">Draft POs, specify expected delivery dates, and issue to dairy, poultry, and vegetable vendors.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">2. GRN Inspection</span>
                <span className="text-slate-500">Verify delivered goods against challan. Record accepted vs rejected quantities with batch numbers and expiry dates.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">3. Vendor Payment</span>
                <span className="text-slate-500">Track outstanding dues and issue vouchers via Bank NEFT, Cheque, UPI, or Cash.</span>
              </div>
            </div>
          </section>

          {/* MODULE 7 */}
          <section id="module-7" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 7</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Customer CRM, Loyalty Program & Vouchers</h2>
              </div>
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-sm text-slate-600">Enter a customer&apos;s 10-digit mobile number during billing to view tier status and redeem points.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 font-bold text-amber-900">Bronze<span className="block font-normal text-xs text-amber-700">1 pt / ₹100</span></div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 font-bold text-slate-800">Silver<span className="block font-normal text-xs text-slate-600">1.5 pt / ₹100</span></div>
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 font-bold text-yellow-900">Gold<span className="block font-normal text-xs text-yellow-700">2 pt / ₹100</span></div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 font-bold text-purple-900">Platinum<span className="block font-normal text-xs text-purple-700">3 pt / ₹100</span></div>
              </div>
            </div>
          </section>

          {/* MODULE 8 */}
          <section id="module-8" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 8</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Staff Roles & Granular Permissions</h2>
              </div>
              <ShieldCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              RestaurantOS enforces 8 enterprise roles with strict security barriers. Cashiers and waiters cannot view P&L financial data, while kitchen staff only see order dispatch controls.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['OWNER', 'ADMINISTRATOR', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'INVENTORY_MANAGER', 'ACCOUNTANT'].map((role) => (
                <span key={role} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800">
                  {role}
                </span>
              ))}
            </div>
          </section>

          {/* MODULE 9 */}
          <section id="module-9" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 9</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Shift Attendance & Pro-Rated Payroll</h2>
              </div>
              <CalendarCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Staff clock in and out using their 4-digit PIN at the POS counter. Late check-ins (&gt;15 min) are automatically flagged. Monthly payroll calculates fixed salary or hourly wages pro-rated by actual days present and overtime worked.
            </p>
          </section>

          {/* MODULE 10 */}
          <section id="module-10" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 10</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Cash Register Till Shifts & Variance Tracking</h2>
              </div>
              <CircleDollarSign className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p>Every cashier shift must be opened with an opening cash float and closed with a physical cash count:</p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                <div>Expected Cash = Opening Float + Cash Sales - Cash Drops - Cash Refunds</div>
                <div>Cash Variance = Actual Physical Cash - Expected Cash</div>
                <div className="text-rose-600 font-bold pt-1">Negative variance = Cash Shortage (Investigated by manager)</div>
              </div>
            </div>
          </section>

          {/* MODULE 11 */}
          <section id="module-11" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 11</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Multi-Branch Outlets & Cross-Branch Transfers</h2>
              </div>
              <GitFork className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Operate multiple outlets (IND Indiranagar, KOR Koramangala, HSR Cloud Kitchen) with complete database tenant isolation. Initiate raw stock transfers between central base kitchens and satellite outlets with in-transit verification.
            </p>
          </section>

          {/* MODULE 12 */}
          <section id="module-12" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">MODULE 12</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Offline-First Mode & Hardware Drivers</h2>
              </div>
              <WifiOff className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                If the restaurant broadband fails, <strong>billing does not stop</strong>. The POS switches seamlessly to offline mode, storing orders in IndexedDB with unique UUID idempotency keys. Tax receipts print locally, and orders auto-sync once internet returns.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block mb-1">Hardware Support Specifications:</span>
                <div>• <strong>Thermal Receipt Printers:</strong> 80mm & 58mm ESC/POS (Epson TM-T82, Star, TVS RP-3200)</div>
                <div>• <strong>Cash Drawer Solenoid:</strong> Auto-kicked via RJ12 port on cash settlement (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">ESC p 0 25 250</code>)</div>
                <div>• <strong>Customer Pole Display (CFD):</strong> Secondary monitor stream showing live items, subtotal, and dynamic UPI QR</div>
                <div>• <strong>Barcode / Weigh Scales:</strong> USB HID keyboard emulation scanner listener hook</div>
              </div>
            </div>
          </section>

          {/* SHORTCUTS CHEAT SHEET */}
          <section id="shortcuts" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">QUICK REFERENCE</span>
                <h2 className="text-2xl font-black text-white mt-1">Cashier Keyboard Shortcuts</h2>
              </div>
              <Terminal className="w-8 h-8 text-slate-600" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Quick Dish Search Focus</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">F2</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Send KOT to Kitchen</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">F4</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Open Payment Modal</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">F8</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Fast Cash Exact Tender</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">F9</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Hold Active Order</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">Ctrl + H</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Kick Cash Drawer</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-orange-400 font-mono font-bold">Ctrl + D</kbd>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
