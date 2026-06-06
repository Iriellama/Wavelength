"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flower } from "@/components/flower"
import { useSteps, type Step } from "@/hooks/use-wavelength"
import { getPersonId } from "@/lib/identity"

const TAGS = [
  { key: "academic", label: "Academic" },
  { key: "physical", label: "Physical" },
  { key: "social", label: "Social" },
  { key: "personal", label: "Personal" },
]

const TAG_DOT: Record<string, string> = {
  academic: "#3E7BD4",
  physical: "#5B8C4F",
  social: "#E8536B",
  personal: "#9B6FC9",
}

function fmtDay(day: string) {
  return new Date(day + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

export function StepsGarden() {
  const { steps, mutate, isLoading } = useSteps()
  const [adding, setAdding] = useState(false)
  const [body, setBody] = useState("")
  const [tag, setTag] = useState("personal")
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState<Step | null>(null)

  async function add() {
    if (!body.trim()) return
    setSaving(true)
    const pid = getPersonId()
    await fetch("/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid, body: body.trim(), tag }),
    })
    await mutate()
    setBody("")
    setTag("personal")
    setSaving(false)
    setAdding(false)
  }

  return (
    <div className="px-6 pt-10">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Your garden
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Every day you show up is worth planting. No streaks. Missing a day
          takes nothing away.
        </p>
      </header>

      <div className="mt-6 flex justify-center">
        <Button className="rounded-full px-6" onClick={() => setAdding((v) => !v)}>
          {adding ? "Close" : "Plant a win"}
        </Button>
      </div>

      {adding && (
        <div className="wl-rise mt-5 rounded-3xl border border-border bg-card p-5">
          <label htmlFor="step-body" className="sr-only">
            Describe your small win
          </label>
          <textarea
            id="step-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="I asked a question in class today. First time in weeks."
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <div role="group" aria-label="Step category" className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={tag === t.key}
                onClick={() => setTag(t.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  tag === t.key
                    ? "border-foreground/30 bg-secondary text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TAG_DOT[t.key] }}
                />
                {t.label}
              </button>
            ))}
          </div>
          <Button
            disabled={!body.trim() || saving}
            className="mt-4 w-full rounded-full"
            onClick={add}
          >
            {saving ? "planting…" : "Add to garden"}
          </Button>
        </div>
      )}

      {/* the garden */}
      <div className="mt-8 min-h-64 rounded-[2rem] border border-border bg-gradient-to-b from-secondary/30 to-secondary/60 p-6">
        {!isLoading && steps.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Your garden is bare ground for now. Plant your first small, true win.
          </p>
        )}
        <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-4">
          {steps.map((s, i) => (
            <Flower
              key={s.id}
              tag={s.tag}
              size={48 + ((i * 7) % 22)}
              swayDelay={`${(i % 6) * 0.35}s`}
              onClick={() => setOpen(s)}
              className="translate-y-0"
            />
          ))}
        </div>
        {steps.length > 0 && (
          <p className="mt-5 border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
            {steps.length} {steps.length === 1 ? "thing" : "things"} that went okay.
            Tap a flower to remember.
          </p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="wl-rise relative w-full max-w-sm rounded-[2rem] border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: TAG_DOT[open.tag] }}
              />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {open.tag} · {fmtDay(open.day)}
              </span>
            </div>
            <p className="mt-4 text-balance font-heading text-xl font-medium leading-snug text-foreground">
              {open.body}
            </p>
            <p className="mt-4 text-sm italic text-muted-foreground">
              This counts. It was true, and it was yours.
            </p>
            <button
              onClick={() => setOpen(null)}
              className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
