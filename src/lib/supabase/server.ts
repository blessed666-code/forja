import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { HistoryEntry, Profile } from '@/data/types'

/**
 * Gestión segura de sesión BFF con Supabase en el servidor.
 * Los tokens NUNCA se guardan en localStorage ni son accesibles desde JavaScript en el navegador.
 * TODO(security): Evaluar activación de MFA (TOTP) y proveedores OAuth 2.0 (Google/Apple) en fases empresariales B2B.
 */

export interface SupabaseEnvConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export function getSupabaseConfig(): SupabaseEnvConfig | null {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anonKey = (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

  if (!url || !anonKey || !serviceRoleKey) {
    return null
  }
  return { url, anonKey, serviceRoleKey }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null
}

/**
 * En producción (NODE_ENV === 'production'), el Gatekeeper aplica política Fail-Close:
 * jamás deja abierta la aplicación si faltan las variables de entorno.
 * En desarrollo local (localhost), se activa automáticamente en cuanto se configuran las llaves.
 */
export function isGatekeeperEnforced(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return true
  }
  return isSupabaseConfigured()
}

function isHttpsCookie(): boolean {
  if (process.env.NODE_ENV === 'production') return true
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return siteUrl.startsWith('https://')
}

export function getSessionCookieNames(): { access: string; refresh: string } {
  const https = isHttpsCookie()
  return {
    access: https ? '__Host-forja_at' : 'forja_at',
    refresh: https ? '__Host-forja_rt' : 'forja_rt',
  }
}

const SAFE_WS_TRANSPORT: typeof WebSocket =
  typeof globalThis.WebSocket !== 'undefined'
    ? globalThis.WebSocket
    : (class NoopServerWebSocket {} as unknown as typeof WebSocket)

export function createSupabaseAnonServerClient(): SupabaseClient {
  const cfg = getSupabaseConfig()
  if (!cfg) {
    throw new Error('Supabase no está configurado en las variables de entorno del servidor.')
  }
  return createClient(cfg.url, cfg.anonKey, {
    realtime: {
      transport: SAFE_WS_TRANSPORT,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function createSupabaseUserServerClient(accessToken: string): SupabaseClient {
  const cfg = getSupabaseConfig()
  if (!cfg) {
    throw new Error('Supabase no está configurado en las variables de entorno del servidor.')
  }
  return createClient(cfg.url, cfg.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    realtime: {
      transport: SAFE_WS_TRANSPORT,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function createSupabaseAdminClient(): SupabaseClient {
  const cfg = getSupabaseConfig()
  if (!cfg) {
    throw new Error('Supabase Service Role no está configurado en el servidor.')
  }
  return createClient(cfg.url, cfg.serviceRoleKey, {
    realtime: {
      transport: SAFE_WS_TRANSPORT,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export async function setAuthSessionCookies(accessToken: string, refreshToken: string, expiresInSec = 3600): Promise<void> {
  const store = await cookies()
  const names = getSessionCookieNames()
  const secure = isHttpsCookie()

  store.set(names.access, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: Math.min(Math.max(expiresInSec, 300), 60 * 60 * 24),
  })

  store.set(names.refresh, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // Expiración máxima de sesión: 14 días (no infinita)
  })
}

export async function clearAuthSessionCookies(): Promise<void> {
  const store = await cookies()
  const names = getSessionCookieNames()
  const secure = isHttpsCookie()

  store.set(names.access, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  store.set(names.refresh, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

export function isConfiguredAdminEmail(email: string): boolean {
  const raw = (process.env.FORJA_ADMIN_EMAIL ?? '').trim().toLowerCase()
  if (!raw) return false
  const allowed = raw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

export interface AuthenticatedAccount {
  userId: string
  email: string
  role: 'member' | 'admin'
  isActive: boolean
  onboardingCompleted: boolean
  courtesyCodeUsed: string | null
  profileData: Profile | null
  accessToken: string
}

export async function getAuthenticatedAccount(options?: { allowRefresh?: boolean }): Promise<AuthenticatedAccount | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const store = await cookies()
  const names = getSessionCookieNames()
  let accessToken = store.get(names.access)?.value ?? ''
  const refreshToken = store.get(names.refresh)?.value ?? ''

  if (!accessToken && !refreshToken) {
    return null
  }

  const anon = createSupabaseAnonServerClient()
  let userId = ''
  let email = ''

  if (accessToken) {
    const { data, error } = await anon.auth.getUser(accessToken)
    if (!error && data.user?.id && data.user.email) {
      userId = data.user.id
      email = data.user.email
    }
  }

  // Renovación transparente si el access token expiró y se permite escribir cookies (Route Handlers / Server Actions)
  if (!userId && refreshToken && (options?.allowRefresh ?? false)) {
    const { data: refreshed, error: refreshErr } = await anon.auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (!refreshErr && refreshed.session && refreshed.user?.id && refreshed.user.email) {
      accessToken = refreshed.session.access_token
      userId = refreshed.user.id
      email = refreshed.user.email
      try {
        await setAuthSessionCookies(
          refreshed.session.access_token,
          refreshed.session.refresh_token,
          refreshed.session.expires_in,
        )
      } catch {
        // Ignorar si estamos en un contexto de solo lectura de cookies
      }
    }
  }

  if (!userId || !email) {
    return null
  }

  const adminClient = createSupabaseAdminClient()
  const { data: profileRow, error: profileErr } = await adminClient
    .from('profiles')
    .select('id, email, role, is_active, onboarding_completed, courtesy_code_used, profile_data')
    .eq('id', userId)
    .maybeSingle()

  if (profileErr || !profileRow) {
    return null
  }

  if (!profileRow.is_active) {
    return null
  }

  let effectiveRole: 'member' | 'admin' = profileRow.role === 'admin' ? 'admin' : 'member'
  if (effectiveRole !== 'admin' && isConfiguredAdminEmail(email)) {
    effectiveRole = 'admin'
    await adminClient.from('profiles').update({ role: 'admin' }).eq('id', userId)
  }

  const rawProfileData = profileRow.profile_data as Record<string, unknown> | null
  const hasValidProfile = Boolean(rawProfileData && typeof rawProfileData.name === 'string' && rawProfileData.name.trim())

  return {
    userId,
    email,
    role: effectiveRole,
    isActive: Boolean(profileRow.is_active),
    onboardingCompleted: Boolean(profileRow.onboarding_completed && hasValidProfile),
    courtesyCodeUsed: (profileRow.courtesy_code_used as string | null) ?? null,
    profileData: hasValidProfile ? (rawProfileData as unknown as Profile) : null,
    accessToken,
  }
}

export async function fetchUserHistory(accessToken: string, userId: string): Promise<HistoryEntry[]> {
  const userClient = createSupabaseUserServerClient(accessToken)
  const { data, error } = await userClient
    .from('workout_history')
    .select('completed_at, session_id, session_name, sets_done')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true })
    .limit(365)

  if (error || !data) return []

  return data.map((row) => ({
    date: String(row.completed_at),
    sessionId: String(row.session_id),
    sessionName: String(row.session_name),
    setsDone: Number(row.sets_done) || 0,
  }))
}
