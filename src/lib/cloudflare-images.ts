import { randomUUID } from "crypto";

const CLOUDFLARE_IMAGES_ACCOUNT_ID = process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID;
const CLOUDFLARE_IMAGES_API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
const CLOUDFLARE_IMAGES_ACCOUNT_HASH =
  process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
const CLOUDFLARE_IMAGES_DEFAULT_VARIANT =
  process.env.CLOUDFLARE_IMAGES_DEFAULT_VARIANT || "public";

interface UploadOptions {
  folder?: string;
  filename?: string;
  metadata?: Record<string, string | number | boolean>;
}

interface UploadResult {
  id: string;
  url: string;
  variants: string[];
}

function ensureConfigured() {
  if (!CLOUDFLARE_IMAGES_ACCOUNT_ID || !CLOUDFLARE_IMAGES_API_TOKEN) {
    throw new Error(
      "Cloudflare Images is not configured. Set CLOUDFLARE_IMAGES_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN.",
    );
  }

  if (CLOUDFLARE_IMAGES_API_TOKEN.startsWith("http")) {
    throw new Error(
      "CLOUDFLARE_IMAGES_API_TOKEN appears to be a URL. Replace it with the actual API token from Cloudflare Images (e.g., generated via API Tokens).",
    );
  }
}

function resolveDeliveryUrl(imageId: string, variants: string[]): string {
  if (variants.length > 0) {
    return variants[0];
  }

  if (!CLOUDFLARE_IMAGES_ACCOUNT_HASH) {
    throw new Error(
      "Cloudflare Images response missing variants and CLOUDFLARE_IMAGES_ACCOUNT_HASH is not set.",
    );
  }

  return `https://imagedelivery.net/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${CLOUDFLARE_IMAGES_DEFAULT_VARIANT}`;
}

export async function uploadImageToCloudflare(
  file: File,
  { folder, filename, metadata }: UploadOptions = {},
): Promise<UploadResult> {
  ensureConfigured();

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_IMAGES_ACCOUNT_ID}/images/v1`;

  const payload = new FormData();
  const resolvedFilename =
    filename ||
    file.name ||
    `${folder ? folder.replaceAll("/", "-") : "upload"}-${randomUUID()}`;

  payload.append("file", file, resolvedFilename);
  payload.append("requireSignedURLs", "false");

  if (metadata || folder) {
    payload.append(
      "metadata",
      JSON.stringify({
        folder,
        ...metadata,
      }),
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
    },
    body: payload,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Cloudflare Images upload failed with status ${response.status}: ${responseText}`,
    );
  }

  const data = (await response.json()) as {
    success: boolean;
    result?: { id: string; variants?: string[] };
    errors?: Array<{ message?: string }>;
  };

  if (!data.success || !data.result) {
    const message =
      data.errors
        ?.map((item) => item.message)
        .filter(Boolean)
        .join(", ") || "Unknown Cloudflare Images error";
    throw new Error(message);
  }

  const url = resolveDeliveryUrl(data.result.id, data.result.variants ?? []);

  return {
    id: data.result.id,
    url,
    variants: data.result.variants ?? [url],
  };
}
