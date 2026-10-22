'use client'

import { Pause, Play } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { applyMotionLevel, MOTION_STORAGE_KEY } from './motionLevel'
import { useMotionLevel } from './useMotionLevel'

interface PauseMotionButtonProps {
  className?: string
  compact?: boolean
}

function subscribeNoop(): () => void {
  return () => undefined
}

function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}

export function PauseMotionButton({ className, compact = false }: PauseMotionButtonProps) {
  const motionLevel = useMotionLevel()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isClient = useIsClient()
  const isPaused = isClient && motionLevel === 'static'
  const label = !isClient ? 'Pausar' : prefersReducedMotion ? 'Sin movimiento' : isPaused ? 'Reanudar' : 'Pausar'

  const handleClick = (): void => {
    if (prefersReducedMotion) return
    window.localStorage.setItem(MOTION_STORAGE_KEY, isPaused ? 'auto' : 'static')
    applyMotionLevel()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={prefersReducedMotion}
      aria-pressed={isPaused}
      className={className}
    >
      {isPaused ? <Play aria-hidden="true" size={18} /> : <Pause aria-hidden="true" size={18} />}
      {compact ? <span className="sr-only">{label}</span> : label}
    </button>
  )
}
