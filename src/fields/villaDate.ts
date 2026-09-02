import type { DateField } from "payload";

import { snapToVillaMidnightUTC } from "@/lib/calendar";

/**
 * A day-only date field that always stores UTC-midnight of the chosen villa-local
 * day, so the calendar maths never drifts by a timezone offset.
 */
export function villaDate(
  name: string,
  label: string,
  opts: {
    width?: string;
    description?: string;
    fieldComponent?: string;
    clientProps?: Record<string, unknown>;
  } = {},
): DateField {
  return {
    name,
    type: "date",
    required: true,
    label,
    admin: {
      width: opts.width,
      description: opts.description,
      date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" },
      ...(opts.fieldComponent
        ? {
            components: {
              Field: {
                path: opts.fieldComponent,
                clientProps: opts.clientProps,
              },
            },
          }
        : {}),
    },
    hooks: {
      // Runs before the collection's beforeValidate, so conflict checks see the
      // normalised value; also persists through to storage.
      beforeValidate: [({ value }) => snapToVillaMidnightUTC(value)],
    },
  };
}
