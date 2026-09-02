import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * Builds a content-page collection: an ordered list of sections, each with a
 * heading, rich text, and an optional grid of captioned images. Used for the
 * "The Villa" and "Stay Guide" pages, which are structurally identical.
 *
 * `labels.plural` is what shows in the admin sidebar (e.g. "The Villa");
 * `labels.singular` is the "Create new …" button text.
 */
export function makePageContentCollection(opts: {
  slug: string;
  labels: { singular: string; plural: string };
  description: string;
}): CollectionConfig {
  return {
    slug: opts.slug,
    labels: opts.labels,
    orderable: true,
    admin: {
      useAsTitle: "heading",
      defaultColumns: ["heading", "published"],
      group: false,
      description: opts.description,
    },
    access: {
      read: anyone,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
    },
    fields: [
      {
        name: "heading",
        type: "text",
        required: true,
        label: "Heading",
      },
      {
        name: "body",
        type: "richText",
        label: "Text",
      },
      {
        name: "images",
        type: "array",
        label: "Images",
        labels: { singular: "Image", plural: "Images" },
        admin: {
          description: "Shown as a grid under the text. Drag to reorder.",
        },
        fields: [
          {
            name: "image",
            type: "upload",
            relationTo: "media",
            required: true,
          },
          {
            name: "caption",
            type: "text",
            label: "Caption",
          },
        ],
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
}
