'use client'

import { Check } from 'lucide-react'

export interface ChequeoItem {
  id: string
  name: string
  badgeLabel?: string
  setsInfo?: string
}

interface ListaChequeoProps {
  heading: string
  items: ChequeoItem[]
  currentIndex: number
  onSelect: (index: number) => void
}

export function ListaChequeo({ heading, items, currentIndex, onSelect }: ListaChequeoProps) {
  const doneCount = Math.min(currentIndex, items.length)

  return (
    <section aria-labelledby="chequeo-fase" className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="chequeo-fase" className="font-display text-xl font-bold uppercase">
          {heading}
        </h2>
        <p className="font-mono text-xs text-muted">
          {doneCount} de {items.length} completados
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => {
          const isDone = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <li key={`${item.id}-${index}`}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                  isCurrent
                    ? 'border-primary bg-surface-2'
                    : isDone
                      ? 'border-primary/30 bg-surface/60'
                      : 'border-border bg-bg hover:border-primary/40'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    isDone || isCurrent ? 'bg-primary text-primary-ink' : 'border border-border text-muted'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : item.badgeLabel ?? index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`leading-snug ${isDone ? 'text-muted line-through' : 'font-semibold text-text'}`}>
                    {item.name}
                  </span>
                  {item.setsInfo && <span className="font-mono text-xs text-muted">{item.setsInfo}</span>}
                </span>
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    Activo
                  </span>
                ) : null}
                {isDone ? <span className="sr-only">Completado</span> : null}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
