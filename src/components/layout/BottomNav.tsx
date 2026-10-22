'use client'

import { m } from 'framer-motion'
import { CalendarDays, Dumbbell, Library, MessageCircle, UserRound } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

const ITEMS: readonly NavItem[] = [
  { href: '/hoy', label: 'Hoy', icon: Dumbbell },
  { href: '/semana', label: 'Semana', icon: CalendarDays },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
  { href: '/coach', label: 'Coach', icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', icon: UserRound },
]

const MotionLink = m.create(Link)

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Secciones de FORJA"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={href} className="flex-1">
              <MotionLink
                href={href}
                aria-current={isActive ? 'page' : undefined}
                whileTap={{ scale: 0.97 }}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs ${
                  isActive ? 'font-semibold text-text' : 'text-muted'
                }`}
              >
                <span
                  className={`pointer-events-none flex h-8 w-12 items-center justify-center rounded-full ${
                    isActive ? 'bg-primary text-primary-ink' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {label}
              </MotionLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
