import { prisma } from "@/lib/server/prisma";

export const PROTECTED_PLATFORM_SLUGS = ["platform-hq", "sutrauniverse-hq"] as const;

export const DEMO_RESTAURANT_SLUGS = [
  "bawarchi-royale",
  "himalayan-momo",
  "cafe-mocha",
  "spice-route",
  "suspended-eats",
] as const;

export interface DeletedRestaurantResult {
  id: string;
  name: string;
  slug: string;
}

/**
 * Deletes an Organization and all tenant/branch-scoped operational records in FK-safe order.
 * Blocks deletion of protected platform HQ records.
 */
export async function deleteRestaurantOrganization(
  organizationId: string,
  authorizedByEmail: string
): Promise<DeletedRestaurantResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      branches: {
        select: { id: true, code: true },
      },
    },
  });

  if (!org) {
    const err = new Error("Restaurant organization not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  if ((PROTECTED_PLATFORM_SLUGS as readonly string[]).includes(org.slug)) {
    const err = new Error("Protected platform HQ organization cannot be deleted") as Error & {
      statusCode?: number;
    };
    err.statusCode = 400;
    throw err;
  }

  const branchKeys = Array.from(
    new Set(
      org.branches.flatMap((b) => [b.id, b.code].filter((v): v is string => Boolean(v)))
    )
  );

  await prisma.$transaction(async (tx) => {
    if (branchKeys.length > 0) {
      // Delete invoices before orders because Invoice.order uses onDelete: Restrict
      await tx.invoice.deleteMany({
        where: {
          OR: [
            { branchId: { in: branchKeys } },
            { order: { branchId: { in: branchKeys } } },
          ],
        },
      });

      await tx.kOT.deleteMany({
        where: { branchId: { in: branchKeys } },
      });

      await tx.order.deleteMany({
        where: { branchId: { in: branchKeys } },
      });

      await tx.expense.deleteMany({
        where: { branchId: { in: branchKeys } },
      });

      await tx.cashRegisterShift.deleteMany({
        where: { branchId: { in: branchKeys } },
      });
    }

    await tx.menuItem.deleteMany({
      where: { organizationId: org.id },
    });

    await tx.customer.deleteMany({
      where: { organizationId: org.id },
    });

    await tx.staff.deleteMany({
      where: {
        OR: [
          { organizationId: org.id },
          ...(branchKeys.length > 0 ? [{ branchId: { in: branchKeys } }] : []),
        ],
      },
    });

    await tx.rolePermissionConfig.deleteMany({
      where: { organizationId: org.id },
    });

    await tx.syncOperation.deleteMany({
      where: { tenantId: org.id },
    });

    await tx.subscriptionInvoice.deleteMany({
      where: { organizationId: org.id },
    });

    await tx.tenantSubscription.deleteMany({
      where: { organizationId: org.id },
    });

    await tx.organization.delete({
      where: { id: org.id },
    });

    await tx.auditLog.create({
      data: {
        action: "SUPER_ADMIN_RESTAURANT_DELETED",
        entityType: "ORGANIZATION",
        entityId: org.id,
        authorizedBy: `${authorizedByEmail} (PLATFORM_OWNER)`,
        reason: `Super Admin permanently deleted restaurant '${org.name}' (${org.slug})`,
        details: JSON.stringify({
          organizationId: org.id,
          name: org.name,
          slug: org.slug,
          contactEmail: org.contactEmail,
          deletedBranches: branchKeys,
        }),
      },
    });
  });

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
  };
}
