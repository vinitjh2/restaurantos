import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      include: {
        variants: true,
        modifiers: {
          include: {
            options: true,
          },
        },
        branchMenuPrices: true,
      },
      orderBy: { name: "asc" },
    });

    const categories = Array.from(new Set(items.map((i) => i.category)));

    return NextResponse.json({
      success: true,
      categories: ["All", ...categories],
      items,
    });
  } catch (error: any) {
    console.error("Failed to fetch POS menu:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      basePrice,
      dietType,
      dietary,
      hsnSacCode,
      sacCode,
      shortCode,
      imageUrl,
      organizationId,
    } = body;

    if (!name || !category || basePrice === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, category, and base price are required" },
        { status: 400 }
      );
    }

    const generatedShortCode =
      shortCode ||
      name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 5) + Math.floor(10 + Math.random() * 90);

    const newItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        shortCode: generatedShortCode,
        basePrice: Number(basePrice),
        dietType: dietType || dietary || "VEG",
        hsnSacCode: hsnSacCode || sacCode || "996331",
        isAvailable: true,
        imageUrl: imageUrl || null,
        organizationId: organizationId || null,
      },
    });

    return NextResponse.json({
      success: true,
      item: newItem,
    });
  } catch (error: any) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isAvailable, basePrice, dietType, dietary, hsnSacCode } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID is required" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
        ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
        ...(dietType || dietary ? { dietType: dietType || dietary } : {}),
        ...(hsnSacCode ? { hsnSacCode } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      item: updated,
    });
  } catch (error: any) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
