import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          select: { id: true, poNumber: true, totalAmount: true, status: true },
        },
        invoices: {
          select: { id: true, invoiceNumber: true, totalAmount: true, balanceDue: true, status: true },
        },
        payments: {
          select: { id: true, amount: true, paymentMethod: true, paymentDate: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const totalPayables = suppliers.reduce((acc, s) => acc + s.creditBalance, 0);

    return NextResponse.json({
      success: true,
      suppliers,
      totalPayables: Math.round(totalPayables),
    });
  } catch (error: any) {
    console.error("Suppliers fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, contactPerson, phone, email, gstin, address, paymentTermsDays } = body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        category: category || "General Goods",
        contactPerson: contactPerson || null,
        phone,
        email: email || null,
        gstin: gstin || null,
        address: address || null,
        paymentTermsDays: Number(paymentTermsDays) || 15,
        creditBalance: 0,
      },
    });

    return NextResponse.json({
      success: true,
      supplier,
      message: `${name} registered in supplier directory!`,
    });
  } catch (error: any) {
    console.error("Save supplier error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
