import { NAIU_PRODUCTS } from '@/data/naiu'
import { buildPlan, repsWords, restWords, WEEKDAY_LABEL, type SessionBlock } from '@/data/routines'
import type { DiagnosisSummary, HistoryEntry, Profile } from '@/data/types'

export interface HoyDayItem {
  id: string
  dayNumber: number
  name: string
  weekdayLabel: string
  isDoneThisCycle: boolean
  isActive: boolean
}

export interface HoyPhaseChip {
  phase: SessionBlock['phase']
  title: string
  detail: string
}

export interface HoyContent {
  firstName: string
  sessionId: string
  dayNumber: number
  totalDays: number
  sessionName: string
  weekdayLabel: string
  minutes: number
  mainCount: number
  strengthPreview: string[]
  phaseChips: HoyPhaseChip[]
  daysStrip: HoyDayItem[]
  diagnosis?: DiagnosisSummary
  line: string
  macaHref: string | null
  cacaoHref: string | null
}

function extractFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Atleta'
}

export function getHoyContent(
  profile: Profile,
  historyCount: number,
  historyEntries: HistoryEntry[] = [],
): HoyContent | null {
  const plan = buildPlan(profile)
  if (plan.sessions.length === 0) return null

  const activeIdx = historyCount % plan.sessions.length
  const session = plan.sessions[activeIdx]
  if (!session) return null

  const strengthBlock = session.blocks.find((b) => b.phase === 'strength')
  const lead =
    strengthBlock?.exercises[0] ??
    session.exercises.find((exercise) => exercise.muscle !== 'CARDIO' && !exercise.closer) ??
    session.exercises[0]
  if (!lead) return null

  const leadName = lead.short ?? lead.name.toLowerCase()
  const maca = NAIU_PRODUCTS.find((product) => product.id === 'maca-negra')
  const cacao = NAIU_PRODUCTS.find((product) => product.id === 'cacao-seynekun')
  const isMassGoal = profile.goal === 'masa' || profile.goal === 'ganar_masa' || profile.goal === 'fuerza'

  const currentCycleCompletedCount = historyCount % plan.sessions.length
  const recentEntries = historyEntries.slice(-currentCycleCompletedCount)
  const doneIdsInCycle = new Set(recentEntries.map((e) => e.sessionId))

  const daysStrip: HoyDayItem[] = plan.sessions.map((item, idx) => ({
    id: item.id,
    dayNumber: item.dayNumber,
    name: item.name,
    weekdayLabel: WEEKDAY_LABEL[item.weekday] ?? '',
    isDoneThisCycle: idx < activeIdx || doneIdsInCycle.has(item.id),
    isActive: idx === activeIdx,
  }))

  const phaseChips: HoyPhaseChip[] = session.blocks.map((b) => {
    if (b.phase === 'warmup') {
      return {
        phase: b.phase,
        title: '1. Calentamiento',
        detail: `${b.exercises.length} activaciones · ${b.durationMinutes} min`,
      }
    }
    if (b.phase === 'strength') {
      return {
        phase: b.phase,
        title: `2. ${session.mainCount} Ejercicios`,
        detail: `Bloque principal · ${b.durationMinutes} min`,
      }
    }
    if (b.phase === 'abs') {
      return {
        phase: b.phase,
        title: '3. Abdomen',
        detail: `${b.laps ?? 3} vueltas · ${b.durationMinutes} min`,
      }
    }
    return {
      phase: b.phase,
      title: '4. Cardio',
      detail: `${b.durationMinutes} min cierre`,
    }
  })

  return {
    firstName: extractFirstName(profile.name),
    sessionId: session.id,
    dayNumber: session.dayNumber,
    totalDays: plan.sessions.length,
    sessionName: session.name,
    weekdayLabel: WEEKDAY_LABEL[session.weekday] ?? '',
    minutes: profile.session_duration_min ?? profile.minutes,
    mainCount: session.mainCount,
    strengthPreview: session.strengthPreview,
    phaseChips,
    daysStrip,
    diagnosis: profile.diagnosis,
    line: `Arrancas fuerza con ${leadName}: ${lead.sets} series de ${repsWords(lead.reps)} y descanso estricto de ${restWords(lead.rest)}.`,
    macaHref: isMassGoal && maca ? maca.url : null,
    cacaoHref: isMassGoal && cacao ? cacao.url : null,
  }
}
