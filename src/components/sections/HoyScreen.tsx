'use client'

import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { LineaNaiu } from '@/components/sections/LineaNaiu'
import { SaludoHoy } from '@/components/sections/SaludoHoy'
import { TarjetaDia } from '@/components/sections/TarjetaDia'
import { useMotionLevel } from '@/components/motion/useMotionLevel'
import type { HoyContent } from '@/lib/hoy'
import { enterContainer, enterItem } from '@/lib/motionPresets'

export function HoyScreen({
  firstName,
  sessionId,
  dayNumber,
  totalDays,
  sessionName,
  weekdayLabel,
  minutes,
  mainCount,
  strengthPreview,
  phaseChips,
  daysStrip,
  diagnosis,
  line,
  macaHref,
  cacaoHref,
}: HoyContent) {
  const motionLevel = useMotionLevel()
  const isStatic = motionLevel === 'static'

  return (
    <m.div
      className="flex flex-col gap-6"
      initial={isStatic ? 'visible' : 'hidden'}
      animate="visible"
      variants={enterContainer}
    >
      <SaludoHoy firstName={firstName} />

      {/* Tira de progresión Día 1 -> Día N */}
      <m.nav variants={enterItem} aria-label="Progreso de días de tu rutina" className="-mx-5 overflow-x-auto px-5">
        <ol className="flex gap-2 pb-1">
          {daysStrip.map((d) => (
            <li key={d.id} className="shrink-0">
              <Link
                href={`/sesion/${d.id}`}
                aria-current={d.isActive ? 'step' : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  d.isActive
                    ? 'border-primary bg-primary text-primary-ink'
                    : d.isDoneThisCycle
                      ? 'border-primary/40 bg-surface-2 text-primary'
                      : 'border-border bg-surface text-muted hover:text-text'
                }`}
              >
                {d.isDoneThisCycle && !d.isActive && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>Día {d.dayNumber}</span>
                <span className={d.isActive ? 'text-primary-ink/80' : 'text-muted'}>· {d.weekdayLabel}</span>
              </Link>
            </li>
          ))}
        </ol>
      </m.nav>

      {/* Resumen de Diagnóstico Base + IA activo */}
      {diagnosis && (
        <m.section
          variants={enterItem}
          aria-label="Tu diagnóstico activo"
          className="flex flex-col gap-1.5 rounded-xl border border-primary/30 bg-surface-2 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Diagnóstico {diagnosis.source === 'ai' ? 'IA Activo' : 'Base Activo'}
            </span>
            <span className="font-mono text-xs text-muted">
              IMC {diagnosis.bmi} · {diagnosis.categoryLabel}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug text-text">{diagnosis.headline}</p>
        </m.section>
      )}

      <TarjetaDia
        sessionId={sessionId}
        dayNumber={dayNumber}
        totalDays={totalDays}
        sessionName={sessionName}
        weekdayLabel={weekdayLabel}
        minutes={minutes}
        mainCount={mainCount}
        strengthPreview={strengthPreview}
        phaseChips={phaseChips}
        line={line}
        sessionHref={`/sesion/${sessionId}`}
      />

      {macaHref && cacaoHref ? <LineaNaiu macaHref={macaHref} cacaoHref={cacaoHref} /> : null}
    </m.div>
  )
}
