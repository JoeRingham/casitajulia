import configPromise from "@payload-config";
import { getPayload } from "payload";

import {
  type EntryRange,
  publicAvailability,
  toDayString,
} from "@/lib/availability";
import { eachDay } from "@/lib/calendar";

export async function getClient() {
  return getPayload({ config: configPromise });
}

export async function getGeneral() {
  const payload = await getClient();
  return payload.findGlobal({ slug: "general" });
}

async function getPageContent(
  collection: "villaContent" | "stayGuideContent",
) {
  const payload = await getClient();
  const res = await payload.find({
    collection,
    where: { published: { equals: true } },
    sort: "_order",
    limit: 100,
    depth: 1, // populate images[].image -> media
  });
  return res.docs;
}

export function getVillaContent() {
  return getPageContent("villaContent");
}

export function getStayGuideContent() {
  return getPageContent("stayGuideContent");
}

/**
 * Public calendar data: a day -> "available" | "unavailable" map for the given
 * inclusive day range. Entry types, guest names and notes never leave here.
 */
export async function getPublicAvailability(fromDay: string, toDay: string) {
  const payload = await getClient();

  const res = await payload.find({
    collection: "bookings",
    where: {
      and: [
        { end: { greater_than_equal: fromDay } },
        { start: { less_than_equal: toDay } },
      ],
    },
    limit: 2000,
    depth: 0,
    pagination: false,
  });

  const entries: EntryRange[] = res.docs.map((e) => ({
    id: e.id,
    start: toDayString(e.start as string),
    end: toDayString(e.end as string),
  }));

  return publicAvailability(eachDay(fromDay, toDay), entries);
}
