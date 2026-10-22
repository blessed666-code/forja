'use client'

import { AnimatePresence, m } from 'framer-motion'
import { ArrowLeft, Check, ShieldAlert, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PauseMotionButton } from '@/components/motion/PauseMotionButton'
import { buildPlan } from '@/data/routines'
import { SEED_PROFILE } from '@/data/seed'
import type { Gender, Goal, JointAlert, Level, Profile } from '@/data/types'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { matchRoutineCluster } from '@/lib/routineMatcher'
import { saveProfile, useProfile } from '@/lib/store'

const TOTAL_STEPS = 8

export function QuizFlow() {
  const router = useRouter()
  const stored = useProfile()
  const [step, setStep] = useState(0)

  // Estados del cuestionario
  const [name, setName] = useState(stored.name || SEED_PROFILE.name)
  const [gender, setGender] = useState<Gender>(stored.gender || 'hombre')
  const [goal, setGoal] = useState<Goal>(stored.goal || 'ganar_masa')
  const [days, setDays] = useState<3 | 4 | 5>((stored.days === 3 || stored.days === 4 || stored.days === 5 ? stored.days : 4))
  const [minutes, setMinutes] = useState<60 | 90 | 120>(
    stored.session_duration_min === 60 || stored.session_duration_min === 90 || stored.session_duration_min === 120
      ? stored.session_duration_min
      : 90,
  )
  const [level, setLevel] = useState<Level>(stored.level || 'intermedio')
  const [jointAlert, setJointAlert] = useState<JointAlert>((stored.joint_alerts?.[0] as JointAlert) || 'hombro')
  const [age, setAge] = useState<number>(stored.age || 26)
  const [weightKg, setWeightKg] = useState<number>(stored.weight_kg || 75)
  const [heightCm, setHeightCm] = useState<number>(stored.height_cm || 176)
  const [energyLevel, setEnergyLevel] = useState<'bajo' | 'normal' | 'alto'>(stored.energy_level || 'normal')

  const { profile: assignedProfile, clusterName } = matchRoutineCluster({
    name,
    gender,
    goal,
    daysPerWeek: days,
    sessionMinutes: minutes,
    level,
    jointAlerts: jointAlert !== ('ninguna' as unknown as JointAlert) ? [jointAlert] : [],
    age,
    weightKg,
    heightCm,
    energyLevel,
  })

  const plan = buildPlan(assignedProfile)
  const macros = calculateMacros({
    gender,
    age,
    weightKg,
    heightCm,
    daysPerWeek: days,
    goal,
  })
  const naiuCard = selectNaiuSuperfood(gender, goal, energyLevel)
  const progress = (step + 1) / TOTAL_STEPS

  const finish = (): void => {
    saveProfile(assignedProfile)
    router.push('/hoy')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 py-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push('/perfil') : setStep((c) => c - 1))}
            className="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Atrás
          </button>
          <span className="font-mono text-sm text-muted">
            {step + 1} / {TOTAL_STEPS}
          </span>
          <PauseMotionButton className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm" />
        </div>
        <div
          role="progressbar"
          aria-label="Progreso del quiz"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step + 1}
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
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Paso 1 de 7</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cómo te llamas?</h1>
                <p className="mt-1 text-sm text-muted">Configuraremos tu perfil personalizado y asignación de rutina.</p>
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

          {/* PASO 1: GÉNERO / ENFOQUE ANATÓMICO */}
          {step === 1 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Enfoque Anatómico</span>
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
                    {gender === 'hombre' && <Check className="h-5 w-5 text-primary" />}
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
                    {gender === 'mujer' && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted">
                    Énfasis en Glúteo en 3 ángulos (Mayor, Medio, Cadena Posterior), Pierna estética y Torso tonificado.
                  </p>
                </button>
              </div>
            </fieldset>
          )}

          {/* PASO 2: OBJETIVO PRINCIPAL */}
          {step === 2 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Meta</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cuál es tu objetivo?</h1>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  {
                    id: 'ganar_masa',
                    title: 'Ganar Masa Muscular',
                    desc: 'Hipertrofia limpia, aumento de fuerza y desarrollo muscular visible.',
                  },
                  {
                    id: 'marcar_tonificar',
                    title: 'Marcar / Recomposición',
                    desc: 'Construir masa magra mientras reduces porcentaje de grasa corporal.',
                  },
                  {
                    id: 'bajar_peso',
                    title: 'Bajar de Peso (Oxidar Grasa)',
                    desc: 'Déficit calórico inteligente preservando masa muscular con pesas.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as Goal)}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      goal === item.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{item.title}</span>
                      {goal === item.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* BANNER EDUCATIVO INMEDIATO PARA BAJAR DE PESO */}
              {goal === 'bajar_peso' && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    Filosofía ARKA Fitness AI
                  </div>
                  <p className="mt-1 text-text">
                    En ARKA no perderás tu tiempo haciendo solo horas de cardio. La forma más efectiva y científica de oxidar
                    grasa y definir tu cuerpo es entrenando fuerza con pesas + abdomen y un déficit calórico inteligente.
                  </p>
                </m.div>
              )}

              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-14 rounded-md bg-primary font-semibold text-primary-ink"
              >
                Siguiente
              </button>
            </fieldset>
          )}

          {/* PASO 3: DÍAS DISPONIBLES */}
          {step === 3 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Frecuencia Semanal</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cuántos días entrenas?</h1>
                <p className="mt-1 text-sm text-muted">Diseñado para Frecuencia 2 óptima sin riesgo de sobreentrenamiento.</p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  { value: 3, label: '3 días por semana', note: 'Torso / Pierna / Full Body (Ideal si tienes poco tiempo)' },
                  { value: 4, label: '4 días por semana', note: 'Torso / Pierna ×2 (Equilibrio perfecto de recuperación)' },
                  { value: 5, label: '5 días por semana', note: 'Split Completo Pro (Rutina Oficial del Fundador)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setDays(opt.value as 3 | 4 | 5)
                      setStep(4)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      days === opt.value ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{opt.label}</span>
                      {days === opt.value && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 4: TIEMPO POR SESIÓN */}
          {step === 4 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Modulador de Tiempo</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Cuánto tiempo tienes?</h1>
                <p className="mt-1 text-sm text-muted">El motor modula series, descansos y volumen automáticamente.</p>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  {
                    value: 60,
                    label: '60 Minutos (1 Hora — Express)',
                    desc: '3 series compactas por ejercicio, descanso de 60-75s y 2 vueltas de abdomen.',
                  },
                  {
                    value: 90,
                    label: '90 Minutos (1h 30m — Estándar)',
                    desc: 'Básicos a 4 series pesadas + accesorios a 3 series + Abdomen + 10 min cardio.',
                  },
                  {
                    value: 120,
                    label: '120 Minutos (2 Horas — Pro / Fundador)',
                    desc: 'Entrenamiento completo sin prisa: 4 series pesadas + 20 min Abdomen + 10 min cardio.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setMinutes(opt.value as 60 | 90 | 120)
                      setStep(5)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      minutes === opt.value ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{opt.label}</span>
                      {minutes === opt.value && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 5: NIVEL DE EXPERIENCIA */}
          {step === 5 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Capacidad de Trabajo</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Tu nivel actual?</h1>
              </legend>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'principiante', label: 'Principiante', note: 'Tope máximo de 4 ejercicios de fuerza por sesión.' },
                  { id: 'intermedio', label: 'Intermedio', note: 'Tope estándar de 5 ejercicios de fuerza por sesión.' },
                  { id: 'avanzado', label: 'Avanzado', note: '5 a 6 bloques completos de pesas con máxima intensidad.' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLevel(opt.id as Level)
                      setStep(6)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      level === opt.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{opt.label}</span>
                      {level === opt.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 6: CUIDADO ARTICULAR */}
          {step === 6 && (
            <fieldset className="flex flex-col gap-6">
              <legend>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Blindaje Articular</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">¿Alguna zona a cuidar?</h1>
                <p className="mt-1 text-sm text-muted">El sistema aplicará sustituciones biomecánicas preventivas.</p>
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
                    note: 'Reemplaza Sentadilla Libre por Prensa 45° guiada con pies medios/altos.',
                  },
                  {
                    id: 'codo',
                    label: 'Cuidado en Codos',
                    note: 'Sustituye Press Francés libre por extensión en polea con cuerda.',
                  },
                  {
                    id: 'espalda-baja',
                    label: 'Cuidado en Espalda Baja',
                    note: 'Sustituye Peso Muerto libre por hiperextensión 45° con apoyo lumbar.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setJointAlert(opt.id as JointAlert)
                      setStep(7)
                    }}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                      jointAlert === opt.id ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{opt.label}</span>
                      {jointAlert === opt.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted">{opt.note}</p>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* PASO 7: DATOS ANTROPOMÉTRICOS Y ENERGÍA */}
          {step === 7 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault()
                setStep(8)
              }}
            >
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Mifflin-St Jeor & NAIU</span>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">Tus Datos Corporales</h1>
                <p className="mt-1 text-sm text-muted">Para calcular tus macronutrientes exactos y superalimentos NAIU.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label htmlFor="edad" className="flex flex-col gap-1 text-sm font-medium">
                  Edad (años)
                  <input
                    id="edad"
                    type="number"
                    min={15}
                    max={80}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    className="h-12 rounded-md border border-border bg-surface px-3 text-base"
                  />
                </label>
                <label htmlFor="peso" className="flex flex-col gap-1 text-sm font-medium">
                  Peso (kg)
                  <input
                    id="peso"
                    type="number"
                    min={40}
                    max={200}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    required
                    className="h-12 rounded-md border border-border bg-surface px-3 text-base"
                  />
                </label>
              </div>

              <label htmlFor="estatura" className="flex flex-col gap-1 text-sm font-medium">
                Estatura (cm)
                <input
                  id="estatura"
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  required
                  className="h-12 rounded-md border border-border bg-surface px-3 text-base"
                />
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm">Nivel de energía percibido al entrenar:</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['bajo', 'normal', 'alto'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`h-11 rounded-md border text-sm font-semibold capitalize ${
                        energyLevel === lvl ? 'border-primary bg-surface-2' : 'border-border bg-surface'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="mt-2 h-14 rounded-md bg-primary font-semibold text-primary-ink">
                Ver Plan Asignado
              </button>
            </form>
          )}

          {/* PASO 8: RESUMEN Y CONFIRMACIÓN */}
          {step === 8 && (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">Asignación 100% Determinista</span>
                <p className="text-muted">Listo, {name.trim().split(/\s+/)[0]}. Tu plan oficial es:</p>
                <h1 className="font-display text-4xl leading-tight font-bold uppercase">{clusterName}</h1>
                <p className="mt-1 font-mono text-sm text-primary">Modo {minutes} Minutos · Frecuencia {days} días</p>
              </div>

              {/* SESIONES DEL CLUSTER */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-muted uppercase">Sesiones de la semana:</span>
                <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
                  {plan.sessions.map((session) => (
                    <li key={session.id} className="flex flex-col gap-1 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{session.name}</span>
                        <span className="font-mono text-xs text-muted">{session.exercises.length} bloques</span>
                      </div>
                      <span className="text-xs text-muted">
                        Calentamiento: {session.warmupName?.split('—')[0]} + Abdomen {session.absName?.split('—')[0]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RESUMEN DE MACRONUTRIENTES */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">Meta Calórica (Mifflin-St Jeor)</span>
                  <span className="font-mono text-xs text-primary">{macros.targetCalories} kcal / día</span>
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

              {/* TARJETA NAIU */}
              <div className="flex flex-col gap-2 rounded-xl border border-primary/40 bg-surface-2 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase">
                  <Sparkles className="h-4 w-4" />
                  Superalimento Oficial NAIU Recomendado
                </div>
                <h3 className="font-display text-xl font-bold">{naiuCard.product_name}</h3>
                <p className="text-sm text-text leading-relaxed">{naiuCard.reason}</p>
                <p className="text-xs text-muted font-mono">Dosis: {naiuCard.dosage}</p>
              </div>

              {jointAlert !== ('ninguna' as unknown as JointAlert) && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Filtro biomecánico activo: Se han reemplazado automáticamente los ejercicios de alto impacto en {jointAlert} por variantes guiadas y seguras.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={finish}
                className="h-14 rounded-md bg-primary text-lg font-semibold text-primary-ink"
              >
                Comenzar a Entrenar
              </button>
            </div>
          )}
        </m.section>
      </AnimatePresence>
    </div>
  )
}
