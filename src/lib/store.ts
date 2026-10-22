'use client'

import { useSyncExternalStore } from 'react'
import { SEED_PROFILE } from '@/data/seed'
import type { HistoryEntry, Profile } from '@/data/types'

const KEYS = {
  profile: 'forja.profile',
  history: 'forja.history',
  seeded: 'forja.seeded.v3',
} as const

const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function ensureSeed(): void {
  if (localStorage.getItem(KEYS.seeded)) return
  localStorage.setItem(KEYS.profile, JSON.stringify(SEED_PROFILE))
  localStorage.setItem(KEYS.history, '[]')
  localStorage.setItem(KEYS.seeded, '1')
}

function read<T>(key: string, fallback: T): T {
  ensureSeed()
  const raw = localStorage.getItem(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value as T

  let value: T = fallback
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T
    } catch (error) {
      console.error(`store: no se pudo leer ${key}`, error)
      value = fallback
    }
  }
  cache.set(key, { raw, value })
  return value
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
  cache.delete(key)
  emit()
}

const NO_HISTORY: HistoryEntry[] = []

function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  )
}

export function useProfile(): Profile {
  return useStored<Profile>(KEYS.profile, SEED_PROFILE)
}

export function useHistory(): HistoryEntry[] {
  return useStored<HistoryEntry[]>(KEYS.history, NO_HISTORY)
}

export function saveProfile(profile: Profile): void {
  write(KEYS.profile, profile)
}

export function addHistory(entry: HistoryEntry): void {
  const current = read<HistoryEntry[]>(KEYS.history, NO_HISTORY)
  write(KEYS.history, [...current, entry])
}
