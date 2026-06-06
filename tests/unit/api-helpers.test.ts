import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonSuccess, jsonError, handleRouteError } from '@/lib/api/response'
import { AppError, validationError } from '@/lib/api/errors'
import { requireOpenAiKey, resetEnvCache } from '@/lib/env'
import { ZodError } from 'zod'

describe('api response helpers', () => {
  it('jsonSuccess wraps data', async () => {
    const res = jsonSuccess({ ok: true })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, data: { ok: true } })
  })

  it('jsonError returns message and status', async () => {
    const res = jsonError('Bad request', 400, { code: 'X' })
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ success: false, message: 'Bad request', code: 'X' })
  })

  it('handleRouteError maps AppError', async () => {
    const res = handleRouteError(new AppError('Not found', 404), 'test')
    expect(res.status).toBe(404)
  })

  it('handleRouteError maps ZodError', async () => {
    const res = handleRouteError(new ZodError([]), 'test')
    expect(res.status).toBe(400)
  })

  it('handleRouteError maps unknown errors to 500', async () => {
    const res = handleRouteError(new Error('boom'), 'test-route')
    expect(res.status).toBe(500)
  })
})

describe('requireOpenAiKey', () => {
  beforeEach(() => {
    resetEnvCache()
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/wavelength_test'
    process.env.NODE_ENV = 'test'
  })

  it('returns key when set', () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    resetEnvCache()
    expect(requireOpenAiKey()).toBe('sk-test')
  })

  it('throws when missing', () => {
    delete process.env.OPENAI_API_KEY
    resetEnvCache()
    expect(() => requireOpenAiKey()).toThrow('OPENAI_API_KEY')
  })
})

describe('validationError', () => {
  it('attaches flattened errors', () => {
    const err = validationError('failed', { fieldErrors: {} })
    expect(err.statusCode).toBe(400)
    expect((err as AppError & { errors: unknown }).errors).toBeDefined()
  })
})
