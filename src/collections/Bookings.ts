import { APIError, type CollectionConfig } from "payload";

import { authenticated } from "@/lib/access";
import { assertNoConflict, toDayString } from "@/lib/availability";
import { villaDate } from "@/fields/villaDate";

/**
 * A friend's stay. Only admins can read these — guest names never reach the
 * public calendar, which shows nothing but "available / booked".
 */
export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "guestName",
    defaultColumns: ["guestName", "checkIn", "checkOut", "status"],
    group: "Calendar",
    listSearchableFields: ["guestName", "notes"],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "guestName",
      type: "text",
      required: true,
      label: "Guest name",
    },
    {
      type: "row",
      fields: [
        villaDate("checkIn", "Check-in", { width: "50%" }),
        villaDate("checkOut", "Check-out", { width: "50%" }),
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "enquiry",
      options: [
        { label: "Enquiry (pencilled in)", value: "enquiry" },
        { label: "Confirmed", value: "confirmed" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Confirmed stays block the calendar. Enquiries are shown to you only.",
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Private notes",
      admin: {
        description:
          "Only ever visible here in the admin — never on the site.",
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, operation }) => {
        const merged = { ...originalDoc, ...data };
        const checkIn = merged?.checkIn ? toDayString(merged.checkIn) : null;
        const checkOut = merged?.checkOut ? toDayString(merged.checkOut) : null;

        if (checkIn && checkOut && checkOut <= checkIn) {
          throw new APIError(
            "Check-out must be after check-in.",
            400,
            undefined,
            true,
          );
        }

        // Enquiries are just pencil marks and may overlap anything. Only a
        // confirmed stay must be clear of other confirmed stays and blocks.
        if (checkIn && checkOut && merged?.status === "confirmed") {
          await assertNoConflict(req.payload, {
            checkIn,
            checkOut,
            ignoreBookingId:
              operation === "update" ? (originalDoc?.id ?? null) : null,
          });
        }

        return data;
      },
    ],
  },
};
