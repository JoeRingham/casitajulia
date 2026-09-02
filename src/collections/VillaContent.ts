import { makePageContentCollection } from "@/collections/makePageContentCollection";

/** Content for the "/villa" page. Sidebar: Content → The Villa. */
export const VillaContent = makePageContentCollection({
  slug: "villaContent",
  labels: { singular: "Section", plural: "The Villa" },
  description:
    "Sections of the “The Villa” page — the house, the garden, getting here. Drag rows to reorder.",
});
