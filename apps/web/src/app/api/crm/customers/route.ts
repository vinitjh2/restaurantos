import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { determineLoyaltyTier } from "@/lib/server/loyalty-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");

    const where: any = {};
    if (tier && tier !== "All") where.loyaltyTier = tier;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { gstin: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        loyaltyTx: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        giftVouchers: true,
      },
      orderBy: { totalSpend: "desc" },
      take: 100,
    });

    const totalCustomers = await prisma.customer.count();
    const aggregate = await prisma.customer.aggregate({
      _sum: { totalSpend: true },
      _avg: { averageOrderValue: true },
    });

    return NextResponse.json({
      success: true,
      customers,
      metrics: {
        totalCustomers,
        totalLifetimeSpend: aggregate._sum.totalSpend || 0,
        averageAOV: Math.round(aggregate._avg.averageOrderValue || 0),
      },
    });
  } catch (error: any) {
    console.error("Customers fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, birthday, address, customerNotes, gstin } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone number are required" },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existing = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name,
          email: email || existing.email,
          birthday: birthday ? new Date(birthday) : existing.birthday,
          address: address || existing.address,
          customerNotes: customerNotes || existing.customerNotes,
          gstin: gstin || existing.gstin,
        },
      });

      return NextResponse.json({
        success: true,
        customer: updated,
        message: `Customer ${name} profile updated!`,
      });
    }

    // Create new customer with Welcome 100 bonus loyalty points
    const newCustomer = await prisma.$transaction(async (tx) => {
      const cust = await tx.customer.create({
        data: {
          name,
          phone: phone.trim(),
          email: email || null,
          birthday: birthday ? new Date(birthday) : null,
          address: address || null,
          customerNotes: customerNotes || null,
          gstin: gstin || null,
          loyaltyTier: "Bronze",
          loyaltyPoints: 100, // Welcome points
        },
      });

      await tx.loyaltyTransaction.create({
        data: {
          customerId: cust.id,
          points: 100,
          type: "BONUS",
          balanceAfter: 100,
          referenceId: "WELCOME-BONUS",
          notes: "Welcome bonus for new registration",
        },
      });

      return cust;
    });

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: `Customer ${name} registered with 100 Welcome Loyalty Points!`,
    });
  } catch (error: any) {
    console.error("Save customer error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
