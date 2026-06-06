import { z } from 'zod'
import { EMOTIONS } from '@/lib/emotions'

const emotionKeys = EMOTIONS.map((e) => e.key) as [string, ...string[]]

export const PersonIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid person id format')

export const EmotionKeySchema = z.enum(emotionKeys)

export const DaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Day must be YYYY-MM-DD')
  .max(10)

export const PersonQuerySchema = z.object({
  pid: PersonIdSchema,
})

export function parseQueryPid(searchParams: URLSearchParams): string {
  const result = PersonQuerySchema.safeParse({
    pid: searchParams.get('pid') ?? '',
  })
  if (!result.success) {
    throw result.error
  }
  return result.data.pid
}
