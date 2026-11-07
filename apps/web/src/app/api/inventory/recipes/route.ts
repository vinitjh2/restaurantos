import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { calculateRecipeFinancials } from "@/lib/server/inventory-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        menuItem: true,
        variant: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const calculatedRecipes = recipes.map((r) => {
      const sellingPrice = r.variant ? r.variant.price : r.menuItem ? r.menuItem.basePrice : 0;
      const ingredientsList = r.ingredients.map((ri) => ({
        ingredientId: ri.ingredientId,
        name: ri.ingredient.name,
        quantityRequired: ri.quantityRequired,
        uom: ri.uom,
        baseUom: ri.ingredient.baseUom,
        purchasePrice: ri.ingredient.purchasePrice,
      }));

      const financials = calculateRecipeFinancials(r.yieldServings, sellingPrice, ingredientsList);

      return {
        id: r.id,
        menuItemId: r.menuItemId,
        menuItemName: r.menuItem?.name || "Unknown Item",
        variantId: r.variantId,
        variantName: r.variant?.name || null,
        instructions: r.instructions,
        createdAt: r.createdAt,
        ...financials,
      };
    });

    return NextResponse.json({
      success: true,
      recipes: calculatedRecipes,
    });
  } catch (error: any) {
    console.error("Recipes fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuItemId, variantId, yieldServings, instructions, ingredients } = body;
    // ingredients: Array of { ingredientId: string, quantityRequired: number, uom: string }

    if (!menuItemId && !variantId) {
      return NextResponse.json({ success: false, error: "Either menuItemId or variantId is required" }, { status: 400 });
    }

    const recipe = await prisma.$transaction(async (tx) => {
      // Delete existing recipe if updating
      if (menuItemId) {
        const existing = await tx.recipe.findUnique({ where: { menuItemId } });
        if (existing) {
          await tx.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });
          await tx.recipe.delete({ where: { id: existing.id } });
        }
      }

      // Create new Recipe & RecipeIngredients
      const newRecipe = await tx.recipe.create({
        data: {
          menuItemId: menuItemId || null,
          variantId: variantId || null,
          yieldServings: Number(yieldServings) || 1,
          instructions: instructions || null,
          ingredients: {
            create: (ingredients || []).map((ing: any) => ({
              ingredientId: ing.ingredientId,
              quantityRequired: Number(ing.quantityRequired),
              uom: ing.uom || "GRAM",
            })),
          },
        },
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      });

      return newRecipe;
    });

    return NextResponse.json({
      success: true,
      recipe,
      message: "Recipe Bill of Materials (BOM) saved successfully!",
    });
  } catch (error: any) {
    console.error("Save recipe error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
