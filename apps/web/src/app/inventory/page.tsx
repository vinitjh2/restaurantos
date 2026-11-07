"use client";

import { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Scale,
  ChefHat,
  History,
  PieChart,
  CheckCircle2,
  X,
  PackageCheck,
  AlertOctagon,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Ingredient {
  id: string;
  name: string;
  itemType: string;
  category: string;
  baseUom: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  purchasePrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

interface RecipeItem {
  id: string;
  menuItemId?: string;
  variantId?: string;
  yieldServings: number;
  instructions?: string;
  menuItem?: {
    id: string;
    name: string;
    basePrice: number;
    category?: { name: string };
  };
  variant?: {
    id: string;
    name: string;
    price: number;
  };
  ingredients: Array<{
    id: string;
    ingredientId: string;
    quantityRequired: number;
    uom: string;
    ingredient: {
      name: string;
      baseUom: string;
      purchasePrice: number;
    };
  }>;
}

interface Movement {
  id: string;
  ingredientId: string;
  movementType: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  unitCost: number;
  totalValue: number;
  referenceId?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
  ingredient: {
    name: string;
    category: string;
    baseUom: string;
  };
}

interface InventoryReport {
  summary: {
    totalValuation: number;
    totalIngredientsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    orderConsumptionValue: number;
    wastageLossValue: number;
    totalSalesRevenue: number;
    foodCostPercentage: number;
    totalPayablesDue: number;
  };
  valuationByCategory: Array<{ category: string; count: number; value: number }>;
  topConsumedIngredients: Array<{ name: string; quantity: number; uom: string; totalCost: number }>;
  wastageByReason: Array<{ reason: string; amount: number }>;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"STOCK" | "RECIPES" | "MOVEMENTS" | "REPORTS">("STOCK");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Data
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [report, setReport] = useState<InventoryReport | null>(null);

  // Modals
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showWastageModal, setShowWastageModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    itemType: "RAW_MATERIAL",
    category: "Dairy",
    baseUom: "KG",
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 50,
    purchasePrice: 0,
    batchNumber: "",
    expiryDate: "",
  });

  const [wastageForm, setWastageForm] = useState({
    ingredientId: "",
    type: "WASTAGE",
    quantity: 1,
    reason: "Damaged during prep",
    authorizedBy: "Head Chef Manpreet",
  });

  const [recipeForm, setRecipeForm] = useState({
    menuItemId: "",
    yieldServings: 1,
    instructions: "",
    items: [{ ingredientId: "", quantityRequired: 100, uom: "GRAM" }],
  });

  const [menuItemsList, setMenuItemsList] = useState<Array<{ id: string; name: string; basePrice: number }>>([]);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, recipesRes, movementsRes, reportRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/recipes"),
        fetch("/api/inventory/movements?limit=100"),
        fetch("/api/inventory/reports"),
      ]);

      const itemsData = await itemsRes.json();
      const recipesData = await recipesRes.json();
      const movementsData = await movementsRes.json();
      const reportData = await reportRes.json();

      if (itemsData.success) {
        setIngredients(itemsData.items || []);
        if (itemsData.items?.length > 0 && !wastageForm.ingredientId) {
          setWastageForm((prev) => ({ ...prev, ingredientId: itemsData.items[0].id }));
        }
      }
      if (recipesData.success) {
        setRecipes(recipesData.recipes || []);
      }
      if (movementsData.success) {
        setMovements(movementsData.movements || []);
      }
      if (reportData.success) {
        setReport(reportData.report || null);
      }

      // Fetch menu items for recipe dropdown
      const menuRes = await fetch("/api/pos/menu");
      const menuData = await menuRes.json();
      if (menuData.categories) {
        const flatItems: any[] = [];
        menuData.categories.forEach((c: any) => {
          c.items.forEach((it: any) => flatItems.push(it));
        });
        setMenuItemsList(flatItems);
        if (flatItems.length > 0 && !recipeForm.menuItemId) {
          setRecipeForm((prev) => ({ ...prev, menuItemId: flatItems[0].id }));
        }
      }
    } catch (err: any) {
      console.error("Error loading inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Create Ingredient
  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIngredient),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", `Ingredient '${newIngredient.name}' added successfully`);
        setShowAddIngredientModal(false);
        setNewIngredient({
          name: "",
          itemType: "RAW_MATERIAL",
          category: "Dairy",
          baseUom: "KG",
          currentStock: 0,
          minimumStock: 5,
          maximumStock: 50,
          purchasePrice: 0,
          batchNumber: "",
          expiryDate: "",
        });
        loadData();
      } else {
        showNotification("error", data.error || "Failed to add ingredient");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to add ingredient");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Wastage / Adjustment
  const handleRecordWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wastageForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", `Wastage recorded: -${wastageForm.quantity} stock adjusted`);
        setShowWastageModal(false);
        loadData();
      } else {
        showNotification("error", data.error || "Failed to record adjustment");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to record adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  // Create Recipe BOM
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", `Recipe saved with Cost: ₹${data.financials.totalRecipeCost} (Food Cost: ${data.financials.foodCostPercent}%)`);
        setShowRecipeModal(false);
        loadData();
      } else {
        showNotification("error", data.error || "Failed to save recipe");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to save recipe");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.category.toLowerCase().includes(search.toLowerCase()) ||
      (ing.batchNumber && ing.batchNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || ing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(ingredients.map((i) => i.category)))];

  // Helper for UOM conversion preview in recipes
  const calculateIngredientLineCost = (ingId: string, qty: number, uom: string) => {
    const ing = ingredients.find((i) => i.id === ingId);
    if (!ing) return 0;
    let factor = 1;
    if (uom === "GRAM" && ing.baseUom === "KG") factor = 0.001;
    else if (uom === "ML" && ing.baseUom === "LITRE") factor = 0.001;
    return Math.round(qty * factor * ing.purchasePrice * 100) / 100;
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)}>
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory & Recipe BOM</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic stock deduction upon order payment, recipe costing, wastage control and procurement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWastageModal(true)}
            className="gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Record Wastage</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecipeModal(true)}
            className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <ChefHat className="h-3.5 w-3.5 text-indigo-600" />
            <span>Recipe Builder</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddIngredientModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Raw Material</span>
          </Button>
        </div>
      </div>

      {/* Top Real-time Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Stock Valuation</span>
            <Scale className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {report?.summary?.totalValuation ? formatINR(report.summary.totalValuation) : "₹0"}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500">
            <span>{ingredients.length} active ingredients tracked</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600">
            {report?.summary?.lowStockCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {report?.summary?.outOfStockCount || 0} items out of stock
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Food Cost %</span>
            <PieChart className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {report?.summary?.foodCostPercentage || 30.5}%
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Optimal benchmark: 28% – 32%
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Wastage & Loss Value</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">
            {report?.summary?.wastageLossValue ? formatINR(report.summary.wastageLossValue) : "₹0"}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tracked across spillage & expiry
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("STOCK")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "STOCK"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Boxes className="h-3.5 w-3.5" />
          <span>Raw Materials & Stock ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RECIPES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "RECIPES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ChefHat className="h-3.5 w-3.5" />
          <span>Recipe BOM & Margins ({recipes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("MOVEMENTS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "MOVEMENTS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Stock Movement Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "REPORTS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PieChart className="h-3.5 w-3.5" />
          <span>Valuation & Analytics</span>
        </button>
      </div>

      {/* TAB 1: RAW MATERIALS & STOCK */}
      {activeTab === "STOCK" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search raw material, batch or category..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                    categoryFilter === cat
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Raw Material / Ingredient</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">UOM</th>
                    <th className="py-3 px-4 font-semibold text-right">In Stock</th>
                    <th className="py-3 px-4 font-semibold text-right">Reorder Threshold</th>
                    <th className="py-3 px-4 font-semibold text-right">Purchase Cost</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Valuation</th>
                    <th className="py-3 px-4 font-semibold">Batch & Expiry</th>
                    <th className="py-3 px-4 font-semibold text-center">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No raw materials match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((item) => {
                      const totalVal = Math.round(item.currentStock * item.purchasePrice * 100) / 100;
                      const isOutOfStock = item.currentStock <= 0;
                      const isLowStock = !isOutOfStock && item.currentStock <= item.minimumStock;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">{item.itemType}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{item.category}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 font-semibold">{item.baseUom}</td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold text-sm ${
                                isOutOfStock
                                  ? "text-rose-600"
                                  : isLowStock
                                  ? "text-amber-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {item.currentStock} {item.baseUom}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            Min: {item.minimumStock} | Max: {item.maximumStock}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">
                            ₹{item.purchasePrice.toFixed(2)} / {item.baseUom}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatINR(totalVal)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-700">{item.batchNumber || "—"}</div>
                            {item.expiryDate ? (
                              <div className="text-[10px] text-slate-400">
                                Exp: {new Date(item.expiryDate).toLocaleDateString("en-IN")}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">No expiry</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isOutOfStock ? (
                              <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 border-amber-300">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                                Normal
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPE BOM & MARGINS */}
      {activeTab === "RECIPES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-600 font-medium">
              Configured Bill of Materials (BOM) automatically deduct ingredients whenever a POS order is settled.
            </div>
            <Button
              size="sm"
              onClick={() => setShowRecipeModal(true)}
              className="gap-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span>Create New Recipe</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No recipes configured yet. Click "Create New Recipe" to set up your first Bill of Materials.
              </div>
            ) : (
              recipes.map((rcp) => {
                const menuItem = rcp.menuItem;
                const sellingPrice = menuItem?.basePrice || 0;

                // Calculate recipe total cost
                let totalCost = 0;
                rcp.ingredients.forEach((ri) => {
                  let factor = 1;
                  if (ri.uom === "GRAM" && ri.ingredient.baseUom === "KG") factor = 0.001;
                  else if (ri.uom === "ML" && ri.ingredient.baseUom === "LITRE") factor = 0.001;
                  totalCost += ri.quantityRequired * factor * ri.ingredient.purchasePrice;
                });
                totalCost = Math.round(totalCost * 100) / 100;

                const costPerServing = Math.round((totalCost / Math.max(1, rcp.yieldServings)) * 100) / 100;
                const grossProfit = Math.round((sellingPrice - costPerServing) * 100) / 100;
                const foodCostPercent = sellingPrice > 0 ? Math.round((costPerServing / sellingPrice) * 1000) / 10 : 0;
                const profitMarginPercent = sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 1000) / 10 : 0;

                return (
                  <div key={rcp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{menuItem?.name || "Unnamed Item"}</h3>
                        <span className="text-[11px] text-slate-500">Yield: {rcp.yieldServings} Serving(s)</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          foodCostPercent <= 32
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : foodCostPercent <= 38
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-rose-50 text-rose-700 border-rose-300"
                        }`}
                      >
                        {foodCostPercent}% Food Cost
                      </Badge>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Selling Price</span>
                        <div className="font-bold text-slate-900 text-sm">₹{sellingPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Recipe Cost</span>
                        <div className="font-bold text-slate-700 text-sm">₹{costPerServing.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Profit</span>
                        <div className="font-bold text-emerald-600 text-sm">₹{grossProfit.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Profit Margin</span>
                        <div className="font-bold text-indigo-600 text-sm">{profitMarginPercent}%</div>
                      </div>
                    </div>

                    {/* Ingredients Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700">Ingredients (BOM):</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {rcp.ingredients.map((ing) => {
                          let factor = 1;
                          if (ing.uom === "GRAM" && ing.ingredient.baseUom === "KG") factor = 0.001;
                          else if (ing.uom === "ML" && ing.ingredient.baseUom === "LITRE") factor = 0.001;
                          const lineCost = Math.round(ing.quantityRequired * factor * ing.ingredient.purchasePrice * 100) / 100;

                          return (
                            <div key={ing.id} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-none">
                              <span className="text-slate-700">
                                {ing.ingredient.name} <span className="text-slate-400">({ing.quantityRequired} {ing.uom})</span>
                              </span>
                              <span className="font-medium text-slate-600 font-mono">₹{lineCost.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {rcp.instructions && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                        "{rcp.instructions}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENT AUDIT LOG */}
      {activeTab === "MOVEMENTS" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Ingredient</th>
                    <th className="py-3 px-4 font-semibold">Movement Type</th>
                    <th className="py-3 px-4 font-semibold text-right">Qty Adjusted</th>
                    <th className="py-3 px-4 font-semibold text-right">Balance (Before → After)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Value</th>
                    <th className="py-3 px-4 font-semibold">Reference ID</th>
                    <th className="py-3 px-4 font-semibold">Reason / Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No movement audit records logged yet.
                      </td>
                    </tr>
                  ) : (
                    movements.map((mov) => {
                      const isPositive = mov.quantity > 0;
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(mov.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{mov.ingredient?.name}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono font-bold ${
                                mov.movementType === "ORDER_DEDUCTION"
                                  ? "bg-slate-100 text-slate-800"
                                  : mov.movementType === "PURCHASE_GRN"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : mov.movementType === "WASTAGE"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {mov.movementType}
                            </Badge>
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity} {mov.ingredient?.baseUom}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {mov.balanceBefore} → {mov.balanceAfter} {mov.ingredient?.baseUom}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatINR(Math.abs(mov.totalValue))}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{mov.referenceId || "—"}</td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800 text-[11px]">{mov.reason || "Automatic operation"}</div>
                            <span className="text-[10px] text-slate-400">By {mov.performedBy || "System"}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VALUATION & ANALYTICS */}
      {activeTab === "REPORTS" && report && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Inventory Valuation by Category</span>
              </h3>
              <div className="space-y-2 pt-1">
                {report.valuationByCategory.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {cat.category} ({cat.count} items)
                      </span>
                      <span className="font-bold text-slate-900">{formatINR(cat.value)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (cat.value / (report.summary.totalValuation || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Consumed Ingredients */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Top Consumed Ingredients (COGS)</span>
              </h3>
              <div className="space-y-2 pt-1">
                {report.topConsumedIngredients.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No consumption recorded yet from settled orders.
                  </div>
                ) : (
                  report.topConsumedIngredients.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <span className="text-[11px] text-slate-500">
                          {item.quantity.toFixed(2)} {item.uom} depleted
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">{formatINR(item.totalCost)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD RAW MATERIAL */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                <span>Add Raw Material / Ingredient</span>
              </h2>
              <button onClick={() => setShowAddIngredientModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="e.g. Fresh Malai Paneer, Amul Butter"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains & Pulses</option>
                    <option value="Spices">Spices & Seasoning</option>
                    <option value="Oils">Oils & Ghee</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Type</label>
                  <select
                    value={newIngredient.itemType}
                    onChange={(e) => setNewIngredient({ ...newIngredient, itemType: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    <option value="RAW_MATERIAL">Raw Material</option>
                    <option value="INGREDIENT">Ingredient</option>
                    <option value="PACKAGING">Packaging</option>
                    <option value="FINISHED_PRODUCT">Finished Product</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Base UOM</label>
                  <select
                    value={newIngredient.baseUom}
                    onChange={(e) => setNewIngredient({ ...newIngredient, baseUom: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    <option value="KG">KG</option>
                    <option value="LITRE">LITRE</option>
                    <option value="PIECE">PIECE</option>
                    <option value="PACKET">PACKET</option>
                    <option value="GRAM">GRAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newIngredient.currentStock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cost / Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newIngredient.purchasePrice}
                    onChange={(e) => setNewIngredient({ ...newIngredient, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newIngredient.minimumStock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newIngredient.batchNumber}
                    onChange={(e) => setNewIngredient({ ...newIngredient, batchNumber: e.target.value })}
                    placeholder="e.g. BAT-2026-09"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddIngredientModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white">
                  {submitting ? "Saving..." : "Save Raw Material"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD WASTAGE / LOSS */}
      {showWastageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Record Stock Wastage / Loss</span>
              </h2>
              <button onClick={() => setShowWastageModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleRecordWastage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Ingredient</label>
                <select
                  required
                  value={wastageForm.ingredientId}
                  onChange={(e) => setWastageForm({ ...wastageForm, ingredientId: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Current: {ing.currentStock} {ing.baseUom})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Loss Type</label>
                  <select
                    value={wastageForm.type}
                    onChange={(e) => setWastageForm({ ...wastageForm, type: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    <option value="WASTAGE">Wastage during prep</option>
                    <option value="DAMAGED">Damaged / Spillage</option>
                    <option value="EXPIRED">Expired stock</option>
                    <option value="AUDIT_RECONCILIATION">Audit reconciliation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity Lost</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={wastageForm.quantity}
                    onChange={(e) => setWastageForm({ ...wastageForm, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={wastageForm.reason}
                  onChange={(e) => setWastageForm({ ...wastageForm, reason: e.target.value })}
                  placeholder="e.g. Deep freezer malfunction, expired batch"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Authorized By</label>
                <input
                  type="text"
                  required
                  value={wastageForm.authorizedBy}
                  onChange={(e) => setWastageForm({ ...wastageForm, authorizedBy: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowWastageModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-rose-600 text-white hover:bg-rose-700">
                  {submitting ? "Deducting..." : "Confirm Stock Deduction"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECIPE BUILDER */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-indigo-600" />
                <span>Recipe Builder (Bill of Materials)</span>
              </h2>
              <button onClick={() => setShowRecipeModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Menu Item</label>
                  <select
                    required
                    value={recipeForm.menuItemId}
                    onChange={(e) => setRecipeForm({ ...recipeForm, menuItemId: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  >
                    {menuItemsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Selling Price: ₹{m.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Yield Servings</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recipeForm.yieldServings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, yieldServings: parseInt(e.target.value, 10) || 1 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Recipe Ingredients List */}
              <div className="space-y-2 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">Required Ingredients</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRecipeForm({
                        ...recipeForm,
                        items: [...recipeForm.items, { ingredientId: ingredients[0]?.id || "", quantityRequired: 50, uom: "GRAM" }],
                      })
                    }
                    className="h-6 text-[10px] gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {recipeForm.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={it.ingredientId}
                      onChange={(e) => {
                        const newItems = [...recipeForm.items];
                        newItems[idx].ingredientId = e.target.value;
                        setRecipeForm({ ...recipeForm, items: newItems });
                      }}
                      className="flex-1 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="">Select Raw Material</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (₹{ing.purchasePrice}/{ing.baseUom})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={it.quantityRequired}
                      onChange={(e) => {
                        const newItems = [...recipeForm.items];
                        newItems[idx].quantityRequired = parseFloat(e.target.value) || 0;
                        setRecipeForm({ ...recipeForm, items: newItems });
                      }}
                      className="w-20 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white text-right"
                    />

                    <select
                      value={it.uom}
                      onChange={(e) => {
                        const newItems = [...recipeForm.items];
                        newItems[idx].uom = e.target.value;
                        setRecipeForm({ ...recipeForm, items: newItems });
                      }}
                      className="w-24 h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="GRAM">GRAM</option>
                      <option value="KG">KG</option>
                      <option value="ML">ML</option>
                      <option value="LITRE">LITRE</option>
                      <option value="PIECE">PIECE</option>
                    </select>

                    <div className="w-20 text-right font-mono font-semibold text-slate-700 text-xs">
                      ₹{calculateIngredientLineCost(it.ingredientId, it.quantityRequired, it.uom).toFixed(2)}
                    </div>

                    {recipeForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = recipeForm.items.filter((_, i) => i !== idx);
                          setRecipeForm({ ...recipeForm, items: newItems });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cooking Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                  placeholder="e.g. Saute spices in butter, add puree, finish with cream..."
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRecipeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {submitting ? "Saving..." : "Save Recipe BOM"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
