import type { BodyCategory, DiagnosisSummary, Gender, Goal, JointAlert } from '@/data/types'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { ROUTINE_CLUSTERS, resolveClusterId, resolveTimeMode } from '@/data/clusters'

export interface BodyDiagnosisInput {
  name?: string
  gender: Gender
  age: number
  weightKg: number
  heightCm: number
  daysPerWeek?: 3 | 4 | 5
  sessionMinutes?: 60 | 90 | 120
  goal?: Goal
  energyLevel?: 'bajo' | 'normal' | 'alto'
  jointAlerts?: JointAlert[]
}

export interface BodyMetrics {
  bmi: number
  category: BodyCategory
  categoryLabel: string
  idealWeightMinKg: number
  idealWeightMaxKg: number
  idealWeightMidKg: number
  weightDeltaKg: number
  suggestedGoal: Goal
  suggestedJointAlert: JointAlert | null
  recommendMetabolicCardio: boolean
  headline: string
  recommendationText: string
}

export function calculateBodyMetrics(input: {
  weightKg: number
  heightCm: number
  gender?: Gender
}): BodyMetrics {
  const safeWeight = Math.min(250, Math.max(35, Number.isFinite(input.weightKg) ? input.weightKg : 70))
  const safeHeightCm = Math.min(235, Math.max(120, Number.isFinite(input.heightCm) ? input.heightCm : 170))
  const heightM = safeHeightCm / 100

  const rawBmi = safeWeight / (heightM * heightM)
  const bmi = Math.round(rawBmi * 10) / 10

  const idealWeightMinKg = Math.round(18.5 * heightM * heightM * 10) / 10
  const idealWeightMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10
  const idealWeightMidKg = Math.round(22.0 * heightM * heightM * 10) / 10

  let weightDeltaKg = 0
  if (safeWeight < idealWeightMinKg) {
    weightDeltaKg = Math.round((safeWeight - idealWeightMinKg) * 10) / 10
  } else if (safeWeight > idealWeightMaxKg) {
    weightDeltaKg = Math.round((safeWeight - idealWeightMaxKg) * 10) / 10
  }

  if (bmi < 18.5) {
    const neededKg = Math.abs(weightDeltaKg).toFixed(1)
    return {
      bmi,
      category: 'bajo_peso',
      categoryLabel: 'Bajo de peso',
      idealWeightMinKg,
      idealWeightMaxKg,
      idealWeightMidKg,
      weightDeltaKg,
      suggestedGoal: 'ganar_masa',
      suggestedJointAlert: null,
      recommendMetabolicCardio: false,
      headline: 'Estás bajo de peso respecto a tu rango base: vamos a construir masa muscular limpia.',
      recommendationText: `Estás aproximadamente ${neededKg} kg por debajo del mínimo saludable (${idealWeightMinKg}–${idealWeightMaxKg} kg para ${safeHeightCm} cm). Te recomendamos etapa de Ganar Masa Muscular con superávit calórico limpio (+12% kcal), proteína en 2.0 g/kg y 5 ejercicios pesados de fuerza por día sin desgaste innecesario de cardio.`,
    }
  }

  if (bmi < 25.0) {
    const suggestedGoal: Goal = bmi < 22.8 ? 'ganar_masa' : 'marcar_tonificar'
    return {
      bmi,
      category: 'peso_ideal',
      categoryLabel: 'Peso ideal',
      idealWeightMinKg,
      idealWeightMaxKg,
      idealWeightMidKg,
      weightDeltaKg: 0,
      suggestedGoal,
      suggestedJointAlert: null,
      recommendMetabolicCardio: bmi >= 23.0,
      headline: 'Estás en peso ideal: vamos a subir masa muscular limpia y marcar.',
      recommendationText: `Tu peso actual (${safeWeight} kg) está dentro del rango óptimo (${idealWeightMinKg}–${idealWeightMaxKg} kg para ${safeHeightCm} cm). Es el mejor punto de partida para hipertrofia estética y recomposición: progresar cargas en tus 5 bloques diarios, esculpir abdomen en circuito y sostener proteína alta.`,
    }
  }

  if (bmi < 30.0) {
    const excessKg = Math.abs(weightDeltaKg).toFixed(1)
    return {
      bmi,
      category: 'sobrepeso',
      categoryLabel: 'Sobrepeso moderado',
      idealWeightMinKg,
      idealWeightMaxKg,
      idealWeightMidKg,
      weightDeltaKg,
      suggestedGoal: 'bajar_peso',
      suggestedJointAlert: null,
      recommendMetabolicCardio: true,
      headline: 'Estás en rango de sobrepeso: vamos a oxidar grasa con pesas y marcar sin perder músculo.',
      recommendationText: `Estás cerca de ${excessKg} kg por encima del tope base (${idealWeightMinKg}–${idealWeightMaxKg} kg para ${safeHeightCm} cm). Sugerimos déficit inteligente (-20% kcal) manteniendo tus 5 ejercicios de fuerza + circuito abdominal + 10 min de cardio metabólico al cierre para bajar porcentaje graso conservando tono muscular.`,
    }
  }

  const excessKg = Math.abs(weightDeltaKg).toFixed(1)
  return {
    bmi,
    category: 'obesidad',
    categoryLabel: 'Sobrepeso alto · Prioridad articular',
    idealWeightMinKg,
    idealWeightMaxKg,
    idealWeightMidKg,
    weightDeltaKg,
    suggestedGoal: 'bajar_peso',
    suggestedJointAlert: 'rodilla',
    recommendMetabolicCardio: true,
    headline: 'Prioridad oxidación de grasa con pesas + blindaje articular activo.',
    recommendationText: `Tu peso está ${excessKg} kg sobre el rango base (${idealWeightMinKg}–${idealWeightMaxKg} kg para ${safeHeightCm} cm). Activamos estrategia de oxidación de grasa con pesas guiadas, protección preventiva de rodillas y caminadora inclinada sin impacto de trote.`,
  }
}

export function buildBaseDiagnosisSummary(input: BodyDiagnosisInput): DiagnosisSummary {
  const metrics = calculateBodyMetrics({
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    gender: input.gender,
  })
  const days = input.daysPerWeek ?? 4
  const minutes = input.sessionMinutes ?? 90
  const effectiveGoal = input.goal ?? metrics.suggestedGoal
  const clusterId = resolveClusterId(input.gender, days)
  const timeMode = resolveTimeMode(minutes)
  const cluster = ROUTINE_CLUSTERS[clusterId]

  const macros = calculateMacros({
    gender: input.gender,
    age: input.age,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    daysPerWeek: days,
    goal: effectiveGoal,
  })

  const naiu = selectNaiuSuperfood(input.gender, effectiveGoal, input.energyLevel, input.jointAlerts)
  const firstName = (input.name ?? 'Atleta').trim().split(/\s+/)[0] || 'Atleta'

  const insights: string[] = [
    `${firstName}, tu IMC actual es ${metrics.bmi} (${metrics.categoryLabel}). Para tus ${input.heightCm} cm, tu rango saludable de referencia es ${metrics.idealWeightMinKg}–${metrics.idealWeightMaxKg} kg.`,
    `Tu rutina queda estructurada en el Cluster ${clusterId} (${cluster.daysPerWeek} días · Modo ${timeMode.replace('_', ' ')}): cada día ejecuta Calentamiento articular → 5 bloques principales de fuerza → Circuito de Abdomen → ${minutes >= 90 || metrics.recommendMetabolicCardio ? '10 min de Cardio metabólico' : 'cierre activo sin cardio extra'}.`,
    `Tu meta nutricional Mifflin-St Jeor es de ${macros.targetCalories} kcal/día (${macros.proteinGrams}g proteína · ${macros.carbGrams}g carbos · ${macros.fatGrams}g grasas), potenciada con ${naiu.product_name}.`,
  ]

  return {
    bmi: metrics.bmi,
    category: metrics.category,
    categoryLabel: metrics.categoryLabel,
    idealWeightMinKg: metrics.idealWeightMinKg,
    idealWeightMaxKg: metrics.idealWeightMaxKg,
    weightDeltaKg: metrics.weightDeltaKg,
    suggestedGoal: metrics.suggestedGoal,
    headline: metrics.headline,
    aiInsights: insights,
    source: 'deterministic',
    generatedAt: new Date().toISOString(),
  }
}
