import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * The single shared image library. Every picture on the site — hero image,
 * images inside a "The Villa" / "Stay Guide" section, images pasted into rich
 * text — is uploaded here once and referenced from wherever it's used.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content" },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    mimeTypes: ["image/*"],
    focalPoint: false,
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 900 },
      { name: "full", width: 2000 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      admin: {
        description:
          "Describe the image for screen readers. A section's own caption is used instead where one is set.",
      },
    },
  ],
};
