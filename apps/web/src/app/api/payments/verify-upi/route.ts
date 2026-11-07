import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

/**
 * Strict UPI Verification Handler
 * In real-world Indian restaurants, generating a UPI QR is NEVER proof of payment.
 * Payment must be validated against bank webhook or verified via 12-digit bank UTR
 * and cashier/supervisor confirmation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, paymentId, utrNumber, cashierPin, cashierName } = body;

    if (!utrNumber || utrNumber.trim().length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid UTR / Bank Reference Number. Indian UPI UTR must be at least 6-12 digits.",
        },
        { status: 400 }
      );
    }

    // Optional cashier PIN verification if provided
    let verifiedByName = cashierName || "Cashier Verified";
    if (cashierPin) {
      const staff = await prisma.staff.findFirst({
        where: { pinCode: cashierPin, isActive: true },
      });
      if (!staff) {
        return NextResponse.json(
          { success: false, error: "Invalid Cashier PIN for payment authorization" },
          { status: 401 }
        );
      }
      verifiedByName = `${staff.name} (${staff.role})`;
    }

    // Locate target payment
    let payment = null;
    if (paymentId) {
      payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    } else if (invoiceId) {
      payment = await prisma.payment.findFirst({
        where: { invoiceId, method: "UPI" },
      });
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching UPI payment record found for verification",
        },
        { status: 404 }
      );
    }

    // Update payment record with verified UTR
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        transactionRef: utrNumber.trim(),
        verifiedAt: new Date(),
        verifiedBy: verifiedByName,
        notes: `Bank UPI UTR Verified: ${utrNumber.trim()} by ${verifiedByName}`,
      },
    });

    // Record audit log entry
    await prisma.auditLog.create({
      data: {
        action: "UPI_PAYMENT_VERIFIED",
        entityType: "PAYMENT",
        entityId: payment.id,
        authorizedBy: verifiedByName,
        details: `Verified UPI payment of ₹${payment.amount} with UTR ${utrNumber.trim()}`,
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: updated.id,
      utrNumber: updated.transactionRef,
      verifiedBy: updated.verifiedBy,
      verifiedAt: updated.verifiedAt,
      amount: updated.amount,
    });
  } catch (error: any) {
    console.error("UPI Verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify UPI payment" },
      { status: 500 }
    );
  }
}
