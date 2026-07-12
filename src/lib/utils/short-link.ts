import { randomBytes } from "crypto";

const SHORT_CODE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** 8 karakterlik URL-safe kısa kod. */
export function createShortCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += SHORT_CODE_ALPHABET[bytes[i]! % SHORT_CODE_ALPHABET.length];
  }
  return code;
}

/** WhatsApp'ta kullanılacak mutlak uygulama adresi. */
export function getAppBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return "http://localhost:3000";

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

export function buildShortImageUrl(baseUrl: string, shortCode: string): string {
  return `${baseUrl.replace(/\/$/, "")}/g/${shortCode}`;
}
