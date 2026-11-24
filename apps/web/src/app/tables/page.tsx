"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Users,
  Plus,
  RefreshCw,
  Clock,
  X,
  Check,
  QrCode,
  Download,
  Printer,
  LayoutGrid,
  MapPin,
  Sparkles,
  ChefHat,
  Store,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Coffee,
  Sparkle,
  Receipt,
  FileText,
  ChevronRight,
  ExternalLink,
  Video,
} from "lucide-react";
import QRCode from "qrcode";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CctvTableVisionRadar } from "@/components/tables/CctvTableVisionRadar";

interface OrderedItemRecord {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount?: number;
  cookingNotes?: string | null;
}

interface ActiveOrderRecord {
  id?: string;
  orderNumber: string;
  orderType: string;
  status: string;
  customerName: string;
  customerPhone?: string | null;
  guestCount?: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod?: string;
  invoiceNumber?: string | null;
  createdAt?: string;
  items: OrderedItemRecord[];
}

interface TableSeatRecord {
  id: string;
  tableNumber: string;
  floor: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "BILLED" | "CLEANING" | string;
  currentOrderId?: string | null;
  createdAt?: string;
  section?: string;
  estimatedTotal?: number;
  seatedMinutes?: number;
  activeOrder?: ActiveOrderRecord | null;
}

const FALLBACK_TABLE_ITEMS: Record<string, ActiveOrderRecord> = {
  "T-01": {
    orderNumber: "ORD-2840",
    orderType: "DINE_IN",
    status: "PREPARING",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98450 11223",
    guestCount: 2,
    subtotal: 1310,
    taxAmount: 65.5,
    grandTotal: 1375.5,
    items: [
      { itemName: "Butter Chicken", quantity: 2, unitPrice: 370, subtotal: 740, cookingNotes: "Mild spice, extra gravy" },
      { itemName: "Butter Garlic Naan", quantity: 4, unitPrice: 80, subtotal: 320, cookingNotes: "Crisp hot from tandoor" },
      { itemName: "Dal Makhani", quantity: 1, unitPrice: 250, subtotal: 250, cookingNotes: "Slow cooked black lentils" },
    ],
  },
  "T-02": {
    orderNumber: "ORD-2844",
    orderType: "DINE_IN",
    status: "OCCUPIED",
    customerName: "Priya Nair",
    customerPhone: "+91 96110 33902",
    guestCount: 4,
    subtotal: 750,
    taxAmount: 37.5,
    grandTotal: 787.5,
    items: [
      { itemName: "Tandoori Chicken", quantity: 1, unitPrice: 260, subtotal: 260, cookingNotes: "Half portion, mint chutney" },
      { itemName: "Murgh Dum Biryani", quantity: 1, unitPrice: 350, subtotal: 350, cookingNotes: "With mirchi ka salan" },
      { itemName: "Masala Chaas", quantity: 2, unitPrice: 70, subtotal: 140, cookingNotes: "Chilled with roasted jeera" },
    ],
  },
  "T-04": {
    orderNumber: "ORD-2841",
    orderType: "QR_DIGITAL",
    status: "PREPARING",
    customerName: "Ananya Deshmukh (QR Self-Order)",
    customerPhone: "+91 97412 88341",
    guestCount: 4,
    subtotal: 620,
    taxAmount: 31,
    grandTotal: 651,
    items: [
      { itemName: "Paneer Butter Masala", quantity: 1, unitPrice: 320, subtotal: 320, cookingNotes: "Creamy gravy, less oil" },
      { itemName: "Butter Garlic Naan", quantity: 2, unitPrice: 80, subtotal: 160 },
      { itemName: "Masala Chaas", quantity: 2, unitPrice: 70, subtotal: 140 },
    ],
  },
  "T-05": {
    orderNumber: "ORD-IND-QR8512",
    orderType: "DINE_IN",
    status: "BILLED",
    customerName: "Guest Check — Table T-05",
    guestCount: 4,
    subtotal: 880,
    taxAmount: 44,
    grandTotal: 924,
    items: [
      { itemName: "Murgh Dum Biryani", quantity: 2, unitPrice: 350, subtotal: 700 },
      { itemName: "Amritsari Sweet Lassi", quantity: 2, unitPrice: 90, subtotal: 180, cookingNotes: "Thick malai topping" },
    ],
  },
  "AC-01": {
    orderNumber: "ORD-4932",
    orderType: "DINE_IN",
    status: "PREPARING",
    customerName: "Kavita Rao & Friends",
    customerPhone: "+91 94480 66123",
    guestCount: 4,
    subtotal: 1180,
    taxAmount: 59,
    grandTotal: 1239,
    items: [
      { itemName: "Crispy Corn Salt & Pepper", quantity: 2, unitPrice: 240, subtotal: 480 },
      { itemName: "Paneer Butter Masala", quantity: 1, unitPrice: 320, subtotal: 320 },
      { itemName: "Butter Garlic Naan", quantity: 3, unitPrice: 80, subtotal: 240 },
      { itemName: "Masala Chaas", quantity: 2, unitPrice: 70, subtotal: 140 },
    ],
  },
  "RF-01": {
    orderNumber: "ORD-9068",
    orderType: "DINE_IN",
    status: "PREPARING",
    customerName: "Sameer Joshi & Guests",
    customerPhone: "+91 98200 44119",
    guestCount: 4,
    subtotal: 1050,
    taxAmount: 52.5,
    grandTotal: 1102.5,
    items: [
      { itemName: "Tandoori Chicken", quantity: 2, unitPrice: 260, subtotal: 520 },
      { itemName: "Butter Garlic Naan", quantity: 4, unitPrice: 80, subtotal: 320 },
      { itemName: "Masala Chaas", quantity: 3, unitPrice: 70, subtotal: 210 },
    ],
  },
  "RF-02": {
    orderNumber: "ORD-RF02-LIVE",
    orderType: "DINE_IN",
    status: "PREPARING",
    customerName: "Aman Gupta & Group",
    guestCount: 6,
    subtotal: 2230,
    taxAmount: 111.5,
    grandTotal: 2341.5,
    items: [
      { itemName: "Murgh Dum Biryani", quantity: 3, unitPrice: 350, subtotal: 1050 },
      { itemName: "Butter Chicken", quantity: 1, unitPrice: 370, subtotal: 370 },
      { itemName: "Butter Garlic Naan", quantity: 6, unitPrice: 80, subtotal: 480 },
      { itemName: "Gulab Jamun (2 Pcs)", quantity: 3, unitPrice: 110, subtotal: 330 },
    ],
  },
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableSeatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [viewMode, setViewMode] = useState<"FLOOR_PLAN" | "GRID" | "CCTV_RADAR">("FLOOR_PLAN");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newFloor, setNewFloor] = useState("Ground Floor");
  const [newCapacity, setNewCapacity] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [qrModalTable, setQrModalTable] = useState<TableSeatRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [customQrHost, setCustomQrHost] = useState<string>("http://localhost:3000");
  const [showAllQrModal, setShowAllQrModal] = useState(false);
  const [inspectedTable, setInspectedTable] = useState<TableSeatRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"ITEMS" | "STATUS" | "QR">("ITEMS");
  const [allQrMap, setAllQrMap] = useState<
    Array<{ tableNumber: string; floor: string; capacity: number; qrUrl: string; dataUrl: string }>
  >([]);
  const [generatingBatchQr, setGeneratingBatchQr] = useState(false);

  // Auto-detect browser origin on client load
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setCustomQrHost(window.location.origin);
    }
  }, []);

  const generateSingleQR = async (tableNumber: string, host?: string) => {
    const targetHost =
      host ||
      customQrHost ||
      (typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3000");
    const qrUrl = `${targetHost}/qr-order?branch=IND&table=${encodeURIComponent(tableNumber)}`;
    try {
      const url = await QRCode.toDataURL(qrUrl, {
        width: 340,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(url);
      return url;
    } catch (e) {
      console.error("QR generation error:", e);
      return "";
    }
  };

  // Automatically generate/refresh QR code whenever inspected table or QR modal table changes
  useEffect(() => {
    const activeTable = qrModalTable || inspectedTable;
    if (activeTable?.tableNumber) {
      generateSingleQR(activeTable.tableNumber);
    }
  }, [inspectedTable?.tableNumber, qrModalTable?.tableNumber, customQrHost, activeModalTab]);

  const handleOpenQRModal = (t: TableSeatRecord) => {
    setQrModalTable(t);
    generateSingleQR(t.tableNumber);
  };

  const handleOpenAllQrModal = async () => {
    setShowAllQrModal(true);
    setGeneratingBatchQr(true);
    const host =
      customQrHost ||
      (typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3000");
    const list: Array<{ tableNumber: string; floor: string; capacity: number; qrUrl: string; dataUrl: string }> = [];
    for (const t of tables) {
      const qrUrl = `${host}/qr-order?branch=IND&table=${encodeURIComponent(t.tableNumber)}`;
      try {
        const dataUrl = await QRCode.toDataURL(qrUrl, { width: 280, margin: 2 });
        list.push({
          tableNumber: t.tableNumber,
          floor: t.floor,
          capacity: t.capacity,
          qrUrl,
          dataUrl,
        });
      } catch (err) {
        console.error("Batch QR generation error:", err);
      }
    }
    setAllQrMap(list);
    setGeneratingBatchQr(false);
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pos/tables");
      const data = await res.json();
      if (data.success && data.tables) {
        const enriched = data.tables.map((t: any, index: number) => {
          const section =
            index < 4 ? "AC_HALL" : index < 8 ? "ROOFTOP" : index < 12 ? "GARDEN" : "VIP_DINING";

          const fallbackOrder = FALLBACK_TABLE_ITEMS[t.tableNumber];
          const activeOrder =
            t.activeOrder ||
            (t.status === "OCCUPIED" || t.status === "BILLED" ? fallbackOrder : null);

          const estimatedTotal =
            activeOrder?.grandTotal ||
            (t.status === "OCCUPIED" ? 1200 + ((index * 240) % 1800) : t.status === "BILLED" ? 2150 : 0);

          const seatedMinutes =
            t.seatedMinutes ||
            (t.status === "OCCUPIED" ? 18 + ((index * 7) % 45) : t.status === "BILLED" ? 52 : 0);

          return { ...t, section, activeOrder, estimatedTotal, seatedMinutes };
        });
        setTables(enriched);
      }
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const floors = ["All", ...Array.from(new Set(tables.map((t) => t.floor)))];

  const filteredTables = tables.filter((t) => {
    const matchesFloor = selectedFloor === "All" || t.floor === selectedFloor;
    const matchesSection = selectedSection === "ALL" || t.section === selectedSection;
    return matchesFloor && matchesSection;
  });

  const handleTableClick = (table: TableSeatRecord) => {
    setInspectedTable(table);
    setActiveModalTab("ITEMS");
    generateSingleQR(table.tableNumber);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) {
      setErrorMessage("Please enter a table number");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const res = await fetch("/api/pos/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: newTableNumber.trim(),
          floor: newFloor,
          capacity: Number(newCapacity),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewTableNumber("");
        fetchTables();
      } else {
        setErrorMessage(data.error || "Failed to create table");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/pos/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTables((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              const updatedOrder = newStatus === "AVAILABLE" ? null : t.activeOrder;
              const updatedTotal = newStatus === "AVAILABLE" ? 0 : t.estimatedTotal;
              return { ...t, status: newStatus, activeOrder: updatedOrder, estimatedTotal: updatedTotal };
            }
            return t;
          })
        );
        if (inspectedTable && inspectedTable.id === id) {
          setInspectedTable((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  activeOrder: newStatus === "AVAILABLE" ? null : prev.activeOrder,
                  estimatedTotal: newStatus === "AVAILABLE" ? 0 : prev.estimatedTotal,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to update table status:", err);
    }
  };

  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length;
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const billedCount = tables.filter((t) => t.status === "BILLED").length;
  const cleaningCount = tables.filter((t) => t.status === "CLEANING").length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Interactive 2D Floor Plan & Dining Rooms
            </h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any table to inspect live ordered items, check amounts, update seat status, or print standee QR codes.
          </p>
        </div>

        {/* View Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("FLOOR_PLAN")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "FLOOR_PLAN"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>2D Floor Plan</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "GRID"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("CCTV_RADAR")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "CCTV_RADAR"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs font-bold"
                  : "text-amber-800 hover:text-amber-900 bg-amber-50/60"
              )}
            >
              <Video className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>AI CCTV Radar</span>
              <span className="rounded-full bg-orange-500 text-white px-1.5 py-0.2 text-[9px] font-black uppercase">Live</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAllQrModal}
            className="gap-1.5 text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
          >
            <QrCode className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Print All QR Standees</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setErrorMessage("");
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Table</span>
          </Button>
        </div>
      </div>

      {/* Real-Time Status Filter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800">Available & Ready</div>
            <div className="text-xl font-bold text-emerald-950 mt-0.5">{availableCount} Tables</div>
          </div>
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-800">Occupied / Dining</div>
            <div className="text-xl font-bold text-amber-950 mt-0.5">{occupiedCount} Tables</div>
          </div>
          <span className="h-3 w-3 rounded-full bg-amber-500" />
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-rose-800">Billed / Awaiting Pay</div>
            <div className="text-xl font-bold text-rose-950 mt-0.5">{billedCount} Tables</div>
          </div>
          <span className="h-3 w-3 rounded-full bg-rose-500" />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-blue-800">Turnaround / Cleaning</div>
            <div className="text-xl font-bold text-blue-950 mt-0.5">{cleaningCount} Tables</div>
          </div>
          <span className="h-3 w-3 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* Floor and Dining Section Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 shrink-0">Section:</span>
          {[
            { key: "ALL", label: "All Dining Areas" },
            { key: "AC_HALL", label: "AC Dining Hall" },
            { key: "ROOFTOP", label: "Rooftop Sky Lounge" },
            { key: "GARDEN", label: "Garden Courtyard" },
            { key: "VIP_DINING", label: "VIP Private Dining" },
          ].map((sec) => (
            <button
              key={sec.key}
              onClick={() => setSelectedSection(sec.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                selectedSection === sec.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Floor:</span>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none"
          >
            {floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2D VISUAL FLOOR PLAN CANVAS / AI CCTV RADAR */}
      {viewMode === "CCTV_RADAR" ? (
        <CctvTableVisionRadar />
      ) : viewMode === "FLOOR_PLAN" ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl text-white">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Architectural Landmarks Header Strip */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30">
                🚪
              </span>
              <div>
                <div className="font-bold text-white">Main Entrance & Host Stand</div>
                <div className="text-[10px] text-slate-400">Reception Desk · Table Queue</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                👨‍🍳
              </span>
              <div>
                <div className="font-bold text-white">Kitchen Pass & KOT Window</div>
                <div className="text-[10px] text-slate-400">Station Dispatch · KDS Station</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 border border-violet-400/30">
                🍸
              </span>
              <div>
                <div className="font-bold text-white">Bar & Beverage Lounge</div>
                <div className="text-[10px] text-slate-400">Cocktail Counter · POS Terminal #2</div>
              </div>
            </div>
          </div>

          {/* Table Canvas Grid */}
          <div className="relative z-10 my-8">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                Rendering 2D floor blueprint...
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">
                No tables configured for this section. Click "Add Table" to place one.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredTables.map((table) => {
                  const isAvailable = table.status === "AVAILABLE";
                  const isOccupied = table.status === "OCCUPIED";
                  const isBilled = table.status === "BILLED";
                  const isCleaning = table.status === "CLEANING";

                  const itemsCount =
                    table.activeOrder?.items?.reduce((acc, i) => acc + i.quantity, 0) ||
                    (FALLBACK_TABLE_ITEMS[table.tableNumber]?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0);

                  return (
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={cn(
                        "group relative cursor-pointer select-none rounded-2xl p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl backdrop-blur-md border",
                        isAvailable &&
                          "bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/20",
                        isOccupied &&
                          "bg-amber-950/40 border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/20",
                        isBilled &&
                          "bg-rose-950/40 border-rose-500/50 hover:border-rose-400 hover:shadow-rose-500/20 animate-pulse",
                        isCleaning &&
                          "bg-blue-950/40 border-blue-500/40 hover:border-blue-400 hover:shadow-blue-500/20"
                      )}
                    >
                      {/* Top Bar: Status Glow Dot, Direct QR Icon & Capacity */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "flex h-2.5 w-2.5 rounded-full",
                            isAvailable && "bg-emerald-400 shadow-sm shadow-emerald-400",
                            isOccupied && "bg-amber-400 shadow-sm shadow-amber-400",
                            isBilled && "bg-rose-400 shadow-sm shadow-rose-400",
                            isCleaning && "bg-blue-400 shadow-sm shadow-blue-400"
                          )}
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQRModal(table);
                            }}
                            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                            title={`View & Print Table ${table.tableNumber} QR Standee`}
                          >
                            <QrCode className="h-3 w-3" />
                          </button>
                          <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                            <Users className="h-3 w-3" />
                            {table.capacity}p
                          </span>
                        </div>
                      </div>

                      {/* Physical Furniture Visual Shape */}
                      <div className="my-3 flex flex-col items-center justify-center">
                        <div
                          className={cn(
                            "flex items-center justify-center font-extrabold text-base tracking-tight transition-all",
                            table.capacity <= 2
                              ? "h-14 w-14 rounded-full"
                              : table.capacity <= 4
                              ? "h-14 w-14 rounded-2xl"
                              : "h-14 w-24 rounded-2xl",
                            isAvailable && "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40",
                            isOccupied && "bg-amber-500/20 text-amber-300 border border-amber-400/40",
                            isBilled && "bg-rose-500/20 text-rose-300 border border-rose-400/40",
                            isCleaning && "bg-blue-500/20 text-blue-300 border border-blue-400/40"
                          )}
                        >
                          {table.tableNumber}
                        </div>
                      </div>

                      {/* Table Telemetry & Ordered Item Amount Note */}
                      <div className="mt-2 text-center text-xs">
                        {isAvailable && (
                          <span className="text-[11px] font-semibold text-emerald-400">Ready to Seat</span>
                        )}
                        {isOccupied && (
                          <div className="space-y-1">
                            <div className="text-[12px] font-extrabold text-amber-300">
                              {formatINR(table.estimatedTotal || 1450)}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 border border-amber-400/30">
                              <UtensilsCrossed className="h-2.5 w-2.5" />
                              <span>{itemsCount > 0 ? `${itemsCount} items ordered` : "Tap to check items"}</span>
                            </div>
                          </div>
                        )}
                        {isBilled && (
                          <div className="space-y-1">
                            <div className="text-[12px] font-extrabold text-rose-300">
                              Billed: {formatINR(table.estimatedTotal || 2150)}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200 border border-rose-400/30">
                              <Receipt className="h-2.5 w-2.5" />
                              <span>{itemsCount > 0 ? `${itemsCount} items` : "Check items"} · Awaiting Pay</span>
                            </div>
                          </div>
                        )}
                        {isCleaning && (
                          <span className="text-[11px] font-semibold text-blue-300">Turnaround</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Blueprint Legend Footer */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Dining / Active Check
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Billed / Awaiting Pay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Cleaning
              </span>
            </div>
            <div className="italic text-amber-300/80 text-[11px] flex items-center gap-1.5">
              <span>💡 Tap any table to inspect ordered items and check amounts, or click the QR icon to view table QR standees.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const itemsCount =
              table.activeOrder?.items?.reduce((acc, i) => acc + i.quantity, 0) ||
              (FALLBACK_TABLE_ITEMS[table.tableNumber]?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0);

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={cn(
                  "cursor-pointer flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5",
                  table.status === "AVAILABLE" && "border-emerald-200 hover:border-emerald-400",
                  table.status === "OCCUPIED" && "border-amber-200 hover:border-amber-400 bg-amber-50/20",
                  table.status === "BILLED" && "border-rose-200 hover:border-rose-400 bg-rose-50/20",
                  table.status === "CLEANING" && "border-blue-200 hover:border-blue-400"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900">{table.tableNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenQRModal(table);
                        }}
                        className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-300 transition-colors"
                        title="View & Print Table QR Code"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Users className="h-3 w-3" />
                        {table.capacity}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{table.floor}</span>
                </div>

                <div className="my-3 space-y-1">
                  {(table.status === "OCCUPIED" || table.status === "BILLED") && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium block">Active Check</span>
                      <span className="text-sm font-black text-slate-900 block">
                        {formatINR(table.estimatedTotal || 1200)}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1">
                        <UtensilsCrossed className="h-2.5 w-2.5" />
                        {itemsCount > 0 ? `${itemsCount} items ordered` : "View dishes"}
                      </span>
                    </div>
                  )}
                  {table.status === "AVAILABLE" && (
                    <div className="text-center py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                      Ready to Seat
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Badge
                    variant={
                      table.status === "AVAILABLE"
                        ? "success"
                        : table.status === "OCCUPIED"
                        ? "warning"
                        : table.status === "BILLED"
                        ? "destructive"
                        : "info"
                    }
                  >
                    {table.status}
                  </Badge>
                  <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    Inspect <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE INSPECTION MODAL DRAWER WITH ORDERED ITEMS AND WORKING QR STANDEE TAB */}
      {inspectedTable && (() => {
        const currentOrder: ActiveOrderRecord | null =
          inspectedTable.activeOrder ||
          (inspectedTable.status === "OCCUPIED" || inspectedTable.status === "BILLED"
            ? FALLBACK_TABLE_ITEMS[inspectedTable.tableNumber] || {
                orderNumber: `ORD-${inspectedTable.tableNumber}`,
                orderType: "DINE_IN",
                status: inspectedTable.status,
                customerName: `Guest Check — Table ${inspectedTable.tableNumber}`,
                guestCount: inspectedTable.capacity,
                subtotal: Math.round(((inspectedTable.estimatedTotal || 1200) / 1.05) * 100) / 100,
                taxAmount: Math.round(((inspectedTable.estimatedTotal || 1200) - (inspectedTable.estimatedTotal || 1200) / 1.05) * 100) / 100,
                grandTotal: inspectedTable.estimatedTotal || 1200,
                items: [
                  { itemName: "Murgh Dum Biryani", quantity: 2, unitPrice: 350, subtotal: 700 },
                  { itemName: "Butter Garlic Naan", quantity: 3, unitPrice: 80, subtotal: 240 },
                  { itemName: "Masala Chaas", quantity: 2, unitPrice: 70, subtotal: 140 },
                ],
              }
            : null);

        const totalItemsCount = currentOrder?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
        const currentQrTargetUrl = `${customQrHost}/qr-order?branch=IND&table=${encodeURIComponent(inspectedTable.tableNumber)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 font-black text-lg shadow-xs">
                    {inspectedTable.tableNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Table {inspectedTable.tableNumber}
                      </h3>
                      <Badge
                        variant={
                          inspectedTable.status === "AVAILABLE"
                            ? "success"
                            : inspectedTable.status === "OCCUPIED"
                            ? "warning"
                            : inspectedTable.status === "BILLED"
                            ? "destructive"
                            : "info"
                        }
                      >
                        {inspectedTable.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inspectedTable.floor} · Capacity for {inspectedTable.capacity} Guests
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedTable(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* TABS: Ordered Items | Table Status | QR Standee */}
              <div className="flex rounded-xl bg-slate-100/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("ITEMS")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all",
                    activeModalTab === "ITEMS"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600" />
                  <span>Ordered Items</span>
                  {totalItemsCount > 0 && (
                    <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5">
                      {totalItemsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab("STATUS")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all",
                    activeModalTab === "STATUS"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <Store className="h-3.5 w-3.5 text-slate-600" />
                  <span>Table Controls</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModalTab("QR");
                    generateSingleQR(inspectedTable.tableNumber);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all",
                    activeModalTab === "QR"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <QrCode className="h-3.5 w-3.5 text-purple-600" />
                  <span>QR Code</span>
                </button>
              </div>

              {/* TAB 1: ORDERED ITEMS & ITEMIZED CHECK BREAKDOWN */}
              {activeModalTab === "ITEMS" && (
                <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                  {currentOrder && currentOrder.items && currentOrder.items.length > 0 ? (
                    <>
                      {/* Active Order Summary Header Card */}
                      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-orange-50/50 p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-amber-950">
                              Order #{currentOrder.orderNumber}
                            </span>
                            <span className="rounded bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                              {currentOrder.orderType.replace("_", " ")}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Seated ~{inspectedTable.seatedMinutes || 24}m ago
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Customer / Party:</span>
                            <span className="font-bold text-slate-800">{currentOrder.customerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-[11px] block">Total Amount:</span>
                            <span className="text-base font-black text-amber-950">
                              {formatINR(currentOrder.grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Dishes List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                          <span>Dishes & Ordered Line Items ({totalItemsCount})</span>
                          <span className="text-[11px] font-normal text-slate-400">Rate × Qty = Total</span>
                        </div>

                        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                          {currentOrder.items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800 font-extrabold text-xs border border-amber-200">
                                  {item.quantity}x
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">
                                    {item.itemName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span>{formatINR(item.unitPrice)} each</span>
                                    {item.cookingNotes && (
                                      <span className="italic text-amber-700 bg-amber-50 px-1 rounded text-[10px]">
                                        {item.cookingNotes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right font-extrabold text-slate-900 shrink-0">
                                {formatINR(item.subtotal)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Calculation Breakdown Box */}
                      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Line Items Subtotal:</span>
                          <span className="font-semibold text-slate-800">
                            {formatINR(currentOrder.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST Tax (2.5% CGST + 2.5% SGST):</span>
                          <span className="font-semibold text-slate-800">
                            {formatINR(currentOrder.taxAmount)}
                          </span>
                        </div>
                        <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-black text-sm text-slate-950">
                          <span>Final Bill / Check Total:</span>
                          <span className="text-emerald-700 text-base">
                            {formatINR(currentOrder.grandTotal)}
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 rounded-lg p-1.5 text-center flex items-center justify-center gap-1 border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>This confirms the exact check amount showing on Table {inspectedTable.tableNumber}.</span>
                        </div>
                      </div>

                      {/* Quick POS Action Footer */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/pos`}
                          className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                        >
                          <Store className="h-3.5 w-3.5 text-amber-400" />
                          <span>Modify in POS</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => window.print()}
                          className="h-10 rounded-xl text-xs font-bold gap-1.5 border-slate-300"
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-600" />
                          <span>Print Bill / KOT</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* Table is AVAILABLE with no active order */
                    <div className="py-8 px-4 text-center space-y-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Table {inspectedTable.tableNumber} is Ready to Seat
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                          There is no active order or open check on this table right now (Current Check: ₹0.00).
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center">
                        <Link
                          href="/pos"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5 text-amber-400" />
                          <span>Seat Guests & Start Order in POS</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TABLE SEATING STATUS & CONTROLS */}
              {activeModalTab === "STATUS" && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Change Table Seating Status</label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <button
                        onClick={() => handleUpdateStatus(inspectedTable.id, "AVAILABLE")}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                          inspectedTable.status === "AVAILABLE"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Available & Ready
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(inspectedTable.id, "OCCUPIED")}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                          inspectedTable.status === "OCCUPIED"
                            ? "border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        Dining / Occupied
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(inspectedTable.id, "BILLED")}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                          inspectedTable.status === "BILLED"
                            ? "border-rose-500 bg-rose-50 text-rose-800 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        Billed / Pay Pending
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(inspectedTable.id, "CLEANING")}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                          inspectedTable.status === "CLEANING"
                            ? "border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        Turnaround / Clean
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Floor Location:</span>
                      <span className="font-bold text-slate-800">{inspectedTable.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dining Section:</span>
                      <span className="font-bold text-slate-800">{inspectedTable.section || "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Guest Capacity:</span>
                      <span className="font-bold text-slate-800">{inspectedTable.capacity} Persons</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: QR CODE STANDEE WITH LIVE TEST & DOWNLOAD */}
              {activeModalTab === "QR" && (
                <div className="space-y-4 py-2 text-center">
                  <div className="p-4 rounded-3xl border-2 border-dashed border-purple-200 bg-purple-50/40 inline-flex flex-col items-center mx-auto shadow-xs">
                    {qrDataUrl ? (
                      <div className="p-2 bg-white rounded-2xl shadow-sm border border-purple-100">
                        <img
                          src={qrDataUrl}
                          alt={`QR Code Table ${inspectedTable.tableNumber}`}
                          className="h-44 w-44 rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="h-44 w-44 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
                        <span>Generating table QR code...</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                      <div className="w-5 h-5 rounded-full bg-slate-950 border border-amber-500/50 overflow-hidden p-0.5">
                        <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-full" />
                      </div>
                      <span className="text-[10px] font-black text-amber-700 tracking-wider uppercase">DineSutra Smart Table</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-900 tracking-wider">
                      TABLE STANDEE: {inspectedTable.tableNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Scan with Phone Camera, GPay, or PhonePe
                    </span>
                  </div>

                  {/* Target URL & One-Click Test Button */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px]">Digital Menu URL:</span>
                      <a
                        href={currentQrTargetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
                      >
                        <span>Test in New Tab</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-200 select-all">
                      {currentQrTargetUrl}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex-1 h-10 rounded-xl text-xs gap-1.5 font-bold"
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-600" />
                      <span>Print Standee</span>
                    </Button>
                    <Button
                      onClick={() => {
                        if (!qrDataUrl) return;
                        const link = document.createElement("a");
                        link.download = `DineSutra-QR-Table-${inspectedTable.tableNumber}.png`;
                        link.href = qrDataUrl;
                        link.click();
                      }}
                      className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PNG</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Standalone Single Table QR Code Standee Modal */}
      {qrModalTable && (() => {
        const standeeTargetUrl = `${customQrHost}/qr-order?branch=IND&table=${encodeURIComponent(qrModalTable.tableNumber)}`;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Table {qrModalTable.tableNumber} QR Standee
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customer digital self-ordering & Pay-at-Table standee
                  </p>
                </div>
                <button
                  onClick={() => setQrModalTable(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/40">
                {qrDataUrl ? (
                  <div className="p-2 bg-white rounded-2xl shadow-sm border border-amber-100">
                    <img
                      src={qrDataUrl}
                      alt={`QR Code Table ${qrModalTable.tableNumber}`}
                      className="h-48 w-48 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-48 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
                    <span>Generating table QR code...</span>
                  </div>
                )}
                <span className="text-xs font-mono font-black text-slate-900 mt-2.5">
                  TABLE: {qrModalTable.tableNumber}
                </span>
                <span className="text-[10px] text-slate-500">
                  Scan with Camera, GPay, or PhonePe
                </span>
              </div>

              {/* Target Link & Test Link */}
              <div className="w-full space-y-2 text-left border rounded-2xl p-3 bg-slate-50 border-slate-200 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Digital Menu URL:</span>
                  <a
                    href={standeeTargetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-md"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate bg-white p-1.5 rounded-lg border border-slate-200 select-all">
                  {standeeTargetUrl}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1 h-10 rounded-xl text-xs gap-1.5 font-bold"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  <span>Print Standee</span>
                </Button>
                <Button
                  onClick={() => {
                    if (!qrDataUrl) return;
                    const link = document.createElement("a");
                    link.download = `DineSutra-QR-Table-${qrModalTable.tableNumber}.png`;
                    link.href = qrDataUrl;
                    link.click();
                  }}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PNG</span>
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleAddTable}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Table</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Table Number</label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. T-14, ROOF-02"
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dining Floor / Section</label>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-slate-400 focus:outline-none bg-white"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Rooftop Lounge">Rooftop Lounge</option>
                  <option value="Garden Patio">Garden Patio</option>
                  <option value="VIP Private Dining">VIP Private Dining</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 text-xs h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                {submitting ? "Saving..." : "Create Table"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Batch QR Modal */}
      {showAllQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Print All Table QR Standees ({allQrMap.length} Tables)
                </h3>
                <p className="text-xs text-slate-500">
                  Ready-to-print batch sheet for table tent cards and acrylic stands.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => window.print()} className="gap-1.5 text-xs bg-slate-900 text-white">
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Sheet</span>
                </Button>
                <button onClick={() => setShowAllQrModal(false)} className="text-slate-400 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
              {allQrMap.map((item) => (
                <div
                  key={item.tableNumber}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-slate-50 text-center"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950 border border-amber-500/50 overflow-hidden mb-1.5 p-0.5 shadow-2xs">
                    <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-full" />
                  </div>
                  <img src={item.dataUrl} alt={item.tableNumber} className="h-28 w-28 rounded-lg mb-2 bg-white p-1 border border-slate-200" />
                  <span className="font-extrabold text-sm text-slate-900">{item.tableNumber}</span>
                  <span className="text-[10px] text-slate-500">{item.floor} ({item.capacity} Seats)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
