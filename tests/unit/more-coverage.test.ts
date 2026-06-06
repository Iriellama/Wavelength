import { describe, expect, it, vi } from 'vitest'
import { listDolls } from '@/lib/repositories/dolls.repository'
import { listSteps } from '@/lib/repositories/steps.repository'
import { parseQueryPid } from '@/lib/schemas/shared.schema'
import { query } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  execute: vi.fn(),
}))

describe('list repositories', () => {
  it('listDolls queries by person_id', async () => {
    vi.mocked(query).mockResolvedValue([{ id: 1, dollKind: 'calm', worry: 'x' }])
    const dolls = await listDolls('user-abc')
    expect(dolls).toHaveLength(1)
    expect(query).toHaveBeenCalledWith(expect.stringContaining('d.person_id = $1'), ['user-abc'])
  })

  it('listSteps queries by person_id', async () => {
    vi.mocked(query).mockResolvedValue([{ id: 2, body: 'walk', tag: 'physical' }])
    const steps = await listSteps('user-abc')
    expect(steps).toHaveLength(1)
  })
})

describe('parseQueryPid', () => {
  it('throws ZodError for invalid pid', () => {
    const params = new URLSearchParams({ pid: 'bad id with spaces' })
    expect(() => parseQueryPid(params)).toThrow()
  })

  it('returns pid for valid query', () => {
    const params = new URLSearchParams({ pid: 'abc-123_uuid' })
    expect(parseQueryPid(params)).toBe('abc-123_uuid')
  })
})
