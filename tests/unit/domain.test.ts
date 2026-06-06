import { describe, expect, it } from 'vitest'
import { buildSystemPrompt } from '@/lib/doll-chat-prompt'
import { buildObservations } from '@/lib/observations'
import { getEmotion, EMOTIONS } from '@/lib/emotions'

describe('emotions', () => {
  it('maps every emotion key', () => {
    for (const emotion of EMOTIONS) {
      expect(getEmotion(emotion.key)?.label).toBe(emotion.label)
    }
  })
})

describe('buildSystemPrompt', () => {
  it('includes student name when provided', () => {
    const prompt = buildSystemPrompt({
      name: 'Aviral',
      recentMoods: [],
      turn: 0,
    })
    expect(prompt).toContain('Aviral')
  })

  it('adds closure guidance after two assistant turns', () => {
    const prompt = buildSystemPrompt({
      name: null,
      recentMoods: [],
      turn: 2,
    })
    expect(prompt).toContain('hand this worry to a doll')
  })

  it('summarizes recent moods', () => {
    const prompt = buildSystemPrompt({
      name: null,
      recentMoods: [{ day: '2026-06-01', emotion: 'anxious' }],
      turn: 0,
    })
    expect(prompt).toContain('Anxious')
  })
})

describe('buildObservations', () => {
  it('returns nothing for short histories', () => {
    expect(buildObservations([])).toEqual([])
    expect(
      buildObservations([
        { id: 1, day: '2026-06-01', emotion: 'calm', color: '#2BA89B', intensity: 3, note: null },
      ]),
    ).toEqual([])
  })

  it('detects heavy streaks', () => {
    const checkins = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      day: `2026-06-0${i + 1}`,
      emotion: 'anxious',
      color: '#E8536B',
      intensity: 4,
      note: null,
    }))
    const observations = buildObservations(checkins)
    expect(observations.some((o) => o.text.includes('last 5 days'))).toBe(true)
  })
})
