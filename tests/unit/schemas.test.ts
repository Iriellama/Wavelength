import { describe, expect, it } from 'vitest'
import { CreateCheckinSchema } from '@/lib/schemas/checkins.schema'
import { CreateDollSchema, PatchDollSchema } from '@/lib/schemas/dolls.schema'
import { DollChatRequestSchema } from '@/lib/schemas/doll-chat.schema'
import { CreateStepSchema } from '@/lib/schemas/steps.schema'
import { PersonQuerySchema } from '@/lib/schemas/shared.schema'

describe('API schemas', () => {
  describe('PersonQuerySchema', () => {
    it('accepts valid person ids', () => {
      const result = PersonQuerySchema.safeParse({ pid: 'p_abc123' })
      expect(result.success).toBe(true)
    })

    it('rejects empty pid', () => {
      const result = PersonQuerySchema.safeParse({ pid: '' })
      expect(result.success).toBe(false)
    })

    it('rejects pid with unsafe characters', () => {
      const result = PersonQuerySchema.safeParse({ pid: "'; DROP TABLE--" })
      expect(result.success).toBe(false)
    })
  })

  describe('CreateCheckinSchema', () => {
    it('parses a valid check-in', () => {
      const result = CreateCheckinSchema.parse({
        pid: 'user-1',
        emotion: 'calm',
        color: '#2BA89B',
        intensity: 4,
      })
      expect(result.intensity).toBe(4)
    })

    it('defaults intensity to 3', () => {
      const result = CreateCheckinSchema.parse({
        pid: 'user-1',
        emotion: 'tired',
        color: '#9AA0A6',
      })
      expect(result.intensity).toBe(3)
    })

    it('rejects invalid emotion keys', () => {
      const result = CreateCheckinSchema.safeParse({
        pid: 'user-1',
        emotion: 'furious',
        color: '#000',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('CreateDollSchema', () => {
    it('bounds worry length', () => {
      const result = CreateDollSchema.safeParse({
        pid: 'user-1',
        worry: 'a'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })

    it('limits conversation messages', () => {
      const messages = Array.from({ length: 51 }, (_, i) => ({
        role: 'user' as const,
        content: `msg ${i}`,
      }))
      const result = CreateDollSchema.safeParse({
        pid: 'user-1',
        worry: 'exam stress',
        messages,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('PatchDollSchema', () => {
    it('requires pid for ownership check', () => {
      const result = PatchDollSchema.safeParse({ id: 1, released: true })
      expect(result.success).toBe(false)
    })

    it('accepts valid patch payload', () => {
      const result = PatchDollSchema.parse({
        id: 42,
        pid: 'user-1',
        released: true,
      })
      expect(result.id).toBe(42)
    })
  })

  describe('CreateStepSchema', () => {
    it('accepts known step tags', () => {
      const result = CreateStepSchema.parse({
        pid: 'user-1',
        body: 'Finished one chapter',
        tag: 'academic',
      })
      expect(result.tag).toBe('academic')
    })

    it('rejects unknown tags', () => {
      const result = CreateStepSchema.safeParse({
        pid: 'user-1',
        body: 'Did something',
        tag: 'unknown',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('DollChatRequestSchema', () => {
    it('limits message count', () => {
      const messages = Array.from({ length: 31 }, () => ({
        role: 'user' as const,
        content: 'hello',
      }))
      const result = DollChatRequestSchema.safeParse({ messages })
      expect(result.success).toBe(false)
    })

    it('defaults recentMoods to empty array', () => {
      const result = DollChatRequestSchema.parse({
        messages: [{ role: 'user', content: 'I feel anxious' }],
      })
      expect(result.recentMoods).toEqual([])
    })
  })
})
