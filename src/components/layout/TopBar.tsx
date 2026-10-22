'use client'

import { PauseMotionButton } from '@/components/motion/PauseMotionButton'

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-bg px-5 py-3">
      <p className="font-display text-3xl font-bold leading-none tracking-wide">FORJA</p>
      <PauseMotionButton className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-text" />
    </header>
  )
}
