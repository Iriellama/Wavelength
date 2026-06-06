import { NextResponse } from 'next/server'
import { AppError, validationError } from '@/lib/api/errors'
import { ZodError } from 'zod'

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function jsonError(
  message: string,
  status: number,
  extras?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, message, ...extras }, { status })
}

export function handleRouteError(error: unknown, route: string) {
  if (error instanceof AppError) {
    const extras =
      'errors' in error
        ? { errors: (error as AppError & { errors: unknown }).errors }
        : undefined
    return jsonError(error.message, error.statusCode, extras)
  }

  if (error instanceof ZodError) {
    const ve = validationError('Validation failed', error.flatten())
    return jsonError(ve.message, ve.statusCode, {
      errors: (ve as AppError & { errors: unknown }).errors,
    })
  }

  console.error(`[${route}] unhandled error:`, error instanceof Error ? error.message : error)
  return jsonError('Internal server error', 500)
}
