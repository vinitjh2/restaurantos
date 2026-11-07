"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, Users, Plus, RefreshCw, Clock, X, Check, QrCode, Download, Printer } from "lucide-react";
import QRCode from "qrcode";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TableSeatRecord {
  id: string;
  tableNumber: string;
  floor: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "BILLED" | "CLEANING" | string;
  currentOrderId?: string | null;
  createdAt?: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableSeatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newFloor, setNewFloor] = useState("Ground Floor");
  const [newCapacity, setNewCapacity] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [qrModalTable, setQrModalTable] = useState<TableSeatRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showAllQrModal, setShowAllQrModal] = useState(false);
  const [allQrMap, setAllQrMap] = useState<
    Array<{ tableNumber: string; floor: string; capacity: number; qrUrl: string; dataUrl: string }>
  >([]);
  const [generatingBatchQr, setGeneratingBatchQr] = useState(false);

  const handleOpenQRModal = async (t: TableSeatRecord) => {
    setQrModalTable(t);
    const host = typeof window !== "undefined" ? window.location.origin : "https://restaurantos.io";
    const qrUrl = `${host}/qr-order?branch=IND&table=${encodeURIComponent(t.tableNumber)}`;
    try {
      const url = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });
      setQrDataUrl(url);
    } catch (e) {
      console.error("QR generation error:", e);
    }
  };

  const handleOpenAllQrModal = async () => {
    setShowAllQrModal(true);
    setGeneratingBatchQr(true);
    const host = typeof window !== "undefined" ? window.location.origin : "https://restaurantos.io";
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
        setTables(data.tables);
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

  const filteredTables = tables.filter(
    (t) => selectedFloor === "All" || t.floor === selectedFloor
  );

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
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update table status:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:border-emerald-400";
      case "OCCUPIED":
        return "border-amber-200 bg-amber-50/40 text-amber-800 hover:border-amber-400";
      case "BILLED":
        return "border-blue-200 bg-blue-50/40 text-blue-800 hover:border-blue-400";
      case "CLEANING":
        return "border-slate-200 bg-slate-100/60 text-slate-500 hover:border-slate-400";
      default:
        return "border-slate-200 bg-white text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Table & Floor Layout</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live dining room telemetry, real-time occupancy and table management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAllQrModal}
            className="gap-1.5 text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
            title="Generate and print QR standees for all tables at once"
          >
            <QrCode className="h-3.5 w-3.5 text-amber-600" />
            <span>Print All QR Cards</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTables}
            className="gap-1.5 text-xs"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
            <span>Sync Floors</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setErrorMessage("");
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 text-xs bg-slate-900 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Table</span>
          </Button>
        </div>
      </div>

      {/* Floor Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {floors.map((floor) => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedFloor === floor
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-600" />
          Loading floor configuration...
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          No tables found on this floor.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${getStatusColor(
                table.status
              )}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">{table.tableNumber}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenQRModal(table)}
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

              <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{table.status}</span>
                </div>

                {/* Quick Status Action Selector */}
                <select
                  value={table.status}
                  onChange={(e) => handleUpdateStatus(table.id, e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="AVAILABLE">Mark Available</option>
                  <option value="OCCUPIED">Mark Occupied</option>
                  <option value="BILLED">Mark Billed</option>
                  <option value="CLEANING">Mark Cleaning</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleAddTable}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Table</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Table Number / Code</label>
                <input
                  type="text"
                  placeholder="e.g. T-12, AC-05, RF-08"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 font-bold focus:outline-none focus:border-amber-500 uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Floor / Dining Area</label>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="AC Family Hall">AC Family Hall</option>
                  <option value="Rooftop Garden">Rooftop Garden</option>
                  <option value="Private Dining">Private Dining</option>
                  <option value="Outdoor Patio">Outdoor Patio</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-slate-900 text-white"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Save Table"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* QR Tent Card Printable Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Table {qrModalTable.tableNumber} QR Code</h3>
                <p className="text-[11px] text-slate-400">{qrModalTable.floor} • Capacity {qrModalTable.capacity}</p>
              </div>
              <button
                onClick={() => setQrModalTable(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Tent Card Preview */}
            <div className="rounded-2xl border-2 border-slate-900 p-5 bg-gradient-to-b from-white to-slate-50 shadow-inner space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-amber-600">
                <UtensilsCrossed className="h-4 w-4" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                  Bawarchi Royale
                </span>
              </div>

              <div className="mx-auto w-48 h-48 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`QR for Table ${qrModalTable.tableNumber}`} className="w-full h-full" />
                ) : (
                  <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
                )}
              </div>

              <div>
                <span className="text-base font-black text-slate-900">TABLE {qrModalTable.tableNumber}</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Scan to View Digital Menu & Order (No Waiter Needed)
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/qr-order?branch=IND&table=${encodeURIComponent(qrModalTable.tableNumber)}`
                    : `/qr-order?table=${qrModalTable.tableNumber}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setQrModalTable(null)}
                className="flex-1 h-9 rounded-xl text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Print All Table QR Standees Modal */}
      {showAllQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <div>
                <h3 className="text-lg font-bold text-slate-900">All Table QR Standees / Wall Stickers</h3>
                <p className="text-xs text-slate-500">
                  Ready to print and place on each table. Customers can scan to order directly without a waiter.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  <Printer className="h-4 w-4" /> Print All Standees
                </Button>
                <button
                  onClick={() => setShowAllQrModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {generatingBatchQr ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-semibold">Generating QR Codes for all tables...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-1 print:max-h-none print:overflow-visible print:grid-cols-2">
                {allQrMap.map((item) => (
                  <div
                    key={item.tableNumber}
                    className="rounded-2xl border-2 border-slate-900 p-4 bg-white text-center shadow-xs flex flex-col items-center justify-between space-y-2 break-inside-avoid"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-amber-600">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                        Bawarchi Royale
                      </span>
                    </div>

                    <div className="w-36 h-36 bg-white p-1 rounded-lg border border-slate-100 flex items-center justify-center">
                      <img src={item.dataUrl} alt={`QR for Table ${item.tableNumber}`} className="w-full h-full" />
                    </div>

                    <div>
                      <div className="text-sm font-black text-slate-900">TABLE {item.tableNumber}</div>
                      <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                        SCAN TO ORDER FOOD
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {item.floor} • No Waiter Needed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end border-t pt-3 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllQrModal(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
