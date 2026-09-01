import type { Metadata } from "next";
import Link from "next/link";

import { CalendarLegend, MonthCalendar } from "@/components/MonthCalendar";
import type { DayState } from "@/lib/availability";
import { getPublicAvailability, getSettings } from "@/lib/data";
import {
  addMonths,
  firstDay,
  lastDay,
  monthLabel,
  monthParam,
  parseMonthParam,
} from "@/lib/month";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const current = parseMonthParam(m);
  const next = addMonths(current, 1);

  const [settings, availability] = await Promise.all([
    getSettings().catch(() => null),
    getPublicAvailability(firstDay(current), lastDay(next)).catch(
      () => new Map<string, DayState>(),
    ),
  ]);

  const prev = addMonths(current, -1);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Calendar
      </h1>

      <div className="flex items-center justify-between text-sm">
        <Link
          href={`/calendar?m=${monthParam(prev)}`}
          className="rounded-md border border-border px-3 py-1.5 text-muted hover:text-foreground"
          rel="nofollow"
        >
          ← {monthLabel(prev)}
        </Link>
        <Link
          href={`/calendar?m=${monthParam(addMonths(current, 2))}`}
          className="rounded-md border border-border px-3 py-1.5 text-muted hover:text-foreground"
          rel="nofollow"
        >
          {monthLabel(addMonths(current, 2))} →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MonthCalendar ym={current} availability={availability} />
        <MonthCalendar ym={next} availability={availability} />
      </div>

      <CalendarLegend />

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-lg font-semibold">How to book</h2>
        <p className="mt-2 whitespace-pre-line leading-7 text-muted">
          {settings?.howToBook ||
            "Message Julia and/or Neal with the dates you'd like. They'll confirm here once it's agreed."}
        </p>
      </section>
    </div>
  );
}
