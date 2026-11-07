import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDb() {
  console.log("=== RESTAURANTOS DATABASE INTEGRITY AUDIT ===");
  
  // 1. Foreign Key Integrity Check
  const fkChecks: any = await prisma.$queryRawUnsafe("PRAGMA foreign_key_check;");
  console.log("1. Foreign Key Check (Violations):", fkChecks.length === 0 ? "NONE (Clean Integrity)" : fkChecks);

  // 2. Quick Integrity Check
  const integrityCheck: any = await prisma.$queryRawUnsafe("PRAGMA integrity_check;");
  console.log("2. SQLite Integrity Check:", integrityCheck[0]?.integrity_check || integrityCheck);

  // 3. Count records across core tables
  const orgCount = await prisma.organization.count();
  const branchCount = await prisma.branch.count();
  const userCount = await prisma.user.count();
  const orderCount = await prisma.order.count();
  const kotCount = await prisma.kOT.count();
  const menuItemCount = await prisma.menuItem.count();
  const ingredientCount = await prisma.ingredient.count();
  const recipeCount = await prisma.recipe.count();
  const customerCount = await prisma.customer.count();
  const auditCount = await prisma.auditLog.count();
  const subCount = await prisma.tenantSubscription.count();
  const syncOpCount = await prisma.syncOperation.count();

  console.log("\n3. Record Counts in Production Database (dev.db):");
  console.log({
    organizations: orgCount,
    branches: branchCount,
    users: userCount,
    orders: orderCount,
    kitchenOrderTickets: kotCount,
    menuItems: menuItemCount,
    inventoryIngredients: ingredientCount,
    recipes: recipeCount,
    customers: customerCount,
    auditLogs: auditCount,
    subscriptions: subCount,
    syncOperations: syncOpCount,
  });

  // 4. Index verification
  const indexes: any = await prisma.$queryRawUnsafe("SELECT type, name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_autoindex%';");
  console.log(`\n4. Explicit Custom Indexes Configured: ${indexes.length} indexes found.`);
}

checkDb()
  .catch((e) => {
    console.error("Database audit error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
