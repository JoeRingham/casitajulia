import { APIError, type CollectionConfig } from "payload";

import { villaDate } from "@/fields/villaDate";
import { authenticated } from "@/lib/access";
import { assertNoConflict, toDayString } from "@/lib/availability";

/**
 * Every entry on the calendar — a guest stay, the family's own stay, or a block
 * (maintenance, closed season). One shape for all three; `type` only decides
 * which extra field shows and how the chip looks.
 *
 * Dates are check-in / check-out, half-open: the nights from `start` up to (not
 * including) `end` are unavailable. See src/lib/availability.ts.
 *
 * Admin-only for every operation — nothing here reaches the public calendar
 * except "these nights are unavailable".
 */
const TYPE_LABELS: Record<string, string> = {
  guest: "Guest stay",
  owner: "Our stay",
  block: "Block",
};

function entryTitle(data: Record<string, unknown> | undefined | null): string {
  const type = (data?.type as string) ?? "owner";
  if (type === "guest") return (data?.guestName as string) || "Guest stay";
  if (type === "block") return (data?.reason as string) || "Block";
  return (data?.note as string) || "Our stay";
}

const DATE_FIELD = "/components/admin/EntryDateField#EntryDateField";

export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Booking", plural: "Bookings" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "start", "end"],
    listSearchableFields: ["guestName", "reason", "note"],
    group: false,
    components: {
      beforeListTable: ["/components/admin/AdminCalendar#AdminCalendar"],
    },
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "owner",
      options: [
        { label: "Guest stay", value: "guest" },
        { label: "Our stay", value: "owner" },
        { label: "Block (maintenance, closed season…)", value: "block" },
      ],
    },
    {
      name: "guestName",
      type: "text",
      label: "Guest name",
      admin: { condition: (data) => data?.type === "guest" },
    },
    {
      name: "reason",
      type: "text",
      label: "Reason",
      admin: {
        condition: (data) => data?.type === "block",
        description: "e.g. “Kitchen works”, “Closed for winter”.",
      },
    },
    {
      type: "row",
      fields: [
        villaDate("start", "Check-in", {
          width: "50%",
          fieldComponent: DATE_FIELD,
          clientProps: { endpoint: "start" },
        }),
        villaDate("end", "Check-out", {
          width: "50%",
          fieldComponent: DATE_FIELD,
          clientProps: { endpoint: "end" },
        }),
      ],
    },
    {
      name: "note",
      type: "textarea",
      label: "Note",
      admin: {
        description: "Optional. Only ever visible here in the admin.",
      },
    },
    {
      name: "title",
      type: "text",
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, operation }) => {
        const merged = { ...originalDoc, ...data };
        const start = merged?.start ? toDayString(merged.start) : null;
        const end = merged?.end ? toDayString(merged.end) : null;

        if (merged?.type === "guest" && !merged?.guestName) {
          throw new APIError(
            "Guest name is required for a guest stay.",
            400,
            undefined,
            true,
          );
        }
        if (merged?.type === "block" && !merged?.reason) {
          throw new APIError(
            "A reason is required for a block.",
            400,
            undefined,
            true,
          );
        }

        if (start && end && end <= start) {
          throw new APIError(
            "Check-out must be after check-in.",
            400,
            undefined,
            true,
          );
        }

        if (start && end) {
          await assertNoConflict(req.payload, {
            start,
            end,
            ignoreId:
              operation === "update" ? (originalDoc?.id ?? null) : null,
          });
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => ({
        ...data,
        title: entryTitle({ ...originalDoc, ...data }),
      }),
    ],
  },
};

export { TYPE_LABELS };
