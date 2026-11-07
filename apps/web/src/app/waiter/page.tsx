"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Send,
  Users,
  CheckCircle2,
  Clock,
  ChefHat,
  Receipt,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  Smartphone,
  Flame,
  Layers,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TableSeat {
  id: string;
  tableNumber: string;
  floor: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED" | "DIRTY";
  currentBill?: number;
  seatedMinutes?: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  dietType: "VEG" | "NON_VEG";
  price: number;
  shortCode?: string;
  availableModifiers?: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  cookingNotes?: string;
}

interface LiveKOT {
  id: string;
  kotNumber: string;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  createdAt: string;
  items: Array<{ itemName: string; quantity: number; station?: string }>;
}

const DEFAULT_TABLES: TableSeat[] = [
  { id: "t1", tableNumber: "T-01", floor: "Ground Floor", capacity: 2, status: "OCCUPIED", currentBill: 820, seatedMinutes: 28 },
  { id: "t2", tableNumber: "T-02", floor: "Ground Floor", capacity: 4, status: "AVAILABLE" },
  { id: "t3", tableNumber: "T-03", floor: "Ground Floor", capacity: 4, status: "OCCUPIED", currentBill: 1450, seatedMinutes: 45 },
  { id: "t4", tableNumber: "T-04", floor: "Ground Floor", capacity: 6, status: "BILL_REQUESTED", currentBill: 2180, seatedMinutes: 62 },
  { id: "t5", tableNumber: "T-05", floor: "Ground Floor", capacity: 4, status: "AVAILABLE" },
  { id: "t6", tableNumber: "T-06", floor: "First Floor", capacity: 4, status: "OCCUPIED", currentBill: 640, seatedMinutes: 15 },
  { id: "t7", tableNumber: "T-07", floor: "First Floor", capacity: 8, status: "AVAILABLE" },
  { id: "t8", tableNumber: "T-08", floor: "First Floor", capacity: 2, status: "AVAILABLE" },
  { id: "t9", tableNumber: "T-09", floor: "Rooftop Lounge", capacity: 4, status: "OCCUPIED", currentBill: 3400, seatedMinutes: 80 },
  { id: "t10", tableNumber: "T-10", floor: "Rooftop Lounge", capacity: 4, status: "AVAILABLE" },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", name: "Paneer Tikka Angara", category: "Starters", dietType: "VEG", price: 290, shortCode: "PTA" },
  { id: "m2", name: "Chicken Malai Tikka", category: "Starters", dietType: "NON_VEG", price: 340, shortCode: "CMT" },
  { id: "m3", name: "Crispy Corn Pepper Salt", category: "Starters", dietType: "VEG", price: 240, shortCode: "CCS" },
  { id: "m4", name: "Paneer Butter Masala", category: "Main Course", dietType: "VEG", price: 320, shortCode: "PBM" },
  { id: "m5", name: "Murgh Lababdar", category: "Main Course", dietType: "NON_VEG", price: 380, shortCode: "MLB" },
  { id: "m6", name: "Dal Makhani Royale", category: "Main Course", dietType: "VEG", price: 260, shortCode: "DMR" },
  { id: "m7", name: "Murgh Dum Biryani", category: "Biryani", dietType: "NON_VEG", price: 350, shortCode: "MDB" },
  { id: "m8", name: "Subz Dum Biryani", category: "Biryani", dietType: "VEG", price: 280, shortCode: "SDB" },
  { id: "m9", name: "Butter Garlic Naan", category: "Breads", dietType: "VEG", price: 65, shortCode: "BGN" },
  { id: "m10", name: "Tandoori Roti Butter", category: "Breads", dietType: "VEG", price: 35, shortCode: "TRB" },
  { id: "m11", name: "Amritsari Sweet Lassi", category: "Beverages", dietType: "VEG", price: 90, shortCode: "ASL" },
  { id: "m12", name: "Fresh Lime Soda", category: "Beverages", dietType: "VEG", price: 75, shortCode: "FLS" },
  { id: "m13", name: "Gulab Jamun (2 pcs)", category: "Desserts", dietType: "VEG", price: 85, shortCode: "GJM" },
];

export default function WaiterTerminalPage() {
  const [tables, setTables] = useState<TableSeat[]>(DEFAULT_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [selectedFloor, setSelectedFloor] = useState<string>("All");
  const [selectedTable, setSelectedTable] = useState<TableSeat>(DEFAULT_TABLES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [captainName, setCaptainName] = useState("Captain Vikram Singh");
  const [isSendingKOT, setIsSendingKOT] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"NEW_ORDER" | "ACTIVE_KOTS">("NEW_ORDER");
  const [liveKOTs, setLiveKOTs] = useState<LiveKOT[]>([
    {
      id: "kot-1",
      kotNumber: "KOT #42",
      status: "PREPARING",
      createdAt: "12 mins ago",
      items: [
        { itemName: "Paneer Tikka Angara", quantity: 1, station: "Tandoor" },
        { itemName: "Fresh Lime Soda", quantity: 2, station: "Bar / Beverages" },
      ],
    },
  ]);

  // Load live tables and menu
  useEffect(() => {
    fetch("/api/pos/tables")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.tables) && data.tables.length > 0) {
          const mapped: TableSeat[] = data.tables.map((t: any) => ({
            id: t.id,
            tableNumber: t.tableNumber,
            floor: t.floor || "Ground Floor",
            capacity: t.capacity || 4,
            status: t.status || "AVAILABLE",
            currentBill: t.status === "OCCUPIED" ? 950 : undefined,
            seatedMinutes: t.status === "OCCUPIED" ? 22 : undefined,
          }));
          setTables(mapped);
          setSelectedTable(mapped[0]);
        }
      })
      .catch(() => {});

    fetch("/api/pos/menu")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
          const mapped: MenuItem[] = data.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            category: it.category || "Main Course",
            dietType: it.dietary === "NON_VEG" || it.dietType === "NON_VEG" ? "NON_VEG" : "VEG",
            price: Number(it.basePrice || it.price || 120),
            shortCode: it.shortCode,
          }));
          setMenuItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const floors = ["All", ...Array.from(new Set(tables.map((t) => t.floor)))];
  const categories = ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredTables = tables.filter((t) =>
    selectedFloor === "All" ? true : t.floor === selectedFloor
  );

  const filteredMenu = menuItems.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          category: item.category,
        },
      ];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleAddInstruction = (itemId: string, note: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, cookingNotes: note } : i))
    );
  };

  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSendKOT = async () => {
    if (cart.length === 0) return;
    setIsSendingKOT(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/pos/orders/kot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "DINE_IN",
          tableNumber: selectedTable.tableNumber,
          customerName: `${captainName} (Table ${selectedTable.tableNumber})`,
          guestCount,
          items: cart,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to dispatch KOT to kitchen");
      }

      const newKOTNumber = `KOT #${Math.floor(100 + Math.random() * 900)}`;
      setLiveKOTs((prev) => [
        {
          id: `kot-${Date.now()}`,
          kotNumber: newKOTNumber,
          status: "PENDING",
          createdAt: "Just now",
          items: cart.map((c) => ({ itemName: c.name, quantity: c.quantity })),
        },
        ...prev,
      ]);

      // Update table to occupied
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === selectedTable.tableNumber
            ? { ...t, status: "OCCUPIED", currentBill: (t.currentBill || 0) + cartSubtotal, seatedMinutes: t.seatedMinutes || 1 }
            : t
        )
      );
      setSelectedTable((prev) => ({
        ...prev,
        status: "OCCUPIED",
        currentBill: (prev.currentBill || 0) + cartSubtotal,
      }));

      setCart([]);
      setFeedback({ type: "success", text: `${newKOTNumber} sent to Kitchen successfully!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Could not dispatch KOT" });
    } finally {
      setIsSendingKOT(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Waiter & Captain Floor Terminal
              </h1>
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                Floor Service Station
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-speed table ordering, modifiers, and instant kitchen ticket (KOT) routing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/mobile/waiter"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Smartphone className="h-3.5 w-3.5 text-amber-600" />
            <span>Switch to Phone Handheld</span>
          </Link>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{captainName}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Tables Floor Map (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Floor Tables
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {filteredTables.length}
              </span>
            </div>
            {/* Floor Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px]">
              {floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                    selectedFloor === fl
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {fl.replace(" Floor", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className="flex-1 overflow-y-auto p-1 pt-3 grid grid-cols-2 gap-2.5">
            {filteredTables.map((t) => {
              const isSelected = selectedTable.tableNumber === t.tableNumber;
              const isOccupied = t.status === "OCCUPIED";
              const isBillReq = t.status === "BILL_REQUESTED";

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTable(t);
                    setCart([]);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all relative ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40"
                      : isBillReq
                      ? "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                      : isOccupied
                      ? "border-rose-200 bg-rose-50/40 hover:border-rose-300"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-extrabold text-slate-900">{t.tableNumber}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isBillReq
                          ? "bg-amber-500 animate-pulse"
                          : isOccupied
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400 font-medium">
                    {t.floor} • {t.capacity} Seats
                  </div>

                  {isOccupied && (
                    <div className="mt-2 pt-1.5 border-t border-rose-100 flex items-center justify-between text-[11px] font-bold text-rose-700">
                      <span>{t.currentBill ? formatINR(t.currentBill) : "Active"}</span>
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {t.seatedMinutes || 15}m
                      </span>
                    </div>
                  )}

                  {isBillReq && (
                    <div className="mt-2 pt-1.5 border-t border-amber-200 text-[10px] font-bold text-amber-800">
                      Bill Requested
                    </div>
                  )}

                  {!isOccupied && !isBillReq && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-600 uppercase">
                      Ready to Seat
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Menu Catalog & KOT Cart (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs overflow-hidden">
          {/* Active Table Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-600 px-2.5 py-1 text-sm font-black text-white">
                {selectedTable.tableNumber}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {selectedTable.floor} • Capacity {selectedTable.capacity} Seats
                </div>
                <div className="text-[10px] text-slate-400">
                  Status: {selectedTable.status} {selectedTable.currentBill ? `· Running Total: ${formatINR(selectedTable.currentBill)}` : ""}
                </div>
              </div>
            </div>

            {/* View Switcher: New Order vs Active KOTs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveViewTab("NEW_ORDER")}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  activeViewTab === "NEW_ORDER" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                + Punch Items ({cart.length})
              </button>
              <button
                onClick={() => setActiveViewTab("ACTIVE_KOTS")}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  activeViewTab === "ACTIVE_KOTS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Live KOTs ({liveKOTs.length})
              </button>
            </div>
          </div>

          {activeViewTab === "NEW_ORDER" ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 mt-3 min-h-0">
              {/* Menu Catalog (7 cols) */}
              <div className="md:col-span-7 flex flex-col min-h-0">
                {/* Search & Category Pills */}
                <div className="space-y-2 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search dish or shortcode (e.g. PBM, Biryani)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          activeCategory === cat
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dishes Grid */}
                <div className="flex-1 overflow-y-auto p-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMenu.map((item) => {
                    const isVeg = item.dietType === "VEG";
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddToCart(item)}
                        className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {item.name}
                          </span>
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-xs border flex items-center justify-center p-0.5 ${
                              isVeg ? "border-emerald-600" : "border-rose-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isVeg ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{formatINR(item.price)}</span>
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] text-white font-bold">
                            <Plus className="h-2.5 w-2.5" /> Add
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Cart Slip (5 cols) */}
              <div className="md:col-span-5 flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 min-h-0">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                    New KOT Ticket
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold">Guests:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                      className="w-10 h-6 text-center border rounded bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-2">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Tap dishes on the left to add items to Table {selectedTable.tableNumber}.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="truncate pr-2">{item.name}</span>
                          <span>{formatINR(item.price * item.quantity)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-1.5 text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Cooking note (e.g. less spicy)..."
                            value={item.cookingNotes || ""}
                            onChange={(e) => handleAddInstruction(item.id, e.target.value)}
                            className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 w-36 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total & Send KOT Button */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>KOT Items Total:</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>

                  <Button
                    onClick={handleSendKOT}
                    disabled={cart.length === 0 || isSendingKOT}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 shadow-sm gap-2"
                  >
                    <Send className={`h-4 w-4 ${isSendingKOT ? "animate-pulse" : ""}`} />
                    <span>{isSendingKOT ? "Dispatching to Kitchen..." : "Fire KOT to Kitchen"}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Live KOTs for Selected Table */
            <div className="flex-1 overflow-y-auto mt-3 space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Active Kitchen Orders for Table {selectedTable.tableNumber}:
              </div>

              {liveKOTs.map((kot) => (
                <div
                  key={kot.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{kot.kotNumber}</span>
                      <span className="text-[11px] text-slate-400">Sent {kot.createdAt}</span>
                    </div>
                    <Badge variant={kot.status === "READY" ? "success" : "warning"} className="text-[10px]">
                      {kot.status}
                    </Badge>
                  </div>

                  <div className="divide-y divide-slate-200/60 pt-1">
                    {kot.items.map((it, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {it.quantity}x {it.itemName}
                        </span>
                        {it.station && (
                          <span className="text-[10px] text-slate-400 font-mono">[{it.station}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Pre-bill invoice printed for Table ${selectedTable.tableNumber}`)}
                  className="gap-2 text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
                >
                  <Receipt className="h-3.5 w-3.5 text-amber-600" />
                  <span>Print Pre-Bill for Table {selectedTable.tableNumber}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
