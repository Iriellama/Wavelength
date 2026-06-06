"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ColorWheel } from "@/components/color-wheel"
import { getPersonId, setName, setExam } from "@/lib/identity"
import type { Emotion } from "@/lib/emotions"

const EXAMS = ["NEET", "JEE", "CAT", "Other"]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"hello" | "feel" | "name">("hello")
  const [picked, setPicked] = useState<Emotion | null>(null)
  const [name, setNameLocal] = useState("")
  const [exam, setExamLocal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function finish() {
    setSaving(true)
    const pid = getPersonId()
    if (name.trim()) setName(name.trim())
    if (exam) setExam(exam)
    if (picked) {
      try {
        await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pid,
            emotion: picked.key,
            color: picked.color,
            intensity: 3,
          }),
        })
      } catch {
        // even if it fails, let them in
      }
    }
    onDone()
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-7 py-12">
      {step === "hello" && (
        <div className="wl-rise flex flex-col items-center text-center">
          <div className="mb-8 wl-float">
            <Petal />
          </div>
          <h1 className="text-balance font-heading text-3xl font-semibold leading-tight text-foreground">
            Hello. This is your space.
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            There&apos;s nothing to set up. No tour, no forms. The app reveals
            itself as you use it.
          </p>
          <p className="mt-6 text-pretty font-heading text-lg italic text-foreground/80">
            &ldquo;Life is not walked on a straight line. It&apos;s okay.&rdquo;
          </p>
          <Button
            size="lg"
            className="mt-10 rounded-full px-8"
            onClick={() => setStep("feel")}
          >
            Begin
          </Button>
        </div>
      )}

      {step === "feel" && (
        <div className="wl-rise flex w-full flex-col items-center text-center">
          <h2 className="text-balance font-heading text-2xl font-semibold text-foreground">
            How are you feeling right now?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach toward a colour. There&apos;s no wrong answer.
          </p>
          <div className="mt-6">
            <ColorWheel
              selectedKey={picked?.key}
              onSelect={(e) => setPicked(e)}
            />
          </div>
          {picked && (
            <div className="wl-rise mt-4 flex flex-col items-center">
              <span
                className="rounded-full px-4 py-1 text-sm font-medium"
                style={{ backgroundColor: picked.tint, color: "#3a2f28" }}
              >
                {picked.label} — {picked.descriptor}
              </span>
              <p className="mt-3 font-heading text-lg italic text-foreground/80">
                &ldquo;{picked.affirmation}&rdquo;
              </p>
            </div>
          )}
          <Button
            size="lg"
            disabled={!picked}
            className="mt-8 rounded-full px-8"
            onClick={() => setStep("name")}
          >
            That&apos;s how I feel
          </Button>
        </div>
      )}

      {step === "name" && (
        <div className="wl-rise flex w-full flex-col text-left">
          <h2 className="text-balance text-center font-heading text-2xl font-semibold text-foreground">
            One last, gentle thing.
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            What should this space call you? You can skip it.
          </p>

          <label htmlFor="onboarding-name" className="mt-7 text-sm font-medium text-foreground">
            Your name
          </label>
          <input
            id="onboarding-name"
            value={name}
            onChange={(e) => setNameLocal(e.target.value)}
            placeholder="just a first name is fine"
            autoComplete="given-name"
            className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />

          <p id="exam-label" className="mt-6 text-sm font-medium text-foreground">
            What are you preparing for?{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <div
            role="group"
            aria-labelledby="exam-label"
            className="mt-3 flex flex-wrap gap-2"
          >
            {EXAMS.map((x) => (
              <button
                key={x}
                type="button"
                aria-pressed={exam === x}
                onClick={() => setExamLocal(exam === x ? null : x)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  exam === x
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {x}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            disabled={saving}
            className="mt-10 rounded-full"
            onClick={finish}
          >
            {saving ? "Settling in…" : "Enter Wavelength"}
          </Button>
        </div>
      )}
    </div>
  )
}

function Petal() {
  const colors = ["#F5B700", "#F2722B", "#E8536B", "#9B6FC9", "#3E7BD4", "#2BA89B", "#5B8C4F", "#9AA0A6"]
  return (
    <svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true">
      {colors.map((c, i) => {
        const a = (i / colors.length) * Math.PI * 2 - Math.PI / 2
        const x = 50 + Math.cos(a) * 26
        const y = 50 + Math.sin(a) * 26
        return <circle key={i} cx={x} cy={y} r="16" fill={c} opacity="0.9" />
      })}
      <circle cx="50" cy="50" r="9" fill="#3a2f28" />
    </svg>
  )
}
