'use client'

import { AnimatePresence, m } from 'framer-motion'
import { Activity, ArrowLeft, ArrowUpRight, Check, Loader2, Scale, ShieldAlert, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PauseMotionButton } from '@/components/motion/PauseMotionButton'
import { buildPlan } from '@/data/routines'
import type { DiagnosisSummary, Gender, Goal, JointAlert, Level } from '@/data/types'
import { buildBaseDiagnosisSummary, calculateBodyMetrics } from '@/lib/bodyDiagnosis'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { matchRoutineCluster } from '@/lib/routineMatcher'
import {
  ensureClientCsrfToken,
  hasCompletedOnboarding,
  saveProfile,
  syncSessionFromServer,
  useProfile,
} from '@/lib/store'

const QUESTION_STEPS = 8

type QuizJointOption = 'ninguna' | JointAlert

export function QuizFlow() {
  const router = useRouter()
  const stored = useProfile()
  const hydratedRef = useRef(false)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [goalTouchedManually, setGoalTouchedManually] = useState(false)

  // Estados limpios de formulario
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('hombre')
  const [ageInput, setAgeInput] = useState('26')
  const [weightInput, setWeightInput] = useState('72')
  const [heightInput, setHeightInput] = useState('172')
  const [energyLevel, setEnergyLevel] = useState<'bajo' | 'normal' | 'alto'>('normal')
  const [goal, setGoal] = useState<Goal>('ganar_masa')
  const [days, setDays] = useState<3 | 4 | 5>(4)
  const [minutes, setMinutes] = useState<60 | 90 | 120>(90)
  const [level, setLevel] = useState<Level>('intermedio')
  const [jointAlert, setJointAlert] = useState<QuizJointOption>('ninguna')

  // Estado del diagnóstico pasado por IA / servidor
  const [aiLoading, setAiLoading] = useState(false)
  const [serverDiagnosis, setServerDiagnosis] = useState<DiagnosisSummary | null>(null)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    void syncSessionFromServer().then((meta) => {
      if (meta.enforced && !meta.authenticated) {
        router.replace('/acceso')
        return
      }
      const done = hasCompletedOnboarding()
      setIsCompleted(done)
      if (stored.name) {
        setName(stored.name)
      }
      if (done) {
        if (stored.gender) setGender(stored.gender)
        if (stored.goal) {
          setGoal(stored.goal)
          setGoalTouchedManually(true)
        }
        if (stored.days === 3 || stored.days === 4 || stored.days === 5) setDays(stored.days)
        if (
          stored.session_duration_min === 60 ||
          stored.session_duration_min === 90 ||
          stored.session_duration_min === 120
        ) {
          setMinutes(stored.session_duration_min)
        }
        if (stored.level) setLevel(stored.level)
        const firstAlert = stored.joint_alerts?.[0]
        if (firstAlert === 'hombro' || firstAlert === 'rodilla' || firstAlert === 'codo' || firstAlert === 'espalda-baja') {
          setJointAlert(firstAlert)
        } else {
          setJointAlert('ninguna')
        }
        if (stored.age) setAgeInput(String(stored.age))
        if (stored.weight_kg) setWeightInput(String(stored.weight_kg))
        if (stored.height_cm) setHeightInput(String(stored.height_cm))
        if (stored.energy_level) setEnergyLevel(stored.energy_level)
      }
    })
  }, [router, stored])

  const parsedAge = Math.min(95, Math.max(15, Number.parseInt(ageInput, 10) || 26))
  const parsedWeight = Math.min(240, Math.max(35, Number.parseFloat(weightInput) || 70))
  const parsedHeight = Math.min(230, Math.max(120, Number.parseFloat(heightInput) || 170))

  const bodyMetrics = calculateBodyMetrics({
    weightKg: parsedWeight,
    heightCm: parsedHeight,
    gender,
  })

  const effectiveAlerts: JointAlert[] = jointAlert !== 'ninguna' ? [jointAlert] : []

  const baseDiagnosis = buildBaseDiagnosisSummary({
    name: name.trim() || 'Atleta',
    gender,
    age: parsedAge,
    weightKg: parsedWeight,
    heightCm: parsedHeight,
    daysPerWeek: days,
    sessionMinutes: minutes,
    goal,
    energyLevel,
    jointAlerts: effectiveAlerts,
  })

  const activeDiagnosis = serverDiagnosis ?? baseDiagnosis

  const { profile: matchedProfile, clusterName } = matchRoutineCluster({
    name: name.trim() || 'Atleta',
    gender,
    goal,
    daysPerWeek: days,
    sessionMinutes: minutes,
    level,
    jointAlerts: effectiveAlerts,
    age: parsedAge,
    weightKg: parsedWeight,
    heightCm: parsedHeight,
    energyLevel,
  })

  const assignedProfile = {
    ...matchedProfile,
    diagnosis: activeDiagnosis,
  }

  const plan = buildPlan(assignedProfile)
  const macros = calculateMacros({
    gender,
    age: parsedAge,
    weightKg: parsedWeight,
    heightCm: parsedHeight,
    daysPerWeek: days,
    goal,
  })
  const naiuCard = selectNaiuSuperfood(gender, goal, energyLevel, effectiveAlerts)

  const displayStep = Math.min(step + 1, QUESTION_STEPS)
  const progress = step >= QUESTION_STEPS ? 1 : (step + 1) / QUESTION_STEPS

  const runDiagnosisWithAiAndProceed = async (selectedAlert: QuizJointOption): Promise<void> => {
    setJointAlert(selectedAlert)
    setStep(8)
    setAiLoading(true)

    const alertsForReq: JointAlert[] = selectedAlert !== 'ninguna' ? [selectedAlert] : []
    const { profile: reqProfile } = matchRoutineCluster({
      name: name.trim() || 'Atleta',
      gender,
      goal,
      daysPerWeek: days,
      sessionMinutes: minutes,
      level,
      jointAlerts: alertsForReq,
      age: parsedAge,
      weightKg: parsedWeight,
      heightCm: parsedHeight,
      energyLevel,
    })

    try {
      const csrf = await ensureClientCsrfToken()
      const res = await fetch('/api/agent/diagnosis', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ profile: reqProfile }),
      })

      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; diagnosis?: DiagnosisSummary }
        if (data.ok && data.diagnosis) {
          setServerDiagnosis(data.diagnosis)
        }
      }
    } catch {
      // Mantiene el diagnóstico base determinista si no hay red momentánea
    } finally {
      setAiLoading(false)
    }
  }

  const finish = async (): Promise<void> => {
    setSaving(true)
    await saveProfile(assignedProfile, true)
    router.push('/hoy')
  }

  // Posición visual del marcador de IMC (entre 15 y 35)
  const bmiGaugePercent = Math.min(96, Math.max(4, Math.round(((bodyMetrics.bmi - 15) / 20) * 100)))

  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 py-6 outline-none"
    >
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          {step > 0 || isCompleted ? (
            <button
              type="button"
              onClick={() => (step === 0 ? router.push('/perfil') : setStep((c) => c - 1))}
              className="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Atrás
            </button>
          ) : (
            <span className="font-display text-xl font-bold tracking-wide text-primary uppercase">FORJA</span>
          )}
          <span className="font-mono text-sm text-muted">
            {step >= QUESTION_STEPS ? 'Diagnóstico + Rutina' : `Paso ${displayStep} / ${QUESTION_STEPS}`}
          </span>
          <PauseMotionButton className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm" />
        </div>
        <div
          role="progressbar"
          aria-label="Progreso del diagnóstico de rutina"
          aria-valuemin={1}
          aria-valuemax={QUESTION_STEPS}
          aria-valuenow={displayStep}
          className="h-1.5 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-300"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <m.section
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-6"
        >
          {/* PASO 0: NOMBRE */}
          {step === 0 && (
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim()) setStep(1)
              }}
            >
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 1 de 8 · Identidad</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cómo te llamas?</h1>
                <p className="mt-1 text-sm text-muted">
                  Haremos primero tu diagnóstico corporal base, lo pasaremos por IA y armaremos tu rutina día por día.
                </p>
              </div>
              <label className="flex flex-col gap-1.5" htmlFor="nombre">
                Nombre
                <input
                  id="nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Tu nombre"
                  className="h-14 rounded-md border border-border bg-surface px-4 text-lg text-text focus:border-primary focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={!name.trim()}
                className="h-14 rounded-md bg-primary font-semibold text-primary-ink transition-opacity disabled:opacity-40"
              >
                Continuar
              </button>
            </form>
          )}

          {/* PASO 1: ENFOQUE ANATÓMICO */}
          {step === 1 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 2 de 8 · Enfoque Anatómico</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">Selecciona tu Enfoque</h1>
              </legend>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGender('hombre')
                    setStep(2)
                  }}
                  className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                    gender === 'hombre' ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold uppercase">Hombre</span>
                    {gender === 'hombre' && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                  </div>
                  <p className="text-sm text-muted">
                    Énfasis en Torso en V (Pecho Superior, Espalda Ancha, Hombros 3D, Brazos) y Pierna sólida.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGender('mujer')
                    setStep(2)
                  }}
                  className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                    gender === 'mujer' ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold uppercase">Mujer</span>
                    {gender === 'mujer' && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                  </div>
                  <p className="text-sm text-muted">
                    Énfasis en Glúteo en 3 ángulos (Mayor, Medio, Cadena Posterior), Pierna estética y Torso tonificado.
                  </p>
                </button>
              </div>
            </fieldset>
          )}

          {/* PASO 2: CALCULADORA CORPORAL & DIAGNÓSTICO BASE EN VIVO */}
          {step === 2 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault()
                if (!goalTouchedManually) {
                  setGoal(bodyMetrics.suggestedGoal)
                }
                if (bodyMetrics.suggestedJointAlert && jointAlert === 'ninguna') {
                  setJointAlert(bodyMetrics.suggestedJointAlert)
                }
                setStep(3)
              }}
            >
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Paso 3 de 8 · Calculadora &amp; Diagnóstico Base
                </span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">Tu Diagnóstico Corporal</h1>
                <p className="mt-1 text-sm text-muted">
                  Ingresa edad, peso y estatura para evaluar si estás bajo de peso, en peso ideal o en sobrepeso y sugerir tu estrategia.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <label htmlFor="edad" className="flex flex-col gap-1 text-xs font-medium">
                  Edad (años)
                  <input
                    id="edad"
                    type="number"
                    inputMode="numeric"
                    min={15}
                    max={95}
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    required
                    className="h-12 rounded-md border border-border bg-surface px-3 font-mono text-base text-text focus:border-primary focus:outline-none"
                  />
                </label>
                <label htmlFor="peso" className="flex flex-col gap-1 text-xs font-medium">
                  Peso (kg)
                  <input
                    id="peso"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min={35}
                    max={240}
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    required
                    className="h-12 rounded-md border border-border bg-surface px-3 font-mono text-base text-text focus:border-primary focus:outline-none"
                  />
                </label>
                <label htmlFor="estatura" className="flex flex-col gap-1 text-xs font-medium">
                  Estatura (cm)
                  <input
                    id="estatura"
                    type="number"
                    inputMode="numeric"
                    min={120}
                    max={230}
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    required
                    className="h-12 rounded-md border border-border bg-surface px-3 font-mono text-base text-text focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              {/* TARJETA DE RESULTADO EN VIVO DE LA CALCULADORA */}
              <section
                aria-live="polite"
                aria-label="Resultado de la calculadora corporal"
                className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-surface-2 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
                    <Scale className="h-4 w-4" aria-hidden="true" />
                    Diagnóstico Base en Vivo
                  </span>
                  <span className="rounded-full border border-primary/40 bg-surface px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                    IMC {bodyMetrics.bmi} · {bodyMetrics.categoryLabel}
                  </span>
                </div>

                {/* Barra visual de rangos IMC */}
                <div className="flex flex-col gap-1">
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface">
                    <div className="grid h-full grid-cols-4">
                      <span className="bg-secondary/50" />
                      <span className="bg-primary/80" />
                      <span className="bg-amber-400/75" />
                      <span className="bg-accent/80" />
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-white shadow"
                      style={{ left: `${bmiGaugePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-muted">
                    <span>Bajo &lt;18.5</span>
                    <span>Ideal 18.5–24.9</span>
                    <span>Sobrepeso 25+</span>
                  </div>
                </div>

                <p className="text-sm font-semibold leading-snug text-text">{bodyMetrics.headline}</p>
                <p className="text-xs leading-relaxed text-muted">{bodyMetrics.recommendationText}</p>

                <div className="flex items-center justify-between border-t border-border pt-2 font-mono text-xs">
                  <span className="text-muted">Rango saludable para {parsedHeight} cm:</span>
                  <span className="font-bold text-text">
                    {bodyMetrics.idealWeightMinKg} – {bodyMetrics.idealWeightMaxKg} kg
                  </span>
                </div>
              </section>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm">Nivel de energía percibido al entrenar:</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['bajo', 'normal', 'alto'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`h-11 rounded-md border text-sm font-semibold capitalize ${
                        energyLevel === lvl ? 'border-primary bg-surface-2 text-primary' : 'border-border bg-surface text-text'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="mt-1 h-14 rounded-md bg-primary font-semibold text-primary-ink">
                Confirmar Diagnóstico Base
              </button>
            </form>
          )}

          {/* PASO 3: OBJETIVO (CON SUGERENCIA DEL DIAGNÓSTICO) */}
          {step === 3 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 4 de 8 · Estrategia</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">Confirma tu Objetivo</h1>
                <p className="mt-1 text-sm text-muted">
                  Según tu IMC ({bodyMetrics.bmi} · {bodyMetrics.categoryLabel}), dejamos marcada la estrategia ideal para ti.
                </p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  {
                    id: 'ganar_masa',
                    title: 'Subir Masa Muscular Limpia',
                    desc: 'Superávit controlado (+12% kcal), progresión de fuerza en 5 ejercicios por día y desarrollo visible.',
                  },
                  {
                    id: 'marcar_tonificar',
                    title: 'Subir Masa Muscular y Marcar (Recomposición)',
                    desc: 'Construir densidad muscular magra mientras afinas cintura y porcentaje graso.',
                  },
                  {
                    id: 'bajar_peso',
                    title: 'Oxidar Grasa y Bajar de Peso (Con Pesas)',
                    desc: 'Déficit inteligente (-20% kcal) preservando músculo con 5 ejercicios de fuerza + abdomen + cardio.',
                  },
                ].map((item) => {
                  const isSuggested = bodyMetrics.suggestedGoal === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGoal(item.id as Goal)
                        setGoalTouchedManually(true)
                      }}
                      className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all ${
                        goal === item.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-semibold">{item.title}</span>
                        <div className="flex items-center gap-2">
                          {isSuggested && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                              Sugerido
                            </span>
                          )}
                          {goal === item.id && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                        </div>
                      </div>
                      <p className="text-sm text-muted">{item.desc}</p>
                    </button>
                  )
                })}
              </div>

              {goal === 'bajar_peso' && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Filosofía ARKA Fitness AI
                  </div>
                  <p className="mt-1 text-text">
                    En FORJA no perderás el tiempo haciendo solo horas de cardio. Oxidarás grasa entrenando tus 5 ejercicios de fuerza + circuito abdominal + déficit calórico con proteína en 2.0 g/kg.
                  </p>
                </m.div>
              )}

              <button
                type="button"
                onClick={() => setStep(4)}
                className="h-14 rounded-md bg-primary font-semibold text-primary-ink"
              >
                Siguiente
              </button>
            </fieldset>
          )}

          {/* PASO 4: DÍAS */}
          {step === 4 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 5 de 8 · Frecuencia Semanal</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cuántos días entrenas?</h1>
                <p className="mt-1 text-sm text-muted">Cada día incluye Calentamiento, 5 ejercicios de fuerza, Abdomen y Cardio.</p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  { value: 3, label: '3 días por semana', note: 'Torso / Pierna / Full Body (Agenda compacta de alto estímulo)' },
                  { value: 4, label: '4 días por semana', note: 'Torso / Pierna ×2 (Equilibrio ideal de recuperación)' },
                  { value: 5, label: '5 días por semana', note: 'Split Completo Pro (Rutina Oficial del Fundador)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setDays(opt.value as 3 | 4 | 5)
                      setStep(5)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      days === opt.value ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{opt.label}</span>
                      {days === opt.value && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 5: TIEMPO */}
          {step === 5 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 6 de 8 · Modulador de Tiempo</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cuánto tiempo tienes?</h1>
                <p className="mt-1 text-sm text-muted">El motor modula series, descansos y vueltas de abdomen automáticamente.</p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  {
                    value: 60,
                    label: '60 Minutos (1 Hora — Express)',
                    desc: 'Calentamiento ágil + tus 5 ejercicios a 3 series (pausa 75s) + 2 vueltas de abdomen.',
                  },
                  {
                    value: 90,
                    label: '90 Minutos (1h 30m — Estándar)',
                    desc: 'Calentamiento completo + 5 ejercicios (básicos a 4 series) + 3 vueltas de abdomen + 10m cardio.',
                  },
                  {
                    value: 120,
                    label: '120 Minutos (2 Horas — Pro / Fundador)',
                    desc: 'Sesión total: Calentamiento + 5 bloques pesados + 3 vueltas completas de abdomen + 10m cardio.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setMinutes(opt.value as 60 | 90 | 120)
                      setStep(6)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      minutes === opt.value ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{opt.label}</span>
                      {minutes === opt.value && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 6: NIVEL */}
          {step === 6 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 7 de 8 · Capacidad de Trabajo</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Tu nivel actual?</h1>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'principiante', label: 'Principiante', note: 'Tus 5 ejercicios del día modulados a 3 series controladas cuidando técnica.' },
                  { id: 'intermedio', label: 'Intermedio', note: 'Tus 5 ejercicios con básicos pesados a 4 series y accesorios a 3 series.' },
                  { id: 'avanzado', label: 'Avanzado', note: 'Tus 5 bloques completos con máxima densidad e intensidad RIR.' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLevel(opt.id as Level)
                      setStep(7)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      level === opt.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{opt.label}</span>
                      {level === opt.id && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 7: BLINDAJE ARTICULAR -> GENERACIÓN CON IA */}
          {step === 7 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 8 de 8 · Blindaje Articular</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Alguna zona a cuidar?</h1>
                <p className="mt-1 text-sm text-muted">
                  Al elegir, pasaremos tu diagnóstico base por IA y generaremos tu rutina completa lista para arrancar.
                </p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'ninguna', label: 'Ninguna molestia', note: 'Ejercicios completos sin restricciones.' },
                  {
                    id: 'hombro',
                    label: 'Cuidado en Hombros / Manguito Rotador',
                    note: 'Sustituye Fondos por Press de Pecho en Máquina y prioriza agarres neutros.',
                  },
                  {
                    id: 'rodilla',
                    label: 'Cuidado en Rodillas',
                    note: 'Reemplaza Sentadilla Libre por Prensa 45° guiada y caminadora sin trote.',
                  },
                  {
                    id: 'codo',
                    label: 'Cuidado en Codos',
                    note: 'Sustituye Press Francés libre por extensión en polea alta con cuerda.',
                  },
                  {
                    id: 'espalda-baja',
                    label: 'Cuidado en Espalda Baja',
                    note: 'Sustituye Peso Muerto libre por variante guiada con soporte lumbar.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => void runDiagnosisWithAiAndProceed(opt.id as QuizJointOption)}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      jointAlert === opt.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{opt.label}</span>
                      {jointAlert === opt.id && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 8: DIAGNÓSTICO IA + RUTINA ESTRUCTURADA GENERADA */}
          {step === 8 && (
            <div className="flex flex-col gap-6 pb-8">
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Diagnóstico Completo + Rutina Lista
                </span>
                <p className="text-muted">Listo, {name.trim().split(/\s+/)[0] || 'Atleta'}. Tu plan oficial es:</p>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">{clusterName}</h1>
                <p className="mt-1 font-mono text-sm text-primary">
                  Modo {minutes} Minutos · {days} Días · 5 Ejercicios principales por día
                </p>
              </div>

              {/* TARJETA DEL DIAGNÓSTICO PASADO POR IA */}
              <section
                aria-live="polite"
                aria-label="Diagnóstico generado"
                className="flex flex-col gap-3 rounded-xl border border-primary/50 bg-surface-2 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
                    <Activity className="h-4 w-4" aria-hidden="true" />
                    {aiLoading
                      ? 'Analizando diagnóstico con IA...'
                      : activeDiagnosis.source === 'ai'
                        ? 'Diagnóstico Verificado por IA'
                        : 'Diagnóstico Deportivo FORJA'}
                  </span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                    IMC {activeDiagnosis.bmi} · {activeDiagnosis.categoryLabel}
                  </span>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                    <span>Procesando tus métricas corporales y estructurando tus bloques de fuerza...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold leading-snug text-text">{activeDiagnosis.headline}</p>
                    <ul className="flex flex-col gap-2 text-xs leading-relaxed text-muted">
                      {activeDiagnosis.aiInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              {/* DESGLOSE SEMANAL EXACTO: CADA DÍA CON SUS 5 EJERCICIOS + CALENTAMIENTO + ABDOMEN */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-muted uppercase">
                  Tus {plan.sessions.length} días estructurados (Calentamiento + 5 Ejercicios + Abdomen):
                </span>
                <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
                  {plan.sessions.map((session) => (
                    <li key={session.id} className="flex flex-col gap-2 px-4 py-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-text">
                          Día {session.dayNumber} · {session.name}
                        </span>
                        <span className="shrink-0 rounded-full border border-primary/40 bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                          {session.mainCount} ejercicios
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        1. {session.warmupName?.split('&')[0]?.trim()} → 2. <strong className="text-text">{session.mainCount} Bloques Fuerza</strong> → 3. {session.absName?.split('—')[0]?.trim()}
                        {session.cardioNotes ? ' → 4. Cardio 10m' : ''}
                      </p>
                      <ol className="grid grid-cols-1 gap-0.5 rounded-lg bg-bg p-2.5 font-mono text-[11px] text-muted">
                        {session.strengthPreview.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ul>
              </div>

              {/* METAS NUTRICIONALES */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">Meta Calórica (Mifflin-St Jeor)</span>
                  <span className="font-mono text-xs font-bold text-primary">{macros.targetCalories} kcal / día</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="rounded-lg bg-surface-2 p-2">
                    <span className="block text-xs text-muted">Proteína</span>
                    <span className="font-mono text-lg font-bold">{macros.proteinGrams}g</span>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <span className="block text-xs text-muted">Carbos</span>
                    <span className="font-mono text-lg font-bold">{macros.carbGrams}g</span>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <span className="block text-xs text-muted">Grasas</span>
                    <span className="font-mono text-lg font-bold">{macros.fatGrams}g</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted">{macros.objectiveNote}</p>
              </div>

              {/* SUPERALIMENTO OFICIAL NAIU */}
              <div className="flex flex-col gap-2.5 rounded-xl border border-primary/40 bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Superalimento Oficial NAIU
                  </span>
                  {naiuCard.price && <span className="font-mono text-xs font-bold text-primary">{naiuCard.price}</span>}
                </div>
                <h2 className="font-display text-2xl font-bold">{naiuCard.product_name}</h2>
                <p className="text-sm leading-relaxed text-text">{naiuCard.reason}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-xs text-muted">Dosis: {naiuCard.dosage}</span>
                  <a
                    href={naiuCard.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-1 rounded border border-primary/40 bg-surface px-3 text-xs font-semibold text-primary hover:border-primary"
                  >
                    <span>{naiuCard.cta_text}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                </div>
              </div>

              {jointAlert !== 'ninguna' && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Filtro biomecánico activo: Se han sustituido automáticamente los ejercicios de alto estrés en {jointAlert} por variantes guiadas.
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={saving || aiLoading}
                onClick={() => void finish()}
                className="h-14 rounded-md bg-primary text-lg font-semibold text-primary-ink disabled:opacity-50"
              >
                {saving ? 'Activando Día 1...' : 'Guardar y Empezar Día 1'}
              </button>
            </div>
          )}
        </m.section>
      </AnimatePresence>
    </main>
  )
}
