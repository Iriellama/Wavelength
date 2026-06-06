import type { EmotionKey } from '@/lib/emotions'

const BASE = '/wheel shapes'

/** Which clock slot (0 = top, clockwise) each PNG is authored for when rotation = 0. */
export const WHEEL_FACE_NATIVE_SLOT: Record<EmotionKey, number> = {
  joyful: 7, // Excited — top-left at 0°
  energised: 6, // Energised — left at 0°
  anxious: 3, // stressed — bottom-right at 0°
  lost: 4, // confused — bottom at 0°
  reflective: 2, // guilty — right at 0°
  calm: 1, // hurt — top-right at 0°
  grounded: 0, // angry — top at 0°
  tired: 5, // sensitive — bottom-left at 0°
}

export const WHEEL_FACE_SRC: Record<EmotionKey, string> = {
  joyful: `${BASE}/Excited 1.png`,
  energised: `${BASE}/Energised 1.png`,
  anxious: `${BASE}/stressed 1.png`,
  lost: `${BASE}/confused 1.png`,
  reflective: `${BASE}/guilty 1.png`,
  calm: `${BASE}/hurt 1.png`,
  grounded: `${BASE}/angry 1.png`,
  tired: `${BASE}/sensitive 1.png`,
}

/** EMOTIONS array order: slot index clockwise from the top. */
export const EMOTION_SLOT: Record<EmotionKey, number> = {
  joyful: 0,
  energised: 1,
  anxious: 2,
  lost: 3,
  reflective: 4,
  calm: 5,
  grounded: 6,
  tired: 7,
}

const SLICE_DEG = 360 / 8

export function wheelFaceUrl(key: EmotionKey): string {
  return encodeURI(WHEEL_FACE_SRC[key])
}

/** Rotate a face PNG from its authored slot onto the emotion slot. */
export function wheelFaceRotation(key: EmotionKey): number {
  const target = EMOTION_SLOT[key]
  const native = WHEEL_FACE_NATIVE_SLOT[key]
  return (target - native) * SLICE_DEG
}
