import { ROUTINE_CLUSTERS, TIME_MODULATIONS, resolveClusterId, resolveTimeMode } from './clusters'
import { EXERCISES, getExercise } from './exercises'
import { ABS_CIRCUITS, WARMUP_LOWER, WARMUP_UPPER } from './fixedBlocks'
import { BIOMECHANICAL_SLOTS, getSlotExerciseId } from './slots'
import type { Days, Equipment, Exercise, JointAlert, Place, Profile, SessionPhase, SlotId } from './types'

/** Plantillas de día y splits clásicos (respaldo casa / TRX) */
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
    ids: ['sentadilla-barra', 'peso-muerto-rumano', 'zancada-barra', 'extension-rodilla', 'curl-femoral', 'estiramiento-isquios'],
  },
  'torso-b': {
    name: 'Torso B',
    ids: ['press-inclinado-mancuernas', 'remo-mancuerna', 'press-militar-barra', 'remo-polea-sentado', 'curl-barra', 'plancha-frontal'],
  },
  'pierna-b': {
    name: 'Pierna B',
    ids: ['peso-muerto-barra', 'prensa', 'sentadilla-bulgara', 'curl-femoral', 'extension-rodilla', 'estiramiento-isquios'],
  },
  'full-a': {
    name: 'Full body A',
    ids: ['sentadilla-barra', 'press-banca-barra', 'remo-barra-supino', 'press-hombro-mancuernas', 'curl-barra', 'plancha-frontal'],
  },
  'full-b': {
    name: 'Full body B',
    ids: ['peso-muerto-barra', 'press-inclinado-mancuernas', 'jalon-polea', 'zancada-barra', 'triceps-polea', 'estiramiento-isquios'],
  },
  'full-c': {
    name: 'Full body C',
    ids: ['prensa', 'fondos', 'remo-polea-sentado', 'elevaciones-laterales', 'peso-muerto-rumano', 'deadbug'],
  },
  empuje: {
    name: 'Empuje',
    ids: ['press-banca-barra', 'press-militar-barra', 'press-inclinado-mancuernas', 'elevaciones-laterales', 'fondos', 'plancha-frontal'],
  },
  jalon: {
    name: 'Jalón',
    ids: ['remo-barra-supino', 'jalon-polea', 'remo-mancuerna', 'remo-polea-sentado', 'curl-barra', 'plancha-frontal'],
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

export interface SessionBlock {
  phase: SessionPhase
  title: string
  subtitle: string
  durationMinutes: number
  laps?: number
  workIntervalSec?: number
  transitionSec?: number
  restBetweenLapsSec?: number
  notes?: string
  exercises: Exercise[]
}

export interface PlanSession {
  id: string
  dayNumber: number
  name: string
  weekday: number
  /** Los 5 bloques/ejercicios principales de fuerza del día */
  mainCount: number
  /** Resumen legible de los 5 bloques principales del día */
  strengthPreview: string[]
  /** Estructura completa por etapas: Calentamiento -> Fuerza (5) -> Abdomen -> Cardio */
  blocks: SessionBlock[]
  /** Lista plana total preservada para compatibilidad interna */
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

function buildStrengthExercise(
  slotId: SlotId,
  blockNumber: number,
  profile: Profile,
  alerts: JointAlert[] | undefined,
  sets: number,
  rest: number,
  badge?: string,
): Exercise {
  const exId = profile.favorite_overrides?.[slotId] ?? getSlotExerciseId(slotId, alerts)
  const base = getExercise(exId) ?? EXERCISES[0]
  return {
    ...base,
    slot_id: slotId,
    sets,
    rest,
    phase: 'strength',
    block_number: blockNumber,
    block_badge: badge,
  }
}

export function buildPlan(profile: Profile): Plan {
  const isDeterministicEligible =
    Boolean(profile.cluster_id) || (Boolean(profile.gender) && profile.days >= 3 && profile.days <= 5)

  if (isDeterministicEligible && profile.place === 'gym') {
    const clusterId = profile.cluster_id ?? resolveClusterId(profile.gender ?? 'hombre', profile.days)
    const clusterDef = ROUTINE_CLUSTERS[clusterId]

    if (clusterDef) {
      const minutes = profile.session_duration_min ?? profile.minutes
      const timeMode = profile.time_mode ?? resolveTimeMode(minutes)
      const mod = TIME_MODULATIONS[timeMode]
      const isBeginner = profile.level === 'principiante' || profile.level === 'nuevo'

      const baseAlerts: JointAlert[] = [
        ...(profile.joint_alerts ?? []),
        ...(profile.care !== 'ninguna' ? [profile.care] : []),
      ]
      // Si el diagnóstico corporal detecta sobrepeso alto (obesidad), activar cuidado preventivo de rodilla en impacto
      if (profile.diagnosis?.category === 'obesidad' && !baseAlerts.includes('rodilla')) {
        baseAlerts.push('rodilla')
      }
      const alerts = baseAlerts.length > 0 ? baseAlerts : undefined

      const shouldIncludeCardio =
        mod.hasCardio ||
        profile.goal === 'bajar_peso' ||
        profile.goal === 'grasa' ||
        profile.diagnosis?.category === 'sobrepeso' ||
        profile.diagnosis?.category === 'obesidad'

      const sessions: PlanSession[] = clusterDef.sessions.map((sessionDef, sessionIdx) => {
        // FASE 1: Calentamiento & Blindaje Articular
        const warmupBlock = sessionDef.warmup === 'WARMUP_UPPER' ? WARMUP_UPPER : WARMUP_LOWER
        const warmupExercises: Exercise[] = warmupBlock.exercises.map((e, idx) => ({
          ...e,
          sets: mod.mode === '60_MIN' ? 1 : e.sets,
          phase: 'warmup',
          block_number: idx + 1,
        }))

        // FASE 2: Los 5 Bloques Principales de Fuerza (1 a 5 exactos en cada día)
        const strengthExercises: Exercise[] = []
        const strengthPreview: string[] = []

        sessionDef.strengthBlocks.forEach((entry, blockIdx) => {
          const blockNumber = blockIdx + 1

          let sets = mod.seriesCount
          let rest = mod.restSeconds
          if (isBeginner) {
            sets = 3
            rest = 90
          } else if (mod.mode === '60_MIN') {
            sets = 3
            rest = 75
          } else if (mod.mode === '90_MIN') {
            sets = blockIdx < 2 ? 4 : 3
            rest = blockIdx < 2 ? 120 : 90
          } else if (mod.mode === '120_MIN') {
            sets = blockIdx < 3 ? 4 : 3
            rest = blockIdx < 3 ? 150 : 120
          }

          if (typeof entry === 'string') {
            const badge =
              mod.mode === '60_MIN' && blockIdx >= 3 ? `Bloque ${blockNumber} · Biserie Express` : `Ejercicio ${blockNumber} de 5`
            const built = buildStrengthExercise(entry, blockNumber, profile, alerts, sets, rest, badge)
            strengthExercises.push(built)
            strengthPreview.push(`${blockNumber}. ${built.name}`)
          } else {
            const [slotA, slotB] = entry
            const exA = buildStrengthExercise(
              slotA,
              blockNumber,
              profile,
              alerts,
              3,
              20,
              `Bloque ${blockNumber}A · Biserie`,
            )
            const exB = buildStrengthExercise(
              slotB,
              blockNumber,
              profile,
              alerts,
              3,
              90,
              `Bloque ${blockNumber}B · Biserie`,
            )
            strengthExercises.push(exA, exB)
            strengthPreview.push(`${blockNumber}. Biserie: ${exA.name} + ${exB.name}`)
          }
        })

        // FASE 3: Circuito Oficial de Abdomen (2 o 3 vueltas)
        const absCircuit = ABS_CIRCUITS[sessionDef.absCircuit]
        const absExercises: Exercise[] = absCircuit.exercises.map((e, idx) => ({
          ...e,
          sets: mod.absLaps,
          phase: 'abs',
          block_number: idx + 1,
        }))

        // FASE 4: Cardio Metabólico
        let cardioExercises: Exercise[] = []
        let effectiveCardioNotes = sessionDef.cardioNotes
        if (shouldIncludeCardio && sessionDef.cardioExerciseId) {
          const lowImpactNeeded = Boolean(alerts?.includes('rodilla') || profile.diagnosis?.category === 'obesidad')
          const cardioId = lowImpactNeeded ? 'caminadora-inclinada' : sessionDef.cardioExerciseId
          if (lowImpactNeeded) {
            effectiveCardioNotes = '10 min Caminadora inclinada 10-14% sin trote (bajo impacto articular).'
          }
          const cardio = getExercise(cardioId)
          if (cardio) {
            cardioExercises = [{ ...cardio, phase: 'cardio', block_number: 1 }]
          }
        }

        const blocks: SessionBlock[] = [
          {
            phase: 'warmup',
            title: 'Calentamiento',
            subtitle: warmupBlock.name,
            durationMinutes: mod.warmupMinutes,
            notes: warmupBlock.focus,
            exercises: warmupExercises,
          },
          {
            phase: 'strength',
            title: '5 Ejercicios',
            subtitle: 'Bloque Principal de Fuerza',
            durationMinutes: mod.strengthMinutes,
            notes: isBeginner
              ? 'Progresión controlada a 3 series cuidando técnica (RIR 2).'
              : 'Respeta descansos y esfuerzo RIR indicado en cada movimiento.',
            exercises: strengthExercises,
          },
          {
            phase: 'abs',
            title: 'Abdomen',
            subtitle: absCircuit.name,
            durationMinutes: mod.absMinutes,
            laps: mod.absLaps,
            workIntervalSec: absCircuit.workIntervalSec,
            transitionSec: absCircuit.transitionSec,
            restBetweenLapsSec: absCircuit.restBetweenLapsSec,
            notes: `${mod.absLaps} vueltas · ${absCircuit.workIntervalSec}s trabajo / ${absCircuit.transitionSec}s transición · ${absCircuit.restBetweenLapsSec}s al cerrar vuelta.`,
            exercises: absExercises,
          },
        ]

        if (cardioExercises.length > 0) {
          blocks.push({
            phase: 'cardio',
            title: 'Cardio',
            subtitle: 'Cierre Metabólico',
            durationMinutes: mod.cardioMinutes > 0 ? mod.cardioMinutes : 10,
            notes: effectiveCardioNotes,
            exercises: cardioExercises,
          })
        }

        const exercises = [...warmupExercises, ...strengthExercises, ...absExercises, ...cardioExercises]

        return {
          id: sessionDef.id,
          dayNumber: sessionIdx + 1,
          name: sessionDef.name,
          weekday: sessionDef.weekday,
          mainCount: 5,
          strengthPreview,
          blocks,
          exercises,
          warmupName: warmupBlock.name,
          absName: absCircuit.name,
          cardioNotes: cardioExercises.length > 0 ? effectiveCardioNotes : undefined,
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

  // Fallback para casa / TRX
  const split = SPLITS[profile.days] ?? SPLITS[4]
  const allowed = ALLOWED_EQUIPMENT[profile.place] ?? ALLOWED_EQUIPMENT.gym
  const suffix = profile.place === 'casa' ? ' · en casa' : profile.place === 'trx' ? ' · TRX' : ''

  const sessions: PlanSession[] = split.templates.map((templateId, index) => {
    const template = TEMPLATES[templateId]
    const used = new Set<string>()
    const base = template.ids.map((id) => getExercise(id)).filter((e): e is Exercise => Boolean(e))
    const main = base.filter((e) => !e.closer).slice(0, 5)
    const closers = base.filter((e) => e.closer)

    const resolvedMain = main.map((e, idx) => {
      const r = resolve(e, allowed, used)
      used.add(r.id)
      const adjusted = profile.level === 'nuevo' ? { ...r, sets: Math.max(2, r.sets - 1) } : r
      return {
        ...adjusted,
        phase: 'strength' as const,
        block_number: idx + 1,
        block_badge: `Ejercicio ${idx + 1} de ${main.length}`,
      }
    })

    const resolvedClosers = closers.map((e, idx) => ({
      ...e,
      phase: 'abs' as const,
      block_number: idx + 1,
    }))

    const movilidad = getExercise('movilidad-8')
    const warmupList: Exercise[] = movilidad ? [{ ...movilidad, phase: 'warmup', block_number: 1 }] : []

    const blocks: SessionBlock[] = []
    if (warmupList.length > 0) {
      blocks.push({
        phase: 'warmup',
        title: 'Calentamiento',
        subtitle: 'Movilidad Articular Inicial',
        durationMinutes: 8,
        exercises: warmupList,
      })
    }
    blocks.push({
      phase: 'strength',
      title: `${resolvedMain.length} Ejercicios`,
      subtitle: 'Bloque Principal',
      durationMinutes: 40,
      exercises: resolvedMain,
    })
    if (resolvedClosers.length > 0) {
      blocks.push({
        phase: 'abs',
        title: 'Core / Cierre',
        subtitle: 'Estabilidad y Vuelta a la Calma',
        durationMinutes: 10,
        laps: 2,
        exercises: resolvedClosers,
      })
    }

    const exercises = [...warmupList, ...resolvedMain, ...resolvedClosers]
    return {
      id: `dia-${index + 1}`,
      dayNumber: index + 1,
      name: template.name,
      weekday: split.weekdays[index],
      mainCount: resolvedMain.length,
      strengthPreview: resolvedMain.map((item, i) => `${i + 1}. ${item.name}`),
      blocks,
      exercises,
    }
  })

  return { splitName: split.name + suffix, sessions }
}

export function substitutesFor(ex: Exercise, place: Place): Exercise[] {
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
  15: 'quince segundos',
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
