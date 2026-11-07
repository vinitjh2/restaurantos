"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingCart,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  CreditCard,
  Banknote,
  ChefHat,
  MessageSquare,
  AlertCircle,
  X,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  dietType: "VEG" | "NON_VEG";
  price: number;
  description: string;
  spiceLevel?: string;
  availableModifiers?: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cookingNotes?: string;
  modifiers?: string[];
}

function QrOrderContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "T-01";
  const branch = searchParams.get("branch") || "IND";

  const [dietFilter, setDietFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"PAY_LATER" | "PAY_ONLINE">("PAY_LATER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Customization Modal State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [itemCookingNotes, setItemCookingNotes] = useState("");

  const DEFAULT_CATALOG: MenuItem[] = [
    {
      id: "item-pbm",
      name: "Paneer Butter Masala",
      category: "Main Course",
      dietType: "VEG",
      price: 320,
      description: "Cottage cheese cubes simmered in a rich tomato, butter and cashew silk gravy.",
      spiceLevel: "Medium",
      availableModifiers: ["Less Spicy", "Jain (No Onion/Garlic)", "Extra Butter"],
    },
    {
      id: "item-biryani",
      name: "Murgh Dum Biryani",
      category: "Biryani",
      dietType: "NON_VEG",
      price: 350,
      description: "Slow-cooked fragrant long-grain basmati rice with marinated chicken & secret potli spices.",
      spiceLevel: "Spicy",
      availableModifiers: ["Extra Spicy", "Extra Salan", "Boneless"],
    },
    {
      id: "item-dal",
      name: "Dal Makhani Royale",
      category: "Main Course",
      dietType: "VEG",
      price: 260,
      description: "Slow-simmered black lentils cooked overnight on charcoal with rich cultured butter.",
      spiceLevel: "Mild",
      availableModifiers: ["Extra Cream", "Mild Tadka"],
    },
    {
      id: "item-tikka",
      name: "Paneer Tikka Angara",
      category: "Starters",
      dietType: "VEG",
      price: 290,
      description: "Charcoal-smoked cottage cheese skewers marinated in hung curd and red Kashmiri chili.",
      spiceLevel: "Medium",
      availableModifiers: ["Extra Crispy", "Mint Chutney"],
    },
    {
      id: "item-naan",
      name: "Butter Garlic Naan",
      category: "Breads",
      dietType: "VEG",
      price: 65,
      description: "Tandoor baked leavened flatbread brushed with garlic butter and fresh cilantro.",
      availableModifiers: ["Crisp", "No Garlic"],
    },
    {
      id: "item-lassi",
      name: "Amritsari Sweet Lassi",
      category: "Beverages",
      dietType: "VEG",
      price: 90,
      description: "Thick hand-churned yogurt beverage infused with saffron and green cardamom.",
      availableModifiers: ["Less Sugar", "Extra Malai"],
    },
    {
      id: "item-jamun",
      name: "Gulab Jamun (2 pcs)",
      category: "Desserts",
      dietType: "VEG",
      price: 85,
      description: "Warm golden milk-solid dumplings soaked in rose and saffron syrup.",
      availableModifiers: ["Serve Warm", "Add Ice Cream"],
    },
  ];

  const [menuCatalog, setMenuCatalog] = useState<MenuItem[]>(DEFAULT_CATALOG);

  useEffect(() => {
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
            description: it.description || `${it.category || "Chef special"} freshly prepared to order.`,
            spiceLevel: it.spiceLevel || "Medium",
            availableModifiers: it.modifiers?.flatMap((m: any) => m.options?.map((o: any) => o.name)) || [
              "Regular",
              "Less Spicy",
            ],
          }));
          setMenuCatalog(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback catalog for QR order:", err);
      });
  }, []);

  const handleQuickAdd = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleRemove = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const openCustomizeModal = (item: MenuItem) => {
    setCustomizingItem(item);
    const existing = cart.find((i) => i.id === item.id);
    setSelectedMods(existing?.modifiers || []);
    setItemCookingNotes(existing?.cookingNotes || "");
  };

  const saveCustomization = () => {
    if (!customizingItem) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === customizingItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === customizingItem.id
            ? { ...i, modifiers: selectedMods, cookingNotes: itemCookingNotes }
            : i
        );
      }
      return [
        ...prev,
        {
          id: customizingItem.id,
          name: customizingItem.name,
          price: customizingItem.price,
          quantity: 1,
          modifiers: selectedMods,
          cookingNotes: itemCookingNotes,
        },
      ];
    });
    setCustomizingItem(null);
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = Math.round(subtotal + tax);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/qr-order/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchCode: branch,
          tableNumber: table,
          customerName: customerName.trim() || `Guest at Table ${table}`,
          customerPhone: customerPhone.trim() || undefined,
          paymentWorkflow: paymentMode,
          items: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order submission failed");
      }

      setActiveOrder({
        orderNumber: data.orderNumber,
        kotNumber: data.kotNumber,
        tableNumber: data.tableNumber,
        grandTotal: data.grandTotal,
        paymentWorkflow: data.paymentWorkflow,
        status: "NEW",
        timestamp: new Date().toLocaleTimeString(),
        items: [...cart],
      });

      setCart([]);
    } catch (err: any) {
      alert("Error submitting order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCatalog = menuCatalog.filter((item) => {
    if (dietFilter === "VEG") return item.dietType === "VEG";
    if (dietFilter === "NON_VEG") return item.dietType === "NON_VEG";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* Table-side Branding Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur-md">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xs">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">Bawarchi Royale</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Indiranagar Flagship</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-xl bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
              Table {table}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* If Order Active: Show Real-time Tracking Screen */}
        {activeOrder ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg space-y-4 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Order Received in Kitchen
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {activeOrder.orderNumber}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                KOT Ticket <span className="font-mono font-bold text-slate-700">{activeOrder.kotNumber}</span> • Table {activeOrder.tableNumber}
              </p>
            </div>

            {/* Preparation Timeline */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-amber-600 animate-pulse" />
                  Kitchen Status:
                </span>
                <Badge className="bg-amber-600 text-white text-[10px]">PREPARING</Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                {activeOrder.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity} × {it.name}
                    </span>
                    <span className="font-semibold">{formatINR(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-extrabold text-slate-900">
                <span>Total Payable:</span>
                <span className="text-amber-800">{formatINR(activeOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 text-left">
              {activeOrder.paymentWorkflow === "PAY_ONLINE" ? (
                <div>
                  <span className="font-bold">Online Payment Succeeded:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your digital payment was verified. Enjoy your meal!
                  </p>
                </div>
              ) : (
                <div>
                  <span className="font-bold">Pay After Dining:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your bill is linked to Table {activeOrder.tableNumber}. You can pay via Cash or UPI when requesting your check at the end of the meal.
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => setActiveOrder(null)}
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-bold"
            >
              Order More Items for Table {activeOrder.tableNumber}
            </Button>
          </div>
        ) : (
          <>
            {/* Dietary Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setDietFilter("ALL")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  dietFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                All Dishes
              </button>
              <button
                onClick={() => setDietFilter("VEG")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  dietFilter === "VEG"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-emerald-700 border border-emerald-200"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pure Veg
              </button>
              <button
                onClick={() => setDietFilter("NON_VEG")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  dietFilter === "NON_VEG"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-rose-700 border border-rose-200"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Non-Veg
              </button>
            </div>

            {/* Menu Items List */}
            <div className="space-y-3">
              {filteredCatalog.map((item) => {
                const inCart = cart.find((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs border p-0.5 ${
                              item.dietType === "VEG"
                                ? "border-emerald-600 bg-white"
                                : "border-rose-600 bg-white"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.dietType === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                          </span>
                          {item.spiceLevel && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {item.spiceLevel}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-xs font-extrabold text-amber-700 mt-1">
                          {formatINR(item.price)}
                        </p>
                      </div>

                      {/* Add Button or Stepper */}
                      {inCart ? (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 p-1">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-amber-900">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => handleQuickAdd(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white shadow-2xs"
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

                    {/* Modifiers / Special instructions toggle */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => openCustomizeModal(item)}
                        className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {inCart?.modifiers?.length || inCart?.cookingNotes
                          ? "Customized Notes"
                          : "Add special cooking notes"}
                      </button>
                      {inCart?.cookingNotes && (
                        <span className="text-slate-400 italic text-[10px] truncate max-w-[150px]">
                          "{inCart.cookingNotes}"
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Cart & Checkout Bar */}
      {cart.length > 0 && !activeOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} items for Table {table}
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {formatINR(grandTotal)} <span className="text-[10px] text-slate-400 font-normal">(incl. 5% GST)</span>
              </span>
            </div>

            {/* Payment Preference Selector */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setPaymentMode("PAY_LATER")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === "PAY_LATER"
                    ? "border-amber-600 bg-amber-50 text-amber-900 shadow-2xs"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <Banknote className="h-4 w-4 text-emerald-600" />
                Pay After Dining
              </button>

              <button
                onClick={() => setPaymentMode("PAY_ONLINE")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === "PAY_ONLINE"
                    ? "border-amber-600 bg-amber-50 text-amber-900 shadow-2xs"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Pay Online (UPI)
              </button>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md"
            >
              {isSubmitting ? "Routing to Kitchen..." : `Confirm & Send to Kitchen (${formatINR(grandTotal)})`}
            </Button>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{customizingItem.name}</h3>
                <p className="text-[11px] text-slate-500">Dietary & cooking instructions</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modifiers List */}
            {customizingItem.availableModifiers && customizingItem.availableModifiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Choose Modifiers</label>
                <div className="space-y-1">
                  {customizingItem.availableModifiers.map((mod) => {
                    const isChecked = selectedMods.includes(mod);
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedMods(selectedMods.filter((m) => m !== mod));
                          } else {
                            setSelectedMods([...selectedMods, mod]);
                          }
                        }}
                        className={`flex w-full items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all ${
                          isChecked
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>{mod}</span>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Cooking Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Special Kitchen Instructions
              </label>
              <textarea
                value={itemCookingNotes}
                onChange={(e) => setItemCookingNotes(e.target.value)}
                placeholder="e.g. Jain preparation, less spicy, allergic to nuts..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCustomizingItem(null)}
                className="flex-1 h-9 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCustomization}
                className="flex-1 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QrOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading digital table menu...</div>}>
      <QrOrderContent />
    </Suspense>
  );
}
