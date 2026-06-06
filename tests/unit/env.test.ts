import { beforeEach, describe, expect, it } from 'vitest'
import { resetEnvCache, getEnv } from '@/lib/env'

describe('env', () => {
  beforeEach(() => {
    resetEnvCache()
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/wavelength'
    process.env.NODE_ENV = 'test'
    delete process.env.OPENAI_API_KEY
  })

  it('parses required DATABASE_URL', () => {
    const env = getEnv()
    expect(env.DATABASE_URL).toContain('wavelength')
  })

  it('allows optional OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    resetEnvCache()
    expect(getEnv().OPENAI_API_KEY).toBe('sk-test-key')
  })

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL
    resetEnvCache()
    expect(() => getEnv()).toThrow()
  })
})
