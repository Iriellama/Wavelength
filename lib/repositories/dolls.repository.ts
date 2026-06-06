import { query, execute } from '@/lib/db'
import type { CreateDollInput, PatchDollInput } from '@/lib/schemas/dolls.schema'
import { AppError } from '@/lib/api/errors'

export interface DollRow {
  id: number
  dollKind: string
  worry: string
  released: number
  createdDay: string
  createdAt: string
  moodEmotion: string | null
  moodColor: string | null
}

export async function listDolls(personId: string): Promise<DollRow[]> {
  return query<DollRow>(
    `SELECT d.id, d.doll_kind AS "dollKind", d.worry, d.released,
            to_char(d.created_at, 'YYYY-MM-DD') AS "createdDay",
            d.created_at AS "createdAt",
            c.emotion AS "moodEmotion", c.color AS "moodColor"
     FROM dolls d
     LEFT JOIN checkins c
       ON c.person_id = d.person_id AND c.day = (d.created_at)::date
     WHERE d.person_id = $1
     ORDER BY d.created_at DESC`,
    [personId],
  )
}

export async function createDoll(input: CreateDollInput): Promise<number> {
  const inserted = await query<{ id: string }>(
    `INSERT INTO dolls (person_id, doll_kind, worry) VALUES ($1, $2, $3) RETURNING id`,
    [input.pid, input.dollKind, input.worry],
  )
  const dollId = Number(inserted[0]?.id)
  if (!dollId) {
    throw new AppError('Failed to create doll', 500, 'CREATE_FAILED')
  }

  if (input.messages?.length) {
    const values: unknown[] = []
    const placeholders = input.messages.map((m, i) => {
      const base = i * 3
      values.push(dollId, m.role, m.content)
      return `($${base + 1}, $${base + 2}, $${base + 3})`
    })
    await execute(
      `INSERT INTO doll_messages (doll_id, role, content) VALUES ${placeholders.join(', ')}`,
      values,
    )
  }

  return dollId
}

export async function updateDollRelease(input: PatchDollInput): Promise<void> {
  const result = await execute(
    `UPDATE dolls
     SET released = $1,
         released_at = CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE id = $2 AND person_id = $3`,
    [input.released, input.id, input.pid],
  )
  if ((result.rowCount ?? 0) === 0) {
    throw new AppError('Doll not found', 404, 'NOT_FOUND')
  }
}
