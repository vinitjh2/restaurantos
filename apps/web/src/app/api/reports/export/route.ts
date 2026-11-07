import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "daily-sales"; // daily-sales, item-sales, gst-register, pnl-statement
    const branch = searchParams.get("branch") || "All";

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["PAID", "PARTIAL"] },
        ...(branch !== "All" ? { branchId: branch } : {}),
      },
      include: {
        order: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let csvContent = "";
    let filename = `restaurantos-${reportType}.csv`;

    if (reportType === "gst-register") {
      filename = `restaurantos-gstr1-${Date.now()}.csv`;
      csvContent = "Invoice Number,Invoice Date,Customer Name,Customer GSTIN,Taxable Value (INR),CGST 2.5% (INR),SGST 2.5% (INR),Total GST (INR),Invoice Grand Total (INR),Payment Method,Branch\n";
      for (const inv of invoices) {
        csvContent += `"${inv.invoiceNumber}","${inv.createdAt.toISOString().split("T")[0]}","${inv.customerName || "Walk-in Patron"}","${inv.customerGstin || "N/A"}",${inv.taxableAmount.toFixed(2)},${inv.cgstAmount.toFixed(2)},${inv.sgstAmount.toFixed(2)},${(inv.cgstAmount + inv.sgstAmount).toFixed(2)},${inv.grandTotal.toFixed(2)},"${inv.paymentMethod}","${inv.branchId}"\n`;
      }
    } else if (reportType === "item-sales") {
      filename = `restaurantos-item-sales-${Date.now()}.csv`;
      csvContent = "Item Name,Quantity Sold,Gross Sales (INR),Average Unit Price (INR)\n";
      const itemMap: Record<string, { qty: number; rev: number }> = {};
      for (const inv of invoices) {
        if (inv.order?.items) {
          for (const it of inv.order.items) {
            if (!itemMap[it.itemName]) itemMap[it.itemName] = { qty: 0, rev: 0 };
            itemMap[it.itemName].qty += it.quantity;
            itemMap[it.itemName].rev += it.subtotal;
          }
        }
      }
      for (const [name, data] of Object.entries(itemMap)) {
        const avgPrice = data.qty > 0 ? (data.rev / data.qty).toFixed(2) : "0.00";
        csvContent += `"${name}",${data.qty},${data.rev.toFixed(2)},${avgPrice}\n`;
      }
    } else {
      // Default: daily-sales
      filename = `restaurantos-sales-ledger-${Date.now()}.csv`;
      csvContent = "Invoice Number,Date Time,Subtotal (INR),Item Discounts (INR),Bill Discount (INR),Taxable Amount (INR),Taxes (INR),Grand Total (INR),Payment Mode,Status\n";
      for (const inv of invoices) {
        csvContent += `"${inv.invoiceNumber}","${inv.createdAt.toISOString()}",${inv.subtotal.toFixed(2)},${inv.itemDiscounts.toFixed(2)},${inv.billDiscount.toFixed(2)},${inv.taxableAmount.toFixed(2)},${(inv.cgstAmount + inv.sgstAmount).toFixed(2)},${inv.grandTotal.toFixed(2)},"${inv.paymentMethod}","${inv.status}"\n`;
      }
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
