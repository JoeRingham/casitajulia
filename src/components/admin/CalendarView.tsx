import type { AdminViewServerProps } from "payload";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import React from "react";

import { AdminCalendar } from "./AdminCalendar";

/**
 * The `/admin/calendar` view — a month grid of bookings and blocks. Registered
 * in payload.config.ts under `admin.components.views.calendar`, with a sidebar
 * link from `CalendarNavLink`. Wrapping in DefaultTemplate keeps the admin
 * sidebar and chrome around it.
 */
export function CalendarView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      viewActions={[]}
      visibleEntities={{
        collections: visibleEntities?.collections ?? [],
        globals: visibleEntities?.globals ?? [],
      }}
    >
      <Gutter>
        <h1 style={{ marginBottom: 16 }}>Calendar</h1>
        <AdminCalendar />
      </Gutter>
    </DefaultTemplate>
  );
}

export default CalendarView;
