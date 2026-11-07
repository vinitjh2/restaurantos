import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const itemType = searchParams.get("itemType");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "All") where.category = category;
    if (itemType && itemType !== "All") where.itemType = itemType;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { category: { contains: search } },
        { batchNumber: { contains: search } },
      ];
    }

    const items = await prisma.ingredient.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        recipeItems: {
          include: {
            recipe: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    // Compute live inventory telemetry & analytics
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;

    const now = new Date();
    const fifteenDaysAhead = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    items.forEach((item) => {
      const itemValuation = Math.max(0, item.currentStock) * item.purchasePrice;
      totalValuation += itemValuation;

      if (item.currentStock <= 0) {
        outOfStockCount++;
      } else if (item.currentStock <= item.minimumStock) {
        lowStockCount++;
      }

      if (item.expiryDate && new Date(item.expiryDate) <= fifteenDaysAhead) {
        expiringCount++;
      }
    });

    const categories = Array.from(new Set(items.map((i) => i.category)));

    return NextResponse.json({
      success: true,
      items,
      categories: ["All", ...categories],
      telemetry: {
        totalValuation: Math.round(totalValuation),
        totalItems: items.length,
        lowStockCount,
        outOfStockCount,
        expiringCount,
      },
    });
  } catch (error: any) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      itemType,
      baseUom,
      currentStock,
      minimumStock,
      maximumStock,
      purchasePrice,
      batchNumber,
      expiryDate,
    } = body;

    const ingredient = await prisma.ingredient.upsert({
      where: { name },
      update: {
        category,
        itemType: itemType || "RAW_MATERIAL",
        baseUom: baseUom || "KG",
        currentStock: Number(currentStock) || 0,
        minimumStock: Number(minimumStock) || 5,
        maximumStock: Number(maximumStock) || 50,
        purchasePrice: Number(purchasePrice) || 0,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      create: {
        name,
        category: category || "General",
        itemType: itemType || "RAW_MATERIAL",
        baseUom: baseUom || "KG",
        currentStock: Number(currentStock) || 0,
        minimumStock: Number(minimumStock) || 5,
        maximumStock: Number(maximumStock) || 50,
        purchasePrice: Number(purchasePrice) || 0,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      ingredient,
      message: `${name} saved to inventory catalog!`,
    });
  } catch (error: any) {
    console.error("Save ingredient error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
