import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * The villa photo gallery. `orderable: true` gives Julia drag-to-reorder in the
 * admin list view; the public gallery renders in that order.
 */
export const Photos: CollectionConfig = {
  slug: "photos",
  orderable: true,
  admin: {
    useAsTitle: "caption",
    defaultColumns: ["caption", "image"],
    group: "Content",
    description: "Drag rows to change the order photos appear on the site.",
  },
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
      { name: "thumbnail", width: 600 },
      { name: "full", width: 2000 },
    ],
  },
  fields: [
    {
      name: "caption",
      type: "text",
      label: "Caption",
      admin: { description: "Shown under the photo. Also used as alt text." },
    },
  ],
};
