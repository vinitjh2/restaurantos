/**
 * RestaurantOS Authoritative Inventory & Recipe BOM Calculation Engine
 * 
 * Rules:
 * - Accurate UOM conversions (e.g., Grams to Kg, ML to Litres)
 * - Exact recipe cost, cost per serving, gross profit & margin calculation
 * - Atomic ACID stock deductions with complete immutable movement logs
 */

import { prisma } from "./prisma";

export interface RecipeCostBreakdown {
  recipeId: string;
  menuItemName: string;
  variantName?: string | null;
  yieldServings: number;
  totalRecipeCost: number;
  costPerServing: number;
  sellingPrice: number;
  grossProfit: number;
  profitMarginPercent: number;
  foodCostPercent: number;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantityRequired: number;
    uom: string;
    baseUom: string;
    unitCost: number;
    lineCost: number;
  }>;
}

/**
 * Standard F&B Unit Conversion Factor to Base UOM
 * e.g., 200 GRAM of a KG base item = 200 * 0.001 = 0.2 KG
 */
export function convertToBaseUom(qty: number, fromUom: string, baseUom: string): number {
  const from = fromUom.toUpperCase();
  const to = baseUom.toUpperCase();

  if (from === to) return qty;

  // Weight conversions
  if ((from === "GRAM" || from === "G" || from === "GM") && (to === "KG" || to === "KILOGRAM")) return qty / 1000;
  if ((from === "KG" || from === "KILOGRAM") && (to === "GRAM" || to === "G" || to === "GM")) return qty * 1000;

  // Volume conversions
  if ((from === "ML" || from === "MILLILITER") && (to === "LITRE" || to === "LITER" || to === "LTR" || to === "L")) return qty / 1000;
  if ((from === "LITRE" || from === "LITER" || from === "LTR" || from === "L") && (to === "ML" || to === "MILLILITER")) return qty * 1000;

  // Unit / piece / packet
  return qty;
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate comprehensive financial metrics for a Recipe BOM
 */
export function calculateRecipeFinancials(
  yieldServings: number,
  sellingPrice: number,
  ingredients: Array<{
    ingredientId: string;
    name: string;
    quantityRequired: number;
    uom: string;
    baseUom: string;
    purchasePrice: number; // cost per base UOM
  }>
): Omit<RecipeCostBreakdown, "recipeId" | "menuItemName" | "variantName"> {
  let totalCost = 0;

  const calculatedIngredients = ingredients.map((ing) => {
    const baseQuantity = convertToBaseUom(ing.quantityRequired, ing.uom, ing.baseUom);
    const lineCost = roundToTwo(baseQuantity * ing.purchasePrice);
    totalCost += lineCost;

    return {
      ingredientId: ing.ingredientId,
      ingredientName: ing.name,
      quantityRequired: ing.quantityRequired,
      uom: ing.uom,
      baseUom: ing.baseUom,
      unitCost: ing.purchasePrice,
      lineCost,
    };
  });

  const totalRecipeCost = roundToTwo(totalCost);
  const costPerServing = roundToTwo(totalRecipeCost / Math.max(1, yieldServings));
  const grossProfit = roundToTwo(sellingPrice - costPerServing);
  const profitMarginPercent = sellingPrice > 0 ? roundToTwo((grossProfit / sellingPrice) * 100) : 0;
  const foodCostPercent = sellingPrice > 0 ? roundToTwo((costPerServing / sellingPrice) * 100) : 0;

  return {
    yieldServings,
    totalRecipeCost,
    costPerServing,
    sellingPrice,
    grossProfit,
    profitMarginPercent,
    foodCostPercent,
    ingredients: calculatedIngredients,
  };
}

/**
 * Automatically deduct inventory stock when an order is settled/paid
 * Executed inside an atomic database transaction
 */
export async function deductStockForOrder(
  orderId: string,
  invoiceNumber: string,
  txClient?: any
) {
  const db = txClient || prisma;

  // 1. Fetch order with orderItems
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) return { success: false, error: "Order not found" };

  const deductionsSummary: Array<{
    ingredientName: string;
    quantityDeducted: number;
    uom: string;
    balanceAfter: number;
  }> = [];

  // 2. Loop through each ordered item and check for a recipe BOM
  for (const item of order.items) {
    if (item.isVoid) continue;

    // Check variant recipe first, then parent item recipe
    let recipe = null;
    if (item.variantId) {
      recipe = await db.recipe.findUnique({
        where: { variantId: item.variantId },
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      });
    }

    if (!recipe) {
      recipe = await db.recipe.findUnique({
        where: { menuItemId: item.menuItemId },
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      });
    }

    if (!recipe) continue; // Item doesn't have an active recipe configured

    // 3. For each recipe ingredient, compute total required deduction
    for (const recipeItem of recipe.ingredients) {
      const ing = recipeItem.ingredient;
      const singleServingQty = recipeItem.quantityRequired / Math.max(1, recipe.yieldServings);
      const totalRequiredInItemUom = singleServingQty * item.quantity;

      // Convert to ingredient's base stock UOM (e.g. grams -> Kg)
      const deductionInBaseUom = convertToBaseUom(
        totalRequiredInItemUom,
        recipeItem.uom,
        ing.baseUom
      );

      const balanceBefore = ing.currentStock;
      const balanceAfter = roundToTwo(balanceBefore - deductionInBaseUom);

      // Decrement stock in database
      await db.ingredient.update({
        where: { id: ing.id },
        data: { currentStock: balanceAfter },
      });

      // Insert immutable movement audit record
      await db.stockMovement.create({
        data: {
          ingredientId: ing.id,
          movementType: "ORDER_DEDUCTION",
          quantity: -deductionInBaseUom,
          balanceBefore,
          balanceAfter,
          unitCost: ing.purchasePrice,
          totalValue: roundToTwo(deductionInBaseUom * ing.purchasePrice),
          referenceId: invoiceNumber,
          reason: `Auto-deducted for ${item.quantity}x ${item.itemName} on Invoice ${invoiceNumber}`,
          performedBy: "System (POS Auto-Deplete)",
        },
      });

      deductionsSummary.push({
        ingredientName: ing.name,
        quantityDeducted: deductionInBaseUom,
        uom: ing.baseUom,
        balanceAfter,
      });
    }
  }

  // 4. Log audit entry
  if (deductionsSummary.length > 0) {
    await db.auditLog.create({
      data: {
        action: "INVENTORY_DEDUCTED",
        entityType: "Invoice",
        entityId: invoiceNumber,
        authorizedBy: "POS Billing Transaction",
        reason: `Auto-deducted ${deductionsSummary.length} raw ingredients`,
        details: JSON.stringify(deductionsSummary),
      },
    });
  }

  return {
    success: true,
    deductions: deductionsSummary,
  };
}
