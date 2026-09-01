import { createHash, timingSafeEqual } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

/**
 * The shared-password gate that fronts the whole site. Deliberately simple: one
 * password (SITE_PASSWORD) that Julia hands out to friends, swapped for a
 * signed, HTTP-only cookie.
 *
 * It is NOT the admin login — that's Payload's own auth on /admin.
 *
 * Two things can invalidate every friend's cookie at once:
 *   • changing GATE_SECRET  — breaks the signature
 *   • changing SITE_PASSWORD — the cookie carries a fingerprint of the password
 *     it was issued against; on change it no longer matches and re-login is forced
 */

export const GATE_COOKIE = "cj_gate";

// How long a friend stays signed in without re-entering the password.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

function secretKey(): Uint8Array {
  const secret = process.env.GATE_SECRET || process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error("GATE_SECRET (or PAYLOAD_SECRET) must be set.");
  }
  return new TextEncoder().encode(secret);
}

/** Short, non-reversible fingerprint of the current site password. */
function sitePasswordFingerprint(): string {
  const pw = process.env.SITE_PASSWORD || "";
  return createHash("sha256").update(pw).digest("hex").slice(0, 16);
}

export function checkSitePassword(input: string): boolean {
  const expected = process.env.SITE_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function issueGateToken(): Promise<string> {
  return new SignJWT({ role: "friend", pw: sitePasswordFingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyGateToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.pw === sitePasswordFingerprint();
  } catch {
    return false;
  }
}

export const gateCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
