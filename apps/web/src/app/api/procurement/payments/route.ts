import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    const payments = await prisma.supplierPayment.findMany({
      where: supplierId ? { supplierId } : undefined,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            creditBalance: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paidAmount: true,
            balanceDue: true,
            status: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error('Failed to fetch supplier payments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, invoiceId, amount, paymentMethod, transactionRef, paidBy } = body;

    const paymentAmount = Number(amount);
    if (!supplierId || isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid supplierId and positive payment amount are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify supplier exists
      const supplier = await tx.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }

      // 2. If invoice provided, verify and update invoice
      let updatedInvoice = null;
      if (invoiceId) {
        const invoice = await tx.purchaseInvoice.findUnique({
          where: { id: invoiceId },
        });

        if (!invoice) {
          throw new Error(`Purchase Invoice ${invoiceId} not found`);
        }

        const newPaidAmount = Math.round((invoice.paidAmount + paymentAmount) * 100) / 100;
        const newBalanceDue = Math.max(0, Math.round((invoice.totalAmount - newPaidAmount) * 100) / 100);
        const newStatus = newBalanceDue <= 0.01 ? 'PAID' : 'PARTIAL';

        updatedInvoice = await tx.purchaseInvoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            balanceDue: newBalanceDue,
            status: newStatus,
          },
        });
      }

      // 3. Create the payment record
      const payment = await tx.supplierPayment.create({
        data: {
          supplierId,
          invoiceId: invoiceId || null,
          amount: paymentAmount,
          paymentMethod: paymentMethod || 'BANK_TRANSFER',
          transactionRef: transactionRef || `PAY-${Date.now().toString().slice(-6)}`,
          paidBy: paidBy || 'Finance Manager',
          paymentDate: new Date(),
        },
      });

      // 4. Decrement supplier credit balance
      const newCreditBalance = Math.max(0, Math.round((supplier.creditBalance - paymentAmount) * 100) / 100);
      const updatedSupplier = await tx.supplier.update({
        where: { id: supplierId },
        data: {
          creditBalance: newCreditBalance,
        },
      });

      // 5. Create audit log
      await tx.auditLog.create({
        data: {
          action: 'SUPPLIER_PAYMENT_RECORDED',
          entityType: 'SupplierPayment',
          entityId: payment.id,
          authorizedBy: paidBy || 'Finance Manager',
          details: JSON.stringify({
            supplierName: supplier.name,
            amount: paymentAmount,
            method: paymentMethod,
            ref: payment.transactionRef,
            newCreditBalance,
          }),
        },
      });

      return { payment, updatedSupplier, updatedInvoice };
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error('Failed to record supplier payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
