import QRCode from "qrcode";

/**
 * Generate QR code as data URL
 * @param payload - QR code payload (e.g., "attendance:{eventId}:{timestamp}")
 * @returns Promise<string> Data URL (data:image/png;base64,...)
 */
export async function generateQRCode(payload: string): Promise<string> {
  try {
    // Generate QR code with high error correction
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return dataUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code payload for an event
 * @param eventId - Event ID
 * @returns QR code payload string
 */
export function generateQRPayload(eventId: string): string {
  const timestamp = Date.now();
  return `attendance:${eventId}:${timestamp}`;
}

/**
 * Parse QR code payload
 * @param payload - QR code payload string
 * @returns Parsed components or null if invalid
 */
export function parseQRPayload(payload: string): {
  eventId: string;
  timestamp: number;
} | null {
  const pattern = /^attendance:([a-z0-9]+):(\d+)$/;
  const match = payload.match(pattern);

  if (!match) {
    return null;
  }

  return {
    eventId: match[1],
    timestamp: parseInt(match[2], 10),
  };
}
