import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });

    // Compute live branch statistics
    const invoices = await prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { branchId: true, grandTotal: true },
    });

    const branchRevenueMap: Record<string, { revenue: number; orders: number }> = {};
    let totalEnterpriseRevenue = 0;

    for (const inv of invoices) {
      if (!branchRevenueMap[inv.branchId]) {
        branchRevenueMap[inv.branchId] = { revenue: 0, orders: 0 };
      }
      branchRevenueMap[inv.branchId].revenue += inv.grandTotal;
      branchRevenueMap[inv.branchId].orders += 1;
      totalEnterpriseRevenue += inv.grandTotal;
    }

    const tablesCount = await prisma.tableSeat.count();
    const staffCount = await prisma.staff.count({ where: { isActive: true } });

    const enrichedBranches = branches.map((b) => {
      const stats = branchRevenueMap[b.code] || { revenue: 0, orders: 0 };
      return {
        ...b,
        revenue: Math.round(stats.revenue),
        ordersCount: stats.orders,
        status: "ONLINE",
      };
    });

    return NextResponse.json({
      success: true,
      branches: enrichedBranches,
      enterpriseMetrics: {
        totalBranches: branches.length,
        totalEnterpriseRevenue: Math.round(totalEnterpriseRevenue),
        totalStaffAcrossChain: staffCount,
        totalTablesAcrossChain: tablesCount,
      },
    });
  } catch (error: any) {
    console.error("Branches fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, address, city, state, pincode, phone, gstin, fssaiNumber, cgstRate, sgstRate, igstRate } = body;

    if (!name || !code || !gstin || !phone) {
      return NextResponse.json(
        { success: false, error: "Branch name, code, GSTIN and phone number are required" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        code: code.trim().toUpperCase(),
        address: address || "City Centre Outlet",
        city: city || "Bengaluru",
        state: state || "Karnataka",
        pincode: pincode || "560001",
        phone,
        gstin: gstin.trim().toUpperCase(),
        fssaiNumber: fssaiNumber || "11223344556677",
        cgstRate: Number(cgstRate) || 2.5,
        sgstRate: Number(sgstRate) || 2.5,
        igstRate: Number(igstRate) || 5.0,
      },
    });

    return NextResponse.json({
      success: true,
      branch,
      message: `Branch outlet '${branch.name}' (${branch.code}) registered with GSTIN ${branch.gstin}!`,
    });
  } catch (error: any) {
    console.error("Create branch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
