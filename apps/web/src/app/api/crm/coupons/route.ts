import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, discountType, discountValue, minOrderValue, maxDiscount, validUntil, usageLimit } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ success: false, error: "Coupon code and discount value required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        title: title || code,
        discountType: discountType || "PERCENTAGE",
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: Number(usageLimit) || 100,
      },
    });

    return NextResponse.json({
      success: true,
      coupon,
      message: `Coupon code '${coupon.code}' created successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
