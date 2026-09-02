"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addDays,
  addMonths,
  firstDay,
  lastDay,
  monthGrid,
  monthLabel,
  villaDayString,
  WEEKDAY_LABELS,
  type YearMonth,
} from "@/lib/calendar";

type EntryType = "guest" | "owner" | "block";

type Entry = {
  id: number;
  type: EntryType;
  guestName?: string | null;
  note?: string | null;
  title?: string | null;
  start: string;
  end: string;
};

const ADMIN = "/admin";

const TYPE_LABEL: Record<EntryType, string> = {
  guest: "Guest stay",
  owner: "Our stay",
  block: "Block",
};

// green / blue / amber
const TYPE_COLOR: Record<EntryType, string> = {
  guest: "var(--theme-success-500)",
  owner: "#3b82f6",
  block: "var(--theme-warning-500)",
};

function thisMonth(): YearMonth {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function entryLabel(e: Entry): string {
  return (
    e.title || e.guestName || e.note || TYPE_LABEL[e.type] || "Entry"
  );
}

const btn: React.CSSProperties = {
  font: "inherit",
  fontSize: 13,
  padding: "5px 12px",
  borderRadius: 4,
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  color: "var(--theme-text)",
  cursor: "pointer",
};

const chipBase: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  lineHeight: 1.35,
  padding: "1px 5px",
  borderRadius: 3,
  marginTop: 3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textDecoration: "none",
  color: "var(--theme-text)",
  background: "var(--theme-elevation-100)",
};

export function AdminCalendar() {
  const [ym, setYm] = useState<YearMonth>(thisMonth);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/bookings?depth=0&limit=2000&sort=start",
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("request failed");
        const json = await res.json();
        if (cancelled) return;
        setEntries(json.docs ?? []);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = useMemo(() => {
    const start = firstDay(ym);
    const end = lastDay(ym);
    const map = new Map<string, { entry: Entry; leaving: boolean }[]>();
    const push = (day: string, entry: Entry, leaving: boolean) => {
      if (day < start || day > end) return;
      const list = map.get(day) ?? [];
      list.push({ entry, leaving });
      map.set(day, list);
    };

    for (const e of entries) {
      // Occupied nights are [check-in .. check-out - 1] ...
      let day = villaDayString(e.start);
      const stop = villaDayString(e.end);
      for (; day < stop; day = addDays(day, 1)) push(day, e, false);
      // ... plus a faint marker on the check-out day, so a same-day handover
      // shows both the leaving entry and the arriving one.
      push(stop, e, true);
    }
    return map;
  }, [ym, entries]);

  const cells = monthGrid(ym);
  const today = villaDayString(new Date());

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button style={btn} onClick={() => setYm((m) => addMonths(m, -1))}>
          ← Prev
        </button>
        <button style={btn} onClick={() => setYm(thisMonth())}>
          Today
        </button>
        <button style={btn} onClick={() => setYm((m) => addMonths(m, 1))}>
          Next →
        </button>
        <strong style={{ marginLeft: 8, fontSize: 15 }}>{monthLabel(ym)}</strong>
        {status === "loading" ? (
          <span style={{ color: "var(--theme-elevation-500)" }}>loading…</span>
        ) : null}
        {status === "error" ? (
          <span style={{ color: "var(--theme-error-500)" }}>
            couldn’t load entries
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: 11,
              fontWeight: 600,
              textAlign: "center",
              padding: "4px 0",
              color: "var(--theme-elevation-600)",
            }}
          >
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const dayEntries = byDay.get(day);
          const isToday = day === today;
          return (
            <div
              key={day}
              style={{
                minHeight: 88,
                border: "1px solid var(--theme-elevation-150)",
                borderRadius: 4,
                padding: 4,
                background: isToday
                  ? "var(--theme-elevation-50)"
                  : "var(--theme-elevation-0)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 400,
                  color: "var(--theme-elevation-700)",
                }}
              >
                {Number(day.slice(8, 10))}
              </div>

              {dayEntries?.map(({ entry: e, leaving }) => (
                <a
                  key={`${e.id}-${day}-${leaving ? "out" : "in"}`}
                  href={`${ADMIN}/collections/bookings/${e.id}`}
                  title={`${entryLabel(e)} · ${TYPE_LABEL[e.type]}${
                    leaving ? " · leaves this day" : ""
                  }`}
                  style={{
                    ...chipBase,
                    borderLeft: `3px ${leaving ? "dashed" : "solid"} ${
                      TYPE_COLOR[e.type]
                    }`,
                    opacity: leaving ? 0.5 : 1,
                  }}
                >
                  {leaving ? `${entryLabel(e)} out` : entryLabel(e)}
                </a>
              ))}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 14,
          fontSize: 12,
          color: "var(--theme-elevation-700)",
          flexWrap: "wrap",
        }}
      >
        <Legend color={TYPE_COLOR.guest} label="Guest stay" />
        <Legend color={TYPE_COLOR.owner} label="Our stay" />
        <Legend color={TYPE_COLOR.block} label="Block" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          display: "inline-block",
          width: 20,
          height: 12,
          borderRadius: 3,
          background: "var(--theme-elevation-100)",
          borderLeft: `3px solid ${color}`,
        }}
      />
      {label}
    </span>
  );
}
