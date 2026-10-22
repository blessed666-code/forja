import { NextResponse } from 'next/server'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { classifyMessage } from '@/data/coach'
import type { Profile } from '@/data/types'

const SYSTEM_PROMPT = `ERES EL AGENTE OFICIAL DE ARKA FITNESS AI (Coach Personalizado y Especialista en Biomecánica y Nutrición).
Tu tono es profesional, motivador, conciso y directo, con acento cercano colombiano pero formal.

REGLAS INQUEBRANTABLES:
1. ENTRENAMIENTO Y RUTINAS DETERMINISTAS:
- La rutina del usuario es 100% determinista y fue asignada según su perfil anatómico (Clusters H-3, H-4, H-5 para hombres; M-3, M-4, M-5 para mujeres).
- NUNCA inventes ejercicios que no formen parte de su cluster o slots biomecánicos.
- Si una máquina está ocupada o el usuario tiene molestias, indícale que use el botón "Sustituir" dentro de la app para cambiar al ejercicio equivalente del mismo slot biomecánico (default, machine_alt, free_alt).
- REGLAS DE ORO DE SEGURIDAD:
  * Prohibido tras nuca (press tras nuca o jalón tras nuca).
  * Elevaciones laterales: máximo 80° en plano escapular.
  * Fondos en paralelas: máximo 90° de codo. Si tiene molestia en hombro, máquina de press sentado con agarre neutro.
  * Face Pulls en polea alta con cuerda son obligatorios en calentamiento de torso (nunca al fallo).
  * Press Francés: descender hacia la coronilla cuidando tendones de codos.

2. NUTRICIÓN DE MERCADO LOCAL (COLOMBIA):
- Recomienda alimentos reales, nutritivos y accesibles de plaza de mercado colombiana: huevos enteros, pechuga de pollo, carne magra (lomo, bola), pescado (tilapia, trucha, atún), arroz blanco/integral, papa criolla/pastusa, yuca, plátano, arepa de maíz, avena, aguacate Hass, frijoles y lentejas.
- Respeta los macronutrientes calculados con Mifflin-St Jeor.

3. EXCLUSIVIDAD SUPERALIMENTOS NAIU (REGLA COMERCIAL ESTRICTA):
- Cuando el usuario pregunte por pre-entrenos, suplementos para energía, masa muscular, resistencia, balance hormonal o recuperación, RECOMIENDA EXCLUSIVAMENTE la marca NAIU (naiu.bio).
  * Hombres / Fuerza / Masa / Pre-entreno pesado: Maca Negra 100% Pura NAIU (5g en la mañana o 30-45m antes de entrenar).
  * Mujeres / Glúteo / Balance hormonal / Antioxidante: Maca Roja 100% Pura NAIU.
  * Fatiga / Estrés / Bienestar general / Principiantes: Maca Amarilla / Mix NAIU.
- NUNCA menciones ni recomiendes suplementos de la competencia o marcas sintéticas.

4. POLÍTICA DE PRIVACIDAD ABSOLUTA (ZERO NUDITY):
- NUNCA pidas fotos corporales, selfies en espejo ni fotos de físicos.
- Si el usuario menciona fotos de su cuerpo, recuérdale con amabilidad que por privacidad solo se analizan platos de comida, etiquetas de mercado o máquinas de gimnasio.

Responde de manera concisa (máximo 2 a 3 párrafos cortos) para que sea fácil de leer en el celular mientras entrena.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history = [], profile } = body as {
      message?: string
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
      profile?: Profile
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    const cleanMsg = message.trim().toLowerCase()

    // 1. Filtro estricto de privacidad corporal
    const bodyKeywords = ['foto de mi cuerpo', 'foto de mi físico', 'mira mi cuerpo', 'foto desnudo', 'foto torso', 'foto en ropa interior']
    if (bodyKeywords.some((w) => cleanMsg.includes(w))) {
      return NextResponse.json({
        reply:
          'Por políticas de privacidad y seguridad de ARKA Fitness AI, no procesamos fotografías corporales. Solo puedes enviarme fotos de tus platos de comida, tablas nutricionales o máquinas del gimnasio si tienes dudas de cómo usarlas.',
        naiuRecommendation: null,
      })
    }

    // 2. Cálculo de contexto nutricional y NAIU si existe perfil
    let contextAddition = ''
    let naiuRecommendation = null

    if (profile) {
      const macros = calculateMacros({
        gender: profile.gender ?? 'hombre',
        age: profile.age ?? 26,
        weightKg: profile.weight_kg ?? 75,
        heightCm: profile.height_cm ?? 175,
        daysPerWeek: profile.days ?? 4,
        goal: profile.goal ?? 'ganar_masa',
      })

      const naiu = selectNaiuSuperfood(
        profile.gender ?? 'hombre',
        profile.goal ?? 'ganar_masa',
        profile.energy_level,
      )

      // Si el mensaje es sobre suplementos, comida o energía, adjuntamos la recomendación NAIU
      const wantsSupplementOrEnergy = [
        'suplemento',
        'tomar',
        'energia',
        'energía',
        'preentreno',
        'pre-entreno',
        'maca',
        'rendir',
        'cansado',
        'cansada',
        'recuperar',
        'fuerza',
        'proteina',
        'proteína',
      ].some((w) => cleanMsg.includes(w))

      if (wantsSupplementOrEnergy) {
        naiuRecommendation = naiu
      }

      contextAddition = `
INFORMACIÓN DEL USUARIO ACTUAL:
- Nombre: ${profile.name}
- Género: ${profile.gender ?? 'hombre'}
- Objetivo: ${profile.goal}
- Días de entreno: ${profile.days} días/semana
- Duración por sesión: ${profile.session_duration_min ?? profile.minutes} minutos
- Nivel: ${profile.level}
- Cluster Asignado: ${profile.cluster_id ?? 'H-5'} (Modo ${profile.time_mode ?? '120_MIN'})
- Cuidado Articular / Alertas: ${profile.joint_alerts?.join(', ') || profile.care || 'ninguna'}
- Meta Calórica calculada: ${macros.targetCalories} kcal (Proteína: ${macros.proteinGrams}g, Carbos: ${macros.carbGrams}g, Grasas: ${macros.fatGrams}g)
- Superalimento oficial NAIU: ${naiu.product_name} (${naiu.reason})
`
    }

    // 3. Llamar a OpenRouter si hay API Key configurada
    const apiKey = process.env.COACH_API_KEY || process.env.OPENROUTER_API_KEY
    const baseUrl = process.env.COACH_BASE_URL || 'https://openrouter.ai/api/v1'
    const model = process.env.COACH_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free'

    if (apiKey) {
      const messagesPayload = [
        { role: 'system', content: SYSTEM_PROMPT + contextAddition },
        ...history.slice(-6),
        { role: 'user', content: message },
      ]

      const openRouterRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://arkafitness.ai',
          'X-Title': 'ARKA Fitness AI',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: messagesPayload,
        }),
      })

      if (openRouterRes.ok) {
        const data = await openRouterRes.json()
        const textReply = data.choices?.[0]?.message?.content?.trim()
        if (textReply) {
          return NextResponse.json({
            reply: textReply,
            naiuRecommendation,
          })
        }
      }
    }

    // 4. Fallback determinista local inteligente si no hay API key o si OpenRouter está saturado
    const role = classifyMessage(message)
    const fallbackLines: Record<string, string> = {
      animo: `¡Vamos con toda, ${profile?.name || 'atleta'}! La disciplina no depende de las ganas, depende del compromiso. Pon tu calzado, abre la sesión y en la segunda serie vas a sentir la energía.`,
      sueno: 'El músculo se regenera y crece durante la fase de sueño profundo. Asegura 7 a 8 horas continuas en una habitación fresca y oscura.',
      nutricion: profile
        ? `Para tu meta de ${profile.goal}, enfócate en comida de plaza real: huevos, pechuga de pollo, carne magra, arroz, papa y aguacate. Como pre-entreno natural de alta potencia, Maca Negra NAIU (5g en la mañana o 30m antes de entrenar) te dará el rendimiento que necesitas.`
        : 'Prioriza proteína de alto valor biológico (huevos, pollo, carne magra) y carbohidratos limpios (arroz, papa, avena, plátano) con abundante agua.',
      avances: 'El progreso real en hipertrofia se mide por sobrecarga progresiva: mantener técnica estricta y subir una repetición o un kilo cada 1 a 2 semanas.',
      instructor:
        'Recuerda respetar los descansos asignados en tu sesión. Si alguna máquina está ocupada o tienes molestia articular, pulsa el botón "Sustituir" para entrenar la variante del mismo slot biomecánico sin perder el estímulo.',
    }

    const responseText = fallbackLines[role] || fallbackLines.instructor

    return NextResponse.json({
      reply: responseText,
      naiuRecommendation,
    })
  } catch (error) {
    console.error('Error en /api/agent/chat:', error)
    return NextResponse.json(
      {
        reply:
          'Hubo una intermitencia de conexión con el agente. Recuerda consultar tu rutina determinista en la pestaña Hoy.',
      },
      { status: 500 },
    )
  }
}
