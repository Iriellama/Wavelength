import { type NextRequest, NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/api/response'
import {
  createDoll,
  listDolls,
  updateDollRelease,
} from '@/lib/repositories/dolls.repository'
import { CreateDollSchema, PatchDollSchema } from '@/lib/schemas/dolls.schema'
import { parseQueryPid } from '@/lib/schemas/shared.schema'
import { ensureSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await ensureSchema()
    const pid = parseQueryPid(req.nextUrl.searchParams)
    const dolls = await listDolls(pid)
    return NextResponse.json({ dolls })
  } catch (error) {
    return handleRouteError(error, 'GET /api/dolls')
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const input = CreateDollSchema.parse(body)
    const id = await createDoll(input)
    return NextResponse.json({ id })
  } catch (error) {
    return handleRouteError(error, 'POST /api/dolls')
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const input = PatchDollSchema.parse(body)
    await updateDollRelease(input)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleRouteError(error, 'PATCH /api/dolls')
  }
}
