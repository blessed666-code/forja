'use client'

import { m } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { WEEKDAY_LABEL } from '@/data/routines'
import { FITNESS_SPRING } from '@/lib/motionPresets'
import { useHistory, useProfile } from '@/lib/store'
import { usePlan } from '@/lib/usePlan'

function startOfWeek(): Date {
  const now = new Date()
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return monday
}

export function SemanaScreen() {
  const plan = usePlan()
  const history = useHistory()
  const profile = useProfile()
  const monday = startOfWeek()
  const thisWeek = history.filter((entry) => new Date(entry.date) >= monday)
  const activeSession = plan.sessions.length > 0 ? plan.sessions[history.length % plan.sessions.length] : undefined

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted">{plan.splitName}</p>
        <h1 className="font-display text-5xl leading-none font-bold uppercase">Semana</h1>
        <p className="font-mono text-sm text-muted">
          {thisWeek.length} de {plan.sessions.length} sesiones cerradas · {profile.days} días
        </p>
      </header>
      <ol className="flex flex-col gap-2.5">
        {WEEKDAY_LABEL.map((label, index) => {
          const session = plan.sessions.find((item) => item.weekday === index)
          const isDone = Boolean(session && thisWeek.some((entry) => entry.sessionId === session.id))
          const isNext = Boolean(session && activeSession?.id === session.id)

          return (
            <li key={label}>
              {session ? (
                <m.div whileTap={{ scale: 0.98 }} transition={FITNESS_SPRING}>
                  <Link
                    href={`/sesion/${session.id}`}
                    className={`flex min-h-16 items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors ${
                      isNext ? 'border-primary bg-surface-2' : 'border-border bg-surface hover:border-primary/50'
                    }`}
                  >
                    <span className="w-10 font-mono text-sm text-muted">{label}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        <span>
                          Día {session.dayNumber} · {session.name}
                        </span>
                        {isNext && (
                          <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-ink">
                            Siguiente
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted">
                        Calentamiento · <strong className="font-semibold text-text">{session.mainCount} ejercicios de fuerza</strong> · Abdomen
                        {session.cardioNotes ? ' · Cardio' : ''}
                      </span>
                    </span>
                    {isDone ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Hecha</span>
                      </span>
                    ) : (
                      <span className="shrink-0 font-mono text-xs text-muted">Entrar</span>
                    )}
                  </Link>
                </m.div>
              ) : (
                <div className="flex min-h-12 items-center gap-4 rounded-lg px-4 py-2.5">
                  <span className="w-10 font-mono text-sm text-muted">{label}</span>
                  <span className="text-sm text-muted">Descanso y recuperación</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
