import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ingredientId = searchParams.get("ingredientId");
    const movementType = searchParams.get("movementType");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (ingredientId) where.ingredientId = ingredientId;
    if (movementType && movementType !== "ALL") where.movementType = movementType;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        ingredient: {
          select: {
            name: true,
            baseUom: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      movements,
    });
  } catch (error: any) {
    console.error("Movements fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
