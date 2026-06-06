"use client"

import { getEmotion } from "@/lib/emotions"

type Face = "calm" | "scared" | "tired" | "sad" | "bright"

// Map an emotion to a facial expression for the doll.
function faceForEmotion(emotion: string | null): Face {
  switch (emotion) {
    case "joyful":
    case "energised":
      return "bright"
    case "anxious":
      return "scared"
    case "tired":
    case "lost":
      return "tired"
    case "reflective":
      return "sad"
    default:
      return "calm"
  }
}

export function WorryDoll({
  color = "#2BA89B",
  emotion = null,
  size = 96,
  opacity = 1,
  className = "",
}: {
  color?: string
  emotion?: string | null
  size?: number
  opacity?: number
  className?: string
}) {
  const resolved = emotion ? (getEmotion(emotion)?.color ?? color) : color
  const face = faceForEmotion(emotion)

  // a darker shade for the yarn stitches
  const stitch = "rgba(0,0,0,0.12)"

  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={(size * 140) / 100}
      style={{ opacity }}
      className={className}
      role="img"
      aria-label="A small worry doll"
    >
      {/* arms */}
      <path
        d="M28 70 Q10 78 14 96"
        stroke={resolved}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M72 70 Q90 78 86 96"
        stroke={resolved}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      {/* legs */}
      <path
        d="M40 116 Q38 132 34 136"
        stroke={resolved}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 116 Q62 132 66 136"
        stroke={resolved}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      {/* body */}
      <rect x="30" y="58" width="40" height="62" rx="20" fill={resolved} />
      {/* knit lines on body */}
      <line x1="34" y1="74" x2="66" y2="74" stroke={stitch} strokeWidth="2" />
      <line x1="34" y1="88" x2="66" y2="88" stroke={stitch} strokeWidth="2" />
      <line x1="34" y1="102" x2="66" y2="102" stroke={stitch} strokeWidth="2" />
      {/* head */}
      <circle cx="50" cy="38" r="26" fill={resolved} />
      <circle cx="50" cy="38" r="26" fill="rgba(255,255,255,0.08)" />
      {/* face area lighter patch */}
      <ellipse cx="50" cy="40" rx="17" ry="16" fill="rgba(255,250,242,0.92)" />

      {/* eyes + mouth by mood */}
      <Eyes face={face} />
      {/* little top knot */}
      <circle cx="50" cy="12" r="6" fill={resolved} />
    </svg>
  )
}

function Eyes({ face }: { face: Face }) {
  const ink = "#3a2f28"
  switch (face) {
    case "bright":
      return (
        <>
          <path d="M40 38 q3 -4 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M54 38 q3 -4 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M44 47 q6 6 12 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="45" r="2.6" fill="#E8536B" opacity="0.45" />
          <circle cx="62" cy="45" r="2.6" fill="#E8536B" opacity="0.45" />
        </>
      )
    case "scared":
      return (
        <>
          <circle cx="43" cy="39" r="3.4" fill={ink} />
          <circle cx="57" cy="39" r="3.4" fill={ink} />
          <circle cx="44" cy="38" r="1" fill="#fff" />
          <circle cx="58" cy="38" r="1" fill="#fff" />
          <ellipse cx="50" cy="49" rx="3" ry="3.6" fill={ink} />
        </>
      )
    case "tired":
      return (
        <>
          <line x1="40" y1="39" x2="46" y2="39" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="54" y1="39" x2="60" y2="39" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M45 49 q5 -2 10 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )
    case "sad":
      return (
        <>
          <path d="M40 40 q3 -3 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M54 40 q3 -3 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M45 50 q5 -4 10 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )
    default: // calm
      return (
        <>
          <circle cx="43" cy="40" r="2.6" fill={ink} />
          <circle cx="57" cy="40" r="2.6" fill={ink} />
          <path d="M45 48 q5 3 10 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )
  }
}
