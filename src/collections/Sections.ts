import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * Free-form content blocks for the "Info" page — house rules, wifi, arrival
 * instructions, parking, bins, local tips, etc. An admin can add, remove, rename
 * and drag-to-reorder these without code changes.
 */
export const Sections: CollectionConfig = {
  slug: "sections",
  orderable: true,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "published"],
    group: "Content",
    description:
      "Each block becomes a titled section on the Info page. Drag rows to reorder.",
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Section title",
    },
    {
      name: "body",
      type: "richText",
      label: "Content",
    },
    {
      name: "published",
      type: "checkbox",
      label: "Show on site",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Uncheck to hide this section without deleting it.",
      },
    },
  ],
};
