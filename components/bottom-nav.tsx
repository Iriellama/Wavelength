"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/", label: "Hue", icon: HueIcon },
  { href: "/quilt", label: "Quilt", icon: QuiltIcon },
  { href: "/dolls", label: "Dolls", icon: DollIcon },
  { href: "/steps", label: "Steps", icon: StepsIcon },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary/12" : "bg-transparent",
                  )}
                >
                  <Icon active={active} />
                </span>
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function HueIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180
        const x = 12 + Math.cos(r) * 7.5
        const y = 12 + Math.sin(r) * 7.5
        return (
          <circle
            key={deg}
            cx={x}
            cy={y}
            r="2.4"
            fill="currentColor"
            opacity={active ? 0.9 : 0.55}
          />
        )
      })}
    </svg>
  )
}

function QuiltIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={3 + col * 6.5}
            y={3 + row * 6.5}
            width="5"
            height="5"
            rx="1.4"
            fill="currentColor"
            opacity={(row + col) % 2 === 0 ? (active ? 0.95 : 0.6) : 0.3}
          />
        )),
      )}
    </svg>
  )
}

function DollIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7" r="3.4" fill="currentColor" />
      <rect x="8" y="11" width="8" height="9" rx="4" fill="currentColor" />
    </svg>
  )
}

function StepsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21c0-4 0-7 0-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 12c-3 0-5-2-5-4 2 0 5 1 5 4Z"
        fill="currentColor"
      />
      <path d="M12 10c2.5 0 4-1.6 4-3.4-1.8 0-4 .9-4 3.4Z" fill="currentColor" />
    </svg>
  )
}
