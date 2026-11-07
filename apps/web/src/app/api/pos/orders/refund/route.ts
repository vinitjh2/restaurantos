import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNumber, amount, reason, paymentMethod, supervisorPin } = body;

    // Validate Supervisor PIN
    const supervisor = await prisma.user.findFirst({
      where: {
        pinCode: supervisorPin,
        role: { in: ["ADMIN", "MANAGER"] },
      },
    });

    if (!supervisor) {
      return NextResponse.json(
        { success: false, error: "Invalid Supervisor PIN. Action unauthorized." },
        { status: 403 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const refundAmount = Number(amount);
    if (refundAmount <= 0 || refundAmount > invoice.paidAmount) {
      return NextResponse.json(
        { success: false, error: `Invalid refund amount. Maximum refundable: ₹${invoice.paidAmount}` },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Create Refund entry
      await tx.refund.create({
        data: {
          invoiceId: invoice.id,
          amount: refundAmount,
          reason,
          authorizedBy: supervisor.name,
          paymentMethod: paymentMethod || "CASH",
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: refundAmount === invoice.paidAmount ? "REFUNDED" : "PARTIALLY_REFUNDED",
        },
      });

      // Log Audit
      await tx.auditLog.create({
        data: {
          action: "REFUND_ISSUED",
          entityType: "Invoice",
          entityId: invoiceNumber,
          authorizedBy: supervisor.name,
          reason,
          details: `Refunded ₹${refundAmount} via ${paymentMethod || "CASH"} for ${invoiceNumber}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${refundAmount} processed by ${supervisor.name} for ${invoiceNumber}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
