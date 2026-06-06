"use client"

import { useRef, useState } from "react"
import { EMOTIONS, type Emotion } from "@/lib/emotions"
import { WHEEL_FACE_NATIVE_SLOT, wheelFaceUrl } from "@/lib/wheel-faces"

// Invisible hit wedge aligned to each octant (assets carry the visible geometry).
function hitWedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  const toXY = (r: number, a: number) => [
    cx + r * Math.cos(a),
    cy + r * Math.sin(a),
  ]
  const [x1, y1] = toXY(innerR, startAngle)
  const [x2, y2] = toXY(outerR, startAngle)
  const [x3, y3] = toXY(outerR, endAngle)
  const [x4, y4] = toXY(innerR, endAngle)
  const large = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${large} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${large} 0 ${x1} ${y1} Z`
}

export function ColorWheel({
  onSelect,
  selectedKey,
}: {
  onSelect: (e: Emotion) => void
  selectedKey?: string | null
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const size = 320
  const cx = size / 2
  const cy = size / 2
  const innerR = 36
  const outerR = 142
  const gap = 0.028
  const n = EMOTIONS.length
  const slice = (Math.PI * 2) / n

  // The wheel-faces container is rotated 45° CW (= 1 slot).
  // Each image ends up at (nativeSlot + 1) % n visually.
  // Sort emotions by that visual slot so hit-path i fires the emotion
  // whose image is actually visible at slot i.
  const visualOrder = [...EMOTIONS].sort(
    (a, b) =>
      (WHEEL_FACE_NATIVE_SLOT[a.key] + 1) % n -
      (WHEEL_FACE_NATIVE_SLOT[b.key] + 1) % n,
  )

  function handlePick(e: Emotion) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(18)
    }
    onSelect(e)
  }

  function moveFocus(currentIdx: number, delta: number) {
    const nextIdx = (currentIdx + delta + EMOTIONS.length) % EMOTIONS.length
    setFocusedIdx(nextIdx)
    pathRefs.current[nextIdx]?.focus()
  }

  return (
    <div className="wheel-scene mx-auto" style={{ width: size, height: size + 28 }}>
      <div className="wheel-shadow" aria-hidden />
      <div className="wheel-body" style={{ width: size, height: size }}>

        {/* Layer 1 — hit targets (below images); keyboard-navigable radiogroup */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="wheel-svg absolute inset-0"
          style={{ zIndex: 1 }}
          role="radiogroup"
          aria-label="How are you feeling?"
        >
          {visualOrder.map((e, i) => {
            const start = -Math.PI / 2 + i * slice + gap / 2
            const end = -Math.PI / 2 + (i + 1) * slice - gap / 2
            const path = hitWedgePath(cx, cy, innerR, outerR, start, end)
            const isActive = selectedKey === e.key
            const isTabStop = isActive
              ? true
              : selectedKey == null
              ? i === 0
              : false
            return (
              <path
                key={e.key}
                ref={(el) => { pathRefs.current[i] = el }}
                d={path}
                fill="transparent"
                role="radio"
                aria-checked={isActive}
                aria-label={e.label}
                tabIndex={isTabStop ? 0 : -1}
                style={{ cursor: "pointer", outline: "none" }}
                onMouseEnter={() => setHovered(e.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { setFocusedIdx(i); handlePick(e) }}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault()
                    handlePick(e)
                  } else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
                    ev.preventDefault()
                    moveFocus(i, 1)
                  } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
                    ev.preventDefault()
                    moveFocus(i, -1)
                  }
                }}
              />
            )
          })}
        </svg>

        {/* Layer 2 — PNG face images, whole group rotated 45° CW to align slots */}
        <div
          className="wheel-faces absolute inset-0 pointer-events-none"
          style={{ zIndex: 2, transform: "rotate(45deg)" }}
          aria-hidden
        >
          {EMOTIONS.map((e) => {
            const active = selectedKey === e.key
            const isHovered = hovered === e.key
            const dim = selectedKey && !active ? 0.42 : 1
            const lift = active || isHovered ? 1.06 : 1

            return (
              <img
                key={e.key}
                src={wheelFaceUrl(e.key)}
                alt=""
                draggable={false}
                className="wheel-face-layer pointer-events-none absolute inset-0 h-full w-full select-none"
                style={{
                  opacity: dim,
                  transform: `scale(${lift})`,
                  transformOrigin: "50% 50%",
                  transition: "opacity 0.28s ease, transform 0.22s ease",
                }}
              />
            )
          })}
        </div>

        {/* Layer 3 — center hub on top of images */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="wheel-svg absolute inset-0 pointer-events-none"
          style={{ zIndex: 3 }}
          aria-hidden
        >
          <defs>
            <filter id="wheel-depth" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2a2018" floodOpacity="0.22" />
            </filter>
            <radialGradient id="wheel-well" cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#f6f2ec" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3a2f28" stopOpacity="0.08" />
            </radialGradient>
          </defs>
          <g filter="url(#wheel-depth)">
            <circle cx={cx} cy={cy} r={innerR + 2} fill="url(#wheel-well)" />
            <circle cx={cx} cy={cy} r={innerR + 2} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={innerR - 8} fill="#E8536B" opacity="0.9" />
            <circle cx={cx} cy={cy} r={innerR - 8} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
            <circle cx={cx} cy={cy} r={innerR - 17} fill="#3a2f28" opacity="0.92" />
            <ellipse cx={cx - 7} cy={cy - 9} rx={innerR * 0.32} ry={innerR * 0.2} fill="rgba(255,255,255,0.22)" />
          </g>
        </svg>

      </div>
    </div>
  )
}
