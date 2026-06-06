import { z } from 'zod'
import { DaySchema, EmotionKeySchema, PersonIdSchema } from '@/lib/schemas/shared.schema'

export const CreateCheckinSchema = z.object({
  pid: PersonIdSchema,
  emotion: EmotionKeySchema,
  color: z.string().min(1).max(16),
  intensity: z.number().int().min(1).max(5).default(3),
  note: z.string().max(500).nullable().optional(),
  day: DaySchema.optional(),
})

export type CreateCheckinInput = z.infer<typeof CreateCheckinSchema>
