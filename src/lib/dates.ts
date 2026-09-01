/**
 * The villa is in Deià. Bookings are about *calendar days* there, not instants,
 * so every stored date is snapped to UTC-midnight of the day it falls on in the
 * villa's timezone. Everything downstream can then treat the first 10 characters
 * of the ISO string as "the day".
 */
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
