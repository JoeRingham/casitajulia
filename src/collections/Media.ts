import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * Images embedded inside rich-text "Info" sections. Villa gallery photos live
 * in their own `photos` collection so they can be reordered independently.
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
      { name: "large", width: 1600 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      admin: { description: "Describe the image for screen readers." },
    },
  ],
};
