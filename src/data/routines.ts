import { ROUTINE_CLUSTERS, TIME_MODULATIONS, resolveClusterId, resolveTimeMode } from './clusters'
import { EXERCISES, getExercise } from './exercises'
import { ABS_CIRCUITS, WARMUP_LOWER, WARMUP_UPPER } from './fixedBlocks'
import { BIOMECHANICAL_SLOTS, getSlotExerciseId } from './slots'
import type { Days, Equipment, Exercise, Place, Profile } from './types'

/** Plantillas de día y splits clásicos */
type TemplateId =
  | 'torso-a'
  | 'pierna-a'
  | 'torso-b'
  | 'pierna-b'
  | 'full-a'
  | 'full-b'
  | 'full-c'
  | 'empuje'
  | 'jalon'
  | 'pierna'

const TEMPLATES: Record<TemplateId, { name: string; ids: string[] }> = {
  'torso-a': {
    name: 'Torso A',
    ids: ['press-banca-barra', 'remo-barra-supino', 'press-hombro-mancuernas', 'jalon-polea', 'fondos', 'plancha-frontal'],
  },
  'pierna-a': {
    name: 'Pierna A',
    ids: ['sentadilla-barra', 'peso-muerto-rumano', 'zancada-barra', 'extension-rodilla', 'estiramiento-isquios'],
  },
  'torso-b': {
    name: 'Torso B',
    ids: ['press-inclinado-mancuernas', 'remo-mancuerna', 'press-militar-barra', 'remo-polea-sentado', 'curl-barra', 'triceps-polea'],
  },
  'pierna-b': {
    name: 'Pierna B',
    ids: ['peso-muerto-barra', 'prensa', 'sentadilla-bulgara', 'curl-femoral', 'estiramiento-isquios'],
  },
  'full-a': {
    name: 'Full body A',
    ids: ['sentadilla-barra', 'press-banca-barra', 'remo-barra-supino', 'press-hombro-mancuernas', 'plancha-frontal', 'estiramiento-isquios'],
  },
  'full-b': {
    name: 'Full body B',
    ids: ['peso-muerto-barra', 'press-inclinado-mancuernas', 'jalon-polea', 'zancada-barra', 'curl-barra', 'estiramiento-isquios'],
  },
  'full-c': {
    name: 'Full body C',
    ids: ['prensa', 'fondos', 'remo-polea-sentado', 'elevaciones-laterales', 'peso-muerto-rumano', 'deadbug', 'estiramiento-isquios'],
  },
  empuje: {
    name: 'Empuje',
    ids: ['press-banca-barra', 'press-militar-barra', 'press-inclinado-mancuernas', 'elevaciones-laterales', 'fondos', 'triceps-polea'],
  },
  jalon: {
    name: 'Jalón',
    ids: ['remo-barra-supino', 'jalon-polea', 'remo-mancuerna', 'remo-polea-sentado', 'curl-barra', 'curl-mancuernas'],
  },
  pierna: {
    name: 'Pierna',
    ids: ['sentadilla-barra', 'peso-muerto-rumano', 'prensa', 'curl-femoral', 'extension-rodilla', 'estiramiento-isquios'],
  },
}

const SPLITS: Record<Days, { name: string; templates: TemplateId[]; weekdays: number[] }> = {
  2: { name: 'Full body A/B', templates: ['full-a', 'full-b'], weekdays: [0, 3] },
  3: { name: 'Full body A/B/C', templates: ['full-a', 'full-b', 'full-c'], weekdays: [0, 2, 4] },
  4: { name: 'Torso / Pierna', templates: ['torso-a', 'pierna-a', 'torso-b', 'pierna-b'], weekdays: [0, 1, 3, 4] },
  5: {
    name: 'Empuje · Jalón · Pierna · Torso · Pierna',
    templates: ['empuje', 'jalon', 'pierna', 'torso-a', 'pierna-b'],
    weekdays: [0, 1, 2, 4, 5],
  },
  6: {
    name: 'Empuje · Jalón · Pierna ×2',
    templates: ['empuje', 'jalon', 'pierna', 'empuje', 'jalon', 'pierna'],
    weekdays: [0, 1, 2, 3, 4, 5],
  },
}

export const WEEKDAY_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export const ALLOWED_EQUIPMENT: Record<Place, Equipment[]> = {
  gym: ['barra', 'mancuerna', 'maquina', 'polea', 'banda', 'peso-corporal'],
  'barra-mancuernas': ['barra', 'mancuerna', 'peso-corporal', 'banda'],
  maquinas: ['maquina', 'polea', 'peso-corporal'],
  casa: ['peso-corporal', 'banda'],
  trx: ['trx', 'peso-corporal'],
}

export interface PlanSession {
  id: string
  name: string
  weekday: number
  exercises: Exercise[]
  warmupName?: string
  absName?: string
  cardioNotes?: string
}

export interface Plan {
  splitName: string
  clusterId?: string
  timeMode?: string
  sessions: PlanSession[]
}

function resolve(ex: Exercise, allowed: Equipment[], used: Set<string>): Exercise {
  if (allowed.includes(ex.equipment) && !(allowed.includes('trx') && !ex.closer && !ex.trx)) return ex
  const pool = EXERCISES.filter((c) => c.muscle === ex.muscle && allowed.includes(c.equipment) && !c.closer)
  const preferTrx = allowed.includes('trx') ? pool.filter((c) => c.trx) : pool
  const fresh = preferTrx.filter((c) => !used.has(c.id))
  return fresh.find((c) => c.pose === ex.pose) ?? fresh[0] ?? preferTrx[0] ?? pool[0] ?? ex
}

export function buildPlan(profile: Profile): Plan {
  // 1. Si el usuario cuenta con perfil determinista de género y días entre 3 y 5
  const isDeterministicEligible =
    Boolean(profile.cluster_id) || (Boolean(profile.gender) && profile.days >= 3 && profile.days <= 5)

  if (isDeterministicEligible && profile.place === 'gym') {
    const clusterId = profile.cluster_id ?? resolveClusterId(profile.gender ?? 'hombre', profile.days)
    const clusterDef = ROUTINE_CLUSTERS[clusterId]

    if (clusterDef) {
      const minutes = profile.session_duration_min ?? profile.minutes
      const timeMode = profile.time_mode ?? resolveTimeMode(minutes)
      const mod = TIME_MODULATIONS[timeMode]

      const maxStrengthExercises =
        profile.level === 'principiante' || profile.level === 'nuevo'
          ? 4
          : profile.level === 'intermedio'
            ? 5
            : 6

      const alerts = profile.joint_alerts ?? (profile.care !== 'ninguna' ? [profile.care] : undefined)

      const sessions: PlanSession[] = clusterDef.sessions.map((sessionDef) => {
        // Bloque 1: Calentamiento & Blindaje
        const warmupBlock = sessionDef.warmup === 'WARMUP_UPPER' ? WARMUP_UPPER : WARMUP_LOWER
        const warmupExercises = warmupBlock.exercises.map((e) => ({
          ...e,
          sets: mod.mode === '60_MIN' ? 1 : e.sets,
        }))

        // Bloque 2: Bloque de Fuerza modulado
        const selectedSlots = sessionDef.slots.slice(0, maxStrengthExercises)
        const strengthExercises = selectedSlots.map((slotId, index) => {
          let exId = profile.favorite_overrides?.[slotId]
          if (!exId) {
            exId = getSlotExerciseId(slotId, alerts)
          }
          const base = getExercise(exId) ?? EXERCISES[0]

          let sets = mod.seriesCount
          let rest = mod.restSeconds
          if (mod.mode === '90_MIN') {
            sets = index < 2 ? 4 : 3
            rest = index < 2 ? 120 : 90
          } else if (mod.mode === '120_MIN') {
            sets = index < 3 ? 4 : 3
            rest = index < 3 ? 150 : 120
          }

          return { ...base, sets, rest }
        })

        // Bloque 3: Circuito de Abdomen
        const absCircuit = ABS_CIRCUITS[sessionDef.absCircuit]
        const absExercises = absCircuit.exercises.map((e) => ({
          ...e,
          sets: mod.absLaps,
        }))

        // Bloque 4: Cardio
        let cardioExercises: Exercise[] = []
        if (mod.hasCardio && sessionDef.cardioExerciseId) {
          const cardio = getExercise(sessionDef.cardioExerciseId)
          if (cardio) cardioExercises = [cardio]
        }

        const exercises = [...warmupExercises, ...strengthExercises, ...absExercises, ...cardioExercises]

        return {
          id: sessionDef.id,
          name: sessionDef.name,
          weekday: sessionDef.weekday,
          exercises,
          warmupName: warmupBlock.name,
          absName: absCircuit.name,
          cardioNotes: sessionDef.cardioNotes,
        }
      })

      return {
        splitName: `${clusterDef.name} · ${timeMode.replace('_', ' ')}`,
        clusterId,
        timeMode,
        sessions,
      }
    }
  }

  // 2. Fallback a la rutina clásica para usuarios en casa, TRX o perfiles 2/6 días
  const split = SPLITS[profile.days] ?? SPLITS[4]
  const allowed = ALLOWED_EQUIPMENT[profile.place] ?? ALLOWED_EQUIPMENT.gym
  const maxMain = profile.minutes === 30 ? 4 : profile.minutes === 45 ? 5 : 6
  const suffix = profile.place === 'casa' ? ' · en casa' : profile.place === 'trx' ? ' · TRX' : ''

  const sessions = split.templates.map((templateId, index) => {
    const template = TEMPLATES[templateId]
    const used = new Set<string>()
    const base = template.ids.map((id) => getExercise(id)).filter((e): e is Exercise => Boolean(e))
    const main = base.filter((e) => !e.closer).slice(0, maxMain)
    const closers = base.filter((e) => e.closer)
    const resolved = [...main, ...closers].map((e) => {
      const r = resolve(e, allowed, used)
      used.add(r.id)
      return profile.level === 'nuevo' && !r.closer ? { ...r, sets: Math.max(2, r.sets - 1) } : r
    })
    const movilidad = getExercise('movilidad-8')
    const exercises = profile.place === 'casa' && movilidad ? [movilidad, ...resolved] : resolved
    return { id: `dia-${index + 1}`, name: template.name, weekday: split.weekdays[index], exercises }
  })

  return { splitName: split.name + suffix, sessions }
}

export function substitutesFor(ex: Exercise, place: Place): Exercise[] {
  // Si el ejercicio pertenece a un slot biomecánico, priorizar las alternativas del mismo slot
  if (ex.slot_id) {
    const slot = BIOMECHANICAL_SLOTS[ex.slot_id]
    if (slot) {
      const slotExerciseIds = [slot.defaultExerciseId, slot.machineAltId, slot.freeAltId].filter(
        (id) => id !== ex.id,
      )
      const slotExercises = slotExerciseIds
        .map((id) => getExercise(id))
        .filter((e): e is Exercise => Boolean(e))
      const otherPool = EXERCISES.filter(
        (c) =>
          c.id !== ex.id &&
          !slotExerciseIds.includes(c.id) &&
          c.muscle === ex.muscle &&
          !c.closer,
      )
      return [...slotExercises, ...otherPool]
    }
  }

  const allowed = ALLOWED_EQUIPMENT[place] ?? ALLOWED_EQUIPMENT.gym
  return EXERCISES.filter(
    (c) =>
      c.id !== ex.id &&
      c.muscle === ex.muscle &&
      !c.closer &&
      (allowed.includes(c.equipment) || c.equipment === ex.equipment),
  )
}

const REST_WORDS: Record<number, string> = {
  20: 'veinte segundos',
  30: 'treinta segundos',
  45: 'cuarenta y cinco segundos',
  60: 'un minuto',
  75: 'un minuto y cuarto',
  90: 'minuto y medio',
  120: 'dos minutos',
  150: 'dos minutos y medio',
  180: 'tres minutos',
}

export function restWords(seconds: number): string {
  return REST_WORDS[seconds] ?? `${seconds} segundos`
}

export function repsWords(reps: string): string {
  return reps.replace('–', ' a ')
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
