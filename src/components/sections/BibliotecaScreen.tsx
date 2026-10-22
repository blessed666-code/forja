'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import { FilterChip } from '@/components/ui/FilterChip'
import { exerciseGifUrl } from '@/data/exerciseMedia'
import { ExercisePhoto } from '@/components/session/ExercisePhoto'
import { EXERCISES } from '@/data/exercises'
import { EQUIPMENT, EQUIPMENT_LABEL, MUSCLES, type Equipment, type Exercise, type Muscle } from '@/data/types'

export function BibliotecaScreen() {
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [muscle, setMuscle] = useState<Muscle | null>(null)
  const [selected, setSelected] = useState<Exercise | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const list = EXERCISES.filter((exercise) => {
    if (equipment && exercise.equipment !== equipment) return false
    if (muscle && exercise.muscle !== muscle) return false
    return true
  })

  const openExercise = (exercise: Exercise): void => {
    setSelected(exercise)
    dialog.current?.showModal()
  }

  const closeExercise = (): void => {
    dialog.current?.close()
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-5xl leading-none font-bold uppercase">Biblioteca</h1>
        <p className="font-mono text-sm text-muted">{list.length} fichas</p>
      </header>

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Filtrar por equipo" data-lenis-prevent className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <FilterChip active={!equipment} label="Todo equipo" onSelect={() => setEquipment(null)} />
          {EQUIPMENT.map((item) => (
            <FilterChip key={item} active={equipment === item} label={EQUIPMENT_LABEL[item]} onSelect={() => setEquipment(item)} />
          ))}
        </div>
        <div role="group" aria-label="Filtrar por músculo" data-lenis-prevent className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <FilterChip active={!muscle} label="Todo músculo" onSelect={() => setMuscle(null)} />
          {MUSCLES.map((item) => (
            <FilterChip key={item} active={muscle === item} label={item} onSelect={() => setMuscle(item)} />
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-muted">No hay fichas con ese filtro.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                onClick={() => openExercise(exercise)}
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left"
              >
                {exerciseGifUrl(exercise.id) ? (
                  <span aria-hidden="true" className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={exerciseGifUrl(exercise.id) ?? ''}
                      alt=""
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold tracking-wider uppercase">{exercise.muscle}</span>
                  <span className="text-sm text-muted">{EQUIPMENT_LABEL[exercise.equipment]}</span>
                </span>
                <span className="leading-snug font-semibold">{exercise.name}</span>
                <span className="font-mono text-sm text-muted">
                  {exercise.sets}×{exercise.reps}
                </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        data-lenis-prevent
        onClose={() => setSelected(null)}
        aria-labelledby="ficha-titulo"
        className="m-auto max-h-[90dvh] w-[min(32rem,calc(100%-1.5rem))] overflow-y-auto rounded-xl border border-border bg-surface p-0 text-text"
      >
        {selected ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-display text-sm font-bold tracking-wider uppercase">{selected.muscle}</p>
                <h2 id="ficha-titulo" className="font-display text-3xl leading-none font-bold uppercase">
                  {selected.name}
                </h2>
              </div>
              <button type="button" onClick={closeExercise} aria-label="Cerrar ficha" className="flex h-11 w-11 items-center justify-center rounded-md">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ExercisePhoto exerciseId={selected.id} name={selected.name} />
            <div className="flex flex-wrap items-center gap-2">
              {selected.slot_id && (
                <span className="rounded-full border border-primary/40 bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-primary">
                  Slot {selected.slot_id}
                </span>
              )}
              {selected.effort_type && (
                <span className="rounded-full border border-secondary/40 bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-secondary">
                  {selected.effort_type === 'RIR_1_2'
                    ? 'RIR 1-2'
                    : selected.effort_type === 'TECHNICAL_FAILURE'
                      ? 'Fallo Técnico'
                      : 'RIR 1 Protegido'}
                </span>
              )}
            </div>
            <p className="font-mono text-sm text-muted">
              {selected.sets}×{selected.reps} · descanso {selected.rest} s · {EQUIPMENT_LABEL[selected.equipment]}
            </p>
            {selected.safety_note && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                <span className="font-semibold text-amber-300">Seguridad: </span>
                {selected.safety_note}
              </div>
            )}
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 leading-relaxed">
              {selected.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Error común: </span>
              {selected.mistake}
            </p>
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Respiración: </span>
              {selected.breathing}
            </p>
          </div>
        ) : null}
      </dialog>
    </div>
  )
}
