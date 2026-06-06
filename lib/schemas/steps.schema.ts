import { z } from 'zod'
import { PersonIdSchema } from '@/lib/schemas/shared.schema'

const StepTagSchema = z.enum(['academic', 'physical', 'social', 'personal'])

export const CreateStepSchema = z.object({
  pid: PersonIdSchema,
  body: z.string().min(1).max(500),
  tag: StepTagSchema.default('personal'),
})

export type CreateStepInput = z.infer<typeof CreateStepSchema>
