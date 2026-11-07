import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tables = await prisma.tableSeat.findMany({
      orderBy: { tableNumber: "asc" },
    });

    return NextResponse.json({
      success: true,
      tables,
    });
  } catch (error: any) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, floor, capacity } = body;

    if (!tableNumber || !floor) {
      return NextResponse.json(
        { success: false, error: "Table number and floor are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.tableSeat.findUnique({
      where: { tableNumber: tableNumber.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Table ${tableNumber} already exists on ${existing.floor}` },
        { status: 409 }
      );
    }

    const newTable = await prisma.tableSeat.create({
      data: {
        tableNumber: tableNumber.trim().toUpperCase(),
        floor: floor.trim(),
        capacity: Number(capacity) || 4,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      table: newTable,
    });
  } catch (error: any) {
    console.error("Failed to create table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, capacity } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Table ID is required" }, { status: 400 });
    }

    const updated = await prisma.tableSeat.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      table: updated,
    });
  } catch (error: any) {
    console.error("Failed to update table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
