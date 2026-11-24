import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";
import { sendPreDebitNotification } from "@/lib/server/subscription-scheduler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const body = await req.json().catch(() => ({}));

    const org = await prisma.organization.findUnique({
      where: { id: tenantCtx.organizationId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const activeSub = org.subscriptions[0];
    const amount = activeSub?.plan?.monthlyPrice || 1499;
    const renewalDate = activeSub?.currentPeriodEnd || new Date(Date.now() + 48 * 60 * 60 * 1000);
    const phone = body.customPhone || org.contactPhone || "+919830099881";

    const result = await sendPreDebitNotification({
      mobile: phone,
      restaurantName: org.name,
      amount,
      renewalDate,
      paymentMethod: activeSub?.mandateMethod || "UPI_AUTOPAY",
      mandateBank: activeSub?.mandateBank || "HDFC Bank (••4210)",
      upiId: activeSub?.mandateUpiId || "owner@okhdfcbank",
    });

    return NextResponse.json({
      success: true,
      message: "Pre-debit alert dispatched successfully!",
      alertSummary: {
        recipient: result.dispatchedTo,
        channel: result.channel,
        referenceId: result.referenceId,
        messageContent: result.messageText,
        scheduledDebitDate: renewalDate.toISOString(),
        debitAmount: amount,
      },
    });
  } catch (err: any) {
    console.error("[Test PreDebit Alert Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger alert test" },
      { status: 500 }
    );
  }
}
