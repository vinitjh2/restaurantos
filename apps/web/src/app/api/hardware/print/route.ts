import { NextRequest, NextResponse } from "next/server";
import net from "net";

export async function POST(req: NextRequest) {
  try {
    const { ipAddress, port = 9100, payloadBase64 } = await req.json();

    if (!ipAddress || !payloadBase64) {
      return NextResponse.json(
        { success: false, error: "Missing ipAddress or payloadBase64" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(payloadBase64, "base64");

    // Transmit buffer to printer over raw TCP socket
    const printPromise = new Promise<{ bytesWritten: number }>((resolve, reject) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);

      socket.connect(Number(port), ipAddress, () => {
        socket.write(buffer, () => {
          socket.end();
          resolve({ bytesWritten: buffer.length });
        });
      });

      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });

      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error(`Connection to printer at ${ipAddress}:${port} timed out.`));
      });
    });

    const result = await printPromise;

    return NextResponse.json({
      success: true,
      message: `Successfully transmitted ${result.bytesWritten} bytes to printer at ${ipAddress}:${port}`,
      bytesWritten: result.bytesWritten,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to dispatch network print job",
      },
      { status: 500 }
    );
  }
}
