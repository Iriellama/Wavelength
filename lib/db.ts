import { Pool } from 'pg'
import { getEnv } from '@/lib/env'

declare global {
  var __wavelengthPool: Pool | undefined
}

function createPool() {
  const { DATABASE_URL } = getEnv()

  const parsed = new URL(DATABASE_URL)
  parsed.search = ''
  const connectionString = parsed.toString()

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 60_000,
    keepAlive: true,
  })
}

export function getPool(): Pool {
  if (!global.__wavelengthPool) {
    global.__wavelengthPool = createPool()
  }
  return global.__wavelengthPool
}

// Run a query with positional params ($1, $2, ...) and return the rows.
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = getPool()
  const res = await pool.query(sql, params as never[])
  return res.rows as T[]
}

export async function execute(sql: string, params: unknown[] = []) {
  const pool = getPool()
  return pool.query(sql, params as never[])
}
