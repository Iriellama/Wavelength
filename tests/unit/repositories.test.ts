import { beforeEach, describe, expect, it, vi } from 'vitest'
import { upsertCheckin, listCheckins } from '@/lib/repositories/checkins.repository'
import { createStep } from '@/lib/repositories/steps.repository'
import { createDoll } from '@/lib/repositories/dolls.repository'
import { query, execute } from '@/lib/db'
import { AppError } from '@/lib/api/errors'

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  execute: vi.fn(),
}))

describe('checkins repository', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists checkins for a person', async () => {
    vi.mocked(query).mockResolvedValue([{ id: 1, day: '2026-06-06', emotion: 'calm' }])
    const rows = await listCheckins('user-1')
    expect(rows).toHaveLength(1)
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('person_id = $1'),
      ['user-1', 120],
    )
  })

  it('upserts a checkin', async () => {
    vi.mocked(query).mockResolvedValue([
      { id: 2, day: '2026-06-06', emotion: 'tired', color: '#9AA0A6', intensity: 3, note: null },
    ])
    const row = await upsertCheckin({
      pid: 'user-1',
      emotion: 'tired',
      color: '#9AA0A6',
      intensity: 3,
    })
    expect(row.emotion).toBe('tired')
  })
})

describe('steps repository', () => {
  it('creates a step', async () => {
    vi.mocked(query).mockResolvedValue([{ id: '7' }])
    const id = await createStep({ pid: 'user-1', body: 'Did revision', tag: 'academic' })
    expect(id).toBe(7)
  })
})

describe('dolls repository create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('batch inserts doll messages', async () => {
    vi.mocked(query).mockResolvedValue([{ id: '10' }])
    vi.mocked(execute).mockResolvedValue({ rowCount: 2 } as never)

    const id = await createDoll({
      pid: 'user-1',
      dollKind: 'calm',
      worry: 'exam fear',
      messages: [
        { role: 'user', content: 'I am scared' },
        { role: 'assistant', content: 'Tell me more' },
      ],
    })

    expect(id).toBe(10)
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO doll_messages'),
      [10, 'user', 'I am scared', 10, 'assistant', 'Tell me more'],
    )
  })

  it('throws when insert fails', async () => {
    vi.mocked(query).mockResolvedValue([])
    await expect(
      createDoll({ pid: 'user-1', dollKind: 'calm', worry: 'worry' }),
    ).rejects.toBeInstanceOf(AppError)
  })
})
