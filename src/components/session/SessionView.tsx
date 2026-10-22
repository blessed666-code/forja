'use client'

import Link from 'next/link'
import { Check, Repeat, RotateCcw, SkipForward, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PauseMotionButton } from '@/components/motion/PauseMotionButton'
import { ExercisePhoto } from '@/components/session/ExercisePhoto'
import { ListaChequeo } from '@/components/session/ListaChequeo'
import { addHistory, useProfile } from '@/lib/store'
import { usePlan } from '@/lib/usePlan'
import { cn } from '@/lib/cn'
import { getExercise } from '@/data/exercises'
import { formatClock, substitutesFor, type PlanSession } from '@/data/routines'
import { EQUIPMENT_LABEL, type Place } from '@/data/types'

export function SessionView({ sessionId }: { sessionId: string }) {
  const plan = usePlan()
  const profile = useProfile()
  const session = plan?.sessions.find((s) => s.id === sessionId)

  if (!session || !profile) {
    return (
      <main id="contenido" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 outline-none">
        <h1 className="font-display text-4xl font-bold uppercase">Sesión no encontrada</h1>
        <Link href="/hoy" className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-ink">
          Volver a Hoy
        </Link>
      </main>
    )
  }
  return <SessionRunner session={session} place={profile.place} />
}

function SessionRunner({ session, place }: { session: PlanSession; place: Place }) {
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [rest, setRest] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
  const [finished, setFinished] = useState(false)
  const [overrides, setOverrides] = useState<Record<number, string>>({})
  const subDialog = useRef<HTMLDialogElement>(null)
  const exitDialog = useRef<HTMLDialogElement>(null)
  const prevRestRef = useRef(0)

  const exercises = session.exercises.map((e, i) => (overrides[i] ? (getExercise(overrides[i]) ?? e) : e))
  const ex = exercises[exIdx]
  const substitutes = substitutesFor(ex, place)

  useEffect(() => {
    if (rest <= 0) return
    const t = window.setTimeout(() => setRest((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearTimeout(t)
  }, [rest])

  useEffect(() => {
    if (prevRestRef.current > 0 && rest === 0) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 80, 120])
        } catch {}
      }
    }
    prevRestRef.current = rest
  }, [rest])

  function markDone() {
    const total = setsDone + 1
    setSetsDone(total)
    if (setIdx + 1 < ex.sets) {
      setSetIdx(setIdx + 1)
      setRest(ex.rest)
    } else if (exIdx + 1 < exercises.length) {
      setExIdx(exIdx + 1)
      setSetIdx(0)
      setRest(ex.rest)
    } else {
      addHistory({ date: new Date().toISOString(), sessionId: session.id, sessionName: session.name, setsDone: total })
      setRest(0)
      setFinished(true)
    }
  }

  function jump(i: number) {
    setExIdx(i)
    setSetIdx(0)
    setRest(0)
  }

  function substitute(id: string) {
    setOverrides((o) => ({ ...o, [exIdx]: id }))
    subDialog.current?.close()
  }

  function undoSet() {
    if (setsDone <= 0) return
    setSetsDone((s) => Math.max(0, s - 1))
    if (setIdx > 0) {
      setSetIdx((s) => s - 1)
    } else if (exIdx > 0) {
      const prevEx = exercises[exIdx - 1]
      setExIdx(exIdx - 1)
      setSetIdx(Math.max(0, prevEx.sets - 1))
    }
    setRest(0)
  }

  if (finished) {
    return (
      <main id="contenido" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10 outline-none">
        <p className="font-mono text-sm text-muted">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-6xl font-bold uppercase leading-none">{session.name} cerrado</h1>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-surface p-4">
            <dt className="text-sm text-muted">Series hechas</dt>
            <dd className="font-mono text-3xl">{setsDone}</dd>
          </div>
          <div className="rounded-lg border bg-surface p-4">
            <dt className="text-sm text-muted">Ejercicios</dt>
            <dd className="font-mono text-3xl">{exercises.length}</dd>
          </div>
        </dl>
        <p className="text-muted">La fecha quedó guardada. La racha suma un día.</p>
        <Link href="/hoy" className="flex h-14 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-ink">
          Volver a Hoy
        </Link>
      </main>
    )
  }

  const progress = ((exIdx + setIdx / ex.sets) / exercises.length) * 100

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col" data-lenis-prevent>
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-border bg-bg px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => exitDialog.current?.showModal()}
            aria-label="Salir o pausar la sesión"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center font-semibold">{session.name}</p>
          <p className="font-mono text-sm text-muted">
            {exIdx + 1}/{exercises.length}
          </p>
          <PauseMotionButton compact className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text" />
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-full w-full origin-left bg-accent" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex flex-col gap-5 px-4 pb-48 pt-4 outline-none">
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-8" aria-label={`Músculo: ${ex.muscle}`}>
          <p className="font-mono text-sm text-muted">{EQUIPMENT_LABEL[ex.equipment]}</p>
          <p className="font-display text-6xl leading-none font-bold tracking-wide uppercase">{ex.muscle}</p>
        </section>

        <ExercisePhoto exerciseId={ex.id} name={ex.name} priority />
        <ListaChequeo
          items={exercises.map((item) => ({ id: item.id, name: item.name }))}
          currentIndex={exIdx}
          onSelect={jump}
        />

        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {ex.slot_id && (
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-primary border border-primary/30">
                Slot {ex.slot_id}
              </span>
            )}
            {ex.effort_type && (
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-secondary border border-secondary/30">
                {ex.effort_type === 'RIR_1_2'
                  ? 'RIR 1-2 (No al fallo)'
                  : ex.effort_type === 'TECHNICAL_FAILURE'
                    ? 'Fallo técnico final'
                    : 'RIR 1 Protegido'}
              </span>
            )}
          </div>
          <h1 className="text-balance font-display text-4xl font-bold uppercase leading-none">{ex.name}</h1>
          <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono">
            <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-lg text-accent">
                serie {setIdx + 1} de {ex.sets}
              </span>
              <span className="text-muted">{ex.reps}</span>
              {ex.rpe && <span className="text-muted">RPE {ex.rpe}</span>}
              <span className="text-muted">descanso {formatClock(ex.rest)}</span>
            </p>
            {setsDone > 0 && (
              <button
                type="button"
                onClick={undoSet}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted hover:text-text focus-visible:outline-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Deshacer serie</span>
              </button>
            )}
          </div>
          {ex.safety_note && (
            <div className="mt-1 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
              <span className="font-semibold text-amber-300">Regla de Seguridad:</span>
              <span>{ex.safety_note}</span>
            </div>
          )}
        </section>

        <section aria-labelledby="pasos" className="flex flex-col gap-3 rounded-lg border bg-surface p-4">
          <h2 id="pasos" className="font-display text-xl font-bold uppercase">
            Pasos
          </h2>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 leading-relaxed">
            {ex.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-accent">Error común: </span>
            {ex.mistake}
          </p>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-secondary">Respiración: </span>
            {ex.breathing}
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-3">
          <div className="flex items-baseline justify-between" aria-live="polite">
            <span className="text-sm text-muted">{rest > 0 ? 'Descanso' : 'Listo para la serie'}</span>
            <span className={cn('font-mono text-3xl tabular-nums', rest > 0 ? 'text-text' : 'text-muted')}>{formatClock(rest)}</span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
            <button
              type="button"
              onClick={markDone}
              className="flex h-14 items-center justify-center gap-2 rounded-md bg-primary text-lg font-semibold text-primary-ink"
            >
              <Check className="h-5 w-5" aria-hidden="true" />
              Hecho
            </button>
            <button
              type="button"
              onClick={() => setRest(0)}
              disabled={rest === 0}
              className="flex h-14 flex-col items-center justify-center rounded-md border bg-surface-2 text-xs font-semibold leading-tight disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              Saltar descanso
            </button>
            <button
              type="button"
              onClick={() => subDialog.current?.showModal()}
              className="flex h-14 flex-col items-center justify-center rounded-md border bg-surface-2 text-xs font-semibold leading-tight"
            >
              <Repeat className="h-4 w-4" aria-hidden="true" />
              Sustituir
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={subDialog}
        aria-labelledby="sustituir-titulo"
        className="m-auto max-h-[80dvh] w-[min(32rem,calc(100%-2rem))] rounded-xl border bg-surface p-0 text-text"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2 id="sustituir-titulo" className="font-display text-2xl font-bold uppercase">
              Sustituir · {ex.muscle}
            </h2>
            <button
              type="button"
              onClick={() => subDialog.current?.close()}
              aria-label="Cerrar"
              className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-2"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {substitutes.length === 0 ? (
            <p className="text-muted">No hay otra opción de este músculo con tu equipo.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {substitutes.map((s) => {
                const isDirectSlotMatch = Boolean(ex.slot_id && s.slot_id === ex.slot_id)
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => substitute(s.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                        isDirectSlotMatch
                          ? 'border-primary/60 bg-surface-2 hover:border-primary'
                          : 'border-border bg-bg hover:border-border-hover'
                      }`}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">{s.name}</span>
                          {isDirectSlotMatch && (
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              Mismo Slot
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted">{EQUIPMENT_LABEL[s.equipment]}</span>
                      </span>
                      <span className="font-mono text-sm text-muted">
                        {s.sets}×{s.reps}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </dialog>

      <dialog
        ref={exitDialog}
        aria-labelledby="salir-titulo"
        className="m-auto max-h-[80dvh] w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-surface p-0 text-text backdrop:bg-black/80"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="salir-titulo" className="font-display text-2xl font-bold uppercase">
            ¿Pausar o Salir de la Sesión?
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Tu progreso de hoy queda registrado en tu dispositivo. Puedes volver a la pantalla principal o continuar entrenando.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => exitDialog.current?.close()}
              className="flex h-14 items-center justify-center rounded-md bg-primary font-semibold text-primary-ink"
            >
              Continuar Entrenando
            </button>
            <Link
              href="/hoy"
              className="flex h-14 items-center justify-center rounded-md border border-border bg-surface-2 font-semibold text-text hover:border-accent hover:text-accent transition-colors"
            >
              Salir a Hoy
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  )
}
