"use client";

import { DateTimeField, useFormFields } from "@payloadcms/ui";

/**
 * Custom render for the Bookings `start` / `end` date fields:
 *  - labels change to "Block start / Block end" when type is a block
 *  - the "block a whole day" hint shows only on the block form
 *  - the `end` picker opens on the `start` month and won't go earlier than it
 * It just augments the field config and hands off to Payload's own DateTimeField.
 */
export function EntryDateField(props: {
  endpoint?: "start" | "end";
  field: Record<string, unknown>;
  [key: string]: unknown;
}) {
  const endpoint = props.endpoint ?? "start";
  const type = useFormFields(
    ([fields]) => fields?.type?.value as string | undefined,
  );
  const startValue = useFormFields(
    ([fields]) => fields?.start?.value as string | undefined,
  );

  const isBlock = type === "block";
  const startDate =
    endpoint === "end" && startValue ? new Date(startValue) : undefined;

  const label = isBlock
    ? endpoint === "start"
      ? "Block start"
      : "Block end"
    : endpoint === "start"
      ? "Check-in"
      : "Check-out";

  const description =
    endpoint === "end" && isBlock
      ? "To block a whole calendar day, set block start to the day before and block end to the day after."
      : undefined;

  const admin = (props.field.admin ?? {}) as Record<string, unknown>;
  const date = (admin.date ?? {}) as Record<string, unknown>;

  const field = {
    ...props.field,
    label,
    admin: {
      ...admin,
      description,
      date: {
        ...date,
        ...(startDate
          ? {
              minDate: startDate,
              overrides: {
                ...((date.overrides as Record<string, unknown>) ?? {}),
                openToDate: startDate,
              },
            }
          : {}),
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DateTimeField {...(props as any)} field={field as any} />;
}

export default EntryDateField;
