import { APIError, type CollectionConfig } from "payload";

import { authenticated } from "@/lib/access";
import { toDayString } from "@/lib/availability";
import { villaDate } from "@/fields/villaDate";

/**
 * Dates that are unavailable but aren't a friend's stay: the family using it
 * themselves, maintenance, or a season they never lend it out. Shown on the
 * public calendar simply as "unavailable".
 */
export const Blocks: CollectionConfig = {
  slug: "blocks",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "start", "end"],
    group: "Calendar",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      label: "Reason",
      admin: { description: "e.g. “Family staying”, “Kitchen works”." },
    },
    {
      type: "row",
      fields: [
        villaDate("start", "From", { width: "50%" }),
        villaDate("end", "Until (last unavailable day)", { width: "50%" }),
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const merged = { ...originalDoc, ...data };
        const start = merged?.start ? toDayString(merged.start) : null;
        const end = merged?.end ? toDayString(merged.end) : null;
        if (start && end && end < start) {
          throw new APIError(
            "“Until” must be on or after “From”.",
            400,
            undefined,
            true,
          );
        }
        return data;
      },
    ],
  },
};
