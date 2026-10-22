'use client'

import { Check } from 'lucide-react'

interface ChequeoItem {
  id: string
  name: string
}

interface ListaChequeoProps {
  items: ChequeoItem[]
  currentIndex: number
  onSelect: (index: number) => void
}

export function ListaChequeo({ items, currentIndex, onSelect }: ListaChequeoProps) {
  const doneCount = Math.min(currentIndex, items.length)

  return (
    <section aria-labelledby="chequeo" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="chequeo" className="font-display text-xl font-bold uppercase">
          Chequeo
        </h2>
        <p className="font-mono text-sm text-muted">
          {doneCount} de {items.length}
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
                className={`flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 text-left ${
                  isCurrent ? 'border-primary bg-surface' : 'border-border bg-bg'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm ${
                    isDone || isCurrent ? 'bg-primary text-primary-ink' : 'border border-border text-muted'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className={`min-w-0 flex-1 leading-snug ${isDone ? 'text-muted line-through' : 'font-semibold'}`}>
                  {item.name}
                </span>
                {isCurrent ? <span className="text-sm text-muted">Ahora</span> : null}
                {isDone ? <span className="sr-only">Hecho</span> : null}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
