export type EmotionKey =
  | "joyful"
  | "energised"
  | "anxious"
  | "lost"
  | "reflective"
  | "calm"
  | "grounded"
  | "tired"

export interface Emotion {
  key: EmotionKey
  label: string
  // longer descriptor shown under the wheel
  descriptor: string
  affirmation: string
  // hex used for tiles, dolls, wheel petals
  color: string
  // a softer tint for backgrounds
  tint: string
}

// Order matters: this is the order petals appear around the wheel.
export const EMOTIONS: Emotion[] = [
  {
    key: "joyful",
    label: "Joyful",
    descriptor: "joyful and bright",
    affirmation: "that warmth is yours",
    color: "#F5B700",
    tint: "#FCEFC4",
  },
  {
    key: "energised",
    label: "Energised",
    descriptor: "energised",
    affirmation: "ready for something",
    color: "#F2722B",
    tint: "#FBE0CE",
  },
  {
    key: "anxious",
    label: "Anxious",
    descriptor: "anxious",
    affirmation: "that's okay to feel",
    color: "#E8536B",
    tint: "#FAD5DB",
  },
  {
    key: "lost",
    label: "Lost",
    descriptor: "lost or numb",
    affirmation: "you're still here",
    color: "#9B6FC9",
    tint: "#E6DAF3",
  },
  {
    key: "reflective",
    label: "Reflective",
    descriptor: "reflective",
    affirmation: "something's settling",
    color: "#3E7BD4",
    tint: "#D4E2F7",
  },
  {
    key: "calm",
    label: "Calm",
    descriptor: "calm and clear",
    affirmation: "a quiet kind of okay",
    color: "#2BA89B",
    tint: "#CDEAE5",
  },
  {
    key: "grounded",
    label: "Grounded",
    descriptor: "grounded",
    affirmation: "roots holding steady",
    color: "#5B8C4F",
    tint: "#D8EBCF",
  },
  {
    key: "tired",
    label: "Tired",
    descriptor: "flat and tired",
    affirmation: "rest is valid too",
    color: "#9AA0A6",
    tint: "#E4E6E8",
  },
]

export const EMOTION_MAP: Record<EmotionKey, Emotion> = EMOTIONS.reduce(
  (acc, e) => {
    acc[e.key] = e
    return acc
  },
  {} as Record<EmotionKey, Emotion>,
)

export function getEmotion(key: string): Emotion | undefined {
  return EMOTION_MAP[key as EmotionKey]
}
