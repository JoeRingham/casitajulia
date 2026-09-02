import { APIError, type Payload } from "payload";

import { villaDayString } from "@/lib/calendar";

/**
 * Availability model
 * ------------------
 * Every calendar entry — guest stay, our stay, or block — occupies the nights
 * `[start, end)`: from `start` up to but NOT including `end`. The `end` day (the
 * morning you leave) is available again.
 *
 * One overlap rule for all types: two entries clash iff their night ranges
 * intersect. Entries that merely touch (A.end === B.start) do not clash — that's
 * a back-to-back / same-day handover, and it's allowed.
 */

/** Normalise a Payload date value to a plain 'YYYY-MM-DD' villa-local day. */
export function toDayString(value: string | number | Date): string {
  return villaDayString(value);
}

/** Do half-open ranges [aStart, aEnd) and [bStart, bEnd) share a night? */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export type EntryRange = {
  id: string | number;
  start: string;
  end: string;
};

export type DayState = "available" | "unavailable";

/**
 * day -> state map for the public calendar. A day is unavailable if it is an
 * occupied night of any entry. Guest names, notes and entry types never reach
 * this function's callers.
 */
export function publicAvailability(
  days: string[],
  entries: EntryRange[],
): Map<string, DayState> {
  const map = new Map<string, DayState>();
  for (const day of days) {
    const taken = entries.some((e) => e.start <= day && day < e.end);
    map.set(day, taken ? "unavailable" : "available");
  }
  return map;
}

/**
 * Throw if a proposed entry `[start, end)` overlaps another entry's nights.
 * Used by the Bookings collection's beforeValidate hook — applies to every type.
 */
export async function assertNoConflict(
  payload: Payload,
  args: { start: string; end: string; ignoreId?: string | number | null },
): Promise<void> {
  const res = await payload.find({
    collection: "bookings",
    limit: 2000,
    depth: 0,
    pagination: false,
  });

  for (const e of res.docs) {
    if (args.ignoreId != null && e.id === args.ignoreId) continue;
    const eStart = toDayString(e.start as string);
    const eEnd = toDayString(e.end as string);
    if (rangesOverlap(args.start, args.end, eStart, eEnd)) {
      const label =
        (e.title as string) ||
        (e.guestName as string) ||
        (e.note as string) ||
        "another entry";
      throw new APIError(
        `Those dates overlap "${label}" (${eStart} to ${eEnd}).`,
        400,
        undefined,
        true,
      );
    }
  }
}
