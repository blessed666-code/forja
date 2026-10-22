'use client'

import { m } from 'framer-motion'
import { enterItem } from '@/lib/motionPresets'

interface LineaEntrenoProps {
  line: string
}

export function LineaEntreno({ line }: LineaEntrenoProps) {
  return (
    <m.p variants={enterItem} className="text-pretty leading-relaxed">
      {line}
    </m.p>
  )
}
