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

    // 2. Razorpay Status Check
    const rzpKey = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpayStatus = {
      provider: "RAZORPAY",
      name: "Razorpay Online Payments & UPI",
      category: "PAYMENTS",
      status: Boolean(rzpKey && rzpSecret) ? "SANDBOX_VERIFIED" : "DISCONNECTED",
      isLiveOperational: false, // Strict: Never claim operational without live gateway verification
      credentialsPresent: Boolean(rzpKey && rzpSecret),
      endpoint: "https://api.razorpay.com/v1/orders",
      message: Boolean(rzpKey && rzpSecret)
        ? "Razorpay API keys configured. Webhook active at /api/webhooks/razorpay."
        : "Razorpay API Key ID and Secret not configured in environment.",
    };

    // 3. WhatsApp Status Check
    const whatsappStatus = await whatsappService.checkHealth();

    // 4. Zomato Status Check
    const zomatoStatus = await zomatoService.checkHealth();

    // 5. Swiggy Status Check
    const swiggyStatus = await swiggyService.checkHealth();

    // 6. Accounting Status Check
    const accountingStatus = await accountingService.checkHealth();

    const integrations = [
      phonePeStatus,
      razorpayStatus,
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
