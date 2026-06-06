import { describe, expect, it, vi } from 'vitest'
import { checkRateLimit, clientIp } from '@/lib/api/rate-limit'

describe('checkRateLimit', () => {
  it('allows first 20 requests from the same key', () => {
    const key = `test-ip-${Date.now()}`
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key)).toBe(true)
    }
  })

  it('blocks the 21st request', () => {
    const key = `test-ip-block-${Date.now()}`
    for (let i = 0; i < 20; i++) checkRateLimit(key)
    expect(checkRateLimit(key)).toBe(false)
  })

  it('resets after window expires', () => {
    vi.useFakeTimers()
    const key = `test-ip-reset-${Date.now()}`
    for (let i = 0; i < 20; i++) checkRateLimit(key)
    expect(checkRateLimit(key)).toBe(false)
    vi.advanceTimersByTime(11 * 60 * 1000)
    expect(checkRateLimit(key)).toBe(true)
    vi.useRealTimers()
  })
})

describe('clientIp', () => {
  it('extracts first IP from x-forwarded-for', () => {
    const req = { headers: { get: (name: string) => (name === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null) } }
    expect(clientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const req = { headers: { get: (name: string) => (name === 'x-real-ip' ? '9.10.11.12' : null) } }
    expect(clientIp(req)).toBe('9.10.11.12')
  })

  it('returns unknown when no IP headers', () => {
    const req = { headers: { get: () => null } }
    expect(clientIp(req)).toBe('unknown')
  })
})
