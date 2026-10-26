'use client'

import { m } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Check,
  Flame,
  KeyRound,
  Loader2,
  LogOut,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAIU_PRODUCTS, NAIU_WHATSAPP_DISPLAY, NAIU_WHATSAPP_URL } from '@/data/naiu'
import { CARE_LABEL, GOAL_LABEL, LEVEL_LABEL, type DiagnosisSummary, type Goal } from '@/data/types'
import { buildBaseDiagnosisSummary, calculateBodyMetrics } from '@/lib/bodyDiagnosis'
import { FITNESS_SPRING } from '@/lib/motionPresets'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { matchRoutineCluster } from '@/lib/routineMatcher'
import {
  ensureClientCsrfToken,
  hasCompletedOnboarding,
  logoutUser,
  resetToNewUser,
  saveProfile,
  useAccountMeta,
  useProfile,
} from '@/lib/store'
import { usePlan } from '@/lib/usePlan'

export function PerfilScreen() {
  const router = useRouter()
  const profile = useProfile()
  const account = useAccountMeta()
  const plan = usePlan()

  const [weightInput, setWeightInput] = useState(String(profile.weight_kg ?? 75))
  const [heightInput, setHeightInput] = useState(String(profile.height_cm ?? 175))
  const [applySuggestedGoal, setApplySuggestedGoal] = useState(false)
  const [updatingDiagnosis, setUpdatingDiagnosis] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile.weight_kg) setWeightInput(String(profile.weight_kg))
    if (profile.height_cm) setHeightInput(String(profile.height_cm))
  }, [profile.weight_kg, profile.height_cm])

  const liveWeightKg = Math.min(240, Math.max(35, Number.parseFloat(weightInput) || profile.weight_kg || 75))
  const liveHeightCm = Math.min(230, Math.max(120, Number.parseFloat(heightInput) || profile.height_cm || 175))

  const liveMetrics = calculateBodyMetrics({
    weightKg: liveWeightKg,
    heightCm: liveHeightCm,
    gender: profile.gender ?? 'hombre',
  })

  const fallbackDiagnosis = buildBaseDiagnosisSummary({
    name: profile.name || 'Atleta',
    gender: profile.gender ?? 'hombre',
    age: profile.age ?? 26,
    weightKg: liveWeightKg,
    heightCm: liveHeightCm,
    daysPerWeek: profile.days === 3 || profile.days === 4 || profile.days === 5 ? profile.days : 4,
    sessionMinutes:
      profile.session_duration_min === 60 ||
      profile.session_duration_min === 90 ||
      profile.session_duration_min === 120
        ? profile.session_duration_min
        : 90,
    goal: applySuggestedGoal ? liveMetrics.suggestedGoal : profile.goal,
    energyLevel: profile.energy_level ?? 'normal',
    jointAlerts: profile.joint_alerts ?? [],
  })

  const isInputsMatchingStored =
    Math.abs(liveWeightKg - (profile.weight_kg ?? 75)) < 0.1 &&
    Math.abs(liveHeightCm - (profile.height_cm ?? 175)) < 0.1 &&
    !applySuggestedGoal

  const activeDiagnosis: DiagnosisSummary =
    isInputsMatchingStored && profile.diagnosis ? profile.diagnosis : fallbackDiagnosis

  const bmiGaugePercent = Math.min(96, Math.max(4, Math.round(((liveMetrics.bmi - 15) / 20) * 100)))

  const macros = calculateMacros({
    gender: profile.gender ?? 'hombre',
    age: profile.age ?? 26,
    weightKg: liveWeightKg,
    heightCm: liveHeightCm,
    daysPerWeek: profile.days,
    goal: applySuggestedGoal ? liveMetrics.suggestedGoal : profile.goal,
  })

  const naiuCard = selectNaiuSuperfood(
    profile.gender ?? 'hombre',
    applySuggestedGoal ? liveMetrics.suggestedGoal : profile.goal,
    profile.energy_level,
    profile.joint_alerts,
  )

  const handleRecalculateDiagnosis = async (): Promise<void> => {
    setUpdatingDiagnosis(true)
    setStatusMessage(null)

    const nextGoal: Goal = applySuggestedGoal ? liveMetrics.suggestedGoal : profile.goal
    const nextDays: 3 | 4 | 5 =
      profile.days === 3 || profile.days === 4 || profile.days === 5 ? profile.days : 4
    const nextMinutes: 60 | 90 | 120 =
      profile.session_duration_min === 60 ||
      profile.session_duration_min === 90 ||
      profile.session_duration_min === 120
        ? profile.session_duration_min
        : 90

    const baseAlerts = profile.joint_alerts ?? []
    const mergedAlerts =
      liveMetrics.suggestedJointAlert && !baseAlerts.includes(liveMetrics.suggestedJointAlert)
        ? [...baseAlerts, liveMetrics.suggestedJointAlert]
        : baseAlerts

    const { profile: recomputedProfile } = matchRoutineCluster({
      name: profile.name || 'Atleta',
      gender: profile.gender ?? 'hombre',
      goal: nextGoal,
      daysPerWeek: nextDays,
      sessionMinutes: nextMinutes,
      level: profile.level,
      jointAlerts: mergedAlerts,
      age: profile.age ?? 26,
      weightKg: liveWeightKg,
      heightCm: liveHeightCm,
      energyLevel: profile.energy_level ?? 'normal',
    })

    let finalDiagnosis: DiagnosisSummary = fallbackDiagnosis

    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/agent/diagnosis', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ profile: recomputedProfile }),
      })

      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; diagnosis?: DiagnosisSummary }
        if (data.ok && data.diagnosis) {
          finalDiagnosis = data.diagnosis
        }
      }
    } catch {
      // Mantiene diagnóstico determinista verificado si el proveedor no responde
    }

    await saveProfile(
      {
        ...recomputedProfile,
        diagnosis: finalDiagnosis,
      },
      hasCompletedOnboarding(),
    )

    setApplySuggestedGoal(false)
    setUpdatingDiagnosis(false)
    setStatusMessage(`Diagnóstico y rutina actualizados (${finalDiagnosis.bmi} IMC · ${finalDiagnosis.categoryLabel}).`)
  }

  const rows: Array<[string, string]> = [
    ['Cluster Determinista', profile.cluster_id ?? plan.clusterId ?? 'H-4'],
    ['Estructura Diaria', 'Calentamiento · 5 Ejercicios · Abdomen · Cardio'],
    ['Modo de Tiempo', profile.time_mode?.replace('_', ' ') ?? '90 MIN'],
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
          <p className="font-display text-2xl font-bold tracking-wide text-primary uppercase">FORJA</p>
          <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted">v2.0 PWA</span>
        </div>
        <h1 className="font-display text-5xl leading-none font-bold uppercase">{profile.name || 'Atleta'}</h1>
        <p className="text-muted">Entrena los días que elegiste. Con exigencia.</p>
      </header>

      {/* CUENTA Y MEMBRESÍA SEGURA */}
      <section aria-labelledby="cuenta-segura" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="cuenta-segura" className="flex items-center gap-2 font-display text-xl font-bold uppercase">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Membresía y Seguridad
          </h2>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-primary">
            {account.authenticated ? 'Sesión Segura Activa' : 'Modo Local'}
          </span>
        </div>

        {account.authenticated ? (
          <div className="flex flex-col gap-1 text-xs text-muted">
            <p>
              Cuenta protegida: <span className="font-mono text-text">{account.maskedEmail}</span>
            </p>
            {account.courtesyCodeUsed && (
              <p>
                Código de cortesía activo: <span className="font-mono text-primary">{account.courtesyCodeUsed}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted">
            Inicia sesión o activa tu código de cortesía para resguardar tu perfil, diagnóstico corporal e historial de entrenamientos en el servidor.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {account.role === 'admin' && (
            <Link
              href="/admin"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-primary/50 bg-surface-2 text-sm font-semibold text-primary hover:border-primary"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Panel Admin: Códigos de Cortesía y Clientes
            </Link>
          )}

          {account.authenticated ? (
            <button
              type="button"
              onClick={() => void logoutUser()}
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-bg text-sm font-semibold text-muted hover:border-accent hover:text-accent"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar Sesión Segura
            </button>
          ) : (
            <Link
              href="/acceso"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-bg text-sm font-semibold text-text hover:border-primary"
            >
              Ir a Pantalla de Acceso / Código de Cortesía
            </Link>
          )}
        </div>
      </section>

      {/* CALCULADORA IMC Y DIAGNÓSTICO CORPORAL + IA */}
      <section aria-labelledby="diagnostico-corporal" className="flex flex-col gap-4 rounded-xl border border-primary/40 bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="diagnostico-corporal" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Scale className="h-5 w-5 text-primary" aria-hidden="true" />
            Calculadora & Diagnóstico Corporal
          </h2>
          <span className="rounded bg-surface-2 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
            {activeDiagnosis.source === 'ai' ? 'IA + Biomecánica' : 'Motor Clínico FORJA'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="perfil-peso-kg" className="text-xs font-semibold text-muted">
              Peso actual (kg)
            </label>
            <input
              id="perfil-peso-kg"
              type="text"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ''))}
              className="h-12 rounded-md border border-border bg-bg px-3 font-mono text-base font-bold text-text"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="perfil-estatura-cm" className="text-xs font-semibold text-muted">
              Estatura (cm)
            </label>
            <input
              id="perfil-estatura-cm"
              type="text"
              inputMode="numeric"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value.replace(/[^0-9.]/g, ''))}
              className="h-12 rounded-md border border-border bg-bg px-3 font-mono text-base font-bold text-text"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface-2 p-3.5" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-primary">IMC {liveMetrics.bmi}</span>
              <span className="rounded bg-bg px-2 py-0.5 text-xs font-semibold text-text">
                {liveMetrics.categoryLabel}
              </span>
            </div>
            <span className="font-mono text-xs text-muted">
              Peso ideal: {liveMetrics.idealWeightMinKg}–{liveMetrics.idealWeightMaxKg} kg
            </span>
          </div>

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-bg" aria-hidden="true">
            <div className="grid h-full w-full grid-cols-4">
              <span className="bg-sky-500/50" />
              <span className="bg-emerald-500/70" />
              <span className="bg-amber-500/70" />
              <span className="bg-rose-500/70" />
            </div>
            <span
              style={{ left: `${bmiGaugePercent}%` }}
              className="absolute top-0 h-full w-2 -translate-x-1/2 rounded-full bg-text ring-2 ring-bg"
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted">
            <span>&lt;18.5 Bajo</span>
            <span>18.5–24.9 Ideal</span>
            <span>25–29.9 Sobrepeso</span>
            <span>30+ Prioridad</span>
          </div>

          <p className="text-sm font-semibold text-text">{activeDiagnosis.headline}</p>

          <ul className="flex flex-col gap-1.5 pt-1 text-xs leading-relaxed text-muted">
            {activeDiagnosis.aiInsights.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {liveMetrics.suggestedGoal !== profile.goal && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={applySuggestedGoal}
              onChange={(e) => setApplySuggestedGoal(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span>
              Cambiar también mi objetivo a la estrategia sugerida:{' '}
              <strong className="text-primary">{GOAL_LABEL[liveMetrics.suggestedGoal]}</strong>
            </span>
          </label>
        )}

        <button
          type="button"
          disabled={updatingDiagnosis}
          onClick={() => void handleRecalculateDiagnosis()}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {updatingDiagnosis ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Actualizando diagnóstico y rutina...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Guardar Peso y Actualizar Diagnóstico IA
            </>
          )}
        </button>

        {statusMessage && (
          <p role="status" aria-live="polite" className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{statusMessage}</span>
          </p>
        )}
      </section>

      {/* METAS NUTRICIONALES DETERMINISTAS */}
      <section aria-labelledby="nutricion-meta" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="nutricion-meta" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Flame className="h-5 w-5 text-accent" aria-hidden="true" />
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
        <p className="text-xs leading-relaxed text-muted">{macros.objectiveNote}</p>
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
        <div className="flex flex-col gap-2.5">
          <Link
            href="/quiz"
            className="flex h-14 items-center justify-center rounded-md bg-primary font-semibold text-primary-ink transition-opacity hover:opacity-90"
          >
            Reconfigurar en Quiz
          </Link>
          <button
            type="button"
            onClick={() => {
              void resetToNewUser().then(() => {
                router.push('/quiz')
              })
            }}
            className="flex h-12 items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-muted transition-colors hover:border-primary/50 hover:text-text"
          >
            Probar como Nuevo Alumno (Resetear Onboarding)
          </button>
        </div>
      </section>

      {/* CATÁLOGO OFICIAL VERIFICADO NAIU */}
      <section aria-labelledby="naiu" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="naiu" className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Catálogo Oficial NAIU Vital
          </h2>
          <span className="text-xs font-semibold text-primary">Aliado Oficial</span>
        </div>

        <div className="flex flex-col gap-2.5 rounded-xl border border-primary/40 bg-surface-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase">Recomendado para tu perfil</span>
            {naiuCard.price && <span className="font-mono text-xs font-bold text-primary">{naiuCard.price}</span>}
          </div>
          <h3 className="font-display text-2xl font-bold">{naiuCard.product_name}</h3>
          <p className="text-sm leading-relaxed text-muted">{naiuCard.reason}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="font-mono text-xs text-muted">Dosis: {naiuCard.dosage}</span>
            <a
              href={naiuCard.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-1 rounded bg-primary px-3 text-xs font-semibold text-primary-ink"
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
                className="flex h-full min-h-28 flex-col gap-1.5 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-primary"
              >
                <span className="flex items-start justify-between gap-1 text-sm font-semibold leading-snug">
                  {product.name}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </span>
                <span className="text-xs leading-relaxed text-muted">{product.tagline}</span>
                <span className="mt-auto pt-1 font-mono text-xs font-semibold text-primary">{product.price}</span>
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </m.a>
            </li>
          ))}
        </ul>

        <a
          href={NAIU_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:border-primary hover:text-text"
        >
          <span>Asesoría y pedidos directos NAIU por WhatsApp ({NAIU_WHATSAPP_DISPLAY})</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted">
        Una muestra de ARKA · Aliado Oficial NAIU (naiu.bio) · PWA Mobile-First WCAG 2.2 AA
      </footer>
    </div>
  )
}
