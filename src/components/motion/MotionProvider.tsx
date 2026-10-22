'use client'

import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'
import { FITNESS_SPRING } from '@/lib/motionPresets'

interface MotionProviderProps {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={FITNESS_SPRING}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
