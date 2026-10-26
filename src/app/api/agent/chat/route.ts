import { NextResponse } from 'next/server'
import { buildDeterministicCoachReply } from '@/data/coach'
import { NAIU_AI_CATALOG_CONTEXT } from '@/data/naiu'
import type { Profile } from '@/data/types'
import { calculateBodyMetrics } from '@/lib/bodyDiagnosis'
import { calculateMacros, matchNaiuProductForMessage, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { verifyOriginHeader } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { sanitizePlainText, validateProfilePayload } from '@/lib/security/validation'
import { getAuthenticatedAccount, isGatekeeperEnforced } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

const SYSTEM_PROMPT = `ERES EL COACH OFICIAL DE FORJA · ARKA FITNESS AI (Especialista en Biomecánica Determinista y Nutrición Funcional en Colombia).
Tu tono es profesional, motivador, técnico, conciso y directo, en español claro de Colombia.

REGLAS INQUEBRANTABLES:
1. ENTRENAMIENTO Y RUTINAS 100% DETERMINISTAS:
- La rutina del alumno fue asignada por el Motor Determinista según su perfil (Clusters H-3, H-4, H-5 para hombres; M-3, M-4, M-5 para mujeres, modulados a 60, 90 o 120 minutos).
- NUNCA inventes rutinas al azar ni ejercicios fuera de los 26 Slots Biomecánicos oficiales.
- Si una máquina está ocupada o siente molestia articular, indícale pulsar "Sustituir" dentro de la sesión para cambiar a la variante equivalente del mismo Slot Biomecánico.
- REGLAS DE ORO DE SALUD ARTICULAR:
  * Prohibido press tras nuca y jalón tras nuca.
  * Elevaciones laterales hasta 80° en plano escapular.
  * Face Pulls en polea alta con cuerda obligatorios en calentamiento de torso (nunca al fallo).
  * Si reporta dolor agudo, indica detener ese ejercicio y consultar fisioterapia/medicina deportiva (tú no diagnosticas patologías).

2. NUTRICIÓN REAL DE PLAZA Y MERCADO COLOMBIANO:
- Recomienda comida real accesible en Colombia: huevos enteros, pechuga de pollo, res magra (lomo, bola, centro de cadera), pescado (tilapia, trucha, atún), arroz, papa pastusa/criolla, yuca, plátano, arepa de maíz, avena, aguacate Hass, fríjol y lenteja.
- Respeta estrictamente los macronutrientes Mifflin-St Jeor calculados en el perfil del usuario.

3. EXCLUSIVIDAD COMERCIAL NAIU VITAL (REGLA ESTRICTA):
- Cuando el alumno pregunte por suplementos, pre-entrenos, energía, masa muscular, balance hormonal, café, cacao, antioxidantes, tendones/colágeno, fatiga o qué vende NAIU, RECOMIENDA EXCLUSIVAMENTE productos reales de NAIU (https://naiu.bio/tienda/naiu-vital):
${NAIU_AI_CATALOG_CONTEXT}
- NUNCA recomiendes marcas de terceros ni inventes productos que no estén en esa lista de 8 productos. No presentes los superalimentos como medicamentos.

4. POLÍTICA ESTRICTA DE PRIVACIDAD (ZERO NUDITY):
- NUNCA solicites selfies, fotos del cuerpo ni fotos de progreso físico.
- Solo se admiten fotos opcionales de platos de comida, tablas nutricionales o máquinas de gimnasio.

Responde en máximo 2 a 3 párrafos breves y accionables para lectura cómoda en el celular.`

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'agent:chat', 20, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Has enviado demasiados mensajes seguidos. Espera ${rl.retryAfterSec}s.` },
      { status: 429, headers: { ...NO_STORE_HEADERS, 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!verifyOriginHeader(req)) {
    return NextResponse.json({ error: 'Origen no autorizado.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  if (isGatekeeperEnforced()) {
    const account = await getAuthenticatedAccount({ allowRefresh: true })
    if (!account) {
      return NextResponse.json(
        { error: 'Inicia sesión con tu cuenta autorizada para usar el Coach.' },
        { status: 401, headers: NO_STORE_HEADERS },
      )
    }
  }

  try {
    const body = (await req.json()) as {
      message?: unknown
      history?: unknown
      profile?: unknown
    }

    const message = sanitizePlainText(body.message, 1000)
    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const cleanMsg = message.toLowerCase()

    // 1. Filtro estricto de privacidad corporal
    const bodyKeywords = [
      'foto de mi cuerpo',
      'foto de mi físico',
      'foto de mi fisico',
      'mira mi cuerpo',
      'foto desnudo',
      'foto desnuda',
      'foto torso',
      'foto en ropa interior',
    ]
    if (bodyKeywords.some((w) => cleanMsg.includes(w))) {
      return NextResponse.json(
        {
          reply:
            'Por políticas de privacidad y seguridad de ARKA Fitness AI, no procesamos fotografías corporales. Solo puedes analizar fotos de platos de comida, tablas nutricionales o máquinas del gimnasio si tienes dudas de cómo usarlas.',
          naiuRecommendation: null,
        },
        { headers: NO_STORE_HEADERS },
      )
    }

    // 2. Validar perfil y calcular contexto determinista + recomendación NAIU real
    const parsedProfile = validateProfilePayload(body.profile)
    const safeProfile: Profile | undefined = parsedProfile.ok ? parsedProfile.profile : undefined

    let contextAddition = ''
    const naiuRecommendation = matchNaiuProductForMessage(message, safeProfile)

    if (safeProfile) {
      const macros = calculateMacros({
        gender: safeProfile.gender ?? 'hombre',
        age: safeProfile.age ?? 26,
        weightKg: safeProfile.weight_kg ?? 75,
        heightCm: safeProfile.height_cm ?? 175,
        daysPerWeek: safeProfile.days ?? 4,
        goal: safeProfile.goal ?? 'ganar_masa',
      })

      const primaryNaiu = selectNaiuSuperfood(
        safeProfile.gender ?? 'hombre',
        safeProfile.goal ?? 'ganar_masa',
        safeProfile.energy_level,
        safeProfile.joint_alerts,
      )

      const bodyMetrics = calculateBodyMetrics({
        weightKg: safeProfile.weight_kg ?? 75,
        heightCm: safeProfile.height_cm ?? 175,
        gender: safeProfile.gender ?? 'hombre',
      })

      contextAddition = `
PERFIL VERIFICADO DEL ALUMNO ACTUAL:
- Nombre: ${safeProfile.name}
- Enfoque anatómico: ${safeProfile.gender ?? 'hombre'}
- Peso / Estatura / IMC: ${safeProfile.weight_kg ?? 75} kg · ${safeProfile.height_cm ?? 175} cm · IMC ${bodyMetrics.bmi} (${bodyMetrics.categoryLabel}, rango ideal ${bodyMetrics.idealWeightMinKg}–${bodyMetrics.idealWeightMaxKg} kg)
- Diagnóstico corporal activo: ${safeProfile.diagnosis?.headline ?? bodyMetrics.headline}
- Objetivo: ${safeProfile.goal}
- Frecuencia: ${safeProfile.days} días/semana (${safeProfile.session_duration_min ?? safeProfile.minutes} min por sesión; estructura diaria: Calentamiento + 5 Ejercicios de Fuerza + Circuito Abdomen + Cardio)
- Nivel: ${safeProfile.level}
- Cluster Determinista: ${safeProfile.cluster_id ?? 'H-4'} (Modo ${safeProfile.time_mode ?? '90_MIN'})
- Alertas articulares: ${safeProfile.joint_alerts?.join(', ') || safeProfile.care || 'ninguna'}
- Meta Nutricional Mifflin-St Jeor: ${macros.targetCalories} kcal/día (Proteína: ${macros.proteinGrams}g, Carbos: ${macros.carbGrams}g, Grasas: ${macros.fatGrams}g)
- Superalimento NAIU principal de su ficha: ${primaryNaiu.product_name} (${primaryNaiu.price ?? ''}) — ${primaryNaiu.cta_url}
${naiuRecommendation ? `- Superalimento NAIU específico para esta pregunta: ${naiuRecommendation.product_name} (${naiuRecommendation.cta_url})` : ''}
`
    }

    // Sanitizar historial reciente (máx. 6 turnos, máx. 1200 caracteres cada uno)
    const rawHistory = Array.isArray(body.history) ? body.history.slice(-6) : []
    const safeHistory = rawHistory
      .filter((item): item is { role: 'user' | 'assistant'; content: string } => {
        if (!item || typeof item !== 'object') return false
        const r = (item as { role?: unknown }).role
        const c = (item as { content?: unknown }).content
        return (r === 'user' || r === 'assistant') && typeof c === 'string'
      })
      .map((item) => ({
        role: item.role,
        content: sanitizePlainText(item.content, 1200),
      }))
      .filter((item) => item.content.length > 0)

    // 3. Consultar proveedor compatible OpenAI / OpenRouter si existe COACH_API_KEY en el servidor
    const apiKey = (process.env.COACH_API_KEY || process.env.OPENROUTER_API_KEY || '').trim()
    const baseUrl = (process.env.COACH_BASE_URL || 'https://openrouter.ai/api/v1').trim().replace(/\/+$/, '')
    const model = (process.env.COACH_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free').trim()

    if (apiKey) {
      const openRouterRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://forja.arka.co',
          'X-Title': 'FORJA · ARKA Fitness AI',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 550,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + contextAddition },
            ...safeHistory,
            { role: 'user', content: message },
          ],
        }),
      })

      if (openRouterRes.ok) {
        const data = (await openRouterRes.json()) as {
          choices?: Array<{ message?: { content?: string } }>
        }
        const textReply = data.choices?.[0]?.message?.content?.trim()
        if (textReply) {
          return NextResponse.json(
            {
              reply: textReply,
              naiuRecommendation,
            },
            { headers: NO_STORE_HEADERS },
          )
        }
      }
    }

    // 4. Motor determinista local con catálogo NAIU real si no hay COACH_API_KEY o el proveedor externo está saturado
    const fallback = buildDeterministicCoachReply(message, {
      profile:
        safeProfile ?? {
          name: 'Atleta',
          goal: 'ganar_masa',
          days: 4,
          minutes: 90,
          place: 'gym',
          level: 'intermedio',
          care: 'ninguna',
        },
      history: [],
      nextSession: undefined,
    })

    return NextResponse.json(
      {
        reply: fallback.lines.join('\n\n'),
        naiuRecommendation: fallback.naiuCard ?? naiuRecommendation,
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      {
        reply:
          'Hubo una intermitencia temporal en el servicio del Coach. Tu rutina determinista sigue disponible en la pestaña Hoy.',
      },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
