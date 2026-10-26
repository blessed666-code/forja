import { NAIU_WHATSAPP_DISPLAY } from './naiu'
import { repsWords, restWords, type PlanSession } from './routines'
import type { HistoryEntry, NaiuRecommendation, Profile } from './types'
import { calculateBodyMetrics } from '@/lib/bodyDiagnosis'
import { matchNaiuProductForMessage, selectNaiuSuperfood } from '@/lib/nutritionEngine'

export type CoachRole = 'instructor' | 'avances' | 'nutricion' | 'sueno' | 'animo'

const RULES: ReadonlyArray<readonly [CoachRole, readonly string[]]> = [
  ['animo', ['no quiero ir', 'flojera', 'dejarlo', 'pereza', 'no tengo ganas', 'rendirme']],
  ['sueno', ['dormir', 'descanso nocturno', 'cansancio', 'cansada', 'cansado', 'sueño', 'insomnio']],
  [
    'nutricion',
    [
      'proteína',
      'proteina',
      'comer',
      'comida',
      'dieta',
      'maca',
      'cacao',
      'cafe',
      'café',
      'chontaduro',
      'camu',
      'chocolate',
      'naiu',
      'suplemento',
      'preentreno',
      'pre-entreno',
      'desayuno',
      'batido',
      'energía',
      'energia',
      'que venden',
      'qué venden',
      'precio',
    ],
  ],
  ['avances', ['racha', 'cuánto llevo', 'cuanto llevo', 'esta semana', 'estancado', 'estancada', 'progreso']],
  ['instructor', ['press', 'serie', 'descanso', 'técnica', 'tecnica', 'sentadilla', 'remo', 'peso', 'ejercicio', 'sustituir']],
]

export function classifyMessage(message: string): CoachRole {
  const text = message.toLowerCase()
  for (const [role, words] of RULES) {
    if (words.some((w) => text.includes(w))) return role
  }
  return 'instructor'
}

export interface CoachContext {
  profile: Profile
  history: HistoryEntry[]
  nextSession: PlanSession | undefined
}

export interface CoachReply {
  role: CoachRole
  lines: string[]
  naiuCard?: NaiuRecommendation | null
}

function weekCount(history: HistoryEntry[]): number {
  const now = new Date()
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return history.filter((h) => new Date(h.date) >= monday).length
}

export function buildDeterministicCoachReply(message: string, ctx: CoachContext): CoachReply {
  const clean = message.toLowerCase()
  const role = classifyMessage(message)
  const naiuMatch = matchNaiuProductForMessage(message, ctx.profile)

  // Si pregunta directamente por el catálogo o qué vende NAIU
  if (
    ['que vende', 'qué vende', 'catalogo', 'catálogo', 'productos naiu', 'precios naiu', 'que tiene naiu', 'qué tiene naiu'].some((w) =>
      clean.includes(w),
    )
  ) {
    return {
      role: 'nutricion',
      lines: [
        'NAIU Vital ofrece 8 superalimentos 100% naturales y orgánicos en Colombia (naiu.bio/tienda/naiu-vital):',
        '• Maca Peruana Negra ($75.000) para fuerza y pre-entreno · Maca Roja ($75.000) para balance hormonal y vitalidad femenina · Camu Camu ($75.000) rico en Vitamina C para tendones y cortisol.',
        '• Chontaduro en Polvo ($35.000) para energía y masa limpia · Café Seynekun ($55.000) y Café Cooagronevada ($55.000) de la Sierra Nevada · Cacao Seynekun ($20.000) y Chocolate de Mesa Orgánico ($38.000).',
        `Para tu perfil actual te recomiendo abajo tu opción principal. Hacen envíos a toda Colombia y atienden por WhatsApp en el ${NAIU_WHATSAPP_DISPLAY}.`,
      ],
      naiuCard:
        naiuMatch ??
        selectNaiuSuperfood(
          ctx.profile.gender ?? 'hombre',
          ctx.profile.goal ?? 'ganar_masa',
          ctx.profile.energy_level,
          ctx.profile.joint_alerts,
        ),
    }
  }

  if (role === 'nutricion') {
    const recommended =
      naiuMatch ??
      selectNaiuSuperfood(
        ctx.profile.gender ?? 'hombre',
        ctx.profile.goal ?? 'ganar_masa',
        ctx.profile.energy_level,
        ctx.profile.joint_alerts,
      )

    const isMass = ctx.profile.goal === 'ganar_masa' || ctx.profile.goal === 'masa' || ctx.profile.goal === 'fuerza'
    return {
      role,
      lines: [
        isMass
          ? 'Para ganar masa limpia, prioriza comida real de plaza colombiana en 3 a 4 tomas: huevos enteros, pechuga de pollo, res magra o tilapia con arroz, papa pastusa, plátano y aguacate Hass.'
          : 'Estructura cada plato con proteína real (huevos, pollo, pescado o carne magra), carbohidrato medido (papa, arepa de maíz o avena) y abundantes vegetales.',
        'Una hora antes de entrenar te funciona excelente un café orgánico de altura o banano con avena; al terminar, asegura tu comida principal dentro de las siguientes 2 horas.',
        `Como apoyo funcional 100% natural para tu perfil, tu aliado clave es ${recommended.product_name} (${recommended.dosage}).`,
      ],
      naiuCard: recommended,
    }
  }

  if (role === 'animo') {
    return {
      role,
      lines: [
        `${ctx.profile.name || 'Atleta'}, hay días pesados y es normal. La constancia le gana a la motivación.`,
        `Hoy te corresponde ${ctx.nextSession?.name ?? 'tu sesión asignada'}. Cumple el calentamiento y la primera serie efectiva; en la segunda serie el cuerpo entra en ritmo.`,
        `Elegiste entrenar ${ctx.profile.days} días con exigencia. Ponte los tenis y abre la sesión.`,
      ],
      naiuCard: naiuMatch,
    }
  }

  if (role === 'sueno') {
    return {
      role,
      lines: [
        'La hipertrofia y la reparación tendinosa ocurren mientras duermes profundo, no durante la serie.',
        'Busca entre 7 y 8 horas continuas en habitación oscura y fresca, soltando pantallas 30 minutos antes.',
        'Si hoy dormiste poco, mantén la técnica estricta en RIR 2 sin buscar el fallo muscular.',
      ],
      naiuCard: naiuMatch,
    }
  }

  if (role === 'avances') {
    const done = weekCount(ctx.history)
    return {
      role,
      lines: [
        done === 0
          ? `Aún tienes pendiente abrir ${ctx.nextSession?.name ?? 'tu primera sesión'} de esta semana.`
          : `Esta semana ya completaste ${done} ${done === 1 ? 'sesión oficial' : 'sesiones oficiales'}.`,
        'La sobrecarga progresiva real consiste en sumar 1 repetición limpia o subir carga cada 1 a 2 semanas respetando el rango del ejercicio.',
      ],
      naiuCard: naiuMatch,
    }
  }

  if (
    ['sobrepeso', 'bajo de peso', 'peso ideal', 'imc', 'diagnóstico', 'diagnostico', 'cuánto debo pesar', 'cuanto debo pesar'].some(
      (w) => clean.includes(w),
    )
  ) {
    const metrics = calculateBodyMetrics({
      weightKg: ctx.profile.weight_kg ?? 75,
      heightCm: ctx.profile.height_cm ?? 175,
      gender: ctx.profile.gender ?? 'hombre',
    })
    return {
      role: 'nutricion',
      lines: [
        `Tu IMC actual es ${metrics.bmi} (${metrics.categoryLabel}). Para tus ${ctx.profile.height_cm ?? 175} cm, tu rango saludable de referencia está entre ${metrics.idealWeightMinKg} y ${metrics.idealWeightMaxKg} kg.`,
        metrics.headline,
        metrics.recommendationText,
      ],
      naiuCard: naiuMatch,
    }
  }

  const first =
    ctx.nextSession?.exercises.find((e) => e.phase === 'strength') ??
    ctx.nextSession?.exercises.find((e) => !e.closer && e.muscle !== 'CARDIO')
  const exLabel = first?.short ?? first?.name ?? 'tu primer básico'
  return {
    role: 'instructor',
    lines: [
      `Con tu esquema de ${ctx.profile.days} días, cada sesión tiene Calentamiento → 5 Ejercicios de Fuerza → Abdomen → Cardio. En ${exLabel} trabajas ${first?.sets ?? 4} series de ${repsWords(first?.reps ?? '8 a 10')} con ${restWords(first?.rest ?? 90)} de descanso.`,
      ctx.profile.care === 'hombro' || ctx.profile.joint_alerts?.includes('hombro')
        ? 'Tienes blindaje de hombro activo: prioriza plano escapular, agarres neutros y nunca bajes de 90° en empujes.'
        : 'Si una estación está ocupada o sientes incomodidad articular, pulsa Sustituir en la sesión para usar la variante exacta del mismo Slot Biomecánico.',
      'Respeta el temporizador completo entre series para sostener la potencia mecánica.',
    ],
    naiuCard: naiuMatch,
  }
}

export function getCoachReply(message: string, ctx: CoachContext): CoachReply {
  return buildDeterministicCoachReply(message, ctx)
}
