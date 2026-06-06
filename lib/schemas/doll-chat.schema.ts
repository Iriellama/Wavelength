import { z } from 'zod'
import { DaySchema, EmotionKeySchema } from '@/lib/schemas/shared.schema'

export const DollChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

export const DollChatRequestSchema = z.object({
  messages: z.array(DollChatMessageSchema).min(1).max(30),
  name: z.string().max(120).nullable().optional(),
  recentMoods: z
    .array(
      z.object({
        day: DaySchema,
        emotion: EmotionKeySchema,
      }),
    )
    .max(14)
    .default([]),
})

export type DollChatRequest = z.infer<typeof DollChatRequestSchema>
