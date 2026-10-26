'use client'

import Link from 'next/link'
import { ArrowRight, Check, Play, Repeat, RotateCcw, SkipForward, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PauseMotionButton } from '@/components/motion/PauseMotionButton'
import { ExercisePhoto } from '@/components/session/ExercisePhoto'
import { ListaChequeo } from '@/components/session/ListaChequeo'
import {
  addHistory,
  clearSessionDraft,
  readSessionDraft,
  useProfile,
  writeSessionDraft,
} from '@/lib/store'
import { usePlan } from '@/lib/usePlan'
import { cn } from '@/lib/cn'
import { getExercise } from '@/data/exercises'
import { formatClock, substitutesFor, type Plan, type PlanSession } from '@/data/routines'
import { EQUIPMENT_LABEL, type Exercise, type Place } from '@/data/types'

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

  return <SessionRunner key={session.id} session={session} plan={plan} place={profile.place} />
}

function SessionRunner({ session, plan, place }: { session: PlanSession; plan: Plan; place: Place }) {
  const blocks = session.blocks
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [absLap, setAbsLap] = useState(1)
  const [rest, setRest] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
  const [completedPhases, setCompletedPhases] = useState<number[]>([])
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const subDialog = useRef<HTMLDialogElement>(null)
  const exitDialog = useRef<HTMLDialogElement>(null)
  const prevRestRef = useRef(0)

  // Hidratar estado guardado de la sesión para no perder series al recargar
  useEffect(() => {
    const saved = readSessionDraft(session.id)
    if (saved) {
      const validPhase = Math.min(Math.max(0, saved.phaseIdx), Math.max(0, blocks.length - 1))
      const phaseExercisesCount = blocks[validPhase]?.exercises.length ?? 1
      const validEx = Math.min(Math.max(0, saved.exIdx), Math.max(0, phaseExercisesCount - 1))
      setPhaseIdx(validPhase)
      setExIdx(validEx)
      setSetIdx(Math.max(0, saved.setIdx))
      setAbsLap(Math.max(1, saved.absLap || 1))
      setSetsDone(Math.max(0, saved.setsDone))
      setCompletedPhases(Array.isArray(saved.completedPhases) ? saved.completedPhases : [])
      setOverrides(saved.overrides ?? {})
    }
    setHydrated(true)
  }, [session.id, blocks])

  // Persistir avance en curso
  useEffect(() => {
    if (!hydrated || finished) return
    writeSessionDraft(session.id, {
      phaseIdx,
      exIdx,
      setIdx,
      absLap,
      setsDone,
      completedPhases,
      overrides,
      updatedAt: new Date().toISOString(),
    })
  }, [hydrated, finished, session.id, phaseIdx, exIdx, setIdx, absLap, setsDone, completedPhases, overrides])

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
        } catch {
          // Vibración no soportada en navegador de escritorio
        }
      }
    }
    prevRestRef.current = rest
  }, [rest])

  const activeBlock = blocks[phaseIdx] ?? blocks[0]

  const phaseExercises: Exercise[] = useMemo(() => {
    if (!activeBlock) return []
    return activeBlock.exercises.map((item, idx) => {
      const overrideKey = `${phaseIdx}:${idx}`
      const overrideId = overrides[overrideKey]
      if (!overrideId) return item
      const replacement = getExercise(overrideId)
      return replacement
        ? {
            ...replacement,
            sets: item.sets,
            rest: item.rest,
            phase: item.phase,
            block_number: item.block_number,
            block_badge: item.block_badge,
            slot_id: item.slot_id,
          }
        : item
    })
  }, [activeBlock, overrides, phaseIdx])

  const safeExIdx = Math.min(exIdx, Math.max(0, phaseExercises.length - 1))
  const ex = phaseExercises[safeExIdx] ?? session.exercises[0]
  const substitutes = ex ? substitutesFor(ex, place) : []

  const totalAbsLaps = activeBlock?.laps ?? 3

  async function finalizeDay(finalSetsCount: number): Promise<void> {
    clearSessionDraft(session.id)
    setRest(0)
    setFinished(true)
    await addHistory({
      date: new Date().toISOString(),
      sessionId: session.id,
      sessionName: session.name,
      setsDone: finalSetsCount,
    })
  }

  function advanceToNextPhase(updatedSetsDone: number): void {
    const nextCompleted = completedPhases.includes(phaseIdx) ? completedPhases : [...completedPhases, phaseIdx]
    setCompletedPhases(nextCompleted)

    if (phaseIdx + 1 < blocks.length) {
      setPhaseIdx(phaseIdx + 1)
      setExIdx(0)
      setSetIdx(0)
      setAbsLap(1)
      setRest(0)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      void finalizeDay(updatedSetsDone)
    }
  }

  function markDone(): void {
    if (!ex || !activeBlock) return
    const nextTotal = setsDone + 1
    setSetsDone(nextTotal)

    // Lógica especializada para Circuito de Abdomen (flujo por vueltas o por estación)
    if (activeBlock.phase === 'abs') {
      if (safeExIdx + 1 < phaseExercises.length) {
        setExIdx(safeExIdx + 1)
        setRest(activeBlock.transitionSec ?? 15)
        return
      }
      if (absLap < totalAbsLaps) {
        setAbsLap(absLap + 1)
        setExIdx(0)
        setRest(activeBlock.restBetweenLapsSec ?? 60)
        return
      }
      advanceToNextPhase(nextTotal)
      return
    }

    // Lógica para Cardio final
    if (activeBlock.phase === 'cardio') {
      advanceToNextPhase(nextTotal)
      return
    }

    // Lógica serie a serie para Calentamiento y los 5 Ejercicios de Fuerza
    if (setIdx + 1 < ex.sets) {
      setSetIdx(setIdx + 1)
      setRest(ex.rest)
    } else if (safeExIdx + 1 < phaseExercises.length) {
      setExIdx(safeExIdx + 1)
      setSetIdx(0)
      setRest(ex.rest)
    } else {
      advanceToNextPhase(nextTotal)
    }
  }

  function completeAbsLapDirectly(): void {
    const added = Math.max(1, phaseExercises.length - safeExIdx)
    const nextTotal = setsDone + added
    setSetsDone(nextTotal)
    if (absLap < totalAbsLaps) {
      setAbsLap(absLap + 1)
      setExIdx(0)
      setRest(activeBlock?.restBetweenLapsSec ?? 60)
    } else {
      advanceToNextPhase(nextTotal)
    }
  }

  function selectPhase(nextPhaseIdx: number): void {
    setPhaseIdx(nextPhaseIdx)
    setExIdx(0)
    setSetIdx(0)
    setRest(0)
  }

  function jumpToExercise(i: number): void {
    setExIdx(i)
    setSetIdx(0)
    setRest(0)
  }

  function substitute(newExId: string): void {
    const key = `${phaseIdx}:${safeExIdx}`
    setOverrides((prev) => ({ ...prev, [key]: newExId }))
    subDialog.current?.close()
  }

  function undoStep(): void {
    if (setsDone <= 0) return
    setSetsDone((s) => Math.max(0, s - 1))
    setRest(0)

    if (activeBlock?.phase === 'abs') {
      if (safeExIdx > 0) {
        setExIdx(safeExIdx - 1)
      } else if (absLap > 1) {
        setAbsLap(absLap - 1)
        setExIdx(Math.max(0, phaseExercises.length - 1))
      }
      return
    }

    if (setIdx > 0) {
      setSetIdx(setIdx - 1)
    } else if (safeExIdx > 0) {
      const prevEx = phaseExercises[safeExIdx - 1]
      setExIdx(safeExIdx - 1)
      setSetIdx(Math.max(0, (prevEx?.sets ?? 1) - 1))
    } else if (phaseIdx > 0) {
      const prevBlock = blocks[phaseIdx - 1]
      const lastExIdx = Math.max(0, (prevBlock?.exercises.length ?? 1) - 1)
      const lastEx = prevBlock?.exercises[lastExIdx]
      setPhaseIdx(phaseIdx - 1)
      setExIdx(lastExIdx)
      setSetIdx(Math.max(0, (lastEx?.sets ?? 1) - 1))
    }
  }

  // Encontrar cuál es el siguiente día en la secuencia tras cerrar este
  const currentSessionIndex = plan.sessions.findIndex((s) => s.id === session.id)
  const nextSession =
    plan.sessions.length > 0
      ? plan.sessions[(currentSessionIndex + 1 + plan.sessions.length) % plan.sessions.length]
      : undefined

  if (finished) {
    return (
      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10 outline-none"
      >
        <span className="w-fit rounded-full border border-primary/40 bg-surface-2 px-3 py-1 font-mono text-xs font-semibold text-primary uppercase">
          Día {session.dayNumber} Completado
        </span>
        <h1 className="font-display text-6xl font-bold uppercase leading-none">{session.name} cerrado</h1>
        <p className="font-mono text-sm text-muted">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs text-muted">Series y estaciones</dt>
            <dd className="font-mono text-3xl font-bold text-primary">{setsDone}</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs text-muted">Bloques principales</dt>
            <dd className="font-mono text-3xl font-bold">{session.mainCount}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {blocks.map((b) => (
            <span
              key={b.phase}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface-2 px-3 py-1 text-xs font-semibold text-primary"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {b.title}
            </span>
          ))}
        </div>

        {nextSession && (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm">
            <p className="font-mono text-xs text-muted uppercase">Siguiente sesión desbloqueada</p>
            <p className="mt-1 font-semibold text-text">
              Día {nextSession.dayNumber} · {nextSession.name}
            </p>
            <p className="text-xs text-muted">{nextSession.mainCount} ejercicios principales + Calentamiento y Abdomen</p>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <Link
            href="/hoy"
            className="flex h-14 items-center justify-center gap-2 rounded-md bg-primary text-lg font-semibold text-primary-ink"
          >
            <span>Continuar a Hoy{nextSession ? ` (Día ${nextSession.dayNumber})` : ''}</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/semana"
            className="flex h-12 items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-text hover:border-primary"
          >
            Ver Progreso de la Semana
          </Link>
        </div>
      </main>
    )
  }

  const phaseFraction =
    activeBlock?.phase === 'abs'
      ? ((absLap - 1 + safeExIdx / Math.max(1, phaseExercises.length)) / Math.max(1, totalAbsLaps))
      : ((safeExIdx + setIdx / Math.max(1, ex?.sets ?? 1)) / Math.max(1, phaseExercises.length))
  const overallProgress = Math.min(100, Math.round(((phaseIdx + phaseFraction) / Math.max(1, blocks.length)) * 100))

  const checklistHeading =
    activeBlock?.phase === 'warmup'
      ? `Calentamiento (${phaseExercises.length} activaciones)`
      : activeBlock?.phase === 'strength'
        ? `Tus ${session.mainCount} bloques principales de hoy`
        : activeBlock?.phase === 'abs'
          ? `Circuito Abdomen · Vuelta ${absLap} de ${totalAbsLaps}`
          : 'Cardio Metabólico de Cierre'

  const primaryActionLabel =
    activeBlock?.phase === 'warmup'
      ? setIdx + 1 < ex.sets
        ? `Serie ${setIdx + 1}/${ex.sets} lista`
        : safeExIdx + 1 < phaseExercises.length
          ? 'Siguiente activación'
          : 'Pasar a los 5 Ejercicios'
      : activeBlock?.phase === 'strength'
        ? setIdx + 1 < ex.sets
          ? `Serie ${setIdx + 1}/${ex.sets} Hecha`
          : safeExIdx + 1 < phaseExercises.length
            ? 'Siguiente Ejercicio'
            : 'Pasar a Abdomen'
        : activeBlock?.phase === 'abs'
          ? safeExIdx + 1 < phaseExercises.length
            ? 'Siguiente estación (45s)'
            : absLap < totalAbsLaps
              ? `Cerrar Vuelta ${absLap}/${totalAbsLaps}`
              : phaseIdx + 1 < blocks.length
                ? 'Pasar a Cardio'
                : `Cerrar Día ${session.dayNumber}`
          : `Cerrar Día ${session.dayNumber}`

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col" data-lenis-prevent>
      <header className="sticky top-0 z-20 flex flex-col gap-2.5 border-b border-border bg-bg px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => exitDialog.current?.showModal()}
            aria-label="Salir o pausar la sesión"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-surface-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-mono text-[11px] font-semibold text-primary uppercase">
              Día {session.dayNumber} · Etapa {phaseIdx + 1} de {blocks.length}
            </p>
            <p className="truncate text-sm font-semibold">{session.name}</p>
          </div>
          <PauseMotionButton compact className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text" />
        </div>

        {/* Barra de pestañas por Etapa: Calentamiento -> 5 Ejercicios -> Abdomen -> Cardio */}
        <nav aria-label="Etapas de la sesión de hoy" className="-mx-4 overflow-x-auto px-4">
          <ol className="flex gap-1.5 pb-0.5">
            {blocks.map((b, idx) => {
              const isCurrent = idx === phaseIdx
              const isDone = completedPhases.includes(idx) || idx < phaseIdx
              return (
                <li key={b.phase} className="flex-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => selectPhase(idx)}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'border-primary bg-primary text-primary-ink'
                        : isDone
                          ? 'border-primary/40 bg-surface-2 text-primary'
                          : 'border-border bg-surface text-muted hover:text-text'
                    }`}
                  >
                    {isDone && !isCurrent ? (
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="font-mono text-[11px]">{idx + 1}.</span>
                    )}
                    <span>{b.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div
            className="h-full w-full origin-left bg-primary transition-transform duration-300"
            style={{ transform: `scaleX(${overallProgress / 100})` }}
          />
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex flex-col gap-5 px-4 pb-52 pt-4 outline-none">
        {/* Banner contextual de la Etapa Activa */}
        <section
          aria-label={`Etapa activa: ${activeBlock?.title}`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-semibold text-primary uppercase">
                Etapa {phaseIdx + 1} · {activeBlock?.title}
              </span>
              <h2 className="font-display text-2xl font-bold uppercase leading-tight">{activeBlock?.subtitle}</h2>
            </div>
            <span className="rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted">
              ~{activeBlock?.durationMinutes} min
            </span>
          </div>
          {activeBlock?.notes && <p className="text-xs leading-relaxed text-muted">{activeBlock.notes}</p>}

          {/* Atajo limpio para avanzar etapa si ya calentó o cerrar vuelta de abdomen */}
          {activeBlock?.phase === 'warmup' && (
            <button
              type="button"
              onClick={() => advanceToNextPhase(setsDone + 1)}
              className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-surface-2 px-3 text-xs font-semibold text-primary hover:border-primary"
            >
              <span>Calentamiento listo · Ir directo a los {session.mainCount} Ejercicios</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {activeBlock?.phase === 'abs' && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-bg px-3 py-2">
              <span className="font-mono text-xs font-semibold text-primary">
                Vuelta activa: {absLap} de {totalAbsLaps}
              </span>
              <button
                type="button"
                onClick={completeAbsLapDirectly}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-surface-2 px-3 text-xs font-semibold text-primary border border-primary/40 hover:border-primary"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Marcar Vuelta {absLap} completa</span>
              </button>
            </div>
          )}

          {activeBlock?.phase === 'cardio' && (
            <button
              type="button"
              onClick={() => setRest((activeBlock.durationMinutes || 10) * 60)}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent/50 bg-accent/10 px-3 text-xs font-semibold text-accent hover:bg-accent/20"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Iniciar cronómetro de {activeBlock.durationMinutes || 10}:00 min</span>
            </button>
          )}
        </section>

        {/* Tarjeta del Ejercicio Activo dentro de la Etapa */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-6" aria-label={`Músculo: ${ex.muscle}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-muted uppercase">{EQUIPMENT_LABEL[ex.equipment]}</p>
            {ex.block_badge && (
              <span className="rounded-full border border-primary/40 bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                {ex.block_badge}
              </span>
            )}
          </div>
          <p className="font-display text-5xl leading-none font-bold tracking-wide uppercase">{ex.muscle}</p>
        </section>

        <ExercisePhoto exerciseId={ex.id} name={ex.name} priority />

        {/* Detalle técnico del movimiento activo */}
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {ex.slot_id && (
              <span className="rounded-full border border-primary/30 bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-primary">
                Slot {ex.slot_id}
              </span>
            )}
            {ex.effort_type && (
              <span className="rounded-full border border-secondary/30 bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-secondary">
                {ex.effort_type === 'RIR_1_2'
                  ? 'RIR 1-2 (Dejar 1-2 en reserva)'
                  : ex.effort_type === 'TECHNICAL_FAILURE'
                    ? 'Última serie al fallo técnico'
                    : 'RIR 1 Protegido'}
              </span>
            )}
          </div>

          <h1 className="text-balance font-display text-4xl font-bold uppercase leading-none">{ex.name}</h1>

          <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono">
            <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              {activeBlock?.phase === 'abs' ? (
                <span className="text-base font-bold text-accent">
                  vuelta {absLap}/{totalAbsLaps} · {ex.reps}
                </span>
              ) : activeBlock?.phase === 'cardio' ? (
                <span className="text-base font-bold text-accent">{ex.reps} continuos</span>
              ) : (
                <>
                  <span className="text-base font-bold text-accent">
                    serie {setIdx + 1} de {ex.sets}
                  </span>
                  <span className="text-text">{ex.reps} reps</span>
                </>
              )}
              {ex.rpe && <span className="text-muted">RPE {ex.rpe}</span>}
              {ex.rest > 0 && <span className="text-muted">pausa {formatClock(ex.rest)}</span>}
            </p>
            {setsDone > 0 && (
              <button
                type="button"
                onClick={undoStep}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted hover:text-text focus-visible:outline-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Deshacer</span>
              </button>
            )}
          </div>

          {ex.safety_note && (
            <div className="mt-1 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
              <span className="font-semibold text-amber-300">Regla de Oro:</span>
              <span>{ex.safety_note}</span>
            </div>
          )}
        </section>

        {/* Lista de Chequeo exclusiva de la Etapa Actual (nunca 15 ejercicios revueltos) */}
        <ListaChequeo
          heading={checklistHeading}
          items={phaseExercises.map((item, idx) => ({
            id: item.id,
            name: item.name,
            badgeLabel:
              item.block_badge?.includes('A · Biserie')
                ? `${item.block_number}A`
                : item.block_badge?.includes('B · Biserie')
                  ? `${item.block_number}B`
                  : String(item.block_number ?? idx + 1),
            setsInfo:
              activeBlock?.phase === 'abs'
                ? `${item.reps} · transición ${activeBlock.transitionSec ?? 15}s`
                : `${item.sets} × ${item.reps}`,
          }))}
          currentIndex={safeExIdx}
          onSelect={jumpToExercise}
        />

        <section aria-labelledby="pasos" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <h2 id="pasos" className="font-display text-xl font-bold uppercase">
            Técnica Paso a Paso
          </h2>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed">
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

      {/* Barra inferior de acción en sala de pesas */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 px-4 py-3">
          <div className="flex items-baseline justify-between" aria-live="polite">
            <span className="text-xs font-medium text-muted">
              {rest > 0 ? 'Tiempo en curso / Descanso' : `Etapa ${phaseIdx + 1}: ${activeBlock?.title}`}
            </span>
            <span className={cn('font-mono text-2xl font-bold tabular-nums', rest > 0 ? 'text-accent' : 'text-muted')}>
              {formatClock(rest)}
            </span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
            <button
              type="button"
              onClick={markDone}
              className="flex h-14 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-ink sm:text-base"
            >
              <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{primaryActionLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => setRest(0)}
              disabled={rest === 0}
              className="flex h-14 flex-col items-center justify-center rounded-md border border-border bg-surface-2 text-xs font-semibold leading-tight disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              Saltar pausa
            </button>
            <button
              type="button"
              onClick={() => subDialog.current?.showModal()}
              disabled={activeBlock?.phase !== 'strength' && substitutes.length === 0}
              className="flex h-14 flex-col items-center justify-center rounded-md border border-border bg-surface-2 text-xs font-semibold leading-tight disabled:opacity-40"
            >
              <Repeat className="h-4 w-4" aria-hidden="true" />
              Sustituir
            </button>
          </div>
        </div>
      </div>

      {/* Modal accesible de sustitución por Slot Biomecánico */}
      <dialog
        ref={subDialog}
        aria-labelledby="sustituir-titulo"
        className="m-auto max-h-[80dvh] w-[min(32rem,calc(100%-2rem))] rounded-xl border border-border bg-surface p-0 text-text backdrop:bg-black/80"
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
            <p className="text-muted">No hay otra variante registrada para este movimiento.</p>
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
                          : 'border-border bg-bg hover:border-primary/40'
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

      {/* Modal accesible de pausa / salida */}
      <dialog
        ref={exitDialog}
        aria-labelledby="salir-titulo"
        className="m-auto max-h-[80dvh] w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-surface p-0 text-text backdrop:bg-black/80"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="salir-titulo" className="font-display text-2xl font-bold uppercase">
            ¿Pausar Día {session.dayNumber}?
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Tu etapa y serie actual quedaron guardadas automáticamente. Cuando regreses podrás retomar exactamente donde vas.
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
              className="flex h-14 items-center justify-center rounded-md border border-border bg-surface-2 font-semibold text-text transition-colors hover:border-accent hover:text-accent"
            >
              Pausar y Volver a Hoy
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  )
}
