"use client"

const ID_KEY = "wavelength_pid"
const NAME_KEY = "wavelength_name"
const EXAM_KEY = "wavelength_exam"

// In some contexts (sandboxed iframes, blocked third-party storage, private
// modes) accessing window.localStorage THROWS a SecurityError. If we let that
// bubble up, the onboarding gate crashes and the app renders a blank screen.
// So we wrap every access and fall back to an in-memory store for the session.
const memoryStore: Record<string, string> = {}

function safeGet(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key)
    }
  } catch {
    // localStorage unavailable — fall through to memory
  }
  return key in memoryStore ? memoryStore[key] : null
}

function safeSet(key: string, value: string) {
  memoryStore[key] = value
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // localStorage unavailable — memory store already holds the value
  }
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    // fall through
  }
  return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getPersonId(): string {
  if (typeof window === "undefined") return ""
  let id = safeGet(ID_KEY)
  if (!id) {
    id = makeId()
    safeSet(ID_KEY, id)
  }
  return id
}

export function getName(): string | null {
  return safeGet(NAME_KEY)
}

export function setName(name: string) {
  safeSet(NAME_KEY, name)
}

export function getExam(): string | null {
  return safeGet(EXAM_KEY)
}

export function setExam(exam: string) {
  safeSet(EXAM_KEY, exam)
}

export function hasOnboarded(): boolean {
  return !!safeGet(ID_KEY)
}
