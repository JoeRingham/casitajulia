/**
 * Everything calendar-related, in one place.
 *
 * ── The one rule ────────────────────────────────────────────────────────────
 * A date in this app always means "a calendar day at the villa" (Deià,
 * Mallorca). It is passed around as a plain 'YYYY-MM-DD' string. There is NO
 * per-visitor timezone conversion — someone loading the site from Australia
 * sees exactly the same dates as someone in Palma.
 *
 * Timezone code appears in only one spot, and only for input: Payload's date
 * picker hands back a full timestamp, and the admin's browser could be in any
 * timezone. `snapToVillaMidnightUTC` pins that timestamp to the Mallorca day the
 * person actually picked, so "the 10th" is stored as the 10th whether they're in
 * London, New York or Palma. After that, dates are just strings and the helpers
 * below never touch a timezone again.
 */

// ── Villa-day normalisation (input side only) ───────────────────────────────

export const VILLA_TZ = "Europe/Madrid";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VILLA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 'YYYY-MM-DD' for the villa-local day that `value` falls on. */
export function villaDayString(value: string | number | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  return dayFormatter.format(d);
}

/** Canonical storage form: UTC midnight of the villa-local day. */
export function snapToVillaMidnightUTC(
  value: string | number | Date | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined || value === "") return value;
  return `${villaDayString(value)}T00:00:00.000Z`;
}

// ── Month-grid maths (pure string/number, no timezone) ──────────────────────

export type YearMonth = { year: number; month: number }; // month: 1-12

export function parseMonthParam(value: string | undefined): YearMonth {
  const now = new Date();
  const fallback = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return fallback;
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) return fallback;
  return { year: y, month: m };
}

export function monthParam({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const zero = year * 12 + (month - 1) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

export function monthLabel({ year, month }: YearMonth): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function firstDay({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function lastDay({ year, month }: YearMonth): string {
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}

/**
 * A Monday-first grid of day cells for the month. Leading/trailing cells from
 * adjacent months are returned as `null`.
 */
export function monthGrid({ year, month }: YearMonth): (string | null)[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun
  const lead = (firstWeekday + 6) % 7; // shift so Monday=0

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
