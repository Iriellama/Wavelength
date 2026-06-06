"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WorryDoll } from "@/components/worry-doll"
import { useCheckins, useDolls } from "@/hooks/use-wavelength"
import { getPersonId, getName } from "@/lib/identity"
import { getEmotion } from "@/lib/emotions"

interface Msg {
  role: "user" | "assistant"
  content: string
}

export function NewDoll() {
  const router = useRouter()
  const { checkins } = useCheckins()
  const { mutate: mutateDolls } = useDolls()

  const [worry, setWorry] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [phase, setPhase] = useState<"name" | "talk">("name")
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // today's mood drives the doll color + expression
  const today = new Date().toISOString().slice(0, 10)
  const todaysCheckin = checkins.find((c) => c.day === today)
  const moodEmotion = todaysCheckin?.emotion ?? "calm"
  const moodColor = todaysCheckin?.color ?? getEmotion("calm")?.color

  const recentMoods = checkins
    .slice(0, 7)
    .map((c) => ({ day: c.day, emotion: c.emotion }))

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, thinking])

  async function beginTalk() {
    if (!worry.trim()) return
    setPhase("talk")
    setThinking(true)
    // first the user "names" the worry, Wren responds
    const opening: Msg[] = [{ role: "user", content: worry.trim() }]
    setMessages(opening)
    await ask(opening)
  }

  async function ask(history: Msg[]) {
    setThinking(true)
    try {
      const res = await fetch("/api/doll-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          name: getName(),
          recentMoods,
        }),
      })
      const data = await res.json()
      setMessages([...history, { role: "assistant", content: data.reply }])
    } catch {
      setMessages([
        ...history,
        {
          role: "assistant",
          content:
            "I'm here, even if my words are slow. Whenever you're ready, you can set this down with a doll.",
        },
      ])
    } finally {
      setThinking(false)
    }
  }

  async function send() {
    if (!input.trim() || thinking) return
    const next: Msg[] = [...messages, { role: "user", content: input.trim() }]
    setMessages(next)
    setInput("")
    await ask(next)
  }

  async function giveToDoll() {
    setSaving(true)
    const pid = getPersonId()
    await fetch("/api/dolls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid,
        dollKind: moodEmotion,
        worry: worry.trim(),
        messages,
      }),
    })
    await mutateDolls()
    router.push("/dolls")
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-10">
      <header className="text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {phase === "name" ? "What's on your mind?" : "I'm listening"}
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {phase === "name"
            ? "You don't have to explain it. Just name it. A short phrase is enough."
            : "I'm Wren. I'm not here to fix anything — just to help you hear yourself."}
        </p>
      </header>

      <aside className="mt-3 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-2 text-center text-xs text-muted-foreground">
        If things feel too heavy right now,{" "}
        <a
          href="tel:14416"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          Tele-MANAS 14416
        </a>{" "}
        is a free, confidential support line — available 24/7.
      </aside>

      {phase === "name" && (
        <div className="mt-8 flex flex-1 flex-col items-center">
          <div className="wl-float">
            <WorryDoll color={moodColor} emotion={moodEmotion} size={120} />
          </div>
          <label htmlFor="worry-input" className="sr-only">
            Name your worry
          </label>
          <textarea
            id="worry-input"
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            rows={2}
            placeholder="scared I'll fail chemistry…"
            className="mt-8 w-full resize-none rounded-3xl border border-border bg-card px-5 py-4 text-center text-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button
              disabled={!worry.trim()}
              className="rounded-full"
              onClick={beginTalk}
            >
              Talk it through with Wren
            </Button>
            <Button
              variant="secondary"
              disabled={!worry.trim() || saving}
              className="rounded-full"
              onClick={giveToDoll}
            >
              Just give it to a doll
            </Button>
          </div>
        </div>
      )}

      {phase === "talk" && (
        <>
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with Wren"
            aria-relevant="additions"
            className="mt-6 flex-1 space-y-3 overflow-y-auto pb-2"
          >
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] text-pretty rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-border bg-card px-4 py-3">
                  <span className="flex gap-1">
                    <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-border bg-background/90 py-3 backdrop-blur">
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Reply to Wren
              </label>
              <textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="say as much or as little as you like…"
                className="max-h-28 flex-1 resize-none rounded-3xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={send}
                disabled={!input.trim() || thinking}
                aria-label="Send"
              >
                ↑
              </Button>
            </div>
            <Button
              variant="secondary"
              disabled={saving}
              className="mt-2 w-full rounded-full"
              onClick={giveToDoll}
            >
              {saving ? "settling it down…" : "I'm ready — give this worry to a doll"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
      style={{ animation: "wl-float 1s ease-in-out infinite", animationDelay: delay }}
    />
  )
}
