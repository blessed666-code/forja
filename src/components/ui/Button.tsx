'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface ButtonProps {
  href: string
  children: ReactNode
}

const MotionLink = m.create(Link)

export function Button({ href, children }: ButtonProps) {
  return (
    <MotionLink
      href={href}
      whileTap={{ scale: 0.98 }}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary text-lg font-semibold text-primary-ink focus-visible:outline-primary-ink"
    >
      {children}
    </MotionLink>
  )
}
