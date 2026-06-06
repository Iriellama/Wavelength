import { getPool } from "./db"

// Idempotent schema setup. Safe to run repeatedly.
let initialized = false
let initPromise: Promise<void> | null = null

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS people (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Hue daily check-ins. One emotion + optional intensity + optional note per day.
  `CREATE TABLE IF NOT EXISTS checkins (
    id BIGSERIAL PRIMARY KEY,
    person_id VARCHAR(64) NOT NULL,
    day DATE NOT NULL,
    emotion VARCHAR(40) NOT NULL,
    color VARCHAR(16) NOT NULL,
    intensity SMALLINT NOT NULL DEFAULT 3,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uniq_person_day UNIQUE (person_id, day)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_checkins_person_day ON checkins (person_id, day)`,

  // Dolls: a worry handed to a doll. The doll "holds" it. Conversations live in doll_messages.
  `CREATE TABLE IF NOT EXISTS dolls (
    id BIGSERIAL PRIMARY KEY,
    person_id VARCHAR(64) NOT NULL,
    doll_kind VARCHAR(40) NOT NULL,
    worry TEXT NOT NULL,
    released BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
  )`,

  `CREATE INDEX IF NOT EXISTS idx_dolls_person ON dolls (person_id, created_at)`,

  `CREATE TABLE IF NOT EXISTS doll_messages (
    id BIGSERIAL PRIMARY KEY,
    doll_id BIGINT NOT NULL,
    role VARCHAR(12) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_doll_messages_doll ON doll_messages (doll_id, created_at)`,

  // Steps: small wins / things that went okay.
  `CREATE TABLE IF NOT EXISTS steps (
    id BIGSERIAL PRIMARY KEY,
    person_id VARCHAR(64) NOT NULL,
    body TEXT NOT NULL,
    tag VARCHAR(24) NOT NULL DEFAULT 'personal',
    day DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_steps_person_day ON steps (person_id, day)`,
]

export async function ensureSchema(): Promise<void> {
  if (initialized) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    const pool = getPool()
    for (const stmt of STATEMENTS) {
      await pool.query(stmt)
    }
    initialized = true
  })()

  try {
    await initPromise
  } catch (err) {
    // Don't cache a rejected promise — allow the next request to retry.
    initPromise = null
    throw err
  }
}
