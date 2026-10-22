'use client'

import { ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LineaEntreno } from '@/components/sections/LineaEntreno'
import { enterItem } from '@/lib/motionPresets'

interface TarjetaDiaProps {
  sessionName: string
  weekdayLabel: string
  minutes: number
  line: string
  sessionHref: string
}

export function TarjetaDia({ sessionName, weekdayLabel, minutes, line, sessionHref }: TarjetaDiaProps) {
  return (
    <m.section variants={enterItem} aria-labelledby="sesion-hoy" className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="sesion-hoy" className="font-display text-4xl font-bold uppercase leading-none">
          {sessionName}
        </h2>
        <p className="font-mono text-sm text-muted">
          {weekdayLabel} · {minutes} min
        </p>
      </div>
      <LineaEntreno line={line} />
      <Button href={sessionHref}>
        Empezar sesión
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Button>
    </m.section>
  )
}
