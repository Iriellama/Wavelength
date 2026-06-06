"use client"

import { useMemo, useState } from "react"
import { useCheckins } from "@/hooks/use-wavelength"
import { buildObservations } from "@/lib/observations"
import { getEmotion } from "@/lib/emotions"
import type { Checkin } from "@/hooks/use-wavelength"

const WD = [
  { abbr: "S", full: "Sunday" },
  { abbr: "M", full: "Monday" },
  { abbr: "T", full: "Tuesday" },
  { abbr: "W", full: "Wednesday" },
  { abbr: "T", full: "Thursday" },
  { abbr: "F", full: "Friday" },
  { abbr: "S", full: "Saturday" },
]

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    )
  }
  return cells
}

export function Quilt() {
  const { checkins, isLoading } = useCheckins()
  const now = new Date()
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  const map = useMemo(() => {
    const m: Record<string, Checkin> = {}
    for (const c of checkins) m[c.day] = c
    return m
  }, [checkins])

  const observations = useMemo(() => buildObservations(checkins), [checkins])
  const cells = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor],
  )
  const [selected, setSelected] = useState<string | null>(null)

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" },
  )

  function shift(delta: number) {
    setSelected(null)
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  const selectedCheckin = selected ? map[selected] : null
  const selectedEmotion = selectedCheckin
    ? getEmotion(selectedCheckin.emotion)
    : null

  return (
    <div className="px-6 pt-10">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Your quilt
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Every day you notice becomes a tile. A pattern, not a verdict.
        </p>
      </header>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          className="rounded-full px-3 py-1 text-lg text-muted-foreground hover:bg-accent"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-heading text-lg font-medium text-foreground">
          {monthLabel}
        </span>
        <button
          onClick={() => shift(1)}
          className="rounded-full px-3 py-1 text-lg text-muted-foreground hover:bg-accent"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">
        {WD.map((d) => (
          <abbr key={d.full} title={d.full} className="no-underline">
            {d.abbr}
          </abbr>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />
          const c = map[day]
          const e = c ? getEmotion(c.emotion) : null
          const dayNum = Number(day.slice(-2))
          const isSelected = selected === day
          return (
            <button
              key={day}
              onClick={() => c && setSelected(isSelected ? null : day)}
              className={`relative flex aspect-square items-center justify-center rounded-xl text-[11px] transition-transform ${
                c ? "cursor-pointer hover:scale-105" : "cursor-default"
              } ${isSelected ? "ring-2 ring-foreground/40" : ""}`}
              style={{
                backgroundColor: e ? e.color : "var(--muted)",
                color: e ? "rgba(255,255,255,0.9)" : "var(--muted-foreground)",
              }}
              aria-label={
                e ? `${day}: ${e.label}` : `${day}: no entry`
              }
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      {selectedCheckin && selectedEmotion && (
        <div className="wl-rise mt-5 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-full"
              style={{ backgroundColor: selectedEmotion.color }}
            />
            <div>
              <p className="font-medium text-foreground">
                {selectedEmotion.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
          {selectedCheckin.note && (
            <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/80">
              {selectedCheckin.note}
            </p>
          )}
          <p className="mt-3 font-heading text-sm italic text-muted-foreground">
            &ldquo;{selectedEmotion.affirmation}&rdquo;
          </p>
        </div>
      )}

      {observations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Quiet noticings
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {observations.map((o, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-secondary/60 p-4"
              >
                <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                  {o.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && checkins.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Your quilt is empty for now. It begins with one check-in.
        </p>
      )}
    </div>
  )
}
