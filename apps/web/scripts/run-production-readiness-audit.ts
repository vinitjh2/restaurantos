/**
 * RestaurantOS Comprehensive Production-Readiness Master Audit Runner
 * Executes and verifies all 56+ scenarios across:
 * 1. Database Integrity & Foreign Key Relations
 * 2. Master F&B Operations (POS, KDS, GST, Split Payments, BOM, Inventory)
 * 3. Multi-Tenant Security & Privilege Isolation
 * 4. Platform Super Admin & Subscription Engine
 * 5. Offline-First Resilience & Sync Replay Protection
 * 6. Hardware & Thermal Printer Stream Encoders
 * 7. Cross-Platform Packaging Architecture (Web, Windows, Android)
 * 8. Advanced Features & Modular Integrations (Waiter, QR, Owner, WhatsApp, Zomato, Swiggy, Tally)
 */

import { execSync } from "child_process";
import * as path from "path";

interface SuiteExecution {
  name: string;
  command: string;
  status: "PASSED" | "FAILED";
  durationMs: number;
  output: string;
}

const suites = [
  { name: "Database Schema & Foreign Key Integrity", script: "scripts/audit-db-integrity.ts" },
  { name: "Master F&B Core Suite (POS, Billing, GST, KDS, BOM)", script: "scripts/test-master-suite.ts" },
  { name: "Multi-Tenant Security & Isolation Suite", script: "scripts/test-multi-tenant-security.ts" },
  { name: "Platform Super Admin & SaaS Subscription Suite", script: "scripts/test-platform-admin-system.ts" },
  { name: "Offline-First Resilience & Queue Sync Suite", script: "scripts/test-offline-sync-suite.ts" },
  { name: "Hardware Thermal Printer & Cash Drawer Suite", script: "scripts/test-hardware-printer-suite.ts" },
  { name: "Cross-Platform Packaging Architecture Suite", script: "scripts/test-cross-platform-suite.ts" },
  { name: "Advanced Features & Modular Integrations Suite", script: "scripts/test-advanced-features-suite.ts" },
];

async function runProductionAudit() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS COMPREHENSIVE PRODUCTION-READINESS AUDIT EXECUTION");
  console.log("===============================================================================\n");

  const results: SuiteExecution[] = [];
  const rootDir = path.resolve(__dirname, "..");

  for (const suite of suites) {
    console.log(`>>> Executing Suite: ${suite.name}...`);
    const startTime = Date.now();
    try {
      const output = execSync(`npx tsx ${suite.script}`, {
        cwd: rootDir,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      const durationMs = Date.now() - startTime;
      results.push({
        name: suite.name,
        command: `npx tsx ${suite.script}`,
        status: "PASSED",
        durationMs,
        output: output.trim(),
      });
      console.log(`[PASSED] ${suite.name} (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      results.push({
        name: suite.name,
        command: `npx tsx ${suite.script}`,
        status: "FAILED",
        durationMs,
        output: (err.stdout || err.stderr || err.message || "").trim(),
      });
      console.error(`[FAILED] ${suite.name} (${durationMs}ms)`);
      console.error(err.stdout || err.stderr || err.message);
    }
  }

  console.log("\n===============================================================================");
  console.log("  COMPREHENSIVE AUDIT EXECUTION SUMMARY");
  console.log("===============================================================================");
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.status === "PASSED" ? "✅" : "❌"} ${r.name.padEnd(55)} [${r.status}] (${r.durationMs}ms)`);
    if (r.status === "FAILED") allPassed = false;
  }
  console.log("===============================================================================");
  console.log(`Overall Result: ${allPassed ? "100% PRODUCTION READY" : "AUDIT DEFECTS FOUND"}`);
  console.log("===============================================================================\n");

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductionAudit();
