import { describe, expect, it, vi } from 'vitest'
import { updateDollRelease } from '@/lib/repositories/dolls.repository'
import { execute } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  execute: vi.fn(),
  query: vi.fn(),
}))

describe('dolls repository security', () => {
  it('scopes release updates to person_id', async () => {
    vi.mocked(execute).mockResolvedValue({ rowCount: 1 } as never)

    await updateDollRelease({ id: 5, pid: 'owner-1', released: true })

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('person_id = $3'),
      [true, 5, 'owner-1'],
    )
  })

  it('throws when doll is not found for person', async () => {
    vi.mocked(execute).mockResolvedValue({ rowCount: 0 } as never)

    await expect(
      updateDollRelease({ id: 5, pid: 'other-user', released: true }),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})
