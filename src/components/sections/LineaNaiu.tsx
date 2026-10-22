'use client'

import { m } from 'framer-motion'
import { enterItem } from '@/lib/motionPresets'

interface LineaNaiuProps {
  macaHref: string
  cacaoHref: string
}

export function LineaNaiu({ macaHref, cacaoHref }: LineaNaiuProps) {
  return (
    <m.p variants={enterItem} className="text-pretty text-sm leading-relaxed text-muted">
      Para la masa, una cucharada de{' '}
      <a href={macaHref} target="_blank" rel="noopener noreferrer" className="font-semibold whitespace-nowrap text-text underline underline-offset-4">
        maca negra
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>{' '}
      o{' '}
      <a href={cacaoHref} target="_blank" rel="noopener noreferrer" className="font-semibold whitespace-nowrap text-text underline underline-offset-4">
        cacao Seynekun
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>{' '}
      en el batido de la mañana.
    </m.p>
  )
}
