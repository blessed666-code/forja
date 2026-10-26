'use client'

import { ArrowRight, CheckCircle2, Flame, Layers, ShieldCheck } from 'lucide-react'
import { m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LineaEntreno } from '@/components/sections/LineaEntreno'
import type { HoyPhaseChip } from '@/lib/hoy'
import { enterItem } from '@/lib/motionPresets'
import { readSessionDraft } from '@/lib/store'

interface TarjetaDiaProps {
  sessionId: string
  dayNumber: number
  totalDays: number
  sessionName: string
  weekdayLabel: string
  minutes: number
  mainCount: number
  strengthPreview: string[]
  phaseChips: HoyPhaseChip[]
  line: string
  sessionHref: string
}

export function TarjetaDia({
  sessionId,
  dayNumber,
  totalDays,
  sessionName,
  weekdayLabel,
  minutes,
  mainCount,
  strengthPreview,
  phaseChips,
  line,
  sessionHref,
}: TarjetaDiaProps) {
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    const draft = readSessionDraft(sessionId)
    setHasDraft(Boolean(draft && (draft.setsDone > 0 || draft.phaseIdx > 0)))
  }, [sessionId])

  return (
    <m.section
      variants={enterItem}
      aria-labelledby="sesion-hoy"
      className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-surface-2 px-3 py-1 font-mono text-xs font-semibold text-primary uppercase">
          Día {dayNumber} de {totalDays} · {mainCount} Ejercicios
        </span>
        <p className="font-mono text-xs text-muted">
          {weekdayLabel} · {minutes} min
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 id="sesion-hoy" className="font-display text-4xl font-bold uppercase leading-none">
          {sessionName}
        </h2>
        <LineaEntreno line={line} />
      </div>

      {/* Etapas estructuradas del día */}
      <div className="grid grid-cols-2 gap-2" aria-label="Etapas del entrenamiento de hoy">
        {phaseChips.map((chip) => (
          <div
            key={chip.phase}
            className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 ${
              chip.phase === 'strength'
                ? 'border-primary/40 bg-surface-2'
                : 'border-border bg-bg'
            }`}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
              {chip.phase === 'warmup' && <ShieldCheck className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />}
              {chip.phase === 'strength' && <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
              {chip.phase === 'abs' && <CheckCircle2 className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />}
              {chip.phase === 'cardio' && <Flame className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}
              {chip.title}
            </span>
            <span className="font-mono text-[11px] text-muted">{chip.detail}</span>
          </div>
        ))}
      </div>

      {/* Vista previa exacta de los 5 ejercicios principales */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-bg p-3.5">
        <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
          Tus {mainCount} bloques principales de hoy
        </span>
        <ol className="flex flex-col gap-1.5 text-sm text-text">
          {strengthPreview.map((item) => (
            <li key={item} className="leading-snug">
              {item}
            </li>
          ))}
        </ol>
      </div>

      <Button href={sessionHref}>
        {hasDraft ? `Retomar Día ${dayNumber}` : `Empezar Día ${dayNumber}`}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Button>
    </m.section>
  )
}
