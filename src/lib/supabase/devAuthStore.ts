import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { CLEAN_DEFAULT_PROFILE } from '@/data/seed'
import type { HistoryEntry, Profile } from '@/data/types'
import { isConfiguredAdminEmail, isSupabaseConfigured } from './server'

/**
 * Almacén BFF local exclusivo para desarrollo (NODE_ENV !== 'production') cuando Supabase aún no tiene llaves en .env.local.
 * Permite probar de punta a punta Registro con Código de Cortesía, Login, Logout, Quiz y Progreso de Rutinas.
 * SEGURIDAD:
 * - Jamás activo en producción (Fail-Close 503 se mantiene intacto en producción).
 * - Contraseñas derivadas con scrypt + salt criptográfico único por usuario (cero texto plano, cero contraseñas quemadas).
 * - Tokens de sesión opacos de 256 bits con expiración e invalidación en logout.
 */

interface DevUserRecord {
  id: string
  email: string
  passwordHashHex: string
  saltHex: string
  role: 'member' | 'admin'
  isActive: boolean
  courtesyCodeUsed: string | null
  onboardingCompleted: boolean
  profileData: Profile
  createdAt: string
}

interface DevSessionRecord {
  token: string
  userId: string
  expiresAt: number
}

interface DevCourtesyCode {
  code: string
  maxUses: number
  usesCount: number
  isActive: boolean
}

interface DevHistoryRecord {
  userId: string
  date: string
  sessionId: string
  sessionName: string
  setsDone: number
}

interface DevDatabase {
  users: DevUserRecord[]
  sessions: DevSessionRecord[]
  courtesyCodes: DevCourtesyCode[]
  history: DevHistoryRecord[]
}

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000

function getDevDbFilePath(): string {
  const dir = path.resolve(process.cwd(), '.next')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return path.join(dir, 'forja-dev-auth.json')
}

function createInitialDb(): DevDatabase {
  return {
    users: [],
    sessions: [],
    courtesyCodes: [
      { code: 'FORJA-VIP-2026', maxUses: 100, usesCount: 0, isActive: true },
      { code: 'NAIU-VIP', maxUses: 100, usesCount: 0, isActive: true },
      { code: 'ARKA-DEMO', maxUses: 100, usesCount: 0, isActive: true },
    ],
    history: [],
  }
}

function loadDb(): DevDatabase {
  const filePath = getDevDbFilePath()
  if (!existsSync(filePath)) {
    const initial = createInitialDb()
    saveDb(initial)
    return initial
  }
  try {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<DevDatabase>
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      courtesyCodes: Array.isArray(parsed.courtesyCodes) && parsed.courtesyCodes.length > 0
        ? parsed.courtesyCodes
        : createInitialDb().courtesyCodes,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    }
  } catch {
    return createInitialDb()
  }
}

function saveDb(db: DevDatabase): void {
  const filePath = getDevDbFilePath()
  writeFileSync(filePath, JSON.stringify(db, null, 2), { encoding: 'utf8', mode: 0o600 })
}

export function isLocalDevAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && !isSupabaseConfigured()
}

function hashPassword(password: string, saltHex: string): string {
  return scryptSync(password, Buffer.from(saltHex, 'hex'), 64).toString('hex')
}

function verifyPassword(password: string, saltHex: string, expectedHashHex: string): boolean {
  const computed = Buffer.from(hashPassword(password, saltHex), 'hex')
  const expected = Buffer.from(expectedHashHex, 'hex')
  if (computed.length !== expected.length) return false
  return timingSafeEqual(computed, expected)
}

export function devRegisterUser(params: {
  courtesyCode: string
  name: string
  email: string
  password: string
}):
  | {
      ok: true
      accessToken: string
      refreshToken: string
      role: 'member' | 'admin'
      onboardingCompleted: boolean
    }
  | { ok: false; status: number; error: string } {
  const db = loadDb()
  const normalizedEmail = params.email.toLowerCase()

  if (db.users.some((u) => u.email === normalizedEmail)) {
    return {
      ok: false,
      status: 409,
      error: 'Este correo ya tiene una cuenta activa. Usa la pestaña Iniciar Sesión.',
    }
  }

  const codeEntry = db.courtesyCodes.find((c) => c.code === params.courtesyCode)
  if (!codeEntry || !codeEntry.isActive) {
    return {
      ok: false,
      status: 403,
      error: 'Código de cortesía inválido. En entorno local usa FORJA-VIP-2026 o NAIU-VIP.',
    }
  }

  if (codeEntry.usesCount >= codeEntry.maxUses) {
    return {
      ok: false,
      status: 403,
      error: 'Este código de cortesía alcanzó su límite máximo de usos.',
    }
  }

  codeEntry.usesCount += 1

  const saltHex = randomBytes(16).toString('hex')
  const passwordHashHex = hashPassword(params.password, saltHex)
  const role: 'member' | 'admin' =
    isConfiguredAdminEmail(normalizedEmail) || db.users.length === 0 ? 'admin' : 'member'

  const userId = randomUUID()
  const initialProfile: Profile = {
    ...CLEAN_DEFAULT_PROFILE,
    name: params.name,
  }

  db.users.push({
    id: userId,
    email: normalizedEmail,
    passwordHashHex,
    saltHex,
    role,
    isActive: true,
    courtesyCodeUsed: codeEntry.code,
    onboardingCompleted: false,
    profileData: initialProfile,
    createdAt: new Date().toISOString(),
  })

  const accessToken = randomBytes(32).toString('hex')
  const refreshToken = randomBytes(32).toString('hex')
  db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now())
  db.sessions.push({
    token: accessToken,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  })

  saveDb(db)

  return {
    ok: true,
    accessToken,
    refreshToken,
    role,
    onboardingCompleted: false,
  }
}

export function devLoginUser(params: {
  email: string
  password: string
}):
  | {
      ok: true
      accessToken: string
      refreshToken: string
      role: 'member' | 'admin'
      onboardingCompleted: boolean
      profile: Profile
    }
  | { ok: false; status: number; error: string } {
  const db = loadDb()
  const normalizedEmail = params.email.toLowerCase()
  const user = db.users.find((u) => u.email === normalizedEmail)

  if (!user || !verifyPassword(params.password, user.saltHex, user.passwordHashHex)) {
    return {
      ok: false,
      status: 401,
      error: 'Correo o contraseña incorrectos.',
    }
  }

  if (!user.isActive) {
    return {
      ok: false,
      status: 403,
      error: 'Tu acceso se encuentra desactivado.',
    }
  }

  const accessToken = randomBytes(32).toString('hex')
  const refreshToken = randomBytes(32).toString('hex')
  db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now() && s.userId !== user.id)
  db.sessions.push({
    token: accessToken,
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  })
  saveDb(db)

  return {
    ok: true,
    accessToken,
    refreshToken,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    profile: user.profileData,
  }
}

export function devGetAccountByToken(accessToken: string): {
  userId: string
  email: string
  role: 'member' | 'admin'
  isActive: boolean
  onboardingCompleted: boolean
  courtesyCodeUsed: string | null
  profileData: Profile | null
  history: HistoryEntry[]
} | null {
  if (!accessToken) return null
  const db = loadDb()
  const now = Date.now()
  const session = db.sessions.find((s) => s.token === accessToken && s.expiresAt > now)
  if (!session) return null

  const user = db.users.find((u) => u.id === session.userId && u.isActive)
  if (!user) return null

  const userHistory: HistoryEntry[] = db.history
    .filter((h) => h.userId === user.id)
    .map((h) => ({
      date: h.date,
      sessionId: h.sessionId,
      sessionName: h.sessionName,
      setsDone: h.setsDone,
    }))

  const hasValidProfile = Boolean(user.profileData && user.profileData.name && user.profileData.name.trim())

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    onboardingCompleted: Boolean(user.onboardingCompleted && hasValidProfile),
    courtesyCodeUsed: user.courtesyCodeUsed,
    profileData: hasValidProfile ? user.profileData : null,
    history: userHistory,
  }
}

export function devInvalidateSessionsForToken(accessToken: string): void {
  if (!accessToken) return
  const db = loadDb()
  const target = db.sessions.find((s) => s.token === accessToken)
  if (!target) return
  db.sessions = db.sessions.filter((s) => s.userId !== target.userId)
  saveDb(db)
}

export function devUpdateProfile(accessToken: string, profile: Profile, onboardingCompleted: boolean): boolean {
  const db = loadDb()
  const now = Date.now()
  const session = db.sessions.find((s) => s.token === accessToken && s.expiresAt > now)
  if (!session) return false
  const user = db.users.find((u) => u.id === session.userId && u.isActive)
  if (!user) return false

  user.profileData = profile
  user.onboardingCompleted = onboardingCompleted
  saveDb(db)
  return true
}

export function devAddHistory(
  accessToken: string,
  entry: { sessionId: string; sessionName: string; setsDone: number },
): boolean {
  const db = loadDb()
  const now = Date.now()
  const session = db.sessions.find((s) => s.token === accessToken && s.expiresAt > now)
  if (!session) return false
  const user = db.users.find((u) => u.id === session.userId && u.isActive)
  if (!user) return false

  db.history.push({
    userId: user.id,
    date: new Date().toISOString(),
    sessionId: entry.sessionId,
    sessionName: entry.sessionName,
    setsDone: entry.setsDone,
  })
  saveDb(db)
  return true
}
