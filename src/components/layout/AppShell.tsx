'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'
import { hasCompletedOnboarding, syncSessionFromServer } from '@/lib/store'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isSession = pathname.startsWith('/sesion')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    void syncSessionFromServer().then((meta) => {
      if (!active) return
      if (meta.enforced && !meta.authenticated) {
        router.replace('/acceso')
        return
      }
      if (!hasCompletedOnboarding() && !pathname.startsWith('/quiz') && !pathname.startsWith('/admin')) {
        router.replace('/quiz')
        return
      }
      setChecked(true)
    })
    return () => {
      active = false
    }
  }, [pathname, router])

  if (!checked) {
    return (
      <main id="contenido" tabIndex={-1} className="flex min-h-dvh items-center justify-center bg-bg text-text outline-none">
        <span className="font-mono text-xs tracking-widest uppercase text-muted">Cargando tu plan...</span>
      </main>
    )
  }

  if (isSession) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <TopBar />
      <main id="contenido" tabIndex={-1} className="flex flex-1 flex-col px-5 pt-2 pb-28 outline-none">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
