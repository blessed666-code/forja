'use client'

import { useMemo } from 'react'
import { buildPlan, type Plan, type PlanSession } from '@/data/routines'
import { useHistory, useProfile } from '@/lib/store'

export function usePlan(): Plan {
  const profile = useProfile()
  return useMemo(() => buildPlan(profile), [profile])
}

export function useNextSession(): PlanSession | undefined {
  const plan = usePlan()
  const history = useHistory()
  if (plan.sessions.length === 0) return undefined
  return plan.sessions[history.length % plan.sessions.length]
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
