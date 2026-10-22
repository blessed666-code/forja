'use client'

import { m } from 'framer-motion'
import { LineaNaiu } from '@/components/sections/LineaNaiu'
import { SaludoHoy } from '@/components/sections/SaludoHoy'
import { TarjetaDia } from '@/components/sections/TarjetaDia'
import { useMotionLevel } from '@/components/motion/useMotionLevel'
import type { HoyContent } from '@/lib/hoy'
import { enterContainer } from '@/lib/motionPresets'

export function HoyScreen({ firstName, sessionId, sessionName, weekdayLabel, minutes, line, macaHref, cacaoHref }: HoyContent) {
  const motionLevel = useMotionLevel()
  const isStatic = motionLevel === 'static'

  return (
    <m.div
      className="flex flex-col gap-8"
      initial={isStatic ? 'visible' : 'hidden'}
      animate="visible"
      variants={enterContainer}
    >
      <SaludoHoy firstName={firstName} />
      <TarjetaDia
        sessionName={sessionName}
        weekdayLabel={weekdayLabel}
        minutes={minutes}
        line={line}
        sessionHref={`/sesion/${sessionId}`}
      />
      {macaHref && cacaoHref ? <LineaNaiu macaHref={macaHref} cacaoHref={cacaoHref} /> : null}
    </m.div>
  )
}
