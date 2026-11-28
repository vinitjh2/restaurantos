import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { zomatoService } from "@/lib/integrations/zomato";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.ZOMATO_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Zomato webhook verification is not configured" },
        { status: 500 }
      );
    }

    const rawText = await req.text();
    const sig = req.headers.get("x-zomato-signature") || req.headers.get("x-webhook-signature") || "";
    const expected = crypto.createHmac("sha256", secret).update(rawText).digest("hex");
    const sigBuf = Buffer.from(sig, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (!sig || sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ success: false, error: "Invalid Zomato webhook signature" }, { status: 401 });
    }

    const rawPayload = JSON.parse(rawText);
    const parsed = zomatoService.parseZomatoOrder(rawPayload);

    // Fetch primary branch for ingestion
    const branch = await prisma.branch.findFirst({ where: { code: "IND" } }) || await prisma.branch.findFirst();
    const branchId = branch?.id || "default";

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: parsed.platformOrderId,
          orderType: "DELIVERY",
          status: "OPEN",
          branchId,
          customerName: `${parsed.customerName} (Zomato)`,
          customerPhone: parsed.customerPhoneMasked || null,
          customerAddress: parsed.deliveryAddress,
          subtotal: parsed.subtotal,
          taxAmount: parsed.tax,
          deliveryCharge: parsed.deliveryFee,
          grandTotal: parsed.total,
          items: {
            create: parsed.items.map((it) => ({
              menuItemId: it.platformItemId,
              itemName: it.name,
              quantity: it.quantity,
              unitPrice: it.price,
              modifierTotal: 0,
              discountAmount: 0,
              subtotal: it.price * it.quantity,
              taxAmount: (it.price * it.quantity * 0.05),
              cookingNotes: it.customizations?.join(", ") || null,
            })),
          },
        },
      });

      const kot = await tx.kOT.create({
        data: {
          kotNumber: `KOT-ZOM-${Date.now().toString().slice(-4)}`,
          orderId: order.id,
          branchId,
          orderType: "DELIVERY",
          station: "Main Kitchen",
          status: "NEW",
          items: {
            create: parsed.items.map((it) => ({
              itemName: it.name,
              quantity: it.quantity,
              station: "Main Kitchen",
              status: "PENDING",
            })),
          },
        },
      });

      return { order, kot };
    });

    return NextResponse.json({
      success: true,
      message: `Zomato order ${parsed.platformOrderId} ingested into Kitchen KDS`,
      orderId: created.order.id,
      kotNumber: created.kot.kotNumber,
    });
  } catch (error: any) {
    console.error("Zomato webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process Zomato order" },
      { status: 500 }
    );
  }
}
