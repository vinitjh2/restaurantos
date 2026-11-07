import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const invoices = await prisma.subscriptionInvoice.findMany({
      include: {
        organization: {
          select: { id: true, name: true, slug: true, contactEmail: true },
        },
        subscription: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      paymentMethod: inv.paymentMethod || "RAZORPAY",
      razorpayPaymentId: inv.razorpayPaymentId,
      paidAt: inv.paidAt?.toISOString() || null,
      createdAt: inv.createdAt.toISOString(),
      organization: inv.organization,
      planName: inv.subscription?.plan?.name || "Standard",
      planCode: inv.subscription?.plan?.code || "GROWTH",
    }));

    return NextResponse.json({
      success: true,
      invoices: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
