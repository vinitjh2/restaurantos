import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getTenantContext, requireRole } from "@/lib/server/auth-context";
import {
  DEMO_RESTAURANT_SLUGS,
  deleteRestaurantOrganization,
  DeletedRestaurantResult,
} from "@/lib/server/platform-admin-cleanup";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext(req);
    requireRole(tenantCtx, ["PLATFORM_OWNER"]);

    const demoOrgs = await prisma.organization.findMany({
      where: {
        slug: { in: [...DEMO_RESTAURANT_SLUGS] },
      },
      select: { id: true, name: true, slug: true },
    });

    const deleted: DeletedRestaurantResult[] = [];
    for (const org of demoOrgs) {
      const result = await deleteRestaurantOrganization(org.id, tenantCtx.email);
      deleted.push(result);
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleted.length,
      deleted,
    });
  } catch (error: any) {
    console.error("Purge demo restaurants error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
