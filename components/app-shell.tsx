"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Onboarding } from "@/components/onboarding"
import { hasOnboarded, getPersonId } from "@/lib/identity"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [onboarded, setOnboarded] = useState(true)

  useEffect(() => {
    try {
      // touching getPersonId would create an id; check raw flag first
      const done = hasOnboarded()
      if (done) {
        getPersonId()
      }
      setOnboarded(done)
    } catch {
      // never let a storage error trap the user on a blank screen
      setOnboarded(false)
    } finally {
      setReady(true)
    }
  }, [])

  if (!ready) {
    return <div className="min-h-screen bg-background" />
  }

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  )
}
