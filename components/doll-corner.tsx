"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WorryDoll } from "@/components/worry-doll"
import { useDolls, type Doll } from "@/hooks/use-wavelength"
import { getEmotion } from "@/lib/emotions"
import { DollDetail } from "@/components/doll-detail"

// Age a doll: older dolls become smaller and lighter.
function ageStyle(createdAt: string) {
  const days = Math.max(
    0,
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  // size from 96 down to ~58 over ~90 days
  const size = Math.max(58, 96 - (days / 90) * 38)
  // opacity from 1 down to ~0.45 over ~120 days
  const opacity = Math.max(0.45, 1 - (days / 120) * 0.55)
  return { size: Math.round(size), opacity: Number(opacity.toFixed(2)), days }
}

export function DollCorner() {
  const { dolls, mutate, isLoading } = useDolls()
  const [openDoll, setOpenDoll] = useState<Doll | null>(null)

  const active = useMemo(
    () => dolls.filter((d) => !d.released),
    [dolls],
  )
  const released = useMemo(
    () => dolls.filter((d) => d.released),
    [dolls],
  )

  return (
    <div className="px-6 pt-10">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          The worry corner
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Each doll holds a worry that once felt too big to carry. They&apos;re
          holding it now, so you don&apos;t have to.
        </p>
      </header>

      <div className="mt-6 flex justify-center">
        <Button
          className="rounded-full px-6"
          nativeButton={false}
          render={<Link href="/dolls/new">Make a doll</Link>}
        />
      </div>

      {/* the shelf */}
      <div className="mt-8 rounded-[2rem] border border-border bg-secondary/40 p-5">
        {active.length === 0 && !isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No dolls yet. When something feels heavy, you can hand it to one.
          </p>
        )}
        <div className="flex flex-wrap items-end justify-center gap-3">
          {active.map((d) => {
            const { size, opacity } = ageStyle(d.createdAt)
            return (
              <button
                key={d.id}
                onClick={() => setOpenDoll(d)}
                className="group flex flex-col items-center"
                aria-label={`Revisit doll: ${d.worry}`}
              >
                <span className="wl-sway block" style={{ animationDelay: `${(d.id % 5) * 0.4}s` }}>
                  <WorryDoll
                    color={d.moodColor ?? undefined}
                    emotion={d.moodEmotion}
                    size={size}
                    opacity={opacity}
                  />
                </span>
              </button>
            )
          })}
        </div>
        {active.length > 0 && (
          <div className="mt-3 border-t border-border/60 pt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Older worries grow smaller and lighter. Tap one to see how it feels
              now.
            </p>
          </div>
        )}
      </div>

      {released.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Released
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Worries you decided you no longer need to carry.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {released.map((d) => {
              const e = d.moodEmotion ? getEmotion(d.moodEmotion) : null
              return (
                <button
                  key={d.id}
                  onClick={() => setOpenDoll(d)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground line-through decoration-muted-foreground/50"
                  style={{ borderColor: e ? e.color + "55" : undefined }}
                >
                  {d.worry.length > 28 ? d.worry.slice(0, 28) + "…" : d.worry}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {openDoll && (
        <DollDetail
          doll={openDoll}
          onClose={() => setOpenDoll(null)}
          onChanged={() => {
            mutate()
          }}
        />
      )}
    </div>
  )
}
