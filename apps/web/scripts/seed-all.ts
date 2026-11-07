/**
 * Master Seed Script for RestaurantOS
 * Runs all seed scripts in proper dependency order.
 */

import { spawnSync } from "child_process";
import path from "path";

const SCRIPTS = [
  "seed-tenant-data.ts",
  "seed-inventory-data.ts",
  "seed-kds-tickets.ts",
  "seed-workforce-crm.ts",
  "seed-analytics-accounting.ts",
  "seed-platform-admin.ts",
];

console.log("=================================================================");
console.log("  RESTAURANTOS MASTER SEED RUNNER");
console.log("=================================================================\n");

for (const script of SCRIPTS) {
  const fullPath = path.join(__dirname, script);
  console.log(`>>> Running: ${script}...`);
  const result = spawnSync("npx", ["tsx", fullPath], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
  });

  if (result.status !== 0) {
    console.warn(`[Warning] Script ${script} exited with code ${result.status}. Continuing...`);
  }
}

console.log("\n✅ Master seed process completed.");
