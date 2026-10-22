'use client'

import { useEffect, useRef } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import type { LenisRef } from 'lenis/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionLevel } from './useMotionLevel'

gsap.registerPlugin(ScrollTrigger)

interface SmoothScrollProps {
  lerp?: number
}

export function SmoothScroll({ lerp = 0.1 }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null)
  const motionLevel = useMotionLevel()

  useLenis(() => {
    ScrollTrigger.update()
  })

  useEffect(() => {
    const update = (time: number): void => {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [])

  if (motionLevel === 'static') return null

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, anchors: true, stopInertiaOnNavigate: true, lerp, syncTouch: false }}
    />
  )
}
