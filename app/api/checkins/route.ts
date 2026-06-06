import { type NextRequest, NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/api/response'
import { listCheckins, upsertCheckin } from '@/lib/repositories/checkins.repository'
import { CreateCheckinSchema } from '@/lib/schemas/checkins.schema'
import { parseQueryPid } from '@/lib/schemas/shared.schema'
import { ensureSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await ensureSchema()
    const pid = parseQueryPid(req.nextUrl.searchParams)
    const checkins = await listCheckins(pid)
    return NextResponse.json({ checkins })
  } catch (error) {
    return handleRouteError(error, 'GET /api/checkins')
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const input = CreateCheckinSchema.parse(body)
    const checkin = await upsertCheckin(input)
    return NextResponse.json({ checkin })
  } catch (error) {
    return handleRouteError(error, 'POST /api/checkins')
  }
}
