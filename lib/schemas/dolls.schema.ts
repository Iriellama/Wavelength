import { z } from 'zod'
import { EmotionKeySchema, PersonIdSchema } from '@/lib/schemas/shared.schema'

export const DollMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

export const CreateDollSchema = z.object({
  pid: PersonIdSchema,
  dollKind: EmotionKeySchema.default('calm'),
  worry: z.string().min(1).max(2000),
  messages: z.array(DollMessageSchema).max(50).optional(),
})

export const PatchDollSchema = z.object({
  id: z.coerce.number().int().positive(),
  pid: PersonIdSchema,
  released: z.boolean(),
})

export type CreateDollInput = z.infer<typeof CreateDollSchema>
export type PatchDollInput = z.infer<typeof PatchDollSchema>
