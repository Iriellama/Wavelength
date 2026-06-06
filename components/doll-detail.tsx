"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WorryDoll } from "@/components/worry-doll"
import { useCheckins, type Doll } from "@/hooks/use-wavelength"
import { getEmotion } from "@/lib/emotions"
import { getPersonId } from "@/lib/identity"

function daysAgo(createdAt: string) {
  const d = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  if (d <= 0) return "today"
  if (d === 1) return "yesterday"
  if (d < 30) return `${d} days ago`
  const months = Math.round(d / 30)
  return `${months} ${months === 1 ? "month" : "months"} ago`
}

export function DollDetail({
  doll,
  onClose,
  onChanged,
}: {
  doll: Doll
  onClose: () => void
  onChanged: () => void
}) {
  const { checkins } = useCheckins()
  const [busy, setBusy] = useState(false)

  const thenEmotion = doll.moodEmotion ? getEmotion(doll.moodEmotion) : null
  const today = new Date().toISOString().slice(0, 10)
  const nowCheckin = checkins.find((c) => c.day === today)
  const nowEmotion = nowCheckin ? getEmotion(nowCheckin.emotion) : null

  async function release() {
    setBusy(true)
    await fetch("/api/dolls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doll.id, pid: getPersonId(), released: true }),
    })
    onChanged()
    setBusy(false)
    onClose()
  }

  async function keep() {
    if (doll.released) {
      setBusy(true)
      await fetch("/api/dolls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doll.id, pid: getPersonId(), released: false }),
      })
      onChanged()
      setBusy(false)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="wl-rise max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-border bg-background p-6 sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <WorryDoll
            color={doll.moodColor ?? undefined}
            emotion={doll.moodEmotion}
            size={96}
          />
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
            made {daysAgo(doll.createdAt)}
          </p>
          <p className="mt-2 text-balance font-heading text-2xl font-semibold leading-snug text-foreground">
            &ldquo;{doll.worry}&rdquo;
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              How you felt then
            </p>
            {thenEmotion ? (
              <div className="mt-2 flex flex-col items-center gap-1">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ backgroundColor: thenEmotion.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {thenEmotion.label}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">—</p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              How you feel now
            </p>
            {nowEmotion ? (
              <div className="mt-2 flex flex-col items-center gap-1">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ backgroundColor: nowEmotion.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {nowEmotion.label}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                check in today to compare
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-pretty text-center text-sm leading-relaxed text-muted-foreground">
          {doll.released
            ? "You released this one. It can stay here as evidence of what you carried — and set down."
            : "What does this doll feel like now? Often the thing that felt enormous is smaller than you remember. You survived it. Look."}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {!doll.released ? (
            <>
              <Button
                onClick={release}
                disabled={busy}
                className="rounded-full"
              >
                Release this worry
              </Button>
              <Button
                variant="secondary"
                onClick={keep}
                className="rounded-full"
              >
                Let it stay for now
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={keep}
              disabled={busy}
              className="rounded-full"
            >
              Bring it back to the corner
            </Button>
          )}
          <button
            onClick={onClose}
            className="mt-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
