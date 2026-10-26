import type {
  BodyCategory,
  Care,
  Days,
  DiagnosisSummary,
  Gender,
  Goal,
  JointAlert,
  Level,
  Minutes,
  Place,
  Profile,
  RoutineClusterId,
  TimeMode,
} from '@/data/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COURTESY_CODE_RE = /^[A-Z0-9_-]{4,32}$/

const GOALS: readonly Goal[] = [
  'masa',
  'grasa',
  'fuerza',
  'recomposicion',
  'cero',
  'ganar_masa',
  'marcar_tonificar',
  'bajar_peso',
]
const GENDERS: readonly Gender[] = ['hombre', 'mujer']
const DAYS_LIST: readonly Days[] = [2, 3, 4, 5, 6]
const MINUTES_LIST: readonly Minutes[] = [30, 45, 60, 75, 90, 120]
const PLACES: readonly Place[] = ['gym', 'barra-mancuernas', 'maquinas', 'casa', 'trx']
const LEVELS: readonly Level[] = ['nuevo', 'intermedio', 'avanzado', 'principiante']
const CARES: readonly Care[] = ['hombro', 'rodilla', 'espalda-baja', 'ninguna']
const JOINT_ALERTS: readonly JointAlert[] = [
  'hombro',
  'rodilla',
  'codo',
  'espalda-baja',
  'manguito_rotador_preventivo',
]
const CLUSTERS: readonly RoutineClusterId[] = ['H-3', 'H-4', 'H-5', 'M-3', 'M-4', 'M-5']
const TIME_MODES: readonly TimeMode[] = ['60_MIN', '90_MIN', '120_MIN']
const ENERGY_LEVELS = ['bajo', 'normal', 'alto'] as const
const BODY_CATEGORIES: readonly BodyCategory[] = ['bajo_peso', 'peso_ideal', 'sobrepeso', 'obesidad']

export function sanitizePlainText(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen)
}

export function validateEmail(raw: unknown): { ok: true; email: string } | { ok: false; error: string } {
  const email = sanitizePlainText(raw, 160).toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Ingresa un correo electrónico válido.' }
  }
  return { ok: true, email }
}

/**
 * Validación de contraseñas fuertes según directrices de seguridad:
 * - Mínimo 12 caracteres, máximo 128 caracteres.
 * - Se permiten todos los caracteres especiales y espacios.
 * TODO(security): Integrar validación opcional contra listas de contraseñas filtradas (k-anonymity HIBP) sin exponer el hash completo.
 */
export function validatePassword(raw: unknown): { ok: true; password: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Ingresa una contraseña válida.' }
  }
  if (raw.length < 12) {
    return { ok: false, error: 'La contraseña debe tener al menos 12 caracteres para proteger tu cuenta.' }
  }
  if (raw.length > 128) {
    return { ok: false, error: 'La contraseña no puede superar 128 caracteres.' }
  }
  return { ok: true, password: raw }
}

export function validateCourtesyCode(raw: unknown): { ok: true; code: string } | { ok: false; error: string } {
  const code = sanitizePlainText(raw, 32).toUpperCase()
  if (!COURTESY_CODE_RE.test(code)) {
    return {
      ok: false,
      error: 'El código de cortesía debe tener entre 4 y 32 letras, números o guiones.',
    }
  }
  return { ok: true, code }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const visible = local.slice(0, 2)
  return `${visible}***@${domain}`
}

function isOneOf<T extends string | number>(val: unknown, allowed: readonly T[]): val is T {
  return allowed.includes(val as T)
}

export function validateProfilePayload(raw: unknown): { ok: true; profile: Profile } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Datos de perfil inválidos.' }
  }
  const obj = raw as Record<string, unknown>

  const name = sanitizePlainText(obj.name, 60)
  if (!name) {
    return { ok: false, error: 'El nombre del atleta es obligatorio.' }
  }

  const goal: Goal = isOneOf(obj.goal, GOALS) ? obj.goal : 'ganar_masa'
  const days: Days = isOneOf(obj.days, DAYS_LIST) ? obj.days : 4
  const minutes: Minutes = isOneOf(obj.minutes, MINUTES_LIST) ? obj.minutes : 90
  const place: Place = isOneOf(obj.place, PLACES) ? obj.place : 'gym'
  const level: Level = isOneOf(obj.level, LEVELS) ? obj.level : 'intermedio'
  const care: Care = isOneOf(obj.care, CARES) ? obj.care : 'ninguna'
  const gender: Gender | undefined = isOneOf(obj.gender, GENDERS) ? obj.gender : undefined
  const sessionDuration =
    obj.session_duration_min === 60 || obj.session_duration_min === 90 || obj.session_duration_min === 120
      ? obj.session_duration_min
      : undefined
  const clusterId: RoutineClusterId | undefined = isOneOf(obj.cluster_id, CLUSTERS) ? obj.cluster_id : undefined
  const timeMode: TimeMode | undefined = isOneOf(obj.time_mode, TIME_MODES) ? obj.time_mode : undefined
  const energyLevel = isOneOf(obj.energy_level, ENERGY_LEVELS) ? obj.energy_level : 'normal'

  const rawAlerts = Array.isArray(obj.joint_alerts) ? obj.joint_alerts : []
  const jointAlerts = rawAlerts.filter((a): a is JointAlert => isOneOf(a, JOINT_ALERTS)).slice(0, 5)

  const ageNum = typeof obj.age === 'number' && Number.isFinite(obj.age) ? Math.round(obj.age) : 26
  const weightNum = typeof obj.weight_kg === 'number' && Number.isFinite(obj.weight_kg) ? Math.round(obj.weight_kg * 10) / 10 : 72
  const heightNum = typeof obj.height_cm === 'number' && Number.isFinite(obj.height_cm) ? Math.round(obj.height_cm) : 172

  const age = Math.min(95, Math.max(14, ageNum))
  const weightKg = Math.min(250, Math.max(35, weightNum))
  const heightCm = Math.min(235, Math.max(120, heightCmSafe(heightNum)))

  const naiuStack = Array.isArray(obj.naiu_stack)
    ? obj.naiu_stack
        .filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]{3,40}$/.test(s))
        .slice(0, 8)
    : undefined

  const favoriteOverrides: Record<string, string> = {}
  if (obj.favorite_overrides && typeof obj.favorite_overrides === 'object') {
    for (const [k, v] of Object.entries(obj.favorite_overrides as Record<string, unknown>).slice(0, 30)) {
      if (/^(SUP|INF)_[0-9A-Z_]{2,8}$/.test(k) && typeof v === 'string' && /^[a-z0-9-]{2,60}$/.test(v)) {
        favoriteOverrides[k] = v
      }
    }
  }

  let diagnosis: DiagnosisSummary | undefined
  if (obj.diagnosis && typeof obj.diagnosis === 'object') {
    const d = obj.diagnosis as Record<string, unknown>
    const bmi = typeof d.bmi === 'number' && Number.isFinite(d.bmi) ? Math.min(70, Math.max(10, Math.round(d.bmi * 10) / 10)) : 22
    const category: BodyCategory = isOneOf(d.category, BODY_CATEGORIES) ? d.category : 'peso_ideal'
    const categoryLabel = sanitizePlainText(d.categoryLabel, 80) || 'Peso ideal'
    const idealMin = typeof d.idealWeightMinKg === 'number' && Number.isFinite(d.idealWeightMinKg) ? Math.round(d.idealWeightMinKg * 10) / 10 : 55
    const idealMax = typeof d.idealWeightMaxKg === 'number' && Number.isFinite(d.idealWeightMaxKg) ? Math.round(d.idealWeightMaxKg * 10) / 10 : 75
    const delta = typeof d.weightDeltaKg === 'number' && Number.isFinite(d.weightDeltaKg) ? Math.round(d.weightDeltaKg * 10) / 10 : 0
    const suggestedGoal: Goal = isOneOf(d.suggestedGoal, GOALS) ? d.suggestedGoal : goal
    const headline = sanitizePlainText(d.headline, 240)
    const rawInsights = Array.isArray(d.aiInsights) ? d.aiInsights : []
    const aiInsights = rawInsights
      .map((item) => sanitizePlainText(item, 420))
      .filter((item) => item.length > 0)
      .slice(0, 5)
    const source: 'ai' | 'deterministic' = d.source === 'ai' ? 'ai' : 'deterministic'
    const generatedAt = sanitizePlainText(d.generatedAt, 40) || new Date().toISOString()

    if (headline) {
      diagnosis = {
        bmi,
        category,
        categoryLabel,
        idealWeightMinKg: idealMin,
        idealWeightMaxKg: idealMax,
        weightDeltaKg: delta,
        suggestedGoal,
        headline,
        aiInsights,
        source,
        generatedAt,
      }
    }
  }

  return {
    ok: true,
    profile: {
      name,
      goal,
      days,
      minutes,
      place,
      level,
      care,
      gender,
      session_duration_min: sessionDuration,
      joint_alerts: jointAlerts,
      cluster_id: clusterId,
      time_mode: timeMode,
      age,
      weight_kg: weightKg,
      height_cm: heightCm,
      energy_level: energyLevel,
      naiu_stack: naiuStack,
      ...(diagnosis ? { diagnosis } : {}),
      ...(Object.keys(favoriteOverrides).length > 0 ? { favorite_overrides: favoriteOverrides } : {}),
    },
  }
}

function heightCmSafe(n: number): number {
  return Number.isFinite(n) ? n : 170
}
