import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const branches = await prisma.branch.findMany();
    if (branches.length === 0) {
      return NextResponse.json({ success: false, error: "No branches configured in database" }, { status: 400 });
    }

    const menuItems = await prisma.menuItem.findMany();
    const menuMap: Record<string, any> = {};
    menuItems.forEach((i) => {
      menuMap[i.name] = i;
    });

    const demoOrdersData = [
      {
        orderNumber: "ORD-2840",
        orderType: "DINE_IN",
        status: "PREPARING",
        tableNumber: "T-01",
        customerName: "Vikram Malhotra",
        customerPhone: "+91 98450 11223",
        paymentMethod: "UNPAID",
        items: [
          { name: "Butter Chicken", qty: 2, price: 370 },
          { name: "Butter Garlic Naan", qty: 4, price: 80 },
          { name: "Dal Makhani", qty: 1, price: 250 },
        ],
      },
      {
        orderNumber: "ORD-2841",
        orderType: "QR_DIGITAL",
        status: "PREPARING",
        tableNumber: "T-04",
        customerName: "Ananya Deshmukh",
        customerPhone: "+91 97412 88341",
        paymentMethod: "UPI (Google Pay)",
        items: [
          { name: "Paneer Butter Masala", qty: 1, price: 320 },
          { name: "Butter Garlic Naan", qty: 2, price: 80 },
          { name: "Masala Chaas", qty: 2, price: 70 },
        ],
      },
      {
        orderNumber: "ORD-2842",
        orderType: "DELIVERY",
        status: "SERVED",
        tableNumber: null,
        customerName: "Zomato Partner (#9841)",
        customerPhone: "+91 98800 23456",
        customerAddress: "Flat 402, Prestige Palms, 100 Ft Rd, Indiranagar",
        paymentMethod: "Zomato Pay",
        items: [
          { name: "Murgh Dum Biryani", qty: 2, price: 350 },
          { name: "Gulab Jamun (2 Pcs)", qty: 2, price: 110 },
        ],
      },
      {
        orderNumber: "ORD-2843",
        orderType: "TAKEAWAY",
        status: "PAID",
        tableNumber: null,
        customerName: "Rohit Verma",
        customerPhone: "+91 99160 55421",
        paymentMethod: "Cash",
        items: [
          { name: "Crispy Corn Salt & Pepper", qty: 1, price: 240 },
          { name: "Paneer Butter Masala", qty: 1, price: 320 },
          { name: "Butter Garlic Naan", qty: 3, price: 80 },
        ],
      },
      {
        orderNumber: "ORD-2844",
        orderType: "DINE_IN",
        status: "PAID",
        tableNumber: "T-02",
        customerName: "Priya Nair",
        customerPhone: "+91 96110 33902",
        paymentMethod: "Credit Card (HDFC)",
        items: [
          { name: "Tandoori Chicken", qty: 1, price: 260 },
          { name: "Murgh Dum Biryani", qty: 1, price: 350 },
          { name: "Masala Chaas", qty: 2, price: 70 },
        ],
      },
      {
        orderNumber: "ORD-2845",
        orderType: "DINE_IN",
        status: "PAID",
        tableNumber: "T-06",
        customerName: "Aditya & Family",
        customerPhone: "+91 98451 99012",
        paymentMethod: "UPI (PhonePe)",
        items: [
          { name: "Murgh Dum Biryani", qty: 3, price: 350 },
          { name: "Butter Chicken", qty: 1, price: 370 },
          { name: "Butter Garlic Naan", qty: 6, price: 80 },
          { name: "Gulab Jamun (2 Pcs)", qty: 3, price: 110 },
        ],
      },
      {
        orderNumber: "ORD-2846",
        orderType: "DELIVERY",
        status: "PREPARING",
        tableNumber: null,
        customerName: "Swiggy Express (#4410)",
        customerPhone: "+91 99001 77234",
        customerAddress: "Villa 12, Windmills of Your Mind, Whitefield",
        paymentMethod: "Swiggy Pay",
        items: [
          { name: "Butter Chicken", qty: 1, price: 370 },
          { name: "Dal Makhani", qty: 1, price: 250 },
          { name: "Butter Garlic Naan", qty: 4, price: 80 },
        ],
      },
      {
        orderNumber: "ORD-2847",
        orderType: "QR_DIGITAL",
        status: "SERVED",
        tableNumber: "AC-01",
        customerName: "Kavita Rao",
        customerPhone: "+91 94480 66123",
        paymentMethod: "UPI (Paytm)",
        items: [
          { name: "Crispy Corn Salt & Pepper", qty: 1, price: 240 },
          { name: "Masala Chaas", qty: 1, price: 70 },
        ],
      },
      {
        orderNumber: "ORD-2848",
        orderType: "DINE_IN",
        status: "CANCELLED",
        tableNumber: "RF-01",
        customerName: "Sameer Joshi (Guest Cancelled)",
        customerPhone: "+91 98200 44119",
        paymentMethod: "REFUNDED",
        items: [
          { name: "Tandoori Chicken", qty: 1, price: 260 },
          { name: "Butter Garlic Naan", qty: 2, price: 80 },
        ],
      },
      {
        orderNumber: "ORD-2849",
        orderType: "TAKEAWAY",
        status: "PREPARING",
        tableNumber: null,
        customerName: "Meera Sen",
        customerPhone: "+91 98860 12890",
        paymentMethod: "UPI (Google Pay)",
        items: [
          { name: "Murgh Dum Biryani", qty: 1, price: 350 },
          { name: "Gulab Jamun (2 Pcs)", qty: 1, price: 110 },
        ],
      },
    ];

    let seededCount = 0;

    for (const branch of branches) {
      for (let idx = 0; idx < demoOrdersData.length; idx++) {
        const data = demoOrdersData[idx];
        const ordNum = `${branch.code}-${data.orderNumber}`;

        const existing = await prisma.order.findUnique({
          where: { orderNumber: ordNum },
        });

        let subtotal = 0;
        const orderItems: any[] = [];

        for (const it of data.items) {
          const itemObj = menuMap[it.name] || menuItems[0];
          const lineTotal = it.qty * it.price;
          subtotal += lineTotal;
          orderItems.push({
            menuItemId: itemObj.id,
            itemName: it.name,
            quantity: it.qty,
            unitPrice: it.price,
            subtotal: lineTotal,
            taxAmount: Math.round(lineTotal * 0.05 * 100) / 100,
          });
        }

        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
        const grandTotal = subtotal + taxAmount;
        const createdDate = new Date(Date.now() - idx * 18 * 60 * 1000);

        if (existing) {
          await prisma.orderItem.deleteMany({ where: { orderId: existing.id } });
          await prisma.order.update({
            where: { id: existing.id },
            data: {
              orderType: data.orderType,
              status: data.status,
              tableNumber: data.tableNumber,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              customerAddress: data.customerAddress || null,
              subtotal,
              taxAmount,
              grandTotal,
              updatedAt: createdDate,
              items: { create: orderItems },
            },
          });
        } else {
          await prisma.order.create({
            data: {
              orderNumber: ordNum,
              branchId: branch.id,
              orderType: data.orderType,
              status: data.status,
              tableNumber: data.tableNumber,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              customerAddress: data.customerAddress || null,
              subtotal,
              taxAmount,
              grandTotal,
              createdAt: createdDate,
              updatedAt: createdDate,
              items: { create: orderItems },
              invoice: {
                create: {
                  invoiceNumber: `INV-${branch.code}-${2840 + idx}`,
                  fiscalYear: "2026-27",
                  branchId: branch.id,
                  subtotal,
                  taxableAmount: subtotal,
                  cgstRate: 2.5,
                  cgstAmount: Math.round((taxAmount / 2) * 100) / 100,
                  sgstRate: 2.5,
                  sgstAmount: Math.round((taxAmount / 2) * 100) / 100,
                  grandTotal,
                  paidAmount: data.status === "PAID" ? grandTotal : 0,
                  balanceDue: data.status === "PAID" ? 0 : grandTotal,
                  status: data.status === "PAID" ? "PAID" : "ISSUED",
                  customerName: data.customerName,
                  customerPhone: data.customerPhone,
                  paymentMethod: data.paymentMethod,
                  createdAt: createdDate,
                  settledAt: createdDate,
                },
              },
            },
          });
        }
        seededCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seededCount} realistic demo orders across ${branches.length} branches.`,
      seededCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

