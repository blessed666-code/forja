'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isSession = pathname.startsWith('/sesion')

  if (isSession) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <TopBar />
      <main id="contenido" tabIndex={-1} className="flex flex-1 flex-col px-5 pt-2 pb-28 outline-none">
        {children}
      </main>
      {isSession ? null : <BottomNav />}
    </div>
  )
}
