import { type NextRequest, NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/api/response'
import { checkRateLimit, clientIp } from '@/lib/api/rate-limit'
import { DollChatRequestSchema } from '@/lib/schemas/doll-chat.schema'
import { FALLBACK_REPLY, generateDollChatReply } from '@/lib/services/doll-chat.service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please wait a few minutes.' },
      { status: 429 },
    )
  }

  try {
    const body = await req.json()
    const input = DollChatRequestSchema.parse(body)
    const reply = await generateDollChatReply(input)
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('doll-chat generation failed:', error instanceof Error ? error.message : error)
    const handled = handleRouteError(error, 'POST /api/doll-chat')
    if (handled.status !== 500) {
      return handled
    }
    return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
  }
}
