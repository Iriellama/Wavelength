import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getSteps, POST as postStep } from '@/app/api/steps/route'
import { POST as postDollChat } from '@/app/api/doll-chat/route'
import { POST as postDoll } from '@/app/api/dolls/route'

vi.mock('@/lib/schema', () => ({
  ensureSchema: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/repositories/steps.repository', () => ({
  listSteps: vi.fn(),
  createStep: vi.fn(),
}))

vi.mock('@/lib/repositories/dolls.repository', () => ({
  listDolls: vi.fn(),
  createDoll: vi.fn(),
  updateDollRelease: vi.fn(),
}))

vi.mock('@/lib/services/doll-chat.service', () => ({
  generateDollChatReply: vi.fn(),
  FALLBACK_REPLY: 'fallback message',
}))

import { listSteps, createStep } from '@/lib/repositories/steps.repository'
import { createDoll } from '@/lib/repositories/dolls.repository'
import { generateDollChatReply } from '@/lib/services/doll-chat.service'

describe('steps API routes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET returns steps for valid pid', async () => {
    vi.mocked(listSteps).mockResolvedValue([
      { id: 1, body: 'Read one chapter', tag: 'academic', day: '2026-06-06', createdAt: '' },
    ])
    const req = new NextRequest('http://localhost/api/steps?pid=user-1')
    const res = await getSteps(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.steps).toHaveLength(1)
  })

  it('POST creates a step', async () => {
    vi.mocked(createStep).mockResolvedValue(9)
    const req = new NextRequest('http://localhost/api/steps', {
      method: 'POST',
      body: JSON.stringify({ pid: 'user-1', body: 'Went for a walk', tag: 'physical' }),
    })
    const res = await postStep(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.id).toBe(9)
  })
})

describe('dolls POST route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a doll with validated payload', async () => {
    vi.mocked(createDoll).mockResolvedValue(3)
    const req = new NextRequest('http://localhost/api/dolls', {
      method: 'POST',
      body: JSON.stringify({ pid: 'user-1', worry: 'NEET prep stress', dollKind: 'anxious' }),
    })
    const res = await postDoll(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.id).toBe(3)
  })
})

describe('doll-chat POST route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns model reply on success', async () => {
    vi.mocked(generateDollChatReply).mockResolvedValue('That sounds heavy.')
    const req = new NextRequest('http://localhost/api/doll-chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I feel anxious about exams' }],
      }),
    })
    const res = await postDollChat(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.reply).toBe('That sounds heavy.')
  })

  it('returns fallback on unexpected failure', async () => {
    vi.mocked(generateDollChatReply).mockRejectedValue(new Error('OpenAI down'))
    const req = new NextRequest('http://localhost/api/doll-chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
      }),
    })
    const res = await postDollChat(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.reply).toBe('fallback message')
  })

  it('returns 400 for invalid payload', async () => {
    const req = new NextRequest('http://localhost/api/doll-chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    })
    const res = await postDollChat(req)
    expect(res.status).toBe(400)
  })
})
