import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { GATE_COOKIE, verifyGateToken } from "@/lib/gate";

/**
 * Next 16 "proxy" (formerly middleware). Runs on the Node runtime.
 *
 * Puts the whole site behind the shared friends password. The only things that
 * stay open are the password page itself and static assets. The admin panel is
 * behind this gate too — Julia enters the site password once (90-day cookie),
 * then logs in to Payload separately.
 */

const ALWAYS_ALLOW = [
  "/enter",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.webmanifest",
];

function isAsset(pathname: string): boolean {
  return /\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|json|webmanifest|woff2?|ttf|otf|map)$/i.test(
    pathname,
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    ALWAYS_ALLOW.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    isAsset(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(GATE_COOKIE)?.value;
  if (await verifyGateToken(token)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/enter";
  url.search = "";
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
