import { describe, expect, it } from 'vitest'
import {
  EMOTION_SLOT,
  WHEEL_FACE_NATIVE_SLOT,
  wheelFaceRotation,
  wheelFaceUrl,
} from '@/lib/wheel-faces'
import { EMOTIONS } from '@/lib/emotions'

describe('wheel faces', () => {
  it('maps every emotion to a public asset', () => {
    for (const e of EMOTIONS) {
      expect(wheelFaceUrl(e.key)).toContain('/wheel%20shapes/')
    }
  })

  it('rotates each face onto its emotion slot', () => {
    for (const e of EMOTIONS) {
      const target = EMOTION_SLOT[e.key]
      const native = WHEEL_FACE_NATIVE_SLOT[e.key]
      expect(wheelFaceRotation(e.key)).toBe((target - native) * 45)
    }
  })

  it('assigns unique native slots across faces', () => {
    const natives = EMOTIONS.map((e) => WHEEL_FACE_NATIVE_SLOT[e.key])
    expect(new Set(natives).size).toBe(8)
  })
})
