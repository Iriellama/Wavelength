"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ColorWheel } from "@/components/color-wheel"
import { useCheckins } from "@/hooks/use-wavelength"
import { getPersonId, getName } from "@/lib/identity"
import { getEmotion, type Emotion } from "@/lib/emotions"

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function prettyDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function HueCheckin() {
  const { checkins, mutate, isLoading } = useCheckins()
  const today = todayKey()
  const existing = useMemo(
    () => checkins.find((c) => c.day === today),
    [checkins, today],
  )

  const [picked, setPicked] = useState<Emotion | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const name = typeof window !== "undefined" ? getName() : null

  // If they already checked in today, reflect that.
  const todaysEmotion = existing ? getEmotion(existing.emotion) : null
  const showResult = saved || !!existing
  const resultEmotion = picked ?? todaysEmotion ?? null

  async function save(e: Emotion) {
    setPicked(e)
    setSaving(true)
    const pid = getPersonId()
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid,
        emotion: e.key,
        color: e.color,
        intensity: 3,
      }),
    })
    await mutate()
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="flex flex-col items-center px-6 pt-10 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {prettyDate()}
      </p>

      <h1 className="mt-6 text-balance font-heading text-3xl font-semibold leading-tight text-foreground">
        {showResult
          ? name
            ? `Noted, ${name}.`
            : "Noted."
          : "How are you feeling today?"}
      </h1>

      {!showResult && (
        <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          Touch the centre and reach toward a colour. Let your hand decide.
        </p>
      )}

      <div className="mt-8">
        <ColorWheel
          selectedKey={resultEmotion?.key ?? null}
          onSelect={save}
        />
      </div>

      {saving && (
        <p className="mt-6 text-sm text-muted-foreground">settling…</p>
      )}

      {!saving && showResult && resultEmotion && (
        <div className="wl-rise mt-6 flex w-full flex-col items-center">
          <span
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: resultEmotion.tint, color: "#3a2f28" }}
          >
            {resultEmotion.label} — {resultEmotion.descriptor}
          </span>
          <p className="mt-4 max-w-xs text-pretty font-heading text-xl italic leading-snug text-foreground/85">
            &ldquo;{resultEmotion.affirmation}&rdquo;
          </p>

          <div className="mt-8 w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-left">
            <p className="text-pretty text-sm leading-relaxed text-foreground/80">
              Is there something on your mind today? You don&apos;t have to
              share. But I&apos;m here.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 rounded-full"
                nativeButton={false}
                render={<Link href="/dolls/new">Talk it through</Link>}
              />
              <Button
                variant="secondary"
                className="flex-1 rounded-full"
                onClick={() => {
                  setSaved(false)
                  setPicked(null)
                }}
              >
                I&apos;m okay for now
              </Button>
            </div>
          </div>

          <Link
            href="/quilt"
            className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            See your quilt →
          </Link>
        </div>
      )}

      {!isLoading && !showResult && checkins.length > 0 && (
        <Link
          href="/quilt"
          className="mt-8 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          {checkins.length} {checkins.length === 1 ? "day" : "days"} noted so far
        </Link>
      )}
    </div>
  )
}
