'use client'

import { useSyncExternalStore } from 'react'
import type { MotionLevel } from './motionLevel'

function readMotionLevel(): MotionLevel {
  const value = document.documentElement.dataset.motion
  if (value === 'full' || value === 'lite' || value === 'static') return value
  return 'lite'
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
  return () => observer.disconnect()
}

function readServerMotionLevel(): MotionLevel {
  return 'static'
}

export function useMotionLevel(): MotionLevel {
  return useSyncExternalStore(subscribe, readMotionLevel, readServerMotionLevel)
}
