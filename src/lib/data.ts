import configPromise from "@payload-config";
import { getPayload } from "payload";

import {
  type BlockRange,
  type BookingRange,
  eachDay,
  publicAvailability,
  toDayString,
} from "@/lib/availability";

export async function getClient() {
  return getPayload({ config: configPromise });
}

export async function getSettings() {
  const payload = await getClient();
  return payload.findGlobal({ slug: "settings" });
}

export async function getSections() {
  const payload = await getClient();
  const res = await payload.find({
    collection: "sections",
    where: { published: { equals: true } },
    sort: "_order",
    limit: 100,
    depth: 1,
  });
  return res.docs;
}

export async function getPhotos() {
  const payload = await getClient();
  const res = await payload.find({
    collection: "photos",
    sort: "_order",
    limit: 200,
    depth: 0,
  });
  return res.docs;
}

/**
 * Public calendar data: a day -> "available" | "unavailable" map for the given
 * inclusive day range. Guest names and block reasons never leave this function.
 */
export async function getPublicAvailability(fromDay: string, toDay: string) {
  const payload = await getClient();

  const [bookings, blocks] = await Promise.all([
    payload.find({
      collection: "bookings",
      where: {
        and: [
          { status: { equals: "confirmed" } },
          { checkOut: { greater_than_equal: fromDay } },
          { checkIn: { less_than_equal: toDay } },
        ],
      },
      limit: 1000,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: "blocks",
      where: {
        and: [
          { end: { greater_than_equal: fromDay } },
          { start: { less_than_equal: toDay } },
        ],
      },
      limit: 1000,
      depth: 0,
      pagination: false,
    }),
  ]);

  const bookingRanges: BookingRange[] = bookings.docs.map((b) => ({
    id: b.id,
    checkIn: toDayString(b.checkIn as string),
    checkOut: toDayString(b.checkOut as string),
    status: b.status as BookingRange["status"],
  }));

  const blockRanges: BlockRange[] = blocks.docs.map((b) => ({
    id: b.id,
    start: toDayString(b.start as string),
    end: toDayString(b.end as string),
  }));

  return publicAvailability(eachDay(fromDay, toDay), bookingRanges, blockRanges);
}
