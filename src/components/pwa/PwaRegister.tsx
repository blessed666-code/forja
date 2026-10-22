'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('PWA: Error al registrar service worker:', err)
        })
      })
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  if (!installPrompt || dismissed) return null

  return (
    <aside
      aria-label="Instalación de aplicación"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border border-primary/30 bg-surface-2 p-3.5 shadow-2xl shadow-black/80 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-bold text-primary-ink">
            F
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Instalar FORJA en tu celular</p>
            <p className="text-xs text-muted">Acceso directo y entreno sin internet</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInstall}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-ink transition-transform active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Instalar
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Cerrar aviso de instalación"
            className="rounded-lg p-1 text-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
