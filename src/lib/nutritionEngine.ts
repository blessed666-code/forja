import { getNaiuProduct, type NaiuProductSlug } from '@/data/naiu'
import type { Gender, Goal, JointAlert, NaiuRecommendation, Profile } from '@/data/types'

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

  // Fórmula clínica Mifflin-St Jeor
  let tmb = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (gender === 'hombre') {
    tmb += 5
  } else {
    tmb -= 161
  }

  // Factor de actividad física según días reales de entrenamiento
  let activityFactor = 1.55
  if (daysPerWeek <= 3) activityFactor = 1.45
  else if (daysPerWeek === 4) activityFactor = 1.55
  else activityFactor = 1.65

  const tdee = Math.round(tmb * activityFactor)

  // Ajuste calórico determinista según objetivo
  let calorieAdjustment = 1.0
  const proteinPerKg = 2.0
  let objectiveNote = 'Mantenimiento y recomposición muscular'

  if (goal === 'bajar_peso' || goal === 'grasa') {
    calorieAdjustment = 0.8 // Déficit del 20%
    objectiveNote = 'Déficit calórico inteligente para oxidar grasa protegiendo masa muscular con pesas'
  } else if (goal === 'ganar_masa' || goal === 'masa' || goal === 'fuerza') {
    calorieAdjustment = 1.12 // Superávit controlado del 12%
    objectiveNote = 'Superávit calórico controlado para hipertrofia limpia sin acumular grasa innecesaria'
  } else {
    calorieAdjustment = 1.0
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

export function buildNaiuRecommendation(slug: NaiuProductSlug, customReason?: string): NaiuRecommendation {
  const product = getNaiuProduct(slug)
  return {
    show_naiu_card: true,
    product_slug: product.id,
    product_name: `${product.name} — NAIU`,
    price: product.price,
    reason: customReason ?? product.benefit,
    dosage: product.dosage,
    cta_text: `Ver ${product.name} (${product.price})`,
    cta_url: product.url,
  }
}

export function selectNaiuSuperfood(
  gender: Gender,
  goal: Goal,
  energyLevel?: 'bajo' | 'normal' | 'alto',
  jointAlerts?: JointAlert[],
): NaiuRecommendation {
  // Disparador 1: Energía percibida baja + cuidado articular -> Camu Camu (colágeno + cortisol/recuperación)
  if (energyLevel === 'bajo' && jointAlerts && jointAlerts.length > 0) {
    return buildNaiuRecommendation(
      'camu-camu',
      'Por tu energía baja y cuidado articular activo, el Camu Camu NAIU aporta Vitamina C natural de alta absorción para síntesis de colágeno en tendones, menor fatiga y mejor recuperación.',
    )
  }

  // Disparador 2: Energía percibida baja al entrenar -> Chontaduro en Polvo o Maca según objetivo
  if (energyLevel === 'bajo' && (goal === 'ganar_masa' || goal === 'masa')) {
    return buildNaiuRecommendation(
      'chontaduro',
      'Para subir energía diaria y sostener tu etapa de masa muscular, el Chontaduro en Polvo NAIU aporta energía limpia del Pacífico, aminoácidos esenciales y micronutrientes.',
    )
  }

  // Disparador 3: Mujer con enfoque glúteo / tonificación / recomposición / oxidación de grasa
  if (gender === 'mujer' && (goal === 'marcar_tonificar' || goal === 'recomposicion' || goal === 'bajar_peso' || goal === 'grasa')) {
    return buildNaiuRecommendation(
      'maca-roja',
      'Optimizada para vitalidad femenina, balance hormonal, densidad ósea, antioxidantes y mejor recuperación en tus sesiones de glúteo y pierna.',
    )
  }

  // Disparador 4: Energía baja general -> Camu Camu (fatiga / estrés oxidativo)
  if (energyLevel === 'bajo') {
    return buildNaiuRecommendation(
      'camu-camu',
      'Ideal cuando sientes fatiga o estrés alto: concentra Vitamina C y antioxidantes puros que modulan el cortisol y blindan tu recuperación diaria.',
    )
  }

  // Disparador 5: Fuerza, masa muscular o pre-entreno natural (Hombres y Mujeres en hipertrofia/fuerza)
  return buildNaiuRecommendation(
    'maca-negra',
    'Pre-entreno 100% natural para tus series pesadas: eleva resistencia física, potencia muscular y enfoque mental sin alterar el sistema nervioso.',
  )
}

/**
 * Detecta si la consulta del usuario en el Coach amerita recomendar un producto específico
 * del catálogo real de NAIU Vital y devuelve la tarjeta exacta con su URL oficial.
 */
export function matchNaiuProductForMessage(message: string, profile?: Profile): NaiuRecommendation | null {
  const q = message.toLowerCase()

  if (['chocolate de mesa', 'chocolate caliente'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('chocolate-mesa-cooagronevada')
  }

  if (['cacao', 'chocolate', 'bombeo', 'oxido nitrico', 'óxido nítrico'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('cacao-seynekun')
  }

  if (['cafe', 'café', 'despertar', 'madrugar', 'mañana temprano'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('cafe-seynekun')
  }

  if (['chontaduro', 'calorias extra', 'calorías extra', 'subir de peso', 'batido energetico', 'batido energético'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('chontaduro')
  }

  if (
    [
      'camu',
      'vitamina c',
      'colageno',
      'colágeno',
      'tendon',
      'tendón',
      'articulacion',
      'articulación',
      'defensas',
      'estres',
      'estrés',
      'cortisol',
      'recuperar',
      'recuperacion',
      'recuperación',
    ].some((w) => q.includes(w))
  ) {
    return buildNaiuRecommendation('camu-camu')
  }

  if (['maca roja', 'hormonal', 'menstrual', 'ciclo', 'gluteo', 'glúteo'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('maca-roja')
  }

  if (['maca negra'].some((w) => q.includes(w))) {
    return buildNaiuRecommendation('maca-negra')
  }

  const generalTriggers = [
    'naiu',
    'suplemento',
    'suplementos',
    'superalimento',
    'superalimentos',
    'que venden',
    'qué venden',
    'catalogo',
    'catálogo',
    'precio',
    'comprar',
    'tomar',
    'energia',
    'energía',
    'preentreno',
    'pre-entreno',
    'maca',
    'rendir',
    'cansado',
    'cansada',
    'fatiga',
    'fuerza',
    'batido',
    'proteina',
    'proteína',
  ]

  if (generalTriggers.some((w) => q.includes(w))) {
    return selectNaiuSuperfood(
      profile?.gender ?? 'hombre',
      profile?.goal ?? 'ganar_masa',
      profile?.energy_level,
      profile?.joint_alerts,
    )
  }

  return null
}
