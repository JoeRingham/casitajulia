import { makePageContentCollection } from "@/collections/makePageContentCollection";

/** Content for the "/info" page. Sidebar: Content → Stay Guide. */
export const StayGuideContent = makePageContentCollection({
  slug: "stayGuideContent",
  labels: { singular: "Section", plural: "Stay Guide" },
  description:
    "Sections of the “Stay Guide” page — wifi, keys, arrival, house rules, bins, local tips. Drag rows to reorder.",
});
