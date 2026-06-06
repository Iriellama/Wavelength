import { query } from '@/lib/db'
import type { CreateStepInput } from '@/lib/schemas/steps.schema'

export interface StepRow {
  id: number
  body: string
  tag: string
  day: string
  createdAt: string
}

const STEPS_LIMIT = 200

export async function listSteps(personId: string): Promise<StepRow[]> {
  return query<StepRow>(
    `SELECT id, body, tag, to_char(day, 'YYYY-MM-DD') AS day, created_at AS "createdAt"
     FROM steps WHERE person_id = $1 ORDER BY created_at ASC LIMIT $2`,
    [personId, STEPS_LIMIT],
  )
}

export async function createStep(input: CreateStepInput): Promise<number> {
  const day = new Date().toISOString().slice(0, 10)
  const inserted = await query<{ id: string }>(
    `INSERT INTO steps (person_id, body, tag, day) VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.pid, input.body, input.tag, day],
  )
  return Number(inserted[0]?.id)
}
