import { timingSafeEqual } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

/**
 * The shared-password gate that fronts the whole site. This is deliberately
 * simple: one password (SITE_PASSWORD) that Julia hands out to friends, swapped
 * for a signed, HTTP-only cookie that lasts ~90 days.
 *
 * It is NOT the admin login — that's Payload's own auth on /admin.
 */

export const GATE_COOKIE = "cj_gate";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

function secretKey(): Uint8Array {
  const secret = process.env.GATE_SECRET || process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error("GATE_SECRET (or PAYLOAD_SECRET) must be set.");
  }
  return new TextEncoder().encode(secret);
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
  return new SignJWT({ role: "friend" })
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
    await jwtVerify(token, secretKey());
    return true;
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
