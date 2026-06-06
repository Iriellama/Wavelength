import { type NextRequest, NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/api/response'
import { createStep, listSteps } from '@/lib/repositories/steps.repository'
import { CreateStepSchema } from '@/lib/schemas/steps.schema'
import { parseQueryPid } from '@/lib/schemas/shared.schema'
import { ensureSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await ensureSchema()
    const pid = parseQueryPid(req.nextUrl.searchParams)
    const steps = await listSteps(pid)
    return NextResponse.json({ steps })
  } catch (error) {
    return handleRouteError(error, 'GET /api/steps')
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const input = CreateStepSchema.parse(body)
    const id = await createStep(input)
    return NextResponse.json({ id })
  } catch (error) {
    return handleRouteError(error, 'POST /api/steps')
  }
}
