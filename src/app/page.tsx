'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasCompletedOnboarding, syncSessionFromServer } from '@/lib/store'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    void syncSessionFromServer(true).then((meta) => {
      if (meta.enforced && !meta.authenticated) {
        router.replace('/acceso')
        return
      }
      if (hasCompletedOnboarding()) {
        router.replace('/hoy')
      } else {
        router.replace('/quiz')
      }
    })
  }, [router])

  return (
    <main id="contenido" tabIndex={-1} className="flex min-h-dvh items-center justify-center bg-bg text-text outline-none">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-mono text-xs tracking-widest uppercase text-muted">Verificando sesión FORJA...</span>
      </div>
    </main>
  )
}
