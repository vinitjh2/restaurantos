import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    const branchWhere =
      tenantCtx.role === "PLATFORM_OWNER"
        ? {}
        : { organizationId: tenantCtx.organizationId };

    const branches = await prisma.branch.findMany({
      where: branchWhere,
      orderBy: { name: "asc" },
    });

    const branchIds = branches.map((b) => b.id);
    const branchCodes = branches.map((b) => b.code);
    const branchKeys = Array.from(new Set([...branchIds, ...branchCodes]));

    // Compute live branch statistics strictly for tenant branches
    const invoices =
      branchKeys.length > 0
        ? await prisma.invoice.findMany({
            where: { status: "PAID", branchId: { in: branchKeys } },
            select: { branchId: true, grandTotal: true },
          })
        : [];

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

    const tablesCount =
      branchCodes.length > 0
        ? await prisma.tableSeat.count({
            where: {
              OR: branchCodes.map((code) => ({ tableNumber: { startsWith: `${code}-` } })),
            },
          })
        : 0;
    const staffCount = await prisma.staff.count({
      where: {
        isActive: true,
        ...(tenantCtx.role === "PLATFORM_OWNER" ? {} : { organizationId: tenantCtx.organizationId }),
      },
    });

    const enrichedBranches = branches.map((b) => {
      const statsByCode = branchRevenueMap[b.code] || { revenue: 0, orders: 0 };
      const statsById = branchRevenueMap[b.id] || { revenue: 0, orders: 0 };
      const revenue = statsByCode.revenue + (b.id !== b.code ? statsById.revenue : 0);
      const orders = statsByCode.orders + (b.id !== b.code ? statsById.orders : 0);
      return {
        ...b,
        revenue: Math.round(revenue),
        ordersCount: orders,
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
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
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
        organizationId: tenantCtx.organizationId,
        name,
        code: code.trim().toUpperCase(),
        address: address || "Main Street",
        city: city || "Bengaluru",
        state: state || "Karnataka",
        pincode: pincode || "560001",
        phone,
        gstin: gstin.trim().toUpperCase(),
        fssaiNumber: fssaiNumber || "",
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
