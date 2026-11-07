"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Send,
  Camera,
  Search,
  Users,
  CheckCircle,
  WifiOff,
  Wifi,
  Clock,
  ChefHat,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCameraScanner } from "@/components/hardware/qr-camera-scanner";
import { offlineStorage, generateOfflineSyncId } from "@/lib/offline/offline-storage";

interface MobileMenuItem {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  dietType: "VEG" | "NON_VEG";
  price: number;
  availableModifiers?: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers?: string[];
  cookingNotes?: string;
}

interface LiveKOTItem {
  id: string;
  itemName: string;
  quantity: number;
  status: string;
}

interface LiveTableKOT {
  id: string;
  kotNumber: string;
  status: "NEW" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED";
  createdAt: string;
  station: string;
  items: LiveKOTItem[];
}

export default function MobileWaiterPage() {
  const [activeTab, setActiveTab] = useState<"MENU" | "STATUS">("MENU");
  const [tables] = useState(["T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-07", "T-08", "T-09", "T-10"]);
  const [selectedTable, setSelectedTable] = useState("T-01");
  const [guestCount, setGuestCount] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Customization & Modifier Modal State
  const [editingItem, setEditingItem] = useState<MobileMenuItem | null>(null);
  const [customModifiers, setCustomModifiers] = useState<string[]>([]);
  const [customCookingNotes, setCustomCookingNotes] = useState("");

  // Live Table KOTs State
  const [tableKOTs, setTableKOTs] = useState<LiveTableKOT[]>([]);
  const [loadingKOTs, setLoadingKOTs] = useState(false);

  // Menu catalog with modifiers
  const [menuItems] = useState<MobileMenuItem[]>([
    {
      id: "item-pbm",
      name: "Paneer Butter Masala",
      shortCode: "PBM",
      category: "Mains",
      dietType: "VEG",
      price: 320,
      availableModifiers: ["Less Spicy", "Jain Prep (No Onion/Garlic)", "Extra Cream (+₹30)"],
    },
    {
      id: "item-dal",
      name: "Dal Makhani",
      shortCode: "DM",
      category: "Mains",
      dietType: "VEG",
      price: 260,
      availableModifiers: ["Extra Butter (+₹20)", "Mild Spice", "Double Tadka (+₹25)"],
    },
    {
      id: "item-biryani",
      name: "Murgh Dum Biryani",
      shortCode: "MDB",
      category: "Biryani",
      dietType: "NON_VEG",
      price: 350,
      availableModifiers: ["Extra Spicy", "Extra Salan (+₹30)", "Boneless Meat (+₹50)"],
    },
    {
      id: "item-tikka",
      name: "Paneer Tikka Angara",
      shortCode: "PTA",
      category: "Starters",
      dietType: "VEG",
      price: 290,
      availableModifiers: ["Crispy Charred", "Extra Mint Chutney", "Jain Preparation"],
    },
    {
      id: "item-naan",
      name: "Butter Garlic Naan",
      shortCode: "BGN",
      category: "Breads",
      dietType: "VEG",
      price: 65,
      availableModifiers: ["Extra Crispy", "Less Butter", "No Garlic"],
    },
    {
      id: "item-lassi",
      name: "Amritsari Sweet Lassi",
      shortCode: "LSI",
      category: "Beverages",
      dietType: "VEG",
      price: 90,
      availableModifiers: ["Less Sugar", "Extra Malai (+₹15)", "No Ice"],
    },
    {
      id: "item-jamun",
      name: "Gulab Jamun (2 pcs)",
      shortCode: "GJ",
      category: "Desserts",
      dietType: "VEG",
      price: 85,
      availableModifiers: ["Serve Warm", "Add Vanilla Ice Cream (+₹40)"],
    },
  ]);

  const categories = ["All", "Starters", "Mains", "Biryani", "Breads", "Beverages", "Desserts"];

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch live KOTs for the selected table
  const fetchTableKOTs = useCallback(async () => {
    setLoadingKOTs(true);
    try {
      const res = await fetch(`/api/kds/tickets?table=${selectedTable}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTableKOTs(data.tickets || []);
        }
      }
    } catch {
      // Mock fallback if offline
      setTableKOTs([
        {
          id: "kot-mock-1",
          kotNumber: "KOT-082",
          status: "PREPARING",
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          station: "MAIN_KITCHEN",
          items: [
            { id: "1", itemName: "Murgh Dum Biryani", quantity: 2, status: "COOKING" },
            { id: "2", itemName: "Butter Garlic Naan", quantity: 3, status: "READY" },
          ],
        },
      ]);
    } finally {
      setLoadingKOTs(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (activeTab === "STATUS") {
      fetchTableKOTs();
    }
  }, [activeTab, selectedTable, fetchTableKOTs]);

  const handleOpenCustomize = (item: MobileMenuItem) => {
    setEditingItem(item);
    const existing = cart.find((i) => i.id === item.id);
    setCustomModifiers(existing?.selectedModifiers || []);
    setCustomCookingNotes(existing?.cookingNotes || "");
  };

  const handleSaveCustomization = () => {
    if (!editingItem) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === editingItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                selectedModifiers: customModifiers,
                cookingNotes: customCookingNotes,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: editingItem.id,
          name: editingItem.name,
          price: editingItem.price,
          quantity: 1,
          selectedModifiers: customModifiers,
          cookingNotes: customCookingNotes,
        },
      ];
    });
    setEditingItem(null);
  };

  const handleQuickAdd = (item: MobileMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const totalLines = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCategory === "All" || i.category === selectedCategory;
    const matchSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDispatchKOT = async () => {
    if (cart.length === 0) return;

    try {
      const kotPayload = {
        tableNumber: selectedTable,
        guestCount,
        station: "MAIN_KITCHEN",
        items: cart.map((i) => ({
          menuItemId: i.id,
          itemName: i.name,
          quantity: i.quantity,
          cookingNotes: i.cookingNotes || "",
          modifiers: i.selectedModifiers || [],
        })),
        clientTimestamp: Date.now(),
      };

      if (navigator.onLine) {
        const res = await fetch("/api/pos/orders/kot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kotPayload),
        });
        if (!res.ok) throw new Error("Server KOT rejection");
      } else {
        const opId = generateOfflineSyncId("IND");
        await offlineStorage.enqueueOperation({
          uuid: opId,
          deviceId: offlineStorage.getDeviceId(),
          tenantId: "org-bawarchi",
          branchId: "IND",
          userId: "waiter-mobile",
          operationType: "CREATE_ORDER",
          timestamp: Date.now(),
          payload: kotPayload,
          syncStatus: "PENDING",
          retryCount: 0,
        });
      }

      setDispatchSuccess(`Dispatched KOT to Kitchen for Table ${selectedTable}!`);
      setCart([]);
      setTimeout(() => setDispatchSuccess(null), 3000);
      // Switch to status view so waiter can track kitchen progress
      setActiveTab("STATUS");
    } catch (err: any) {
      alert("Error dispatching KOT: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 pb-24 text-slate-900">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xs">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Waiter Ordering</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">RestaurantOS Mobile</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Wifi className="h-3 w-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
              <WifiOff className="h-3 w-3" /> Offline
            </span>
          )}

          <button
            onClick={() => setScannerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            title="Scan Table QR"
          >
            <Camera className="h-4 w-4 text-amber-600" />
          </button>
        </div>
      </header>

      {/* Mode Navigation Tabs (Order Taking vs Live Status) */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab("MENU")}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === "MENU"
              ? "border-amber-600 text-amber-700 bg-amber-50/40"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Menu & Order ({totalLines})
        </button>
        <button
          onClick={() => setActiveTab("STATUS")}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === "STATUS"
              ? "border-amber-600 text-amber-700 bg-amber-50/40"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Table Status ({selectedTable})
        </button>
      </div>

      {/* Table & Guest Count Selector Strip */}
      <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Table:</span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="h-8 rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs font-bold text-slate-900 focus:outline-none"
          >
            {tables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Guests:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="h-6 w-6 rounded bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center"
            >
              -
            </button>
            <span className="w-5 text-center text-xs font-bold">{guestCount}</span>
            <button
              onClick={() => setGuestCount(guestCount + 1)}
              className="h-6 w-6 rounded bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {dispatchSuccess && (
        <div className="mx-3 my-2 flex items-center gap-2 rounded-xl bg-emerald-600 p-3 text-white shadow-md animate-in fade-in-50">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{dispatchSuccess}</span>
        </div>
      )}

      {/* TAB 1: MENU & ORDER TAKING */}
      {activeTab === "MENU" && (
        <>
          {/* Search Input */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish or code (PBM, MDB)..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Pills (Horizontal Scroll) */}
          <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          <div className="flex-1 px-3 space-y-2">
            {filteredItems.map((item) => {
              const inCart = cart.find((i) => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs active:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            item.dietType === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                        <span className="font-mono text-[10px] font-semibold text-slate-400">
                          {item.shortCode}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-0.5">{item.name}</h3>
                      <p className="text-xs font-extrabold text-amber-700 mt-0.5">{formatINR(item.price)}</p>
                    </div>

                    {/* Quantity Stepper */}
                    {inCart ? (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-1">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs hover:bg-slate-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-amber-900">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white shadow-2xs hover:bg-amber-700"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAdd(item)}
                        className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 text-xs font-bold"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                      </Button>
                    )}
                  </div>

                  {/* Modifiers & Special Instructions Action */}
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px]">
                    <button
                      onClick={() => handleOpenCustomize(item)}
                      className="flex items-center gap-1 text-slate-500 hover:text-amber-700 font-semibold"
                    >
                      <MessageSquare className="h-3 w-3 text-amber-600" />
                      {inCart?.selectedModifiers?.length || inCart?.cookingNotes ? (
                        <span className="text-amber-700 font-bold">
                          Customized ({inCart.selectedModifiers?.length || 0})
                        </span>
                      ) : (
                        <span>Special notes & modifiers</span>
                      )}
                    </button>
                    {inCart?.cookingNotes && (
                      <span className="text-slate-400 italic truncate max-w-[150px]">
                        "{inCart.cookingNotes}"
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Bottom Dispatch Action Bar */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Table {selectedTable} • {totalLines} Items
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">{formatINR(totalAmount)}</p>
                </div>
                <Button
                  onClick={handleDispatchKOT}
                  className="h-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 text-xs font-bold text-white shadow-md hover:from-amber-700 hover:to-orange-700"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send KOT to Kitchen
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: LIVE TABLE KOT STATUS */}
      {activeTab === "STATUS" && (
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xs font-bold text-slate-800">Active Kitchen Orders</h2>
              <p className="text-[10px] text-slate-400">Live KDS status for Table {selectedTable}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTableKOTs}
              className="h-7 text-[11px]"
            >
              Refresh
            </Button>
          </div>

          {loadingKOTs ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading table orders...</div>
          ) : tableKOTs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No active kitchen orders</p>
              <p className="text-[11px] text-slate-400 mt-1">Switch to Menu to punch an order.</p>
            </div>
          ) : (
            tableKOTs.map((kot) => {
              const statusColors = {
                NEW: "bg-blue-50 text-blue-700 border-blue-200",
                ACCEPTED: "bg-purple-50 text-purple-700 border-purple-200",
                PREPARING: "bg-amber-50 text-amber-800 border-amber-300",
                READY: "bg-emerald-50 text-emerald-800 border-emerald-300",
                SERVED: "bg-slate-100 text-slate-600 border-slate-200",
              };

              return (
                <div
                  key={kot.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">{kot.kotNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({kot.station})
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${statusColors[kot.status] || ""}`}
                    >
                      {kot.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {kot.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-0.5"
                      >
                        <span className="text-slate-800 font-medium">
                          {item.quantity} × {item.itemName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.status || kot.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Ordered: {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {kot.status === "READY" && (
                      <span className="text-emerald-600 font-bold animate-pulse">
                        Ready to pick up from counter!
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modifiers & Special Instructions Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{editingItem.name}</h3>
              <p className="text-[11px] text-slate-500">Configure cooking instructions & modifiers</p>
            </div>

            {/* Modifiers Options */}
            {editingItem.availableModifiers && editingItem.availableModifiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Kitchen Modifiers</label>
                <div className="space-y-1">
                  {editingItem.availableModifiers.map((mod) => {
                    const isChecked = customModifiers.includes(mod);
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setCustomModifiers(customModifiers.filter((m) => m !== mod));
                          } else {
                            setCustomModifiers([...customModifiers, mod]);
                          }
                        }}
                        className={`flex w-full items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all ${
                          isChecked
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>{mod}</span>
                        {isChecked && <CheckCircle className="h-3.5 w-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Cooking Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Special Cooking Instructions
              </label>
              <textarea
                value={customCookingNotes}
                onChange={(e) => setCustomCookingNotes(e.target.value)}
                placeholder="e.g. Jain preparation, allergic to peanuts, extra hot..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="flex-1 h-9 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomization}
                className="flex-1 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Apply to Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Camera Scanner Modal */}
      <QrCameraScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(code) => {
          if (code.startsWith("T-") || tables.includes(code)) {
            setSelectedTable(code);
          } else {
            setSearchQuery(code);
          }
        }}
      />
    </div>
  );
}
