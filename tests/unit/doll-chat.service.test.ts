import { describe, expect, it, vi } from 'vitest'
import { generateDollChatReply } from '@/lib/services/doll-chat.service'

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({ text: 'I hear you.' }),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn().mockReturnValue('mock-model'),
}))

vi.mock('@/lib/env', () => ({
  requireOpenAiKey: vi.fn().mockReturnValue('sk-test'),
}))

describe('doll-chat service', () => {
  it('generates a reply from OpenAI', async () => {
    const reply = await generateDollChatReply({
      messages: [{ role: 'user', content: 'I feel lost' }],
      recentMoods: [{ day: '2026-06-06', emotion: 'lost' }],
      name: 'Sam',
    })
    expect(reply).toBe('I hear you.')
  })
})
