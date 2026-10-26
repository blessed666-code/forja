'use client'

import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ensureClientCsrfToken, hasCompletedOnboarding, syncSessionFromServer, useAccountMeta } from '@/lib/store'

type AuthMode = 'login' | 'register'

export function AccesoScreen() {
  const router = useRouter()
  const account = useAccountMeta()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [courtesyCode, setCourtesyCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    void syncSessionFromServer(true).then((meta) => {
      if (meta.authenticated) {
        router.replace(hasCompletedOnboarding() ? '/hoy' : '/quiz')
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)

    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json()) as {
        ok?: boolean
        onboardingCompleted?: boolean
        error?: string
      }

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'No fue posible iniciar sesión.')
        setSubmitting(false)
        return
      }

      await syncSessionFromServer(true)
      router.replace(data.onboardingCompleted ? '/hoy' : '/quiz')
    } catch {
      setErrorMsg('Error de conexión con el servidor. Intenta nuevamente.')
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)

    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          courtesyCode: courtesyCode.trim().toUpperCase(),
          name,
          email,
          password,
        }),
      })

      const data = (await res.json()) as {
        ok?: boolean
        requiresManualLogin?: boolean
        error?: string
      }

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'No se pudo activar la membresía.')
        setSubmitting(false)
        return
      }

      if (data.requiresManualLogin) {
        setMode('login')
        setSubmitting(false)
        return
      }

      await syncSessionFromServer(true)
      router.replace('/quiz')
    } catch {
      setErrorMsg('Error de red al activar el código de cortesía.')
      setSubmitting(false)
    }
  }

  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-between gap-8 px-5 py-8 outline-none"
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-surface-2 px-3 py-1 font-mono text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Acceso Exclusivo · ARKA &amp; NAIU
            </span>
          </div>
          <h1 className="mt-2 font-display text-6xl leading-none font-bold tracking-wide uppercase">FORJA</h1>
          <p className="text-sm leading-relaxed text-muted">
            Entrenamiento determinista de precisión y nutrición funcional. Ingresa con tu cuenta o canjea tu código de cortesía oficial.
          </p>
        </header>

        {account.ready && !account.configured && (
          <section
            aria-label="Estado de autenticación local"
            className="flex flex-col gap-2.5 rounded-xl border border-primary/40 bg-surface-2 p-4 text-xs leading-relaxed text-text"
          >
            <p className="font-semibold text-primary">
              Autenticación Local Activa (Cifrado BFF con scrypt + cookies HttpOnly)
            </p>
            <p className="text-muted">
              Puedes probar el registro e inicio de sesión completos usando el código de cortesía{' '}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-primary">FORJA-VIP-2026</code> o{' '}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-primary">NAIU-VIP</code>. Al conectar tus llaves de Supabase en <code className="font-mono">.env.local</code>, pasará automáticamente a PostgreSQL.
            </p>
            {!account.enforced && (
              <Link
                href="/quiz"
                className="mt-1 flex h-11 items-center justify-center rounded-md border border-primary/50 bg-surface px-4 font-semibold text-primary hover:bg-bg"
              >
                Ir directo al Quiz y Diagnóstico sin cuenta (Solo localhost)
              </Link>
            )}
          </section>
        )}

        {/* Selector de pestaña accesible */}
        <div role="tablist" aria-label="Tipo de acceso" className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1.5">
          <button
            role="tab"
            type="button"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login')
              setErrorMsg(null)
            }}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-primary text-primary-ink' : 'text-muted hover:text-text'
            }`}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Iniciar Sesión
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register')
              setErrorMsg(null)
            }}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-primary text-primary-ink' : 'text-muted hover:text-text'
            }`}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Código de Cortesía
          </button>
        </div>

        {errorMsg && (
          <div
            id="acceso-error"
            role="alert"
            className="rounded-xl border border-accent/60 bg-accent/10 px-4 py-3 text-sm text-text"
          >
            {errorMsg}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <label htmlFor="login-email" className="flex flex-col gap-1.5 text-sm font-medium">
              Correo electrónico
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errorMsg)}
                aria-describedby={errorMsg ? 'acceso-error' : undefined}
                placeholder="tu@correo.com"
                className="h-14 rounded-md border border-border bg-surface px-4 text-base text-text focus:border-primary focus:outline-none"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? 'acceso-error' : undefined}
                  placeholder="Tu contraseña segura"
                  className="h-14 w-full rounded-md border border-border bg-surface pr-12 pl-4 text-base text-text focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-1.5 flex h-11 w-11 items-center justify-center rounded-md text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="mt-2 flex h-14 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-ink transition-opacity disabled:opacity-40"
            >
              {submitting ? 'Verificando acceso...' : 'Entrar a FORJA'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
            <div className="rounded-xl border border-primary/30 bg-surface-2 p-3.5 text-xs leading-relaxed text-muted">
              <p className="flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Membresía Privada por Invitación
              </p>
              <p className="mt-1">
                Solo clientes con un Código de Cortesía activo entregado por ARKA o NAIU pueden crear su cuenta.
              </p>
            </div>

            <label htmlFor="reg-code" className="flex flex-col gap-1.5 text-sm font-medium">
              Código de Cortesía Oficial
              <input
                id="reg-code"
                type="text"
                required
                autoComplete="off"
                value={courtesyCode}
                onChange={(e) => setCourtesyCode(e.target.value.toUpperCase())}
                placeholder="Ej. FORJA-VIP-2026"
                className="h-14 rounded-md border border-primary/50 bg-surface px-4 font-mono text-base tracking-wider uppercase text-primary focus:border-primary focus:outline-none"
              />
            </label>

            <label htmlFor="reg-name" className="flex flex-col gap-1.5 text-sm font-medium">
              Tu nombre
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Camila Ríos"
                className="h-14 rounded-md border border-border bg-surface px-4 text-base text-text focus:border-primary focus:outline-none"
              />
            </label>

            <label htmlFor="reg-email" className="flex flex-col gap-1.5 text-sm font-medium">
              Correo electrónico
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-14 rounded-md border border-border bg-surface px-4 text-base text-text focus:border-primary focus:outline-none"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium">
                Crea tu contraseña (mínimo 12 caracteres)
              </label>
              <div className="relative flex items-center">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres"
                  className="h-14 w-full rounded-md border border-border bg-surface pr-12 pl-4 text-base text-text focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-1.5 flex h-11 w-11 items-center justify-center rounded-md text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !courtesyCode.trim() || !name.trim() || !email.trim() || password.length < 12}
              className="mt-2 flex h-14 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-ink transition-opacity disabled:opacity-40"
            >
              {submitting ? 'Activando membresía...' : 'Canjear Código y Configurar Rutina'}
            </button>
          </form>
        )}
      </div>

      <footer className="border-t border-border pt-4 text-xs text-muted">
        FORJA · ARKA Fitness AI · Aliado Oficial NAIU (naiu.bio) · Sesiones cifradas con cookies HttpOnly
      </footer>
    </main>
  )
}
