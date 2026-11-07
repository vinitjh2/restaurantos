"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MenuItemRecord {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  dietType?: string;
  dietary?: string;
  gstRate?: number;
  hsnSacCode?: string;
  sacCode?: string;
  isAvailable: boolean;
  kitchenStation?: string;
  shortCode?: string;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // New Dish Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Main Course");
  const [newPrice, setNewPrice] = useState<number | string>("");
  const [newDietary, setNewDietary] = useState("VEG");
  const [newStation, setNewStation] = useState("Main Kitchen");
  const [newGstRate, setNewGstRate] = useState(5.0);
  const [newSacCode, setNewSacCode] = useState("996331");

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pos/menu");
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error("Failed to load menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/pos/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isAvailable: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isAvailable: !currentStatus } : i))
        );
      }
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCategory.trim() || !newPrice) {
      setErrorMessage("Please fill all required dish details");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const res = await fetch("/api/pos/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory.trim(),
          basePrice: Number(newPrice),
          dietary: newDietary,
          kitchenStation: newStation,
          gstRate: Number(newGstRate),
          sacCode: newSacCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewName("");
        setNewPrice("");
        fetchMenu();
      } else {
        setErrorMessage(data.error || "Failed to create dish");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Menu & Pricing Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dishes, dietary tags, GST tax slabs (SAC 996331) and KDS routing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMenu}
            className="gap-1.5 text-xs"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
            <span>Refresh</span>
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
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dish by name, category, short code..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-600" />
            Loading dishes from database...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No dishes found matching your query.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Dish Name</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Station</th>
                <th className="py-3.5 px-4 font-semibold text-right">Base Price</th>
                <th className="py-3.5 px-4 font-semibold text-center">GST Slab</th>
                <th className="py-3.5 px-4 font-semibold text-center">SAC Code</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Toggle Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-3 w-3 items-center justify-center rounded-xs border p-0.5 ${
                          (item.dietType || item.dietary) === "VEG"
                            ? "border-emerald-600 bg-white"
                            : "border-rose-600 bg-white"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            (item.dietType || item.dietary) === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                      </span>
                      <div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        {item.shortCode && (
                          <span className="ml-1.5 text-[10px] font-mono text-slate-400">
                            [{item.shortCode}]
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{item.category}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.kitchenStation || "Main Kitchen"}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatINR(item.basePrice)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant="outline" className="text-[10px]">
                      {item.gstRate ?? 5}% (Composite)
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-600">
                    {item.hsnSacCode || item.sacCode || "996331"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={item.isAvailable ? "success" : "secondary"}>
                      {item.isAvailable ? "Available" : "86'd / Sold Out"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant={item.isAvailable ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      className="h-7 text-[11px]"
                    >
                      {item.isAvailable ? "86 Dish" : "Make Available"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Menu Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleAddItem}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Menu Item</h3>
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
                <label className="font-semibold text-slate-700 block mb-1">Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. Garlic Naan, Chicken Tikka Masala"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Starters, Biryani"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="₹"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dietary Tag</label>
                  <select
                    value={newDietary}
                    onChange={(e) => setNewDietary(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  >
                    <option value="VEG">Vegetarian (Green Dot)</option>
                    <option value="NON_VEG">Non-Vegetarian (Red Dot)</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="EGG">Egg Only</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kitchen Station</label>
                  <select
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  >
                    <option value="Main Kitchen">Main Kitchen</option>
                    <option value="Tandoor Station">Tandoor Station</option>
                    <option value="Biryani Counter">Biryani Counter</option>
                    <option value="Beverage Counter">Beverage Counter</option>
                    <option value="Dessert Station">Dessert Station</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GST Tax Slab</label>
                  <select
                    value={newGstRate}
                    onChange={(e) => setNewGstRate(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  >
                    <option value="5.0">5% (Composite CGST 2.5% + SGST 2.5%)</option>
                    <option value="18.0">18% (AC Luxury Restaurant)</option>
                    <option value="0.0">0% (Exempt)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SAC Code</label>
                  <input
                    type="text"
                    value={newSacCode}
                    onChange={(e) => setNewSacCode(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
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
                {submitting ? "Adding..." : "Save Dish"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
