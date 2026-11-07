import { spawn } from "child_process";
import * as http from "http";
import { signJwtToken } from "../src/lib/server/auth-context";

const ROUTES_TO_TEST = [
  { path: "/", expectedTitle: "Operations Overview" },
  { path: "/pos", expectedTitle: "Point of Sale" },
  { path: "/orders", expectedTitle: "Orders" },
  { path: "/tables", expectedTitle: "Tables" },
  { path: "/kitchen", expectedTitle: "Kitchen" },
  { path: "/menu", expectedTitle: "Menu" },
  { path: "/inventory", expectedTitle: "Inventory" },
  { path: "/purchases", expectedTitle: "Purchases" },
  { path: "/suppliers", expectedTitle: "Suppliers" },
  { path: "/customers", expectedTitle: "Customers" },
  { path: "/staff", expectedTitle: "Staff" },
  { path: "/attendance", expectedTitle: "Attendance" },
  { path: "/expenses", expectedTitle: "Expenses" },
  { path: "/reports", expectedTitle: "Reports" },
  { path: "/branches", expectedTitle: "Branches" },
  { path: "/settings", expectedTitle: "Settings" },
  { path: "/subscription", expectedTitle: "Subscription" },
  { path: "/sync-monitor", expectedTitle: "Sync Monitor" },
  { path: "/tutorial", expectedTitle: "Tutorial" },
  { path: "/platform-admin", expectedTitle: "Platform Super Admin" },
];

function fetchRoute(path: string, cookie?: string): Promise<{ status: number; location?: string; body: string }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};
    if (cookie) {
      headers["Cookie"] = `restaurantos_session=${cookie}`;
    }

    const req = http.request(
      `http://127.0.0.1:3000${path}`,
      {
        method: "GET",
        headers,
        timeout: 5000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            location: res.headers.location,
            body: data,
          });
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    req.end();
  });
}

async function main() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS ROUTE & NAVIGATION DIAGNOSTIC SUITE");
  console.log("===============================================================================\n");

  const devProcess = spawn("npx.cmd", ["next", "dev", "-p", "3000"], {
    cwd: process.cwd(),
    shell: true,
  });

  devProcess.stdout?.on("data", (d) => {
    const text = d.toString();
    if (text.includes("Ready in") || text.includes("started server on")) {
      console.log(`[Next.js Server] ${text.trim()}`);
    }
  });

  devProcess.stderr?.on("data", (d) => {
    console.error(`[Next.js Error] ${d.toString().trim()}`);
  });

  // Wait for server to start
  console.log("Waiting for Next.js dev server to be ready on port 3000...");
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetchRoute("/login");
      if (res.status === 200) {
        ready = true;
        console.log(`\nDev server is responding! (Attempt ${i + 1})\n`);
        break;
      }
    } catch (e: any) {
      process.stdout.write(` [${e.code || e.message}] `);
    }
  }

  if (!ready) {
    devProcess.kill();
    throw new Error("Failed to connect to dev server on port 3000 after 30 seconds.");
  }

  try {
    // Generate valid session token
    const token = signJwtToken({
      userId: "8d0ddb40-ce60-4c11-90c0-5bc128da21df", // owner@bawarchiroyale.com
      organizationId: "fc670ad4-0f06-4368-8c50-5017a4e6464c",
      organizationSlug: "bawarchi-royale",
      email: "owner@bawarchiroyale.com",
      name: "Chef Singhania",
      role: "TENANT_OWNER",
    });

    console.log("-------------------------------------------------------------------------------");
    console.log("PHASE 1: Unauthenticated Requests (Testing Middleware Behavior)");
    console.log("-------------------------------------------------------------------------------");
    for (const route of ROUTES_TO_TEST) {
      const res = await fetchRoute(route.path);
      const isRedirect = res.status === 307 || res.status === 308 || res.status === 302;
      console.log(
        `Route ${route.path.padEnd(18)} -> HTTP ${res.status} | Location: ${res.location || "N/A"}`
      );
    }

    console.log("\n-------------------------------------------------------------------------------");
    console.log("PHASE 2: Authenticated Requests (With valid restaurantos_session cookie)");
    console.log("-------------------------------------------------------------------------------");
    for (const route of ROUTES_TO_TEST) {
      const res = await fetchRoute(route.path, token);
      const hasOverview = res.body.includes("Operations Overview");
      const hasPageTitle = res.body.toLowerCase().includes(route.expectedTitle.toLowerCase());
      
      // Extract h1 if possible
      const h1Match = res.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ") : "NO H1 FOUND";

      console.log(
        `Route ${route.path.padEnd(18)} -> HTTP ${res.status} | H1: "${h1Text}" | Contains "Operations Overview": ${hasOverview}`
      );
    }

  } finally {
    console.log("\nStopping dev server...");
    devProcess.kill();
    // On Windows, kill tree
    spawn("taskkill", ["/pid", String(devProcess.pid), "/f", "/t"], { stdio: "ignore" });
  }
}

main().catch((err) => {
  console.error("Diagnostic run failed:", err);
  process.exit(1);
});
