"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Receipt,
  ChefHat,
  Banknote,
  QrCode,
  CreditCard,
  Percent,
  Clock,
  ArrowRightLeft,
  Split,
  Ban,
  RotateCcw,
  User,
  Users,
  Store,
  CheckCircle2,
  AlertCircle,
  Tag,
  ChevronDown,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  Monitor,
  Barcode,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Offline & Hardware Integration Drivers
import { offlineStorage, generateOfflineSyncId, generateOfflineReceiptNumber, type OfflineOrder } from "@/lib/offline/offline-storage";
import { syncQueue, type SyncStats } from "@/lib/offline/sync-queue";
import { cfdBridge } from "@/lib/hardware/customer-display";
import { useBarcodeScanner } from "@/lib/hardware/use-barcode-scanner";

// Modals
import { ModifierModal, MenuItemWithCustomization } from "@/components/pos/modifier-modal";
import { PaymentModal } from "@/components/pos/payment-modal";
import { ThermalReceiptModal } from "@/components/pos/thermal-receipt-modal";
import { KOTTicketModal } from "@/components/pos/kot-ticket-modal";
import { SupervisorPinModal } from "@/components/pos/supervisor-pin-modal";
import { HeldOrdersModal } from "@/components/pos/held-orders-modal";
import { TableTransferModal } from "@/components/pos/table-transfer-modal";
import { SplitBillModal } from "@/components/pos/split-bill-modal";

export interface CartItem {
  id: string; // unique cart line ID
  menuItemId: string;
  name: string;
  category: string;
  dietType: string;
  basePrice: number;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  selectedModifiers: Array<{ id: string; name: string; price: number }>;
  quantity: number;
  cookingNotes?: string;
  discountPercentage?: number;
  discountAmount?: number;
}

export default function POSPage() {
  // Master data
  const [menuItems, setMenuItems] = useState<MenuItemWithCustomization[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY" | "PICKUP">("DINE_IN");
  const [selectedTable, setSelectedTable] = useState("T-01");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [showCustomerInput, setShowCustomerInput] = useState(false);

  // Cart & Calculation
  const [cart, setCart] = useState<CartItem[]>([]);
  const [calculation, setCalculation] = useState<any>(null);
  const [billDiscountPercentage, setBillDiscountPercentage] = useState<number>(0);
  const [billDiscountReason, setBillDiscountReason] = useState<string>("");

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<MenuItemWithCustomization | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [kotTicketData, setKotTicketData] = useState<any | null>(null);
  const [supervisorModal, setSupervisorModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: "CANCEL_ORDER" | "DISCOUNT" | "REFUND";
  }>({
    open: false,
    title: "",
    description: "",
    actionType: "DISCOUNT",
  });
  const [heldOrdersModalOpen, setHeldOrdersModalOpen] = useState(false);
  const [heldOrdersList, setHeldOrdersList] = useState<any[]>([]);
  const [tableTransferOpen, setTableTransferOpen] = useState(false);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Offline Synchronization & Hardware State
  const [syncStats, setSyncStats] = useState<SyncStats>({
    isOnline: true,
    pendingCount: 0,
    syncing: false,
    lastSyncTime: null,
    conflictCount: 0,
    failedCount: 0,
    syncedCount: 0,
    deviceId: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to background sync queue
  useEffect(() => {
    const unsub = syncQueue.subscribe((stats) => {
      setSyncStats(stats);
    });
    return () => unsub();
  }, []);

  // Barcode / scale scanner integration
  useBarcodeScanner({
    onScan: (scannedCode) => {
      const match = menuItems.find(
        (m) =>
          m.shortCode?.toLowerCase() === scannedCode.toLowerCase() ||
          m.name.toLowerCase().includes(scannedCode.toLowerCase())
      );
      if (match) {
        handleItemClick(match);
        showToast(`Scanned & added: ${match.name}`);
      } else {
        showToast(`Code "${scannedCode}" not recognized in catalog`);
      }
    },
  });

  // Broadcast live cart state to Customer-Facing Display (CFD)
  useEffect(() => {
    if (cart.length > 0 && calculation) {
      cfdBridge.broadcastUpdate({
        type: "CART_UPDATE",
        items: cart.map((i) => ({
          name: i.name + (i.variantName ? ` (${i.variantName})` : ""),
          quantity: i.quantity,
          price: (i.variantPrice || i.basePrice) + (i.selectedModifiers || []).reduce((a, b) => a + b.price, 0),
        })),
        subtotal: calculation.subtotal,
        taxAmount: calculation.totalTax,
        grandTotal: calculation.grandTotal,
        customerName: customerName || undefined,
      });
    } else {
      cfdBridge.broadcastUpdate({ type: "IDLE" });
    }
  }, [cart, calculation, customerName]);

  // 1. Fetch initial menu and tables from backend with offline caching
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [menuRes, tablesRes] = await Promise.all([
        fetch("/api/pos/menu").then((r) => r.json()),
        fetch("/api/pos/tables").then((r) => r.json()),
      ]);

      if (menuRes.success) {
        setMenuItems(menuRes.items);
        setCategories(menuRes.categories);
        await offlineStorage.cacheCatalog("menu_items", menuRes.items);
        await offlineStorage.cacheCatalog("categories", menuRes.categories);
      }
      if (tablesRes.success) {
        setTables(tablesRes.tables);
        await offlineStorage.cacheCatalog("tables", tablesRes.tables);
      }
    } catch (err) {
      console.warn("Offline POS: Loading cached menu catalog & tables from IndexedDB");
      const [cachedItems, cachedCats, cachedTables] = await Promise.all([
        offlineStorage.getCachedCatalog<MenuItemWithCustomization[]>("menu_items"),
        offlineStorage.getCachedCatalog<string[]>("categories"),
        offlineStorage.getCachedCatalog<any[]>("tables"),
      ]);

      if (cachedItems && cachedItems.length > 0) {
        setMenuItems(cachedItems);
      }
      if (cachedCats && cachedCats.length > 0) {
        setCategories(cachedCats);
      }
      if (cachedTables && cachedTables.length > 0) {
        setTables(cachedTables);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchHeldOrders();
  }, []);

  const fetchHeldOrders = async () => {
    try {
      const res = await fetch("/api/pos/orders/hold").then((r) => r.json());
      if (res.success) setHeldOrdersList(res.heldOrders);
    } catch (e) {}
  };

  // 2. Authoritative Backend Calculation via `/api/pos/calculate`
  const refreshBackendCalculation = useCallback(
    async (currentCart: CartItem[], bDiscount: number, bReason: string) => {
      if (currentCart.length === 0) {
        setCalculation(null);
        return;
      }

      try {
        const payload = {
          items: currentCart.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            basePrice: i.basePrice,
            variantId: i.variantId,
            variantName: i.variantName,
            variantPrice: i.variantPrice,
            modifierOptions: i.selectedModifiers,
            quantity: i.quantity,
            discountPercentage: i.discountPercentage,
            discountAmount: i.discountAmount,
            cookingNotes: i.cookingNotes,
          })),
          orderType,
          billDiscountPercentage: bDiscount > 0 ? bDiscount : undefined,
          billDiscountReason: bReason || undefined,
        };

        const res = await fetch("/api/pos/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (res.success) {
          setCalculation(res.calculation);
        }
      } catch (err) {
        console.error("Recalculate failed:", err);
      }
    },
    [orderType]
  );

  useEffect(() => {
    refreshBackendCalculation(cart, billDiscountPercentage, billDiscountReason);
  }, [cart, billDiscountPercentage, billDiscountReason, refreshBackendCalculation]);

  // 3. Cart interactions
  const handleItemClick = (item: MenuItemWithCustomization) => {
    const hasVariants = item.variants && item.variants.length > 0;
    const hasModifiers = item.modifiers && item.modifiers.length > 0;

    if (hasVariants || hasModifiers) {
      setCustomizingItem(item);
    } else {
      addToCartDirect(item);
    }
  };

  const addToCartDirect = (
    item: MenuItemWithCustomization,
    customProps?: {
      variantId?: string;
      variantName?: string;
      variantPrice?: number;
      selectedModifiers?: Array<{ id: string; name: string; price: number }>;
      cookingNotes?: string;
    }
  ) => {
    const lineId = `${item.id}-${customProps?.variantId || "default"}-${JSON.stringify(
      customProps?.selectedModifiers || []
    )}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === lineId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }

      const newItem: CartItem = {
        id: lineId,
        menuItemId: item.id,
        name: item.name,
        category: item.category,
        dietType: item.dietType,
        basePrice: item.basePrice,
        variantId: customProps?.variantId,
        variantName: customProps?.variantName,
        variantPrice: customProps?.variantPrice,
        selectedModifiers: customProps?.selectedModifiers || [],
        quantity: 1,
        cookingNotes: customProps?.cookingNotes,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === lineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (lineId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== lineId));
  };

  const clearOrder = () => {
    setCart([]);
    setBillDiscountPercentage(0);
    setBillDiscountReason("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerGstin("");
  };

  // 4. KOT Dispatch
  const handleFireKOT = async () => {
    if (cart.length === 0) return;

    try {
      const payload = {
        orderType,
        tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
        customerName: customerName || undefined,
        items: cart.map((i) => ({
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          cookingNotes: i.cookingNotes,
        })),
      };

      const res = await fetch("/api/pos/orders/kot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        setKotTicketData(res.kot);
        showToast(res.message);
        fetchInitialData(); // update tables state
      }
    } catch (err: any) {
      alert("KOT error: " + err.message);
    }
  };

  // 5. Offline Fallback & Settle Invoice API caller for PaymentModal
  const saveAndSettleOffline = async (payments: Array<{ method: string; amount: number; transactionRef?: string }>) => {
    const offlineSyncId = generateOfflineSyncId("IND");
    const localReceipt = generateOfflineReceiptNumber("IND");
    const deviceId = offlineStorage.getDeviceId();
    const session = await offlineStorage.getCachedSession();

    const offlineOrder: OfflineOrder = {
      offlineSyncId,
      deviceId,
      tenantId: session?.organizationId || "default-tenant",
      branchId: session?.assignedBranchId || "IND",
      userId: session?.email || "offline-cashier",
      clientTimestamp: Date.now(),
      orderNumber: `OFF-${Date.now().toString().slice(-4)}`,
      localReceiptNumber: localReceipt,
      orderType,
      tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
      guestCount: 1,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerGstin: customerGstin || undefined,
      items: cart.map((i) => ({
        menuItemId: i.menuItemId,
        itemName: i.name,
        variantId: i.variantId,
        variantName: i.variantName,
        quantity: i.quantity,
        unitPrice: i.basePrice,
        modifierTotal: (i.selectedModifiers || []).reduce((acc, m) => acc + m.price, 0),
        discountAmount: i.discountAmount || 0,
        discountReason: i.discountPercentage ? `${i.discountPercentage}%` : undefined,
        subtotal: (i.basePrice + (i.selectedModifiers || []).reduce((acc, m) => acc + m.price, 0)) * i.quantity - (i.discountAmount || 0),
        taxAmount: (i.basePrice * i.quantity) * 0.05,
        cookingNotes: i.cookingNotes,
        modifiers: (i.selectedModifiers || []).map((m) => ({
          modifierOptionId: m.id,
          modifierName: m.name,
          price: m.price,
        })),
      })),
      subtotal: calculation?.subtotal || 0,
      taxAmount: calculation?.totalTax || 0,
      billDiscount: calculation?.billDiscount || 0,
      packagingCharge: calculation?.packagingCharge || 0,
      deliveryCharge: calculation?.deliveryCharge || 0,
      serviceCharge: calculation?.serviceCharge || 0,
      grandTotal: calculation?.grandTotal || 0,
      isSettled: true,
      payment: {
        method: (payments[0]?.method as any) || "CASH",
        amount: payments[0]?.amount || calculation?.grandTotal || 0,
        transactionRef: payments[0]?.transactionRef || `OFF-${Date.now()}`,
        status: payments[0]?.method === "UPI" ? ("UNVERIFIED" as const) : ("PENDING_RECONCILIATION" as const),
      },
      syncStatus: "PENDING",
      retryCount: 0,
    };

    await offlineStorage.saveOrder(offlineOrder);
    const updatedStats = await syncQueue.getStats();
    setSyncStats(updatedStats);

    return {
      success: true,
      isOffline: true,
      invoiceNumber: localReceipt,
      branch: {
        name: "RestaurantOS Flagship (Offline Queue)",
        code: "IND",
        address: "100 Feet Rd, Indiranagar",
        city: "Bengaluru",
        phone: "+91 98765 43210",
        gstin: "29AABCU9603R1ZM",
        fssaiNumber: "11223344000123",
      },
      calculation: calculation || {
        subtotal: 0,
        totalTax: 0,
        grandTotal: payments[0]?.amount || 0,
      },
      invoice: {
        payments: payments.length > 0 ? payments : [{ method: "CASH", amount: calculation?.grandTotal || 0 }],
        settledAt: new Date().toISOString(),
      },
    };
  };

  const handleSettleApi = async (payments: Array<{ method: string; amount: number; transactionRef?: string }>) => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!isOnline) {
      return saveAndSettleOffline(payments);
    }

    try {
      const payload = {
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          basePrice: i.basePrice,
          variantId: i.variantId,
          variantName: i.variantName,
          variantPrice: i.variantPrice,
          modifierOptions: i.selectedModifiers,
          quantity: i.quantity,
          discountPercentage: i.discountPercentage,
          discountAmount: i.discountAmount,
          cookingNotes: i.cookingNotes,
        })),
        orderType,
        tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerGstin: customerGstin || undefined,
        billDiscountPercentage,
        billDiscountReason,
        payments,
      };

      const res = await fetch("/api/pos/orders/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      return res;
    } catch {
      // Automatic failover to offline persistent storage
      return saveAndSettleOffline(payments);
    }
  };

  const onPaymentSuccess = (settlementData: any) => {
    setPaymentOpen(false);
    setReceiptData({
      invoiceNumber: settlementData.invoiceNumber,
      branch: settlementData.branch,
      orderType,
      tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerGstin: customerGstin || undefined,
      calculation: settlementData.calculation,
      payments: settlementData.invoice.payments,
      settledAt: settlementData.invoice.settledAt,
    });

    // Notify Customer Display of completed order
    cfdBridge.broadcastUpdate({
      type: "ORDER_COMPLETED",
      grandTotal: settlementData.calculation?.grandTotal,
    });

    if (settlementData.isOffline) {
      showToast(`⚡ Offline Bill ${settlementData.invoiceNumber} saved! Will sync when online.`);
    } else {
      showToast(`Invoice ${settlementData.invoiceNumber} paid & recorded!`);
    }

    clearOrder();
    fetchInitialData();
  };

  // 6. Hold Order
  const handleHoldOrder = async () => {
    if (cart.length === 0) return;

    try {
      const payload = {
        orderType,
        tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        cartData: { cart, billDiscountPercentage, billDiscountReason },
      };

      const res = await fetch("/api/pos/orders/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        showToast(res.message);
        clearOrder();
        fetchHeldOrders();
      }
    } catch (e: any) {
      alert("Failed to hold: " + e.message);
    }
  };

  const handleResumeOrder = async (held: any) => {
    try {
      const parsed = JSON.parse(held.orderData);
      setCart(parsed.cart || []);
      setBillDiscountPercentage(parsed.billDiscountPercentage || 0);
      setBillDiscountReason(parsed.billDiscountReason || "");
      if (held.tableNumber) setSelectedTable(held.tableNumber);
      if (held.orderType) setOrderType(held.orderType);
      if (held.customerName) setCustomerName(held.customerName);
      if (held.customerPhone) setCustomerPhone(held.customerPhone);

      // delete from held
      await fetch(`/api/pos/orders/hold?id=${held.id}`, { method: "DELETE" });
      setHeldOrdersModalOpen(false);
      fetchHeldOrders();
      showToast(`Resumed ${held.orderNumber}!`);
    } catch (e) {}
  };

  const handleDeleteHeldOrder = async (id: string) => {
    await fetch(`/api/pos/orders/hold?id=${id}`, { method: "DELETE" });
    fetchHeldOrders();
  };

  // 7. Table Transfer
  const handleTableTransfer = async (targetTable: string) => {
    try {
      const res = await fetch("/api/pos/orders/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromTable: selectedTable, toTable: targetTable }),
      }).then((r) => r.json());

      if (res.success) {
        setSelectedTable(targetTable);
        setTableTransferOpen(false);
        showToast(res.message);
        fetchInitialData();
      } else {
        alert(res.error);
      }
    } catch (e: any) {
      alert("Transfer error: " + e.message);
    }
  };

  // 8. Supervisor PIN Actions
  const handleSupervisorSuccess = async (data: any) => {
    if (supervisorModal.actionType === "DISCOUNT") {
      setBillDiscountPercentage(data.discountPercent || 10);
      setBillDiscountReason(data.reason);
      setSupervisorModal({ ...supervisorModal, open: false });
      showToast(`Applied ${data.discountPercent}% manager discount!`);
    } else if (supervisorModal.actionType === "CANCEL_ORDER") {
      try {
        const res = await fetch("/api/pos/orders/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
            reason: data.reason,
            supervisorPin: data.pin,
          }),
        }).then((r) => r.json());

        if (res.success) {
          clearOrder();
          setSupervisorModal({ ...supervisorModal, open: false });
          showToast(res.message);
          fetchInitialData();
        } else {
          alert(res.error);
        }
      } catch (e: any) {
        alert("Cancel error: " + e.message);
      }
    } else if (supervisorModal.actionType === "REFUND") {
      try {
        const invoiceNum = prompt("Enter Invoice Number to Refund (e.g. IND/2026-27/00284):");
        if (!invoiceNum) return;

        const res = await fetch("/api/pos/orders/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber: invoiceNum,
            amount: data.refundAmount || 100,
            reason: data.reason,
            paymentMethod: "CASH",
            supervisorPin: data.pin,
          }),
        }).then((r) => r.json());

        if (res.success) {
          setSupervisorModal({ ...supervisorModal, open: false });
          showToast(res.message);
        } else {
          alert(res.error);
        }
      } catch (e: any) {
        alert("Refund error: " + e.message);
      }
    }
  };

  // Filtered catalog
  const filteredCatalog = menuItems.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4 select-none">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT PANEL: Menu Catalog, Categories & Search (62%) */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Top Controls Bar: Order Types & Quick Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3.5 bg-slate-50/50">
          {/* Order Type Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            {(["DINE_IN", "TAKEAWAY", "DELIVERY", "PICKUP"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  orderType === type
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Dine-in Table Selector / Delivery Tag */}
          {orderType === "DINE_IN" ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs focus:outline-none"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} ({t.floor}) {t.status === "OCCUPIED" ? "• Busy" : "• Free"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-800">
              Direct Counter Channel
            </span>
          )}

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish or keycode ('MDB', 'BC')..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          {/* Offline Sync State & Hardware Bridge Controls */}
          <div className="flex items-center gap-2">
            {syncStats.syncing ? (
              <span className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-2xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Syncing...
              </span>
            ) : !syncStats.isOnline ? (
              <span className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs">
                <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                Offline ({syncStats.pendingCount} Queued)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
                <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                {syncStats.pendingCount > 0 ? (
                  <span>Online ({syncStats.pendingCount} Queued)</span>
                ) : (
                  <span>Online & Synced</span>
                )}
              </span>
            )}

            {syncStats.pendingCount > 0 && syncStats.isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  showToast("Synchronizing offline queue with server...");
                  const stats = await syncQueue.triggerImmediateSync();
                  setSyncStats(stats);
                  showToast(`Sync complete! Remaining queued: ${stats.pendingCount}`);
                }}
                className="h-8 gap-1 border-blue-200 bg-blue-50/50 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="h-3 w-3" />
                Sync Now
              </Button>
            )}

            <Link
              href="/sync-monitor"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Open Synchronization Monitor"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              <span>Queue Monitor</span>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cfdBridge.openDisplayWindow();
                showToast("Opened Customer-Facing Display window");
              }}
              className="h-8 gap-1.5 border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              title="Launch Secondary Monitor Pole Display"
            >
              <Monitor className="h-3.5 w-3.5 text-slate-500" />
              CFD Screen
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 p-2.5 bg-slate-50/20 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredCatalog.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3 text-left shadow-xs hover:border-amber-400 hover:shadow-md/5 active:scale-[0.98] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Indian Veg/Non-Veg Tag */}
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
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      {item.shortCode}
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatINR(item.basePrice)}
                    </span>
                    {hasVariants && (
                      <span className="text-[9px] text-slate-400 block font-medium">
                        Customizable
                      </span>
                    )}
                  </div>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                    + Add
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Current Order, Modifiers, Discounts, Taxes & Tender (38%) */}
      <div className="flex w-[420px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Order Header & Operational Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 p-3.5 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">
                {orderType === "DINE_IN" ? selectedTable : orderType}
              </h3>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold">
                {cart.length} Lines
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {customerName ? `Patron: ${customerName}` : "Guest Dine-in"}
            </p>
          </div>

          {/* Quick Operations Dropdown Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHeldOrdersModalOpen(true)}
              className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Held Orders / Running Tabs"
            >
              <Clock className="h-4 w-4" />
              {heldOrdersList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white">
                  {heldOrdersList.length}
                </span>
              )}
            </button>

            {orderType === "DINE_IN" && (
              <button
                onClick={() => setTableTransferOpen(true)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="Transfer Table"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setSplitBillOpen(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Split Bill"
            >
              <Split className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                setSupervisorModal({
                  open: true,
                  title: "Manager Discount Override",
                  description: "Apply discretionary percentage discount on entire bill.",
                  actionType: "DISCOUNT",
                })
              }
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Apply Bill Discount"
            >
              <Percent className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                setSupervisorModal({
                  open: true,
                  title: "Authorize Order Cancellation",
                  description: "Supervisor PIN required to void order and log reason.",
                  actionType: "CANCEL_ORDER",
                })
              }
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              title="Cancel Order"
            >
              <Ban className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customer Information Drawer (Optional toggle) */}
        <div className="border-b border-slate-100 px-3.5 py-2 bg-slate-50/20 text-xs">
          {!showCustomerInput ? (
            <button
              onClick={() => setShowCustomerInput(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              <User className="h-3.5 w-3.5" />
              <span>{customerName ? `${customerName} (${customerPhone})` : "+ Add Customer / B2B GSTIN"}</span>
            </button>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="h-7 flex-1 rounded-lg border border-slate-200 px-2 text-[11px]"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone # (+91)"
                  className="h-7 w-28 rounded-lg border border-slate-200 px-2 text-[11px]"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value)}
                  placeholder="B2B GSTIN (Optional)"
                  className="h-7 flex-1 rounded-lg border border-slate-200 px-2 font-mono text-[10px]"
                />
                <button
                  onClick={() => setShowCustomerInput(false)}
                  className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Order Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
              <Utensils className="h-10 w-10 stroke-[1.2] mb-2 opacity-40" />
              <p className="text-xs font-bold text-slate-600">Order is Empty</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Select dishes from catalog to start billing or resume a held tab.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const modifierTotal = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
              const unitEffective = (item.variantPrice ?? item.basePrice) + modifierTotal;
              const lineTotal = unitEffective * item.quantity;

              return (
                <div key={item.id} className="flex items-start justify-between py-2 text-xs">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{item.name}</span>
                      {item.variantName && (
                        <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] text-slate-600">
                          {item.variantName}
                        </span>
                      )}
                    </div>

                    {/* Modifiers / Extras List */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-slate-500 mt-0.5 pl-1 space-y-0.5">
                        {item.selectedModifiers.map((mod, mIdx) => (
                          <div key={mIdx}>
                            + {mod.name} ({formatINR(mod.price)})
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cooking Instructions Note */}
                    {item.cookingNotes && (
                      <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                        * Note: {item.cookingNotes}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {formatINR(unitEffective)} x {item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-200 rounded-l-lg"
                      >
                        <Minus className="h-3 w-3 text-slate-600" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-200 rounded-r-lg"
                      >
                        <Plus className="h-3 w-3 text-slate-600" />
                      </button>
                    </div>

                    <span className="w-16 text-right font-bold text-slate-900">
                      {formatINR(lineTotal)}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Financial Calculation Breakdown Footer */}
        {calculation && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-800">{formatINR(calculation.subtotal)}</span>
            </div>

            {calculation.billDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Manager Discount ({billDiscountPercentage}%)</span>
                <span>-{formatINR(calculation.billDiscount)}</span>
              </div>
            )}

            {calculation.packagingCharge > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Packaging Fee</span>
                <span className="font-semibold text-slate-800">{formatINR(calculation.packagingCharge)}</span>
              </div>
            )}

            {/* Indian GST Breakdown */}
            <div className="flex justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
              <span>CGST (2.5%)</span>
              <span>{formatINR(calculation.cgstAmount, true)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>SGST (2.5%)</span>
              <span>{formatINR(calculation.sgstAmount, true)}</span>
            </div>

            {calculation.roundOff !== 0 && (
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>Round-off</span>
                <span>{calculation.roundOff > 0 ? `+${calculation.roundOff}` : `${calculation.roundOff}`}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-t border-slate-300 pt-2 text-sm font-extrabold text-slate-900">
              <span>Payable Total:</span>
              <span className="text-xl text-amber-700 tracking-tight">
                {formatINR(calculation.grandTotal)}
              </span>
            </div>

            {/* Action Buttons: Hold, Fire KOT, Settle */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHoldOrder}
                className="text-xs font-bold gap-1"
              >
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Hold</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFireKOT}
                className="text-xs font-bold gap-1 border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100"
              >
                <ChefHat className="h-3.5 w-3.5 text-amber-600" />
                <span>Fire KOT</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setPaymentOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-sm"
              >
                <Banknote className="h-3.5 w-3.5" />
                <span>Settle ₹{calculation.grandTotal}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ALL MODALS */}
      {/* 1. Customization Modal (Variants & Extras) */}
      {customizingItem && (
        <ModifierModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onConfirm={(customized) => {
            addToCartDirect(customizingItem, {
              variantId: customized.variantId,
              variantName: customized.variantName,
              variantPrice: customized.variantPrice,
              selectedModifiers: customized.selectedModifiers,
              cookingNotes: customized.cookingNotes,
            });
            setCustomizingItem(null);
          }}
        />
      )}

      {/* 2. Payment Settlement Modal */}
      {paymentOpen && calculation && (
        <PaymentModal
          grandTotal={calculation.grandTotal}
          subtotal={calculation.subtotal}
          taxAmount={calculation.totalTax}
          orderType={orderType}
          tableNumber={orderType === "DINE_IN" ? selectedTable : undefined}
          customerName={customerName || undefined}
          onClose={() => setPaymentOpen(false)}
          onPaymentSuccess={onPaymentSuccess}
          onSettleApi={handleSettleApi}
        />
      )}

      {/* 3. Thermal Receipt Preview Modal */}
      {receiptData && (
        <ThermalReceiptModal
          receiptData={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* 4. Kitchen Order Ticket (KOT) Modal */}
      {kotTicketData && (
        <KOTTicketModal
          kot={kotTicketData}
          onClose={() => setKotTicketData(null)}
        />
      )}

      {/* 5. Supervisor PIN Modal */}
      {supervisorModal.open && (
        <SupervisorPinModal
          title={supervisorModal.title}
          description={supervisorModal.description}
          actionType={supervisorModal.actionType}
          onClose={() => setSupervisorModal({ ...supervisorModal, open: false })}
          onSuccess={handleSupervisorSuccess}
        />
      )}

      {/* 6. Held Orders Drawer Modal */}
      {heldOrdersModalOpen && (
        <HeldOrdersModal
          heldOrders={heldOrdersList}
          onClose={() => setHeldOrdersModalOpen(false)}
          onResume={handleResumeOrder}
          onDelete={handleDeleteHeldOrder}
        />
      )}

      {/* 7. Table Transfer Modal */}
      {tableTransferOpen && (
        <TableTransferModal
          currentTable={selectedTable}
          availableTables={tables.filter((t) => t.status === "AVAILABLE")}
          onClose={() => setTableTransferOpen(false)}
          onTransfer={handleTableTransfer}
        />
      )}

      {/* 8. Split Bill Modal */}
      {splitBillOpen && calculation && (
        <SplitBillModal
          grandTotal={calculation.grandTotal}
          onClose={() => setSplitBillOpen(false)}
          onConfirmSplit={(guestCount, perPerson) => {
            setSplitBillOpen(false);
            setPaymentOpen(true);
          }}
        />
      )}
    </div>
  );
}
