import { beforeEach, describe, expect, it } from 'vitest'

// identity.ts reads/writes localStorage — provide a minimal shim
const store: Record<string, string> = {}
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
  },
  writable: true,
})

Object.defineProperty(global, 'window', { value: global, writable: true })
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
  writable: true,
})

import {
  getPersonId,
  getName,
  setName,
  getExam,
  setExam,
  hasOnboarded,
} from '@/lib/identity'

describe('identity', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.keys(store).forEach((k) => delete store[k])
  })

  it('creates and returns a stable person id', () => {
    const id1 = getPersonId()
    const id2 = getPersonId()
    expect(id1).toBe(id2)
    expect(id1).toBe('test-uuid-1234')
  })

  it('returns null name before setting', () => {
    expect(getName()).toBeNull()
  })

  it('persists name across calls', () => {
    setName('Aviral')
    expect(getName()).toBe('Aviral')
  })

  it('persists exam across calls', () => {
    setExam('NEET')
    expect(getExam()).toBe('NEET')
  })

  it('hasOnboarded returns false before first visit', () => {
    expect(hasOnboarded()).toBe(false)
  })

  it('hasOnboarded returns true after getPersonId', () => {
    getPersonId()
    expect(hasOnboarded()).toBe(true)
  })
})
