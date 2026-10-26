'use client'

import { ArrowLeft, Check, Copy, KeyRound, Plus, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ensureClientCsrfToken, useAccountMeta } from '@/lib/store'

interface CourtesyCodeRow {
  id: string
  code: string
  label: string
  max_uses: number
  uses_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface MemberRow {
  id: string
  maskedEmail: string
  name: string
  clusterId: string
  role: 'member' | 'admin'
  isActive: boolean
  courtesyCodeUsed: string | null
  onboardingCompleted: boolean
  createdAt: string
}

export function AdminScreen() {
  const account = useAccountMeta()
  const [codes, setCodes] = useState<CourtesyCodeRow[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [label, setLabel] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState(0)
  const [creating, setCreating] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      const data = (await res.json()) as {
        codes?: CourtesyCodeRow[]
        members?: MemberRow[]
        error?: string
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? 'No tienes permisos de administrador.')
        setLoading(false)
        return
      }
      setCodes(data.codes ?? [])
      setMembers(data.members ?? [])
    } catch {
      setErrorMsg('Error cargando datos desde Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleCreateCode = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setCreating(true)
    setErrorMsg(null)

    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          label: label.trim() || 'Cortesía Exclusiva FORJA',
          customCode: customCode.trim().toUpperCase(),
          maxUses,
          expiresInDays: expiresInDays > 0 ? expiresInDays : undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'Error al generar el código.')
        setCreating(false)
        return
      }
      setLabel('')
      setCustomCode('')
      setMaxUses(1)
      setExpiresInDays(0)
      await loadData()
    } catch {
      setErrorMsg('Error de conexión al crear código.')
    } finally {
      setCreating(false)
    }
  }

  const toggleCode = async (row: CourtesyCodeRow): Promise<void> => {
    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/admin/codes', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ id: row.id, isActive: !row.is_active }),
      })
      if (res.ok) {
        await loadData()
      }
    } catch {
      setErrorMsg('No se pudo actualizar el estado del código.')
    }
  }

  const toggleMember = async (member: MemberRow): Promise<void> => {
    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ userId: member.id, isActive: !member.isActive }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErrorMsg(data.error ?? 'No se pudo cambiar el estado del cliente.')
        return
      }
      await loadData()
    } catch {
      setErrorMsg('Error actualizando acceso del cliente.')
    }
  }

  const copyInviteMessage = async (row: CourtesyCodeRow): Promise<void> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteText = `¡Bienvenido a FORJA · ARKA Fitness AI!\n\nTu Código de Cortesía exclusivo es: ${row.code}\n\nActiva tu cuenta y rutina personalizada en:\n${origin}/acceso`
    try {
      await navigator.clipboard.writeText(inviteText)
      setCopiedId(row.id)
      window.setTimeout(() => setCopiedId(null), 2200)
    } catch {
      // Ignorar si el navegador restringe portapapeles
    }
  }

  if (account.ready && account.role !== 'admin') {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h1 className="font-display text-4xl font-bold uppercase">Zona Restringida</h1>
        <p className="text-sm text-muted">
          Este panel está habilitado únicamente para la cuenta administradora de FORJA.
        </p>
        <Link href="/perfil" className="flex h-12 w-fit items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-ink">
          Volver a Perfil
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-2">
        <Link href="/perfil" className="inline-flex h-11 w-fit items-center gap-2 text-sm font-semibold text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a Perfil
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Control Exclusivo de Accesos
        </div>
        <h1 className="font-display text-5xl leading-none font-bold uppercase">Códigos de Cortesía</h1>
        <p className="text-sm text-muted">
          Genera invitaciones exclusivas para clientes NAIU o alumnos autorizados y administra quién tiene acceso activo.
        </p>
      </header>

      {errorMsg && (
        <div role="alert" className="rounded-xl border border-accent/60 bg-accent/10 px-4 py-3 text-sm text-text">
          {errorMsg}
        </div>
      )}

      {/* FORMULARIO CREAR CÓDIGO */}
      <section aria-labelledby="nuevo-codigo" className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 id="nuevo-codigo" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
          <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
          Nuevo Código de Cortesía
        </h2>
        <form onSubmit={handleCreateCode} className="flex flex-col gap-3.5">
          <label htmlFor="code-label" className="flex flex-col gap-1 text-sm font-medium">
            Nombre del cliente o campaña
            <input
              id="code-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Cortesía NAIU — Andrés Gómez"
              className="h-12 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none"
            />
          </label>

          <label htmlFor="custom-code" className="flex flex-col gap-1 text-sm font-medium">
            Código personalizado (opcional — vacío lo genera automático)
            <input
              id="custom-code"
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="Ej. NAIU-ANDRES-01"
              className="h-12 rounded-md border border-border bg-bg px-3 font-mono text-sm uppercase text-primary focus:border-primary focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="max-uses" className="flex flex-col gap-1 text-sm font-medium">
              Cupos (usos máx.)
              <input
                id="max-uses"
                type="number"
                min={1}
                max={500}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="h-12 rounded-md border border-border bg-bg px-3 font-mono text-sm text-text focus:border-primary focus:outline-none"
              />
            </label>
            <label htmlFor="expires-days" className="flex flex-col gap-1 text-sm font-medium">
              Vigencia días (0 = sin límite)
              <input
                id="expires-days"
                type="number"
                min={0}
                max={365}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="h-12 rounded-md border border-border bg-bg px-3 font-mono text-sm text-text focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-1 flex h-14 items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-ink disabled:opacity-40"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {creating ? 'Generando código...' : 'Crear Código Exclusivo'}
          </button>
        </form>
      </section>

      {/* LISTA DE CÓDIGOS */}
      <section aria-labelledby="lista-codigos" className="flex flex-col gap-3">
        <h2 id="lista-codigos" className="font-display text-2xl font-bold uppercase">
          Códigos Emitidos ({codes.length})
        </h2>
        {loading ? (
          <p className="text-sm text-muted">Cargando códigos...</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay códigos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {codes.map((row) => {
              const exhausted = row.uses_count >= row.max_uses
              return (
                <li key={row.id} className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wider text-primary">{row.code}</p>
                      <p className="text-sm text-text">{row.label}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
                        !row.is_active
                          ? 'bg-accent/20 text-accent'
                          : exhausted
                            ? 'bg-surface-2 text-muted'
                            : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {!row.is_active ? 'Pausado' : exhausted ? 'Agotado' : 'Activo'} · {row.uses_count}/{row.max_uses}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copyInviteMessage(row)}
                      className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary/40 bg-surface-2 px-3 text-xs font-semibold text-primary hover:border-primary"
                    >
                      {copiedId === row.id ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                      {copiedId === row.id ? 'Invitación copiada' : 'Copiar invitación WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCode(row)}
                      className="inline-flex h-11 items-center rounded-md border border-border bg-bg px-3 text-xs font-semibold text-muted hover:text-text"
                    >
                      {row.is_active ? 'Desactivar código' : 'Reactivar código'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* LISTA DE ALUMNOS REGISTRADOS */}
      <section aria-labelledby="lista-clientes" className="flex flex-col gap-3">
        <h2 id="lista-clientes" className="font-display text-2xl font-bold uppercase">
          Clientes Registrados ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted">Ningún cliente registrado todavía.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text">{m.name}</span>
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                      {m.clusterId}
                    </span>
                    {m.role === 'admin' && (
                      <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-ink">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {m.maskedEmail} {m.courtesyCodeUsed ? `· Código ${m.courtesyCodeUsed}` : ''}
                  </span>
                </div>
                {m.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => toggleMember(m)}
                    className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold ${
                      m.isActive
                        ? 'border-border bg-bg text-muted hover:border-accent hover:text-accent'
                        : 'border-primary/50 bg-surface-2 text-primary'
                    }`}
                  >
                    {m.isActive ? (
                      <>
                        <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                        Suspender
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Reactivar
                      </>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
