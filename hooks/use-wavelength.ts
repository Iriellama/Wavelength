"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { getPersonId } from "@/lib/identity"

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export interface Checkin {
  id: number
  day: string
  emotion: string
  color: string
  intensity: number
  note: string | null
}

export interface Doll {
  id: number
  dollKind: string
  worry: string
  released: number
  createdDay: string
  createdAt: string
  moodEmotion: string | null
  moodColor: string | null
}

export interface Step {
  id: number
  body: string
  tag: string
  day: string
  createdAt: string
}

function usePid(): string {
  return useMemo(
    () => (typeof window !== "undefined" ? getPersonId() : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}

export function useCheckins() {
  const pid = usePid()
  const { data, mutate, isLoading, error } = useSWR<{ checkins: Checkin[] }>(
    pid ? `/api/checkins?pid=${pid}` : null,
    fetcher,
  )
  return { checkins: data?.checkins ?? [], mutate, isLoading, error }
}

export function useDolls() {
  const pid = usePid()
  const { data, mutate, isLoading, error } = useSWR<{ dolls: Doll[] }>(
    pid ? `/api/dolls?pid=${pid}` : null,
    fetcher,
  )
  return { dolls: data?.dolls ?? [], mutate, isLoading, error }
}

export function useSteps() {
  const pid = usePid()
  const { data, mutate, isLoading, error } = useSWR<{ steps: Step[] }>(
    pid ? `/api/steps?pid=${pid}` : null,
    fetcher,
  )
  return { steps: data?.steps ?? [], mutate, isLoading, error }
}
