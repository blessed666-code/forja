'use client'

import { m } from 'framer-motion'
import { enterItem } from '@/lib/motionPresets'

interface SaludoHoyProps {
  firstName: string
}

export function SaludoHoy({ firstName }: SaludoHoyProps) {
  return (
    <m.header variants={enterItem} className="flex flex-col gap-1">
      <p className="text-sm text-muted">Hoy</p>
      <h1 className="font-display text-5xl font-bold leading-none">Hola, {firstName}.</h1>
    </m.header>
  )
}
