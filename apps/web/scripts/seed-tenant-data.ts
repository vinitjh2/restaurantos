/**
 * Multi-Tenant Seed Script for RestaurantOS
 * Initializes default Organization, UserAccount with bcrypt password,
 * associates existing branches, and establishes branch-specific menu pricing.
 */

import { prisma } from "../src/lib/server/prisma";
import bcrypt from "bcryptjs";

async function seedTenantData() {
  console.log("=================================================================");
  console.log("  SEEDING MULTI-TENANT SAAS PLATFORM DATA");
  console.log("=================================================================\n");

  try {
    // 1. Create or Find Primary Tenant Organization
    let org = await prisma.organization.findUnique({
      where: { slug: "bawarchi-royale" },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Bawarchi Royale Hospitality",
          slug: "bawarchi-royale",
          businessType: "MULTI_CHAIN",
          contactEmail: "admin@bawarchiroyale.com",
          contactPhone: "+91 98765 43210",
          currency: "INR",
          status: "ACTIVE",
          subscriptionPlan: "ENTERPRISE",
          subscriptionRenewal: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
      console.log(`✅ Created Primary Tenant: ${org.name} (Slug: ${org.slug})`);
    } else {
      console.log(`ℹ️ Existing Tenant Found: ${org.name} (ID: ${org.id})`);
    }

    // 2. Create Owner UserAccount with Salted Bcrypt Password
    const ownerEmail = "owner@bawarchiroyale.com";
    const existingOwner = await prisma.userAccount.findUnique({
      where: { email: ownerEmail },
    });

    if (!existingOwner) {
      const passwordHash = await bcrypt.hash("Password123!", 10);
      const ownerUser = await prisma.userAccount.create({
        data: {
          organizationId: org.id,
          email: ownerEmail,
          passwordHash,
          name: "Vikramaditya Singhania",
          phone: "+91 98450 12345",
          role: "TENANT_OWNER",
          isActive: true,
        },
      });
      console.log(`✅ Created Tenant Owner Account: ${ownerUser.email} (Role: ${ownerUser.role})`);
    } else {
      console.log(`ℹ️ Existing Owner Account Found: ${existingOwner.email}`);
    }

    // 3. Associate all existing branches with this Organization
    const branches = await prisma.branch.findMany();
    for (const b of branches) {
      if (!b.organizationId) {
        await prisma.branch.update({
          where: { id: b.id },
          data: { organizationId: org.id },
        });
        console.log(`🔗 Associated Branch '${b.name}' (${b.code}) with Organization '${org.name}'`);
      }
    }

    // 4. Associate Staff records with Organization and their Branch
    const staffList = await prisma.staff.findMany();
    for (const s of staffList) {
      if (!s.organizationId) {
        await prisma.staff.update({
          where: { id: s.id },
          data: {
            organizationId: org.id,
            branchId: s.branchId || "IND",
          },
        });
      }
    }
    console.log(`✅ Associated ${staffList.length} staff records with Organization`);

    // 5. Seed Branch-Specific Menu Pricing & Availability Overrides
    // Find sample item: "Paneer Butter Masala"
    const pbm = await prisma.menuItem.findFirst({
      where: { name: { contains: "Paneer" } },
    });

    const indBranch = branches.find((b) => b.code === "IND");
    const korBranch = branches.find((b) => b.code === "KOR");
    const hsrBranch = branches.find((b) => b.code === "HSR");

    if (pbm && indBranch && korBranch && hsrBranch) {
      // Indiranagar Flagship: Premium dine-in pricing ₹340
      await prisma.branchMenuPrice.upsert({
        where: { branchId_menuItemId: { branchId: indBranch.id, menuItemId: pbm.id } },
        create: { branchId: indBranch.id, menuItemId: pbm.id, price: 340.0, isAvailable: true },
        update: { price: 340.0 },
      });

      // Koramangala Cafe: Standard pricing ₹320
      await prisma.branchMenuPrice.upsert({
        where: { branchId_menuItemId: { branchId: korBranch.id, menuItemId: pbm.id } },
        create: { branchId: korBranch.id, menuItemId: pbm.id, price: 320.0, isAvailable: true },
        update: { price: 320.0 },
      });

      // HSR Cloud Kitchen: Value delivery pricing ₹299
      await prisma.branchMenuPrice.upsert({
        where: { branchId_menuItemId: { branchId: hsrBranch.id, menuItemId: pbm.id } },
        create: { branchId: hsrBranch.id, menuItemId: pbm.id, price: 299.0, isAvailable: true },
        update: { price: 299.0 },
      });
      console.log(`✅ Configured Branch-Specific Menu Pricing for '${pbm.name}':`);
      console.log(`   IND Flagship: ₹340.00 | KOR Cafe: ₹320.00 | HSR Cloud Kitchen: ₹299.00`);
    }

    console.log("\n=================================================================");
    console.log("  MULTI-TENANT SEED COMPLETED SUCCESSFULLY");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("Multi-tenant seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTenantData();
