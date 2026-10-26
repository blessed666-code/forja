'use client'

import { useSyncExternalStore } from 'react'
import { CLEAN_DEFAULT_PROFILE } from '@/data/seed'
import type { HistoryEntry, Profile } from '@/data/types'

/**
 * Estado reactivo del cliente con sincronización automática hacia Supabase PostgreSQL vía BFF.
 * SEGURIDAD: Jamás se almacenan tokens de sesión ni credenciales en localStorage;
 * la sesión reside exclusivamente en cookies HttpOnly gestionadas por el servidor.
 */

const KEYS = {
  profile: 'forja.profile.v4',
  history: 'forja.history.v4',
  onboarding: 'forja.onboarding_done.v4',
  sessionDrafts: 'forja.session_progress.v1',
} as const

export interface SessionDraft {
  phaseIdx: number
  exIdx: number
  setIdx: number
  absLap: number
  setsDone: number
  completedPhases: number[]
  overrides: Record<string, string>
  updatedAt: string
}

export interface AccountMeta {
  ready: boolean
  configured: boolean
  enforced: boolean
  authenticated: boolean
  maskedEmail: string | null
  role: 'member' | 'admin' | null
  courtesyCodeUsed: string | null
  csrfToken: string
}

let accountMeta: AccountMeta = {
  ready: false,
  configured: false,
  enforced: false,
  authenticated: false,
  maskedEmail: null,
  role: null,
  courtesyCodeUsed: null,
  csrfToken: '',
}

let syncInFlight: Promise<AccountMeta> | null = null

const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener)
    }
  }
}

export function getCsrfToken(): string {
  return accountMeta.csrfToken
}

export function useAccountMeta(): AccountMeta {
  return useSyncExternalStore(
    subscribe,
    () => accountMeta,
    () => accountMeta,
  )
}

export async function ensureClientCsrfToken(): Promise<string> {
  if (accountMeta.csrfToken) return accountMeta.csrfToken
  const meta = await syncSessionFromServer(true)
  return meta.csrfToken
}

export async function syncSessionFromServer(force = false): Promise<AccountMeta> {
  if (typeof window === 'undefined') return accountMeta
  if (accountMeta.ready && !force) return accountMeta
  if (syncInFlight && !force) return syncInFlight

  syncInFlight = (async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!res.ok) {
        accountMeta = { ...accountMeta, ready: true }
        emit()
        return accountMeta
      }

      const data = (await res.json()) as {
        csrfToken?: string
        configured?: boolean
        enforced?: boolean
        authenticated?: boolean
        account?: {
          maskedEmail: string
          role: 'member' | 'admin'
          onboardingCompleted: boolean
          courtesyCodeUsed: string | null
        } | null
        profile?: Profile | null
        history?: HistoryEntry[]
      }

      accountMeta = {
        ready: true,
        configured: Boolean(data.configured),
        enforced: Boolean(data.enforced),
        authenticated: Boolean(data.authenticated),
        maskedEmail: data.account?.maskedEmail ?? null,
        role: data.account?.role ?? null,
        courtesyCodeUsed: data.account?.courtesyCodeUsed ?? null,
        csrfToken: data.csrfToken ?? '',
      }

      if (data.authenticated && data.account) {
        if (data.profile) {
          localStorage.setItem(KEYS.profile, JSON.stringify(data.profile))
        }
        if (Array.isArray(data.history)) {
          localStorage.setItem(KEYS.history, JSON.stringify(data.history))
        }
        if (data.account.onboardingCompleted) {
          localStorage.setItem(KEYS.onboarding, '1')
        } else {
          localStorage.removeItem(KEYS.onboarding)
        }
        cache.clear()
      } else if (data.enforced && !data.authenticated) {
        clearLocalWorkoutCache()
      }

      emit()
      return accountMeta
    } catch {
      accountMeta = { ...accountMeta, ready: true }
      emit()
      return accountMeta
    } finally {
      syncInFlight = null
    }
  })()

  return syncInFlight
}

export function clearLocalWorkoutCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.onboarding)
  localStorage.removeItem(KEYS.profile)
  localStorage.removeItem(KEYS.history)
  localStorage.removeItem(KEYS.sessionDrafts)
  // Limpiar también claves heredadas de versiones previas sin base de datos
  localStorage.removeItem('forja.profile')
  localStorage.removeItem('forja.history')
  localStorage.removeItem('forja.seeded.v3')
  localStorage.removeItem('forja.onboarding_done')
  cache.clear()
}

export function readSessionDraft(sessionId: string): SessionDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.sessionDrafts)
    if (!raw) return null
    const all = JSON.parse(raw) as Record<string, SessionDraft>
    return all[sessionId] ?? null
  } catch {
    return null
  }
}

export function writeSessionDraft(sessionId: string, draft: SessionDraft): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(KEYS.sessionDrafts)
    const all = raw ? (JSON.parse(raw) as Record<string, SessionDraft>) : {}
    all[sessionId] = draft
    localStorage.setItem(KEYS.sessionDrafts, JSON.stringify(all))
  } catch {
    // Ignorar cuota llena en modo privado
  }
}

export function clearSessionDraft(sessionId: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(KEYS.sessionDrafts)
    if (!raw) return
    const all = JSON.parse(raw) as Record<string, SessionDraft>
    delete all[sessionId]
    localStorage.setItem(KEYS.sessionDrafts, JSON.stringify(all))
  } catch {
    // Ignorar error de lectura
  }
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEYS.onboarding) === '1'
}

export function setOnboardingCompleted(completed = true): void {
  if (typeof window === 'undefined') return
  if (completed) {
    localStorage.setItem(KEYS.onboarding, '1')
  } else {
    localStorage.removeItem(KEYS.onboarding)
  }
  emit()
}

export async function resetToNewUser(): Promise<void> {
  if (typeof window === 'undefined') return
  const emptyProfile: Profile = { ...CLEAN_DEFAULT_PROFILE, name: '' }
  localStorage.removeItem(KEYS.onboarding)
  localStorage.setItem(KEYS.profile, JSON.stringify(emptyProfile))
  cache.clear()
  emit()

  if (accountMeta.authenticated) {
    try {
      const csrf = await ensureClientCsrfToken()
      await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          profile: { ...emptyProfile, name: 'Atleta' },
          onboardingCompleted: false,
        }),
      })
    } catch {
      // Mantiene reinicio local si hay pérdida momentánea de red
    }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const csrf = await ensureClientCsrfToken()
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'x-csrf-token': csrf,
      },
    })
  } catch {
    // Continuar con limpieza obligatoria del cliente
  }

  clearLocalWorkoutCache()
  accountMeta = {
    ready: false,
    configured: accountMeta.configured,
    enforced: accountMeta.enforced,
    authenticated: false,
    maskedEmail: null,
    role: null,
    courtesyCodeUsed: null,
    csrfToken: '',
  }
  emit()

  if (typeof window !== 'undefined') {
    window.location.href = '/acceso'
  }
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value as T

  let value: T = fallback
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = fallback
    }
  }
  cache.set(key, { raw, value })
  return value
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
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
  return useStored<Profile>(KEYS.profile, CLEAN_DEFAULT_PROFILE)
}

export function useHistory(): HistoryEntry[] {
  return useStored<HistoryEntry[]>(KEYS.history, NO_HISTORY)
}

export async function saveProfile(profile: Profile, onboardingCompleted = true): Promise<void> {
  write(KEYS.profile, profile)
  setOnboardingCompleted(onboardingCompleted)

  if (accountMeta.authenticated) {
    try {
      const csrf = await ensureClientCsrfToken()
      await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          profile,
          onboardingCompleted,
        }),
      })
    } catch {
      // Queda respaldado localmente hasta recuperar señal en el gimnasio
    }
  }
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
  const current = read<HistoryEntry[]>(KEYS.history, NO_HISTORY)
  write(KEYS.history, [...current, entry])

  if (accountMeta.authenticated) {
    try {
      const csrf = await ensureClientCsrfToken()
      await fetch('/api/user/history', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          sessionId: entry.sessionId,
          sessionName: entry.sessionName,
          setsDone: entry.setsDone,
        }),
      })
    } catch {
      // Respaldado localmente en caso de modo avión en sala de pesas
    }
  }
}
