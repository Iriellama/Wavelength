import { getEmotion, type EmotionKey } from "@/lib/emotions"
import type { Checkin } from "@/hooks/use-wavelength"

// "heavy" emotions we gently track for streaks
const HEAVY: EmotionKey[] = ["anxious", "lost", "tired"]

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export interface Observation {
  text: string
}

// Generate gentle, non-prescriptive observations from check-in history.
export function buildObservations(checkins: Checkin[]): Observation[] {
  const out: Observation[] = []
  if (checkins.length < 4) return out

  // sorted oldest first
  const sorted = [...checkins].sort((a, b) => a.day.localeCompare(b.day))

  // 1) weekday tendency for heavy moods
  const byWeekday: Record<number, { heavy: number; total: number }> = {}
  for (const c of sorted) {
    const wd = new Date(c.day + "T00:00:00").getDay()
    byWeekday[wd] ??= { heavy: 0, total: 0 }
    byWeekday[wd].total++
    if (HEAVY.includes(c.emotion as EmotionKey)) byWeekday[wd].heavy++
  }
  let worstDay = -1
  let worstRatio = 0
  for (const [wd, v] of Object.entries(byWeekday)) {
    if (v.total >= 3) {
      const ratio = v.heavy / v.total
      if (ratio > worstRatio && ratio >= 0.5) {
        worstRatio = ratio
        worstDay = Number(wd)
      }
    }
  }
  if (worstDay >= 0) {
    out.push({
      text: `You tend to feel heavier on ${DAY_NAMES[worstDay]}s. That's okay to notice — it doesn't have to mean anything more than it does.`,
    })
  }

  // 2) recent heavy streak
  const recent = [...sorted].reverse()
  let streak = 0
  for (const c of recent) {
    if (HEAVY.includes(c.emotion as EmotionKey)) streak++
    else break
  }
  if (streak >= 4) {
    out.push({
      text: `These last ${streak} days have asked a lot of you. You've still shown up to notice. That counts for something.`,
    })
  }

  // 3) gentle brightening
  if (recent.length >= 3) {
    const last3Bright = recent
      .slice(0, 3)
      .every((c) => ["joyful", "energised", "calm", "grounded"].includes(c.emotion))
    if (last3Bright) {
      out.push({
        text: `Something has felt a little lighter lately. Worth letting yourself feel it.`,
      })
    }
  }

  // 4) most common feeling
  const counts: Record<string, number> = {}
  for (const c of sorted) counts[c.emotion] = (counts[c.emotion] || 0) + 1
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  if (top && top[1] >= 4) {
    const e = getEmotion(top[0])
    if (e) {
      out.push({
        text: `${e.label.toLowerCase()} has been your most frequent feeling. Naming it is the first quiet step.`,
      })
    }
  }

  return out.slice(0, 3)
}
