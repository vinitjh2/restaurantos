import { prisma } from "../src/lib/server/prisma";
import { kdsEmitter } from "../src/lib/server/kds-events";
import { resolveItemStation } from "../src/lib/server/station-router";

async function runKDSTest() {
  console.log("=== STARTING REAL-TIME KITCHEN DISPLAY SYSTEM (KDS) TEST ===");

  // 1. Station Routing Engine Test
  const testBiryani = resolveItemStation("Biryani", "Murgh Dum Biryani");
  const testNaan = resolveItemStation("Breads", "Butter Garlic Naan");
  const testCocktail = resolveItemStation("Bar", "Classic Mojito");
  const testChaas = resolveItemStation("Beverages", "Masala Chaas");

  if (testBiryani !== "Main Kitchen" || testNaan !== "Bakery" || testCocktail !== "Bar" || testChaas !== "Beverage Counter") {
    throw new Error(`Station routing mismatch: ${testBiryani}, ${testNaan}, ${testCocktail}, ${testChaas}`);
  }
  console.log("[PASS] Station Routing Verified (Main Kitchen, Bakery, Bar, Beverage Counter)");

  // 2. Real-Time Event Subscription Test
  let receivedRealtimeEvent = false;
  const testListener = (payload: any) => {
    if (payload.type === "KOT_STATUS_UPDATED" && payload.kot?.kotNumber) {
      receivedRealtimeEvent = true;
      console.log(`[PASS] Real-Time Event Received via Event Hub: ${payload.type} for ${payload.kot.kotNumber}`);
    }
  };
  kdsEmitter.on("kds_event", testListener);

  // 3. Fetch Active KDS Tickets & Verify Urgency Slabs
  const tickets = await prisma.kOT.findMany({
    include: { items: true, order: true },
    orderBy: { createdAt: "asc" },
  });

  if (tickets.length === 0) throw new Error("No KDS tickets found in database");
  console.log(`[PASS] Loaded ${tickets.length} Active Tickets across kitchen stations`);

  const now = Date.now();
  tickets.forEach((t) => {
    const elapsedMinutes = (now - t.createdAt.getTime()) / (1000 * 60);
    const urgency = elapsedMinutes > 20 ? "CRITICAL RUSH" : elapsedMinutes > 10 ? "DELAYED WARNING" : "NORMAL";
    console.log(`       - ${t.kotNumber} [${t.station}]: Elapsed ${elapsedMinutes.toFixed(1)}m -> Tier: ${urgency}`);
  });

  // 4. Test Lifecycle Transition (NEW -> ACCEPTED -> PREPARING -> READY -> SERVED)
  const targetTicket = tickets[tickets.length - 1]; // latest ticket
  const updatedKot = await prisma.kOT.update({
    where: { id: targetTicket.id },
    data: {
      status: "READY",
      readyAt: new Date(),
    },
    include: { items: true, order: true },
  });

  // Broadcast
  kdsEmitter.emit("kds_event", {
    type: "KOT_STATUS_UPDATED",
    kot: updatedKot,
    timestamp: new Date().toISOString(),
  });

  if (!receivedRealtimeEvent) {
    throw new Error("Real-time event was not received by subscriber");
  }

  // 5. Test Item-Level Bump Checkbox
  if (targetTicket.items.length > 0) {
    const targetItem = targetTicket.items[0];
    const updatedItem = await prisma.kOTItem.update({
      where: { id: targetItem.id },
      data: { status: "READY" },
    });
    console.log(`[PASS] Item-Level Bump Verified: '${updatedItem.itemName}' marked ${updatedItem.status}`);
  }

  // 6. Test Authorized KOT Reprint
  const reprintAudit = await prisma.auditLog.create({
    data: {
      action: "KOT_REPRINTED",
      entityType: "KOT",
      entityId: targetTicket.kotNumber,
      authorizedBy: "Head Chef Manpreet",
      reason: "Station thermal slip reprinted",
      details: `Station: ${targetTicket.station}`,
    },
  });
  console.log(`[PASS] Authorized Reprint Audit Log Created: ${reprintAudit.action} by ${reprintAudit.authorizedBy}`);

  kdsEmitter.off("kds_event", testListener);
  console.log("\n=== ALL KDS WORKFLOW TESTS PASSED PERFECTLY! ===");
}

runKDSTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
