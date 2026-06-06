import { query, execute } from '@/lib/db'
import type { CreateCheckinInput } from '@/lib/schemas/checkins.schema'

export interface CheckinRow {
  id: number
  day: string
  emotion: string
  color: string
  intensity: number
  note: string | null
}

const CHECKIN_LOOKBACK_DAYS = 120

export async function listCheckins(personId: string): Promise<CheckinRow[]> {
  return query<CheckinRow>(
    `SELECT id, to_char(day, 'YYYY-MM-DD') AS day, emotion, color, intensity, note
     FROM checkins
     WHERE person_id = $1
       AND day >= (CURRENT_DATE - $2::int * INTERVAL '1 day')
     ORDER BY day DESC`,
    [personId, CHECKIN_LOOKBACK_DAYS],
  )
}

export async function upsertCheckin(input: CreateCheckinInput): Promise<CheckinRow> {
  const theDay = input.day ?? new Date().toISOString().slice(0, 10)
  const rows = await query<CheckinRow>(
    `INSERT INTO checkins (person_id, day, emotion, color, intensity, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (person_id, day) DO UPDATE SET
       emotion = EXCLUDED.emotion,
       color = EXCLUDED.color,
       intensity = EXCLUDED.intensity,
       note = EXCLUDED.note
     RETURNING id, to_char(day, 'YYYY-MM-DD') AS day, emotion, color, intensity, note`,
    [input.pid, theDay, input.emotion, input.color, input.intensity, input.note ?? null],
  )
  return rows[0]
}
