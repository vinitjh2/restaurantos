"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileDown,
  Filter,
  DollarSign,
  Utensils,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MenuItemEngineeringData {
  id: string;
  name: string;
  category: string;
  diet: "VEG" | "NON_VEG";
  sellingPrice: number;
  foodCost: number;
  contributionMargin: number;
  foodCostPercent: number;
  quantitySold: number;
  totalRevenue: number;
  totalGrossProfit: number;
  quadrant: "STAR" | "PLOWHORSE" | "PUZZLE" | "DOG";
  recommendation: string;
  actionBadge: string;
}

const MENU_ENGINEERING_DATA: MenuItemEngineeringData[] = [
  {
    id: "m-1",
    name: "Murgh Dum Biryani",
    category: "Biryani",
    diet: "NON_VEG",
    sellingPrice: 350,
    foodCost: 98,
    contributionMargin: 252,
    foodCostPercent: 28.0,
    quantitySold: 142,
    totalRevenue: 49700,
    totalGrossProfit: 35784,
    quadrant: "STAR",
    recommendation: "Maintain recipe standard strictly. Hero spot on digital QR menu.",
    actionBadge: "Maintain Standard",
  },
  {
    id: "m-2",
    name: "Butter Chicken Royale",
    category: "Main Course",
    diet: "NON_VEG",
    sellingPrice: 370,
    foodCost: 115,
    contributionMargin: 255,
    foodCostPercent: 31.1,
    quantitySold: 118,
    totalRevenue: 43660,
    totalGrossProfit: 30090,
    quadrant: "STAR",
    recommendation: "Flagship favorite. Bundle with Garlic Naan combo to increase ticket size.",
    actionBadge: "Bundle with Breads",
  },
  {
    id: "m-3",
    name: "Tandoori Chicken (Full)",
    category: "Tandoor",
    diet: "NON_VEG",
    sellingPrice: 480,
    foodCost: 140,
    contributionMargin: 340,
    foodCostPercent: 29.2,
    quantitySold: 48,
    totalRevenue: 23040,
    totalGrossProfit: 16320,
    quadrant: "STAR",
    recommendation: "High margin star. Maintain charcoal smoke authenticity.",
    actionBadge: "Feature in Starters",
  },
  {
    id: "m-4",
    name: "Butter Garlic Naan",
    category: "Breads",
    diet: "VEG",
    sellingPrice: 65,
    foodCost: 28,
    contributionMargin: 37,
    foodCostPercent: 43.1,
    quantitySold: 240,
    totalRevenue: 15600,
    totalGrossProfit: 8880,
    quadrant: "PLOWHORSE",
    recommendation: "High volume but lower margin. Increase price by ₹5–₹10 or bulk source Amul butter.",
    actionBadge: "Raise Price ₹10",
  },
  {
    id: "m-5",
    name: "Dal Makhani Royale",
    category: "Main Course",
    diet: "VEG",
    sellingPrice: 250,
    foodCost: 110,
    contributionMargin: 140,
    foodCostPercent: 44.0,
    quantitySold: 82,
    totalRevenue: 20500,
    totalGrossProfit: 11480,
    quadrant: "PLOWHORSE",
    recommendation: "Popular staple. Tweak cream/butter portion slightly to bring food cost under 38%.",
    actionBadge: "Recipe Costing",
  },
  {
    id: "m-6",
    name: "Paneer Butter Masala",
    category: "Main Course",
    diet: "VEG",
    sellingPrice: 320,
    foodCost: 138,
    contributionMargin: 182,
    foodCostPercent: 43.1,
    quantitySold: 96,
    totalRevenue: 30720,
    totalGrossProfit: 17472,
    quadrant: "PLOWHORSE",
    recommendation: "Steady seller. Raise price to ₹340 to capture an extra ₹1,920 in gross profit.",
    actionBadge: "Raise Price ₹20",
  },
  {
    id: "m-7",
    name: "Mutton Rogan Josh",
    category: "Main Course",
    diet: "NON_VEG",
    sellingPrice: 490,
    foodCost: 130,
    contributionMargin: 360,
    foodCostPercent: 26.5,
    quantitySold: 24,
    totalRevenue: 11760,
    totalGrossProfit: 8640,
    quadrant: "PUZZLE",
    recommendation: "Outstanding profit margin (₹360/dish). Train floor waiters to actively recommend.",
    actionBadge: "Waitstaff Upsell",
  },
  {
    id: "m-8",
    name: "Prawns Koliwada Fry",
    category: "Starters",
    diet: "NON_VEG",
    sellingPrice: 420,
    foodCost: 110,
    contributionMargin: 310,
    foodCostPercent: 26.2,
    quantitySold: 18,
    totalRevenue: 7560,
    totalGrossProfit: 5580,
    quadrant: "PUZZLE",
    recommendation: "High gross margin. Feature on counter tent cards & digital banner.",
    actionBadge: "Feature on Banner",
  },
  {
    id: "m-9",
    name: "Paneer Tikka Angara",
    category: "Starters",
    diet: "VEG",
    sellingPrice: 290,
    foodCost: 78,
    contributionMargin: 212,
    foodCostPercent: 26.9,
    quantitySold: 32,
    totalRevenue: 9280,
    totalGrossProfit: 6784,
    quadrant: "PUZZLE",
    recommendation: "Excellent vegetarian margin. Offer as party platter starter.",
    actionBadge: "Promote in Combos",
  },
  {
    id: "m-10",
    name: "Mixed Veg Clear Soup",
    category: "Starters",
    diet: "VEG",
    sellingPrice: 140,
    foodCost: 75,
    contributionMargin: 65,
    foodCostPercent: 53.6,
    quantitySold: 14,
    totalRevenue: 1960,
    totalGrossProfit: 910,
    quadrant: "DOG",
    recommendation: "Low margin and low sales. High prep holding overhead. Consider removing.",
    actionBadge: "Remove or Reformulate",
  },
  {
    id: "m-11",
    name: "Jeera Rice (Small)",
    category: "Biryani",
    diet: "VEG",
    sellingPrice: 120,
    foodCost: 62,
    contributionMargin: 58,
    foodCostPercent: 51.7,
    quantitySold: 19,
    totalRevenue: 2280,
    totalGrossProfit: 1102,
    quadrant: "DOG",
    recommendation: "Low return. Upsell to Ghee Rice or Dum Biryani instead.",
    actionBadge: "Upsell Substitute",
  },
];

export function MenuEngineeringMatrix() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const stars = MENU_ENGINEERING_DATA.filter((i) => i.quadrant === "STAR");
  const plowhorses = MENU_ENGINEERING_DATA.filter((i) => i.quadrant === "PLOWHORSE");
  const puzzles = MENU_ENGINEERING_DATA.filter((i) => i.quadrant === "PUZZLE");
  const dogs = MENU_ENGINEERING_DATA.filter((i) => i.quadrant === "DOG");

  const filteredItems = MENU_ENGINEERING_DATA.filter((item) => {
    const matchesQuad = selectedQuadrant === "ALL" || item.quadrant === selectedQuadrant;
    const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchesQuad && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              ⭐
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Menu Engineering & BCG Profitability Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Classifies all dishes across two critical dimensions: <strong>Popularity (Sales Volume)</strong> vs.{" "}
            <strong>Profitability (Contribution Margin)</strong>. Reveals which dishes generate your profits, which need price increases, and which should be eliminated.
          </p>
        </div>

        <Button
          onClick={() => alert("Exporting Menu Engineering Strategic Action Plan (Excel/PDF)...")}
          className="h-9 gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0"
        >
          <FileDown className="h-3.5 w-3.5 text-amber-400" />
          <span>Export Matrix Strategy</span>
        </Button>
      </div>

      {/* 4 BCG Quadrant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STARS */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === "STAR" ? "ALL" : "STAR")}
          className={cn(
            "cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs",
            selectedQuadrant === "STAR"
              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-white hover:border-emerald-300"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              ⭐ Stars
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {stars.length} Dishes
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {formatINR(stars.reduce((a, b) => a + b.totalRevenue, 0))}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">High Profit · High Sales</div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
            Your crown jewels. Keep quality consistent; feature on home banner.
          </p>
        </div>

        {/* PLOWHORSES */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === "PLOWHORSE" ? "ALL" : "PLOWHORSE")}
          className={cn(
            "cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs",
            selectedQuadrant === "PLOWHORSE"
              ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
              : "border-slate-200 bg-white hover:border-amber-300"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              🐴 Plowhorses
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {plowhorses.length} Dishes
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {formatINR(plowhorses.reduce((a, b) => a + b.totalRevenue, 0))}
          </div>
          <div className="text-[11px] font-semibold text-amber-700 mt-0.5">Low Profit · High Sales</div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
            Cash generators. Raise prices by ₹10–₹20 or trim food cost portions.
          </p>
        </div>

        {/* PUZZLES */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === "PUZZLE" ? "ALL" : "PUZZLE")}
          className={cn(
            "cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs",
            selectedQuadrant === "PUZZLE"
              ? "border-violet-500 bg-violet-50/60 ring-2 ring-violet-500/20"
              : "border-slate-200 bg-white hover:border-violet-300"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-800 uppercase tracking-wider flex items-center gap-1">
              🧩 Puzzles
            </span>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
              {puzzles.length} Dishes
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {formatINR(puzzles.reduce((a, b) => a + b.totalRevenue, 0))}
          </div>
          <div className="text-[11px] font-semibold text-violet-700 mt-0.5">High Profit · Low Sales</div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
            High margin potential. Train waitstaff to upsell; rename or reposition.
          </p>
        </div>

        {/* DOGS */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === "DOG" ? "ALL" : "DOG")}
          className={cn(
            "cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs",
            selectedQuadrant === "DOG"
              ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20"
              : "border-slate-200 bg-white hover:border-rose-300"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              🐶 Dogs
            </span>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              {dogs.length} Dishes
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {formatINR(dogs.reduce((a, b) => a + b.totalRevenue, 0))}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 mt-0.5">Low Profit · Low Sales</div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
            Consumes inventory shelf-life. Consider dropping from physical menu.
          </p>
        </div>
      </div>

      {/* Itemized Table with Strategic Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Dish Performance Breakdown ({filteredItems.length} Dishes)
            </span>
            {selectedQuadrant !== "ALL" && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                Filtered: {selectedQuadrant}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Biryani">Biryani</option>
              <option value="Main Course">Main Course</option>
              <option value="Tandoor">Tandoor & Starters</option>
              <option value="Breads">Breads</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Food Cost</th>
                <th className="py-3 px-3">Margin (₹)</th>
                <th className="py-3 px-3">Qty Sold</th>
                <th className="py-3 px-3">Gross Profit</th>
                <th className="py-3 px-3">Quadrant</th>
                <th className="py-3 px-4">Strategic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          item.diet === "VEG" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {formatINR(item.sellingPrice)}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatINR(item.foodCost)}{" "}
                    <span className="text-[10px] text-slate-400">({item.foodCostPercent}%)</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    {formatINR(item.contributionMargin)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {item.quantitySold}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatINR(item.totalGrossProfit)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        item.quadrant === "STAR" && "bg-emerald-100 text-emerald-800",
                        item.quadrant === "PLOWHORSE" && "bg-amber-100 text-amber-800",
                        item.quadrant === "PUZZLE" && "bg-violet-100 text-violet-800",
                        item.quadrant === "DOG" && "bg-rose-100 text-rose-800"
                      )}
                    >
                      {item.quadrant}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="inline-block rounded-md bg-slate-900 text-amber-300 font-bold px-2 py-0.5 text-[10px]">
                        {item.actionBadge}
                      </span>
                      <p className="text-[10px] text-slate-500 max-w-[220px]">
                        {item.recommendation}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

