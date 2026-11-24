import { NextRequest, NextResponse } from "next/server";
import { runSubscriptionCronWorker } from "@/lib/server/subscription-scheduler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const summary = await runSubscriptionCronWorker();
    return NextResponse.json({
      success: true,
      message: "Subscription renewal and pre-debit alert cron worker completed successfully.",
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Subscription Cron Worker Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Cron worker execution failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
