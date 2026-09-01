import { APIError, type Payload } from "payload";

import { villaDayString } from "@/lib/dates";

/**
 * Availability model
 * ------------------
 * Bookings use half-open night semantics: a stay of check-in D1 / check-out D2
 * occupies the nights D1 .. D2-1. The check-out day itself is free for the next
 * arrival.
 *
 * Blocks (family use, maintenance, closed seasons) use inclusive day semantics:
 * "from D1 until D2" means every day D1 .. D2 is unavailable.
 *
 * CLEANER_GAP_DAYS is wired through everywhere but left at 0 for now — Julia
 * wants to revisit the exact turnaround rule later. Bumping this constant is all
 * that's needed to reserve N days after every check-out for the cleaner.
 */
export const CLEANER_GAP_DAYS = 0;

/**
 * Normalise a Payload date value to a plain 'YYYY-MM-DD' calendar day in the
 * villa's timezone. Stored values are already UTC-midnight of the villa day (see
 * fields/villaDate.ts), so this is mostly a slice — but it stays correct even if
 * a raw value slips through.
 */
export function toDayString(value: string | number | Date): string {
  return villaDayString(value);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function compareDay(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inclusive list of day strings from `start` to `end`. */
export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Do half-open ranges [aStart, aEnd) and [bStart, bEnd) share any day? */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export type BookingRange = {
  id: string | number;
  checkIn: string;
  checkOut: string;
  status: "enquiry" | "confirmed";
  guestName?: string;
};

export type BlockRange = {
  id: string | number;
  start: string;
  end: string;
  label?: string;
};

/** The half-open span a confirmed booking removes from availability. */
export function bookingSpan(
  b: { checkIn: string; checkOut: string },
  gapDays = CLEANER_GAP_DAYS,
): [string, string] {
  return [b.checkIn, addDays(b.checkOut, gapDays)];
}

/** The half-open span a block removes from availability (inclusive -> exclusive). */
export function blockSpan(b: { start: string; end: string }): [string, string] {
  return [b.start, addDays(b.end, 1)];
}

export type DayState = "available" | "unavailable";

/**
 * Build a day -> state map for the public calendar. Only `confirmed` bookings
 * and blocks make a day unavailable; enquiries are invisible to friends.
 */
export function publicAvailability(
  days: string[],
  bookings: BookingRange[],
  blocks: BlockRange[],
  gapDays = CLEANER_GAP_DAYS,
): Map<string, DayState> {
  const map = new Map<string, DayState>();
  for (const day of days) map.set(day, "available");

  const spans: Array<[string, string]> = [
    ...bookings
      .filter((b) => b.status === "confirmed")
      .map((b) => bookingSpan(b, gapDays)),
    ...blocks.map(blockSpan),
  ];

  for (const day of days) {
    const nextDay = addDays(day, 1);
    if (spans.some(([s, e]) => rangesOverlap(day, nextDay, s, e))) {
      map.set(day, "unavailable");
    }
  }
  return map;
}

/**
 * Throw if a proposed booking [checkIn, checkOut) collides with a confirmed
 * booking or a block. Used by the Bookings collection's beforeValidate hook.
 */
export async function assertNoConflict(
  payload: Payload,
  args: {
    checkIn: string;
    checkOut: string;
    ignoreBookingId?: string | number | null;
  },
): Promise<void> {
  const proposed = bookingSpan({
    checkIn: args.checkIn,
    checkOut: args.checkOut,
  });

  const [bookings, blocks] = await Promise.all([
    payload.find({
      collection: "bookings",
      where: { status: { equals: "confirmed" } },
      limit: 1000,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: "blocks",
      limit: 1000,
      depth: 0,
      pagination: false,
    }),
  ]);

  for (const b of bookings.docs) {
    if (args.ignoreBookingId != null && b.id === args.ignoreBookingId) continue;
    const span = bookingSpan({
      checkIn: toDayString(b.checkIn as string),
      checkOut: toDayString(b.checkOut as string),
    });
    if (rangesOverlap(proposed[0], proposed[1], span[0], span[1])) {
      throw new APIError(
        `Those dates clash with a confirmed stay (${toDayString(
          b.checkIn as string,
        )} to ${toDayString(b.checkOut as string)}).`,
        400,
        undefined,
        true,
      );
    }
  }

  for (const bl of blocks.docs) {
    const span = blockSpan({
      start: toDayString(bl.start as string),
      end: toDayString(bl.end as string),
    });
    if (rangesOverlap(proposed[0], proposed[1], span[0], span[1])) {
      throw new APIError(
        `Those dates fall inside a blocked period ("${bl.label}").`,
        400,
        undefined,
        true,
      );
    }
  }
}
