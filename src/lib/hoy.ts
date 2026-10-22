import { NAIU_PRODUCTS } from '@/data/naiu'
import { buildPlan, repsWords, restWords, WEEKDAY_LABEL } from '@/data/routines'
import type { Profile } from '@/data/types'

export interface HoyContent {
  firstName: string
  sessionId: string
  sessionName: string
  weekdayLabel: string
  minutes: number
  line: string
  macaHref: string | null
  cacaoHref: string | null
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function getHoyContent(profile: Profile, historyCount: number): HoyContent | null {
  const plan = buildPlan(profile)
  if (plan.sessions.length === 0) return null
  const session = plan.sessions[historyCount % plan.sessions.length]
  if (!session) return null

  const lead = session.exercises.find((exercise) => exercise.muscle !== 'CARDIO' && !exercise.closer) ?? session.exercises[0]
  if (!lead) return null

  const leadName = lead.short ?? lead.name.toLowerCase()
  const maca = NAIU_PRODUCTS.find((product) => product.id === 'maca-negra')
  const cacao = NAIU_PRODUCTS.find((product) => product.id === 'cacao-seynekun')
  const isMassGoal = profile.goal === 'masa' || profile.goal === 'ganar_masa' || profile.goal === 'fuerza'
  const showShelf = Boolean(isMassGoal && maca && cacao)

  return {
    firstName: firstName(profile.name),
    sessionId: session.id,
    sessionName: session.name,
    weekdayLabel: WEEKDAY_LABEL[session.weekday] ?? '',
    minutes: profile.minutes,
    line: `Hoy el ${leadName} va en ${lead.sets} por ${repsWords(lead.reps)}. El descanso de ${restWords(lead.rest)} se cumple.`,
    macaHref: isMassGoal && maca ? maca.url : null,
    cacaoHref: isMassGoal && cacao ? cacao.url : null,
  }
}
