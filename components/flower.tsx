"use client"

const TAG_COLORS: Record<string, { petal: string; center: string }> = {
  academic: { petal: "#3E7BD4", center: "#F5B700" },
  physical: { petal: "#5B8C4F", center: "#F5B700" },
  social: { petal: "#E8536B", center: "#F5B700" },
  personal: { petal: "#9B6FC9", center: "#F5B700" },
}

export function Flower({
  tag = "personal",
  size = 64,
  onClick,
  swayDelay = "0s",
  className = "",
}: {
  tag?: string
  size?: number
  onClick?: () => void
  swayDelay?: string
  className?: string
}) {
  const c = TAG_COLORS[tag] ?? TAG_COLORS.personal
  const petals = 6

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center focus:outline-none ${className}`}
      aria-label="A win in your garden"
    >
      {/* stem */}
      <span
        className="wl-sway block"
        style={{ animationDelay: swayDelay, transformOrigin: "bottom center" }}
      >
        <svg width={size} height={size * 1.6} viewBox="0 0 64 102" aria-hidden="true">
          <path
            d="M32 100 C 30 70 30 55 32 44"
            stroke="#5B8C4F"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M31 72 C 20 70 16 62 14 56 C 24 56 30 62 31 72Z"
            fill="#5B8C4F"
          />
          {/* flower head */}
          <g transform="translate(32 30)">
            {Array.from({ length: petals }).map((_, i) => {
              const a = (i / petals) * Math.PI * 2
              const x = Math.cos(a) * 13
              const y = Math.sin(a) * 13
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="9"
                  ry="13"
                  fill={c.petal}
                  transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
                  opacity="0.92"
                />
              )
            })}
            <circle cx="0" cy="0" r="9" fill={c.center} />
          </g>
        </svg>
      </span>
    </button>
  )
}
