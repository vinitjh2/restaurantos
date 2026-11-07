import { NextRequest } from "next/server";
import { kdsEmitter, KDSEventPayload } from "@/lib/server/kds-events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection confirmation
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED", time: new Date().toISOString() })}\n\n`)
      );

      // 2. Real-time event listener
      const onEvent = (payload: KDSEventPayload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (e) {
          kdsEmitter.off("kds_event", onEvent);
        }
      };

      kdsEmitter.on("kds_event", onEvent);

      // 3. Heartbeat keep-alive every 15s to keep connections open
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(interval);
          kdsEmitter.off("kds_event", onEvent);
        }
      }, 15000);

      // 4. Abort / disconnect cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        kdsEmitter.off("kds_event", onEvent);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
