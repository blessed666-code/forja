'use client'

import { m } from 'framer-motion'
import { ArrowUpRight, Flame, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { NAIU_PRODUCTS } from '@/data/naiu'
import { CARE_LABEL, GOAL_LABEL, LEVEL_LABEL, PLACE_LABEL } from '@/data/types'
import { FITNESS_SPRING } from '@/lib/motionPresets'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { useProfile } from '@/lib/store'
import { usePlan } from '@/lib/usePlan'

export function PerfilScreen() {
  const profile = useProfile()
  const plan = usePlan()

  const macros = calculateMacros({
    gender: profile.gender ?? 'hombre',
    age: profile.age ?? 26,
    weightKg: profile.weight_kg ?? 75,
    heightCm: profile.height_cm ?? 175,
    daysPerWeek: profile.days,
    goal: profile.goal,
  })

  const naiuCard = selectNaiuSuperfood(
    profile.gender ?? 'hombre',
    profile.goal,
    profile.energy_level,
  )

  const rows: Array<[string, string]> = [
    ['Cluster Determinista', profile.cluster_id ?? plan.clusterId ?? 'H-5'],
    ['Modo de Tiempo', profile.time_mode?.replace('_', ' ') ?? '120 MIN'],
    ['Objetivo', GOAL_LABEL[profile.goal] ?? profile.goal],
    ['Enfoque Anatómico', profile.gender === 'mujer' ? 'Mujer (Glúteo Focus)' : 'Hombre (Torso V & Pierna)'],
    ['Frecuencia', `${profile.days} días por semana`],
    ['Duración por sesión', `${profile.session_duration_min ?? profile.minutes} min`],
    ['Nivel', LEVEL_LABEL[profile.level] ?? profile.level],
    ['Zona a cuidar', profile.joint_alerts?.join(', ') || CARE_LABEL[profile.care] || 'Ninguna'],
    ['Split Oficial', plan.splitName],
  ]

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="font-display text-2xl font-bold tracking-wide uppercase text-primary">FORJA</p>
          <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted">v2.0 PWA</span>
        </div>
        <h1 className="font-display text-5xl leading-none font-bold uppercase">{profile.name}</h1>
        <p className="text-muted">Motor de entrenamiento determinista sin alucinaciones. Con exigencia.</p>
      </header>

      {/* METAS NUTRICIONALES DETERMINISTAS */}
      <section aria-labelledby="nutricion-meta" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="nutricion-meta" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Flame className="h-5 w-5 text-accent" />
            Metas Nutricionales (Mifflin-St Jeor)
          </h2>
          <span className="font-mono text-sm font-bold text-accent">{macros.targetCalories} kcal</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col rounded-xl border border-border bg-surface p-3 text-center">
            <span className="text-xs text-muted">Proteína</span>
            <span className="font-mono text-xl font-bold text-text">{macros.proteinGrams}g</span>
            <span className="text-[10px] text-muted">2.0 g/kg</span>
          </div>
          <div className="flex flex-col rounded-xl border border-border bg-surface p-3 text-center">
            <span className="text-xs text-muted">Carbos</span>
            <span className="font-mono text-xl font-bold text-text">{macros.carbGrams}g</span>
            <span className="text-[10px] text-muted">Energía limpia</span>
          </div>
          <div className="flex flex-col rounded-xl border border-border bg-surface p-3 text-center">
            <span className="text-xs text-muted">Grasas</span>
            <span className="font-mono text-xl font-bold text-text">{macros.fatGrams}g</span>
            <span className="text-[10px] text-muted">Hormonal</span>
          </div>
        </div>
        <p className="text-xs text-muted leading-relaxed">{macros.objectiveNote}</p>
      </section>

      {/* FICHA TÉCNICA */}
      <section aria-labelledby="ficha" className="flex flex-col gap-3">
        <h2 id="ficha" className="font-display text-2xl font-bold uppercase">
          Tu ficha técnica
        </h2>
        <dl className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-right font-mono text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/quiz"
          className="flex h-14 items-center justify-center rounded-md bg-primary font-semibold text-primary-ink"
        >
          Reconfigurar en Quiz
        </Link>
      </section>

      {/* RECOMENDACIÓN NAIU */}
      <section aria-labelledby="naiu" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="naiu" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Sparkles className="h-5 w-5 text-primary" />
            Superalimentos Oficiales NAIU
          </h2>
          <span className="text-xs font-semibold text-primary">Aliado Oficial</span>
        </div>

        {/* Tarjeta destacada NAIU según perfil */}
        <div className="rounded-xl border border-primary/40 bg-surface-2 p-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-primary uppercase">Recomendado para tu perfil</span>
          <h3 className="font-display text-xl font-bold">{naiuCard.product_name}</h3>
          <p className="text-sm text-muted leading-relaxed">{naiuCard.reason}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-xs text-muted">Dosis: {naiuCard.dosage}</span>
            <a
              href={naiuCard.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-ink"
            >
              <span>{naiuCard.cta_text}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {NAIU_PRODUCTS.map((product) => (
            <li key={product.id}>
              <m.a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                transition={FITNESS_SPRING}
                className="flex h-full min-h-24 flex-col gap-1 rounded-xl border border-border bg-surface p-4 hover:border-primary transition-colors"
              >
                <span className="flex items-start justify-between gap-2 font-semibold">
                  {product.name}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </span>
                {product.benefit ? <span className="text-xs text-muted leading-relaxed">{product.benefit}</span> : null}
                {product.price ? <span className="mt-auto font-mono text-xs text-primary">{product.price}</span> : null}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </m.a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted">
        ARKA Fitness AI · Diseñado para gimnasios y clientes NAIU · PWA Mobile-First
      </footer>
    </div>
  )
}
