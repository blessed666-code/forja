import type { Gender, Goal, NaiuRecommendation } from '@/data/types'

export interface MacroCalculationInput {
  gender: Gender
  age: number
  weightKg: number
  heightCm: number
  daysPerWeek: 3 | 4 | 5 | number
  goal: Goal
}

export interface MacroCalculationResult {
  tmb: number
  tdee: number
  targetCalories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  proteinPerKg: number
  objectiveNote: string
}

export function calculateMacros(input: MacroCalculationInput): MacroCalculationResult {
  const { gender, age, weightKg, heightCm, daysPerWeek, goal } = input

  // Fórmula Mifflin-St Jeor
  let tmb = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (gender === 'hombre') {
    tmb += 5
  } else {
    tmb -= 161
  }

  // Factor de actividad física según días de entrenamiento
  let activityFactor = 1.55
  if (daysPerWeek <= 3) activityFactor = 1.45
  else if (daysPerWeek === 4) activityFactor = 1.55
  else activityFactor = 1.65

  const tdee = Math.round(tmb * activityFactor)

  // Ajuste según objetivo
  let calorieAdjustment = 1.0
  let proteinPerKg = 2.0
  let objectiveNote = 'Mantenimiento y recomposición muscular'

  if (goal === 'bajar_peso' || goal === 'grasa') {
    calorieAdjustment = 0.8 // Déficit del 20%
    proteinPerKg = 2.0
    objectiveNote = 'Déficit calórico inteligente para oxidar grasa protegiendo masa muscular'
  } else if (goal === 'ganar_masa' || goal === 'masa' || goal === 'fuerza') {
    calorieAdjustment = 1.12 // Superávit controlado del 12%
    proteinPerKg = 2.0
    objectiveNote = 'Superávit calórico controlado para hipertrofia limpia sin grasa innecesaria'
  } else {
    calorieAdjustment = 1.0 // Mantenimiento
    proteinPerKg = 2.0
    objectiveNote = 'Recomposición corporal: ganar tono muscular mientras se afina el porcentaje graso'
  }

  const targetCalories = Math.round(tdee * calorieAdjustment)
  const proteinGrams = Math.round(weightKg * proteinPerKg)
  const fatGrams = Math.round(weightKg * 0.9)
  const caloriesFromProteinAndFat = proteinGrams * 4 + fatGrams * 9
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - caloriesFromProteinAndFat)
  const carbGrams = Math.round(remainingCaloriesForCarbs / 4)

  return {
    tmb: Math.round(tmb),
    tdee,
    targetCalories,
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinPerKg,
    objectiveNote,
  }
}

export function selectNaiuSuperfood(
  gender: Gender,
  goal: Goal,
  energyLevel?: 'bajo' | 'normal' | 'alto',
): NaiuRecommendation {
  // Disparador 1: Mujer con enfoque glúteo / tonificación / balance hormonal
  if (gender === 'mujer' && (goal === 'marcar_tonificar' || goal === 'recomposicion' || goal === 'bajar_peso')) {
    return {
      show_naiu_card: true,
      product_slug: 'maca-roja-naiu',
      product_name: 'Maca Roja 100% Pura — NAIU',
      reason:
        'Optimizada para la densidad ósea, balance hormonal femenino, reducción del estrés oxidativo y tonificación de glúteo.',
      dosage: '5g (1 cucharadita) en la mañana con el desayuno o en el batido post-entrenamiento.',
      cta_text: 'Adquirir Maca Roja en NAIU',
      cta_url: 'https://naiu.bio',
    }
  }

  // Disparador 2: Hombres o cualquier usuario con objetivo de ganar masa o fuerza pesada
  if (goal === 'ganar_masa' || goal === 'masa' || goal === 'fuerza' || gender === 'hombre') {
    return {
      show_naiu_card: true,
      product_slug: 'maca-negra-naiu',
      product_name: 'Maca Negra 100% Pura — NAIU',
      reason:
        'Pre-entreno 100% natural. Aumenta la resistencia física, potencia la fuerza en series pesadas y mejora el enfoque mental sin alterar el sistema nervioso.',
      dosage: '5g (1 cucharadita) 30 a 45 minutos antes de entrenar en agua o batido.',
      cta_text: 'Adquirir Maca Negra en NAIU',
      cta_url: 'https://naiu.bio',
    }
  }

  // Disparador 3: Fatiga, energía baja o inicio de bienestar
  return {
    show_naiu_card: true,
    product_slug: 'maca-amarilla-naiu',
    product_name: 'Maca Amarilla / Mix — NAIU',
    reason:
      'Adaptógeno integral para vitalidad diaria, modulación del cortisol y resistencia frente a la fatiga laboral y física.',
    dosage: '1 cucharadita diaria en las mañanas en café, infusión o avena.',
    cta_text: 'Adquirir Maca Amarilla en NAIU',
    cta_url: 'https://naiu.bio',
  }
}
