import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { buildSystemPrompt } from '@/lib/doll-chat-prompt'
import { requireOpenAiKey } from '@/lib/env'
import type { DollChatRequest } from '@/lib/schemas/doll-chat.schema'

const FALLBACK_REPLY =
  "I'm having a little trouble finding my words just now. But I'm still here. Whenever you're ready, you can set this worry down with a doll."

export async function generateDollChatReply(input: DollChatRequest): Promise<string> {
  requireOpenAiKey()

  const turn = input.messages.filter((m) => m.role === 'assistant').length

  const { text } = await generateText({
    model: openai('gpt-5-mini'),
    system: buildSystemPrompt({
      name: input.name ?? null,
      recentMoods: input.recentMoods,
      turn,
    }),
    messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.8,
  })

  return text
}

export { FALLBACK_REPLY }
