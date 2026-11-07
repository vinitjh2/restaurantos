"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

export interface MenuItemWithCustomization {
  id: string;
  name: string;
  category: string;
  shortCode: string;
  basePrice: number;
  dietType: string;
  variants?: Array<{ id: string; name: string; price: number; isDefault: boolean }>;
  modifiers?: Array<{
    id: string;
    name: string;
    minSelect: number;
    maxSelect: number;
    isRequired: boolean;
    options: Array<{ id: string; name: string; price: number }>;
  }>;
}

interface ModifierModalProps {
  item: MenuItemWithCustomization;
  onClose: () => void;
  onConfirm: (customizedItem: {
    variantId?: string;
    variantName?: string;
    variantPrice?: number;
    selectedModifiers: Array<{ id: string; name: string; price: number }>;
    cookingNotes?: string;
  }) => void;
}

export function ModifierModal({ item, onClose, onConfirm }: ModifierModalProps) {
  const defaultVariant = item.variants?.find((v) => v.isDefault) || item.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    defaultVariant?.id
  );
  const [selectedModifiers, setSelectedModifiers] = useState<
    Array<{ id: string; name: string; price: number }>
  >([]);
  const [cookingNotes, setCookingNotes] = useState("");

  const currentVariant = item.variants?.find((v) => v.id === selectedVariantId) || defaultVariant;
  const currentPrice = currentVariant ? currentVariant.price : item.basePrice;
  const modifiersPriceTotal = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
  const totalPrice = currentPrice + modifiersPriceTotal;

  const toggleModifier = (option: { id: string; name: string; price: number }) => {
    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.id === option.id);
      if (exists) {
        return prev.filter((m) => m.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const handleDone = () => {
    onConfirm({
      variantId: currentVariant?.id,
      variantName: currentVariant?.name,
      variantPrice: currentVariant?.price,
      selectedModifiers,
      cookingNotes: cookingNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-xs border p-0.5 ${
                item.dietType === "VEG" ? "border-emerald-600 bg-white" : "border-rose-600 bg-white"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  item.dietType === "VEG" ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">{item.name}</h3>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                Base {formatINR(item.basePrice)} · {item.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Area */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5 text-xs">
          {/* Variants Selection */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Choose Portion / Size <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {item.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                    >
                      <span>{v.name}</span>
                      <span className="text-slate-900">{formatINR(v.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modifiers & Toppings */}
          {item.modifiers && item.modifiers.length > 0 && (
            <div className="space-y-3">
              {item.modifiers.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      {group.name}
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isChecked = selectedModifiers.some((m) => m.id === opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleModifier(opt)}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border ${
                                isChecked
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span>{opt.name}</span>
                          </div>
                          <span className="text-slate-500">
                            {opt.price > 0 ? `+${formatINR(opt.price)}` : "Free"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Special Kitchen Instructions (Notes)
            </label>
            <input
              type="text"
              value={cookingNotes}
              onChange={(e) => setCookingNotes(e.target.value)}
              placeholder="e.g. Less spicy, Extra crispy, No garlic & onion..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/70">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Configured Price</span>
            <div className="text-lg font-bold text-slate-900 leading-none mt-0.5">
              {formatINR(totalPrice)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDone}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5"
            >
              Add to Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
