"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getGeneral } from "@/lib/data";
import {
  GATE_COOKIE,
  checkSitePassword,
  gateCookieOptions,
  issueGateToken,
} from "@/lib/gate";

async function wrongPasswordMessage(): Promise<string> {
  const general = await getGeneral().catch(() => null);
  const owner = general?.ownerNames?.trim();
  const who = owner ? owner : "the owners";
  return `That password isn't right. Try again, or ask ${who} for the latest password.`;
}

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
    return { error: await wrongPasswordMessage() };
  }

  const token = await issueGateToken();
  const store = await cookies();
  store.set(GATE_COOKIE, token, gateCookieOptions);

  redirect(next);
}
