import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getCheckins, POST as postCheckin } from '@/app/api/checkins/route'
import { GET as getDolls, PATCH as patchDoll } from '@/app/api/dolls/route'
import { AppError } from '@/lib/api/errors'

vi.mock('@/lib/schema', () => ({
  ensureSchema: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/repositories/checkins.repository', () => ({
  listCheckins: vi.fn(),
  upsertCheckin: vi.fn(),
}))

vi.mock('@/lib/repositories/dolls.repository', () => ({
  listDolls: vi.fn(),
  createDoll: vi.fn(),
  updateDollRelease: vi.fn(),
}))

import { listCheckins, upsertCheckin } from '@/lib/repositories/checkins.repository'
import { updateDollRelease } from '@/lib/repositories/dolls.repository'

describe('checkins API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns checkins for valid pid', async () => {
    vi.mocked(listCheckins).mockResolvedValue([
      {
        id: 1,
        day: '2026-06-06',
        emotion: 'calm',
        color: '#2BA89B',
        intensity: 3,
        note: null,
      },
    ])

    const req = new NextRequest('http://localhost/api/checkins?pid=user-abc')
    const res = await getCheckins(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.checkins).toHaveLength(1)
    expect(listCheckins).toHaveBeenCalledWith('user-abc')
  })

  it('GET rejects missing pid', async () => {
    const req = new NextRequest('http://localhost/api/checkins')
    const res = await getCheckins(req)
    expect(res.status).toBe(400)
  })

  it('POST upserts a validated check-in', async () => {
    vi.mocked(upsertCheckin).mockResolvedValue({
      id: 2,
      day: '2026-06-06',
      emotion: 'joyful',
      color: '#F5B700',
      intensity: 5,
      note: 'good day',
    })

    const req = new NextRequest('http://localhost/api/checkins', {
      method: 'POST',
      body: JSON.stringify({
        pid: 'user-abc',
        emotion: 'joyful',
        color: '#F5B700',
        intensity: 5,
        note: 'good day',
      }),
    })
    const res = await postCheckin(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.checkin.emotion).toBe('joyful')
  })

  it('POST rejects invalid payload', async () => {
    const req = new NextRequest('http://localhost/api/checkins', {
      method: 'POST',
      body: JSON.stringify({ pid: 'user-abc', emotion: 'invalid' }),
    })
    const res = await postCheckin(req)
    expect(res.status).toBe(400)
  })
})

describe('dolls PATCH route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires pid to prevent cross-user updates', async () => {
    const req = new NextRequest('http://localhost/api/dolls', {
      method: 'PATCH',
      body: JSON.stringify({ id: 1, released: true }),
    })
    const res = await patchDoll(req)
    expect(res.status).toBe(400)
    expect(updateDollRelease).not.toHaveBeenCalled()
  })

  it('returns 404 when doll is not owned by pid', async () => {
    vi.mocked(updateDollRelease).mockRejectedValue(
      new AppError('Doll not found', 404, 'NOT_FOUND'),
    )

    const req = new NextRequest('http://localhost/api/dolls', {
      method: 'PATCH',
      body: JSON.stringify({ id: 99, pid: 'user-abc', released: true }),
    })
    const res = await patchDoll(req)
    expect(res.status).toBe(404)
  })
})

describe('dolls GET route', () => {
  it('rejects sql injection in pid', async () => {
    const req = new NextRequest("http://localhost/api/dolls?pid=' OR 1=1--")
    const res = await getDolls(req)
    expect(res.status).toBe(400)
  })
})
