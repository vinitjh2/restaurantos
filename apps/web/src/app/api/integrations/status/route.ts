import { NextRequest, NextResponse } from "next/server";
import { whatsappService } from "@/lib/integrations/whatsapp";
import { zomatoService } from "@/lib/integrations/zomato";
import { swiggyService } from "@/lib/integrations/swiggy";
import { accountingService } from "@/lib/integrations/accounting";
import { getPhonePeConfig } from "@/lib/server/phonepe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. PhonePe Payment Gateway Status Check
    const ppCfg = getPhonePeConfig(req.nextUrl.origin);
    const phonePeConfigured = ppCfg.mode !== "unconfigured";
    const phonePeStatus = {
      provider: "PHONEPE",
      name: `PhonePe Payment Gateway (${ppCfg.env === "production" ? "Live" : "Sandbox"})`,
      category: "PAYMENTS",
      status: phonePeConfigured
        ? ppCfg.env === "production"
          ? "OPERATIONAL"
          : "SANDBOX_VERIFIED"
        : "DISCONNECTED",
      isLiveOperational: phonePeConfigured && ppCfg.env === "production",
      credentialsPresent: phonePeConfigured,
      endpoint: `${ppCfg.apiBaseUrl}${ppCfg.mode === "v1" ? "/pg/v1/pay" : "/checkout/v2/pay"}`,
      message: phonePeConfigured
        ? `PhonePe PG (${ppCfg.mode.toUpperCase()} / ${ppCfg.env}) active. Webhook URL: /api/webhooks/phonepe`
        : "Add PHONEPE_CLIENT_ID & PHONEPE_CLIENT_SECRET (or v1 Merchant ID & Salt Key) in server .env.",
    };

    // 2. WhatsApp Status Check
    const whatsappStatus = await whatsappService.checkHealth();

    // 3. Zomato Status Check
    const zomatoStatus = await zomatoService.checkHealth();

    // 4. Swiggy Status Check
    const swiggyStatus = await swiggyService.checkHealth();

    // 5. Accounting Status Check
    const accountingStatus = await accountingService.checkHealth();

    const integrations = [
      phonePeStatus,
      whatsappStatus,
      zomatoStatus,
      swiggyStatus,
      accountingStatus,
    ];

    return NextResponse.json({
      success: true,
      integrations,
      timestamp: new Date().toISOString(),
      summary: {
        total: integrations.length,
        operational: integrations.filter((i) => i.isLiveOperational).length,
        sandboxVerified: integrations.filter((i) => i.status === "SANDBOX_VERIFIED").length,
        disconnected: integrations.filter((i) => i.status === "DISCONNECTED").length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve integrations status" },
      { status: 500 }
    );
  }
}
