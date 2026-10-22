'use client'

interface FilterChipProps {
  active: boolean
  label: string
  onSelect: () => void
}

export function FilterChip({ active, label, onSelect }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${
        active ? 'border-primary bg-primary font-semibold text-primary-ink' : 'border-border bg-surface text-text'
      }`}
    >
      {label}
    </button>
  )
}
