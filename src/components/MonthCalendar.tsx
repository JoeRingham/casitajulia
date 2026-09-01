import type { DayState } from "@/lib/availability";
import { monthGrid, monthLabel, WEEKDAY_LABELS, type YearMonth } from "@/lib/month";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function MonthCalendar({
  ym,
  availability,
}: {
  ym: YearMonth;
  availability: Map<string, DayState>;
}) {
  const cells = monthGrid(ym);
  const today = todayStr();

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 font-serif text-lg font-semibold">{monthLabel(ym)}</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`x${i}`} />;
          const state = availability.get(day) ?? "available";
          const past = day < today;
          const dayNum = Number(day.slice(8, 10));
          return (
            <div
              key={day}
              className={[
                "aspect-square rounded-md border text-sm flex items-center justify-center",
                past
                  ? "border-transparent text-muted/50"
                  : state === "unavailable"
                    ? "border-border bg-accent/15 text-foreground line-through decoration-accent/60"
                    : "border-border bg-background text-foreground",
              ].join(" ")}
              title={
                past
                  ? undefined
                  : state === "unavailable"
                    ? "Unavailable"
                    : "Available"
              }
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarLegend() {
  return (
    <div className="flex gap-5 text-sm text-muted">
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded border border-border bg-background" />
        Available
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded border border-border bg-accent/15" />
        Unavailable
      </span>
    </div>
  );
}
