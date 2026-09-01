"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  GATE_COOKIE,
  checkSitePassword,
  gateCookieOptions,
  issueGateToken,
} from "@/lib/gate";

function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  // Only allow same-site absolute paths, never protocol-relative or external.
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export async function submitPassword(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  // Small cost to blunt brute-forcing on a shared password.
  await new Promise((r) => setTimeout(r, 400));

  if (!checkSitePassword(password)) {
    return { error: "That password isn't right. Try again, or ask Julia." };
  }

  const token = await issueGateToken();
  const store = await cookies();
  store.set(GATE_COOKIE, token, gateCookieOptions);

  redirect(next);
}
