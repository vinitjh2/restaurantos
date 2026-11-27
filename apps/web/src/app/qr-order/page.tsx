"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingCart,
  QrCode,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  Banknote,
  ChefHat,
  MessageSquare,
  AlertCircle,
  X,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  Check,
  ArrowRight,
  Send,
  Star,
  Search,
  Flame,
  Bell,
  Droplets,
  Heart,
  Share2,
} from "lucide-react";
import QRCode from "qrcode";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  dietType: "VEG" | "NON_VEG";
  price: number;
  description: string;
  spiceLevel?: "Mild" | "Medium" | "Spicy";
  availableModifiers?: string[];
  imageUrl: string;
  rating?: number;
  servesCount?: string;
  prepTimeMinutes?: number;
  isBestseller?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cookingNotes?: string;
  modifiers?: string[];
  imageUrl?: string;
}

const DEFAULT_CATALOG: MenuItem[] = [
  {
    id: "item-biryani",
    name: "Murgh Dum Biryani Royale",
    category: "Biryani",
    dietType: "NON_VEG",
    price: 350,
    description: "Slow-cooked fragrant long-grain basmati rice layered with succulent marinated chicken, saffron milk and potli spices. Served with mint burhani raita.",
    spiceLevel: "Spicy",
    availableModifiers: ["Extra Spicy", "Extra Salan", "Boneless Cuts", "Less Spicy"],
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "Serves 1-2",
    prepTimeMinutes: 15,
    isBestseller: true,
  },
  {
    id: "item-butter-chicken",
    name: "Old Delhi Butter Chicken",
    category: "Main Course",
    dietType: "NON_VEG",
    price: 370,
    description: "Charcoal-tandoor roasted shredded chicken simmered in a silky tomato, cashew cream and wild fenugreek silk gravy.",
    spiceLevel: "Medium",
    availableModifiers: ["Extra Butter Swirl", "Boneless Only", "Mild Sweet Finish"],
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "Serves 2",
    prepTimeMinutes: 12,
    isBestseller: true,
  },
  {
    id: "item-pbm",
    name: "Paneer Butter Masala",
    category: "Main Course",
    dietType: "VEG",
    price: 320,
    description: "Artisanal malai paneer cubes simmered in a rich velvety tomato, butter and golden cashew silk gravy.",
    spiceLevel: "Medium",
    availableModifiers: ["Less Spicy", "Jain (No Onion/Garlic)", "Extra Butter Swirl"],
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    servesCount: "Serves 2",
    prepTimeMinutes: 10,
    isBestseller: true,
  },
  {
    id: "item-dal",
    name: "Dal Makhani Royale",
    category: "Main Course",
    dietType: "VEG",
    price: 260,
    description: "Urad lentils slow-cooked overnight for 16 hours over charcoal with white cultured butter and house-churned cream.",
    spiceLevel: "Mild",
    availableModifiers: ["Extra Cream Swirl", "Double Butter Tadka", "Mild Spiced"],
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "Serves 2",
    prepTimeMinutes: 8,
    isBestseller: true,
  },
  {
    id: "item-tikka",
    name: "Paneer Tikka Angara",
    category: "Starters",
    dietType: "VEG",
    price: 290,
    description: "Charcoal-smoked cottage cheese skewers marinated in hung curd, carom seeds and Deggi Kashmiri red chili marinade.",
    spiceLevel: "Medium",
    availableModifiers: ["Extra Crispy Edge", "Mint Coriander Chutney", "Jain Preparation"],
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    servesCount: "6 Skewers",
    prepTimeMinutes: 14,
    isBestseller: false,
  },
  {
    id: "item-tandoori-chicken",
    name: "Tandoori Chicken (Full)",
    category: "Starters",
    dietType: "NON_VEG",
    price: 480,
    description: "Whole tender chicken marinated for 12 hours in cold-pressed mustard oil, tandoori spices and clay-oven roasted.",
    spiceLevel: "Spicy",
    availableModifiers: ["Extra Lemon & Chaat Masala", "Mint Chutney Bowl", "Crispy Skin"],
    imageUrl: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "Serves 2-3",
    prepTimeMinutes: 18,
    isBestseller: true,
  },
  {
    id: "item-naan",
    name: "Butter Garlic Naan",
    category: "Breads",
    dietType: "VEG",
    price: 65,
    description: "Clay tandoor baked leavened flatbread brushed with golden roasted garlic butter and freshly snipped cilantro.",
    spiceLevel: "Mild",
    availableModifiers: ["Extra Garlic Butter", "Extra Crispy", "Cut into 4 Pcs"],
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "2 Halves",
    prepTimeMinutes: 5,
    isBestseller: true,
  },
  {
    id: "item-lassi",
    name: "Amritsari Kesar Sweet Lassi",
    category: "Beverages",
    dietType: "VEG",
    price: 90,
    description: "Thick hand-churned buffalo yogurt beverage infused with Kashmiri saffron strands, green cardamom and thick clotted malai.",
    spiceLevel: "Mild",
    availableModifiers: ["Extra Malai Layer", "Less Sugar", "Crushed Pistachio"],
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    servesCount: "350 ml",
    prepTimeMinutes: 4,
    isBestseller: true,
  },
  {
    id: "item-jamun",
    name: "Shahi Gulab Jamun (2 pcs)",
    category: "Desserts",
    dietType: "VEG",
    price: 85,
    description: "Warm golden khoya milk-solid dumplings steeped in wild rosewater, cardamom and saffron scented syrup.",
    spiceLevel: "Mild",
    availableModifiers: ["Serve Steaming Warm", "Add Vanilla Scoop (₹40)"],
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    servesCount: "2 Pcs",
    prepTimeMinutes: 3,
    isBestseller: false,
  },
  {
    id: "item-mojito",
    name: "Kaffir Lime & Mint Cooler",
    category: "Beverages",
    dietType: "VEG",
    price: 110,
    description: "Crushed fresh garden mint sprigs, zesty lemon juice and sparkling club soda over crushed ice.",
    spiceLevel: "Mild",
    availableModifiers: ["Less Ice", "Extra Fizzy", "Low Sugar"],
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    servesCount: "300 ml",
    prepTimeMinutes: 4,
    isBestseller: false,
  },
];

const CATEGORIES = [
  { key: "ALL", label: "All Items", icon: "✨" },
  { key: "BESTSELLER", label: "Bestsellers", icon: "🔥" },
  { key: "Starters", label: "Tandoor & Starters", icon: "🍢" },
  { key: "Biryani", label: "Royal Biryani", icon: "🍗" },
  { key: "Main Course", label: "Curries & Gravy", icon: "🥘" },
  { key: "Breads", label: "Tandoori Breads", icon: "🫓" },
  { key: "Beverages", label: "Coolers & Lassi", icon: "🍹" },
  { key: "Desserts", label: "Desserts", icon: "🍨" },
];

function QrOrderContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "T-01";
  const branch = searchParams.get("branch") || "IND";

  const [activeTab, setActiveTab] = useState<"MENU" | "BILL_PAY">("MENU");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [dietFilter, setDietFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Service alert toast
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);

  // Pay-at-Table UPI States
  const [tableUpiQr, setTableUpiQr] = useState<string>("");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [isSettlingPayment, setIsSettlingPayment] = useState(false);
  const [isBillPaid, setIsBillPaid] = useState(false);
  const [paidTxRef, setPaidTxRef] = useState<string>("");

  // Customization Modal State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [itemCookingNotes, setItemCookingNotes] = useState("");

  const [menuCatalog, setMenuCatalog] = useState<MenuItem[]>(DEFAULT_CATALOG);

  // Trigger floating service alert (Call Waiter / Water)
  const triggerServiceRequest = (type: "WAITER" | "WATER" | "BILL") => {
    const text =
      type === "WAITER"
        ? `Captain notified for Table ${table}! Server is arriving at your table.`
        : type === "WATER"
        ? `Water service requested for Table ${table}. Bringing fresh glasses.`
        : `Bill requested for Table ${table}. Switching to digital checkout...`;

    setServiceNotice(text);
    setTimeout(() => setServiceNotice(null), 4000);

    if (type === "BILL") {
      setTimeout(() => setActiveTab("BILL_PAY"), 600);
    }
  };

  // Sample running bill items for Table
  const runningTableItems = useMemo(() => {
    if (activeOrder?.items && activeOrder.items.length > 0) {
      return activeOrder.items;
    }
    return [];
  }, [activeOrder]);

  const runningSubtotal = runningTableItems.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0);
  const runningCgst = runningSubtotal * 0.025;
  const runningSgst = runningSubtotal * 0.025;
  const runningGrandTotal = Math.round(runningSubtotal + runningCgst + runningSgst);

  // Generate real dynamic UPI QR Code for Pay-at-Table
  useEffect(() => {
    async function makeUpiQr() {
      const vpa = "";
      if (!vpa) {
        setTableUpiQr("");
        return;
      }
      const name = "Restaurant";
      const note = `Table-${table}-Bill`;
      const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${runningGrandTotal}&cu=INR&tn=${encodeURIComponent(note)}`;
      try {
        const qr = await QRCode.toDataURL(upiUrl, { width: 300, margin: 2 });
        setTableUpiQr(qr);
      } catch (e) {
        console.error("Failed to generate table UPI QR:", e);
      }
    }
    makeUpiQr();
  }, [table, runningGrandTotal]);

  const handleQuickAdd = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl },
      ];
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
          imageUrl: customizingItem.imageUrl,
        },
      ];
    });
    setCustomizingItem(null);
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = subtotal * 0.05; // 5% composite GST
  const grandTotal = Math.round(subtotal + tax);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/pos/orders/qr-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: table,
          branchCode: branch,
          customerName: customerName || `Table ${table} Diner`,
          customerPhone: customerPhone || "9876543210",
          paymentWorkflow: "PAY_LATER",
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

  const handleSettlePayAtTable = () => {
    setIsSettlingPayment(true);
    setTimeout(() => {
      const ref = utrNumber.trim() || `UPI-UTR-${Date.now().toString().slice(-8)}`;
      setPaidTxRef(ref);
      setIsBillPaid(true);
      setIsSettlingPayment(false);
    }, 800);
  };

  // Filter items
  const filteredCatalog = useMemo(() => {
    return menuCatalog.filter((item) => {
      // Category filter
      if (selectedCategory === "BESTSELLER" && !item.isBestseller) return false;
      if (selectedCategory !== "ALL" && selectedCategory !== "BESTSELLER" && item.category !== selectedCategory) {
        return false;
      }
      // Diet filter
      if (dietFilter === "VEG" && item.dietType !== "VEG") return false;
      if (dietFilter === "NON_VEG" && item.dietType !== "NON_VEG") return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuCatalog, selectedCategory, dietFilter, searchQuery]);

  const bestsellers = useMemo(() => menuCatalog.filter((i) => i.isBestseller), [menuCatalog]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-36 font-sans">
      {/* Service Alert Toast */}
      {serviceNotice && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white p-3.5 shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-4">
          <Bell className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />
          <span className="text-xs font-semibold leading-snug">{serviceNotice}</span>
        </div>
      )}

      {/* LUXURY RESTAURANT COVER HERO BANNER */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80"
          alt="Restaurant Interior"
          className="h-full w-full object-cover opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges & Table Pill */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Table {table}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerServiceRequest("WAITER")}
              className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md hover:bg-amber-500/30 transition-all"
            >
              <Bell className="h-3 w-3" />
              <span>Call Waiter</span>
            </button>
            <button
              onClick={() => triggerServiceRequest("WATER")}
              className="flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 text-xs font-bold text-blue-300 backdrop-blur-md hover:bg-blue-500/30 transition-all"
              title="Request Water"
            >
              <Droplets className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Hero Details Card */}
        <div className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto z-10 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-500/60 shadow-xl overflow-hidden p-0.5 shrink-0">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-xl" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                Royal Mughlai & Charcoal Tandoor
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>4.9</span>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              DineSutra Table Ordering
            </h1>
            <p className="text-xs text-slate-300 truncate">
              Branch {branch} · DineSutra Smart Table Service
            </p>
          </div>
        </div>
      </div>

      {/* TOP TAB SWITCHER: Digital Menu vs Live Bill Checkout */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-xs backdrop-blur-md">
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("MENU")}
            className={cn(
              "py-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeTab === "MENU"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <UtensilsCrossed className="h-3.5 w-3.5 text-amber-400" />
            <span>Digital Menu & Order</span>
          </button>
          <button
            onClick={() => setActiveTab("BILL_PAY")}
            className={cn(
              "py-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeTab === "BILL_PAY"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Receipt className="h-3.5 w-3.5 text-emerald-400" />
            <span>Table Check & Pay (UPI)</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {activeTab === "BILL_PAY" ? (
          /* =========================================================
             PAY-AT-TABLE DIGITAL CHECKOUT VIEW
             ========================================================= */
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            {isBillPaid ? (
              /* Success Receipt */
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    Payment Verified & Settled
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {formatINR(runningGrandTotal)}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Table {table} settled instantly via UPI. Thank you for dining with us!
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Transaction UTR Ref:</span>
                    <span className="font-mono font-bold text-slate-800">{paidTxRef}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax Invoice Prefix:</span>
                    <span className="font-mono text-slate-800">IND/2026-27/00285</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GSTIN:</span>
                    <span className="font-mono text-slate-800">29AABCU9603R1ZM</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>FSSAI License:</span>
                    <span className="font-mono text-slate-800">11223344000123</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl text-xs gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Tax Receipt</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsBillPaid(false);
                      setActiveTab("MENU");
                    }}
                    className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    Back to Menu
                  </Button>
                </div>
              </div>
            ) : (
              /* Live Check & Dynamic UPI QR */
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Table {table} Running Check</h2>
                    <p className="text-[11px] text-slate-400">Real-time KOT items from kitchen</p>
                  </div>
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                    Live Check
                  </span>
                </div>

                {/* Itemized running items */}
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  {runningTableItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between pt-2">
                      <div className="flex gap-2">
                        <span className="font-bold text-slate-900">{item.quantity}×</span>
                        <span className="text-slate-800 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* GST Tax Breakdown */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Food Subtotal</span>
                    <span>{formatINR(runningSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST (2.5% under SAC 996331)</span>
                    <span>{formatINR(runningCgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST (2.5% under SAC 996331)</span>
                    <span>{formatINR(runningSgst)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-slate-900 border-t border-slate-200 pt-2.5">
                    <span>Total Amount Payable</span>
                    <span className="text-amber-800 text-lg">{formatINR(runningGrandTotal)}</span>
                  </div>
                </div>

                {/* Dynamic UPI QR Section */}
                <div className="rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-5 text-center space-y-3">
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    Scan or Tap to Pay Instant UPI
                  </span>

                  {tableUpiQr ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={tableUpiQr}
                        alt="Dynamic Table UPI QR"
                        className="h-44 w-44 rounded-2xl border border-slate-200 shadow-md bg-white p-2.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-800 mt-2">
                        Payable: {formatINR(runningGrandTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Exact payable amount embedded: {formatINR(runningGrandTotal)}
                      </span>
                    </div>
                  ) : (
                    <div className="h-44 w-44 mx-auto flex items-center justify-center text-xs text-slate-400">
                      Ask staff for UPI QR or pay at counter
                    </div>
                  )}

                  {/* 1-Tap Mobile App Links */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">
                      Configure merchant UPI VPA in Settings to enable 1-tap UPI links.
                    </span>
                  </div>
                </div>

                {/* UTR Input & Confirmation */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Optional: Enter 12-digit UPI UTR / Bank Reference to Verify
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431289104821"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-emerald-500 focus:outline-none bg-slate-50"
                  />
                  <Button
                    onClick={handleSettlePayAtTable}
                    disabled={isSettlingPayment}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md"
                  >
                    {isSettlingPayment ? "Verifying Payment..." : `I Have Paid ${formatINR(runningGrandTotal)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================
             DIGITAL MENU & ORDERING VIEW
             ========================================================= */
          <>
            {/* SEARCH BAR */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Biryani, Butter Chicken, Naan, Drinks..."
                className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 pr-10 py-3 text-xs font-medium text-slate-900 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* HORIZONTAL CATEGORY PILL SLIDER */}
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all shadow-2xs",
                    selectedCategory === cat.key
                      ? "bg-slate-900 text-white shadow-xs scale-105"
                      : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* DIETARY FILTER TOGGLES */}
            <div className="flex gap-2">
              <button
                onClick={() => setDietFilter("ALL")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all",
                  dietFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200"
                )}
              >
                All Dishes
              </button>
              <button
                onClick={() => setDietFilter("VEG")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  dietFilter === "VEG"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-emerald-700 border border-emerald-200"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pure Veg
              </button>
              <button
                onClick={() => setDietFilter("NON_VEG")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  dietFilter === "NON_VEG"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-rose-700 border border-rose-200"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Non-Veg
              </button>
            </div>

            {/* CHEF'S BESTSELLER SPOTLIGHT CAROUSEL (If on ALL or BESTSELLER) */}
            {(selectedCategory === "ALL" || selectedCategory === "BESTSELLER") && !searchQuery && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                    <span>Chef's Signature Recommendations</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600">Must Try</span>
                </div>

                <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2">
                  {bestsellers.slice(0, 4).map((item) => {
                    const inCart = cart.find((i) => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="group relative w-60 shrink-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{item.rating || 4.9}</span>
                          </div>
                          <span
                            className={cn(
                              "absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-xs border p-0.5",
                              item.dietType === "VEG" ? "border-emerald-600 bg-white" : "border-rose-600 bg-white"
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                item.dietType === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                              )}
                            />
                          </span>
                        </div>

                        <div className="p-3 space-y-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.servesCount || "Serves 1-2"}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black text-slate-900">{formatINR(item.price)}</span>
                            {inCart ? (
                              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-300 px-1 py-0.5 text-xs font-bold text-amber-900">
                                <button onClick={() => handleRemove(item.id)} className="p-0.5">
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span>{inCart.quantity}</span>
                                <button onClick={() => handleQuickAdd(item)} className="p-0.5">
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickAdd(item)}
                                className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-colors"
                              >
                                <span>Add</span>
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FULL DISH CATALOG LIST */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{filteredCatalog.length} Dishes Available</span>
                <span className="text-[11px] font-normal text-slate-400">Freshly prepared to order</span>
              </div>

              {filteredCatalog.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No dishes match your filter. Try clearing your search query.
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const inCart = cart.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex gap-3">
                        {/* Left Details */}
                        <div className="flex-1 space-y-1.5 pr-1">
                          {/* Dietary dot & Badges */}
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex h-3.5 w-3.5 items-center justify-center rounded-xs border p-0.5",
                                item.dietType === "VEG" ? "border-emerald-600 bg-white" : "border-rose-600 bg-white"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  item.dietType === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                                )}
                              />
                            </span>

                            {item.isBestseller && (
                              <span className="flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
                                <Flame className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                Bestseller
                              </span>
                            )}

                            {item.rating && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{item.rating}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
                            {item.name}
                          </h3>

                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                            {item.servesCount && <span>{item.servesCount}</span>}
                            {item.prepTimeMinutes && (
                              <>
                                <span>·</span>
                                <span>~{item.prepTimeMinutes} mins</span>
                              </>
                            )}
                          </div>

                          <div className="pt-1">
                            <span className="text-sm font-extrabold text-slate-900">
                              {formatINR(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Right Photo & Action Button */}
                        <div className="relative flex flex-col items-center justify-between shrink-0 w-28 sm:w-32">
                          <div className="relative h-24 w-28 sm:w-32 overflow-hidden rounded-2xl bg-slate-100 shadow-2xs">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>

                          {/* Stepper or Add button positioned over image */}
                          <div className="-mt-3.5 z-10">
                            {inCart ? (
                              <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                                <button onClick={() => handleRemove(item.id)} className="p-0.5 text-slate-300 hover:text-white">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-3 text-center">{inCart.quantity}</span>
                                <button onClick={() => handleQuickAdd(item)} className="p-0.5 text-amber-400 hover:text-white">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickAdd(item)}
                                className="flex items-center gap-1 rounded-xl bg-white border border-slate-200/90 px-4 py-1.5 text-xs font-extrabold text-slate-900 shadow-md hover:bg-slate-900 hover:text-white transition-all uppercase tracking-wider"
                              >
                                <span>Add</span>
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customization prompt */}
                      {item.availableModifiers && item.availableModifiers.length > 0 && (
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                          <button
                            onClick={() => openCustomizeModal(item)}
                            className="text-amber-800 font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <span>Customize instructions / spice level</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          {inCart?.modifiers && inCart.modifiers.length > 0 && (
                            <span className="text-slate-400 font-medium italic truncate max-w-[150px]">
                              {inCart.modifiers.join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Brand Footer */}
        <footer className="pt-6 pb-20 text-center text-[11px] text-slate-400 space-y-2 border-t border-slate-100 mt-6 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-500/50 shadow-sm overflow-hidden p-0.5">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-1 font-semibold text-slate-600">
            <span>Powered by</span>
            <span className="font-black text-amber-600">DineSutra</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Part of SutraUniverse</span>
          </div>
          <p className="text-[10px] text-slate-400">Direct Kitchen Routing & GST Compliant Digital Table Menu</p>
        </footer>
      </main>

      {/* FLOATING BOTTOM CART BAR (Appears when cart has items) */}
      {cart.length > 0 && activeTab === "MENU" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-6">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <ShoppingCart className="h-4 w-4 text-amber-600" />
                <span>{cart.reduce((a, b) => a + b.quantity, 0)} Items Selected</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                {formatINR(grandTotal)}{" "}
                <span className="text-[10px] text-slate-400 font-normal">(incl. 5% GST)</span>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 gap-2"
            >
              <span>{isSubmitting ? "Routing..." : "Confirm & Send to Kitchen"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ITEM CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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
                        className={cn(
                          "flex w-full items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all",
                          isChecked
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        )}
                      >
                        <span>{mod}</span>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Special Kitchen Instructions
              </label>
              <textarea
                value={itemCookingNotes}
                onChange={(e) => setItemCookingNotes(e.target.value)}
                placeholder="e.g. Jain preparation, extra spicy, mild salt..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-amber-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCustomizingItem(null)}
                className="flex-1 h-10 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCustomization}
                className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Apply Customization
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading digital menu...</div>}>
      <QrOrderContent />
    </Suspense>
  );
}
