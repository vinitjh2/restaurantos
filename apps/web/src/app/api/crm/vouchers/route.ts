import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vouchers = await prisma.giftVoucher.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, vouchers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initialAmount, customerName, customerPhone, recipientEmail, expiryDays } = body;

    const amount = Number(initialAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: "Valid initial voucher amount required" }, { status: 400 });
    }

    const code = `GIFT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (Number(expiryDays) || 365));

    const voucher = await prisma.giftVoucher.create({
      data: {
        code,
        initialAmount: amount,
        currentBalance: amount,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        recipientEmail: recipientEmail || null,
        expiryDate,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      voucher,
      message: `Gift voucher ${voucher.code} issued for ₹${amount.toLocaleString("en-IN")}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
