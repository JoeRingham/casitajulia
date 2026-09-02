"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addDays,
  addMonths,
  eachDay,
  firstDay,
  lastDay,
  monthGrid,
  monthLabel,
  villaDayString,
  WEEKDAY_LABELS,
  type YearMonth,
} from "@/lib/calendar";

type Booking = {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "enquiry" | "confirmed";
};

type Block = {
  id: number;
  label: string;
  start: string;
  end: string;
};

type DayEntries = { bookings: Booking[]; blocks: Block[] };

const ADMIN = "/admin";

function thisMonth(): YearMonth {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rb, rbl] = await Promise.all([
          fetch("/api/bookings?depth=0&limit=2000&sort=checkIn", {
            credentials: "include",
          }),
          fetch("/api/blocks?depth=0&limit=2000&sort=start", {
            credentials: "include",
          }),
        ]);
        if (!rb.ok || !rbl.ok) throw new Error("request failed");
        const jb = await rb.json();
        const jbl = await rbl.json();
        if (cancelled) return;
        setBookings(jb.docs ?? []);
        setBlocks(jbl.docs ?? []);
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
    const map = new Map<string, DayEntries>();
    const bucket = (day: string) => {
      let e = map.get(day);
      if (!e) {
        e = { bookings: [], blocks: [] };
        map.set(day, e);
      }
      return e;
    };

    for (const b of bookings) {
      const ci = villaDayString(b.checkIn);
      const co = villaDayString(b.checkOut);
      // Occupied nights are [check-in .. check-out - 1].
      for (const day of eachDay(ci, addDays(co, -1))) {
        if (day < start || day > end) continue;
        bucket(day).bookings.push(b);
      }
    }
    for (const bl of blocks) {
      for (const day of eachDay(villaDayString(bl.start), villaDayString(bl.end))) {
        if (day < start || day > end) continue;
        bucket(day).blocks.push(bl);
      }
    }
    return map;
  }, [ym, bookings, blocks]);

  const cells = monthGrid(ym);
  const today = villaDayString(new Date());

  return (
    <div>
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
            couldn’t load bookings
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
          const entries = byDay.get(day);
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

              {entries?.bookings.map((b) => (
                <a
                  key={`b-${b.id}-${day}`}
                  href={`${ADMIN}/collections/bookings/${b.id}`}
                  title={`${b.guestName} · ${b.status}`}
                  style={{
                    ...chipBase,
                    borderLeft: `3px ${
                      b.status === "confirmed" ? "solid" : "dashed"
                    } var(--theme-success-500)`,
                    opacity: b.status === "confirmed" ? 1 : 0.85,
                  }}
                >
                  {b.guestName}
                </a>
              ))}

              {entries?.blocks.map((bl) => (
                <a
                  key={`bl-${bl.id}-${day}`}
                  href={`${ADMIN}/collections/blocks/${bl.id}`}
                  title={bl.label}
                  style={{
                    ...chipBase,
                    borderLeft: "3px solid var(--theme-warning-500)",
                  }}
                >
                  {bl.label}
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
        <Legend swatch="3px solid var(--theme-success-500)" label="Confirmed stay" />
        <Legend swatch="3px dashed var(--theme-success-500)" label="Enquiry" />
        <Legend swatch="3px solid var(--theme-warning-500)" label="Blocked" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          display: "inline-block",
          width: 20,
          height: 12,
          borderRadius: 3,
          background: "var(--theme-elevation-100)",
          borderLeft: swatch,
        }}
      />
      {label}
    </span>
  );
}
