import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, verifyBranchOwnership, requireRole } from "@/lib/server/auth-context";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantCtx = await getTenantContext(req);
    const branch = await verifyBranchOwnership(tenantCtx, params.id);

    // Fetch all menu items
    const menuItems = await prisma.menuItem.findMany({
      include: {
        variants: true,
        modifiers: { include: { options: true } },
        branchMenuPrices: {
          where: { branchId: branch.id },
        },
      },
      orderBy: { category: "asc" },
    });

    // Merge base price with branch-specific override
    const items = menuItems.map((item) => {
      const branchOverride = item.branchMenuPrices[0];
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        shortCode: item.shortCode,
        basePrice: item.basePrice,
        effectivePrice: branchOverride ? branchOverride.price : item.basePrice,
        hasOverride: Boolean(branchOverride),
        isAvailable: branchOverride ? branchOverride.isAvailable : item.isAvailable,
        dietType: item.dietType,
        variants: item.variants,
        modifiers: item.modifiers,
      };
    });

    return NextResponse.json({
      success: true,
      branch: { id: branch.id, name: branch.name, code: branch.code },
      items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER", "TENANT_OWNER", "TENANT_ADMIN", "BRANCH_MANAGER"]);
    const branch = await verifyBranchOwnership(tenantCtx, params.id);

    const body = await req.json();
    const { menuItemId, price, isAvailable } = body;

    if (!menuItemId || price === undefined) {
      return NextResponse.json(
        { success: false, error: "menuItemId and price are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.branchMenuPrice.upsert({
      where: {
        branchId_menuItemId: {
          branchId: branch.id,
          menuItemId,
        },
      },
      create: {
        branchId: branch.id,
        menuItemId,
        price: Number(price),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
      update: {
        price: Number(price),
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
      },
      include: {
        menuItem: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "BRANCH_MENU_PRICE_UPDATED",
        entityType: "BRANCH_MENU_PRICE",
        entityId: updated.id,
        authorizedBy: `${tenantCtx.email} (${tenantCtx.role})`,
        details: `Updated price of '${updated.menuItem.name}' for Branch '${branch.name}' to ₹${updated.price}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated branch price for '${updated.menuItem.name}' to ₹${updated.price}`,
      override: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
