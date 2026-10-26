import { NextResponse } from 'next/server'
import { NAIU_AI_CATALOG_CONTEXT } from '@/data/naiu'
import type { DiagnosisSummary } from '@/data/types'
import { buildBaseDiagnosisSummary, calculateBodyMetrics } from '@/lib/bodyDiagnosis'
import { calculateMacros, selectNaiuSuperfood } from '@/lib/nutritionEngine'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { sanitizePlainText, validateProfilePayload } from '@/lib/security/validation'
import { getAuthenticatedAccount, isGatekeeperEnforced } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

const DIAGNOSIS_SYSTEM_PROMPT = `ERES EL MOTOR DE DIAGNÓSTICO DEPORTIVO DE FORJA · ARKA FITNESS AI (Colombia).
Recibirás el Diagnóstico Base Determinista de un alumno (IMC, rango de peso saludable, meta calórica Mifflin-St Jeor, Cluster oficial de 5 bloques de fuerza por día, cuidado articular y superalimento NAIU).
NO diagnosticas enfermedades médicas. Tu tarea es redactar una síntesis personalizada, clara, directa y motivadora para arrancar su Día 1.

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE un objeto JSON válido con esta forma exacta (sin bloques markdown):
{"headline": "...", "insights": ["...", "...", "..."]}
2. "headline": 1 frase directa (máx 150 caracteres) indicando su estado ponderal (bajo de peso / peso ideal / sobrepeso) y la estrategia elegida (ej. subir masa muscular limpia y marcar, u oxidar grasa con pesas protegiendo músculo).
3. "insights": arreglo de exactamente 3 puntos breves (máx 320 caracteres cada uno):
   - Punto 1: Lectura clara de su IMC y peso actual frente a su rango saludable en kg.
   - Punto 2: Cómo trabajará su rutina asignada (Calentamiento articular -> 5 ejercicios de fuerza -> Circuito de Abdomen -> Cardio según corresponda) y cuidado articular si aplica.
   - Punto 3: Estrategia nutricional con comida real colombiana respetando sus calorías/proteína + su superalimento oficial NAIU (${NAIU_AI_CATALOG_CONTEXT}).`

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'agent:diagnosis', 15, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes de diagnóstico. Espera ${rl.retryAfterSec}s.` },
      { status: 429, headers: { ...NO_STORE_HEADERS, 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json(
      { error: 'Solicitud bloqueada por protección CSRF. Recarga la página e intenta nuevamente.' },
      { status: 403, headers: NO_STORE_HEADERS },
    )
  }

  if (isGatekeeperEnforced()) {
    const account = await getAuthenticatedAccount({ allowRefresh: true })
    if (!account) {
      return NextResponse.json(
        { error: 'Inicia sesión con tu cuenta autorizada para generar tu diagnóstico.' },
        { status: 401, headers: NO_STORE_HEADERS },
      )
    }
  }

  try {
    const body = (await req.json()) as { profile?: unknown }
    const validated = validateProfilePayload(body.profile)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const safeProfile = validated.profile
    const gender = safeProfile.gender ?? 'hombre'
    const days = safeProfile.days === 3 || safeProfile.days === 4 || safeProfile.days === 5 ? safeProfile.days : 4
    const minutes =
      safeProfile.session_duration_min === 60 ||
      safeProfile.session_duration_min === 90 ||
      safeProfile.session_duration_min === 120
        ? safeProfile.session_duration_min
        : 90
    const age = safeProfile.age ?? 26
    const weightKg = safeProfile.weight_kg ?? 70
    const heightCm = safeProfile.height_cm ?? 170

    const baseSummary = buildBaseDiagnosisSummary({
      name: safeProfile.name,
      gender,
      age,
      weightKg,
      heightCm,
      daysPerWeek: days,
      sessionMinutes: minutes,
      goal: safeProfile.goal,
      energyLevel: safeProfile.energy_level,
      jointAlerts: safeProfile.joint_alerts,
    })

    const metrics = calculateBodyMetrics({ weightKg, heightCm, gender })
    const macros = calculateMacros({
      gender,
      age,
      weightKg,
      heightCm,
      daysPerWeek: days,
      goal: safeProfile.goal,
    })
    const naiu = selectNaiuSuperfood(gender, safeProfile.goal, safeProfile.energy_level, safeProfile.joint_alerts)

    const apiKey = (process.env.COACH_API_KEY || process.env.OPENROUTER_API_KEY || '').trim()
    const baseUrl = (process.env.COACH_BASE_URL || 'https://openrouter.ai/api/v1').trim().replace(/\/+$/, '')
    const model = (process.env.COACH_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free').trim()

    if (apiKey) {
      try {
        const userContext = JSON.stringify({
          atleta: safeProfile.name,
          enfoque: gender,
          edad: age,
          peso_kg: weightKg,
          estatura_cm: heightCm,
          imc: metrics.bmi,
          estado_corporal: metrics.categoryLabel,
          rango_peso_ideal_kg: `${metrics.idealWeightMinKg}-${metrics.idealWeightMaxKg}`,
          objetivo_elegido: safeProfile.goal,
          objetivo_sugerido_por_imc: metrics.suggestedGoal,
          frecuencia_dias: days,
          duracion_minutos: minutes,
          cluster: safeProfile.cluster_id ?? `${gender === 'mujer' ? 'M' : 'H'}-${days}`,
          cuidado_articular: safeProfile.joint_alerts ?? [],
          calorias_objetivo: macros.targetCalories,
          proteina_g: macros.proteinGrams,
          carbos_g: macros.carbGrams,
          grasas_g: macros.fatGrams,
          superalimento_naiu: naiu.product_name,
        })

        const aiRes = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          signal: AbortSignal.timeout(8500),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'FORJA · ARKA Fitness AI',
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: 450,
            messages: [
              { role: 'system', content: DIAGNOSIS_SYSTEM_PROMPT },
              { role: 'user', content: `Genera el diagnóstico estructurado para esta ficha verificada: ${userContext}` },
            ],
          }),
        })

        if (aiRes.ok) {
          const data = (await aiRes.json()) as {
            choices?: Array<{ message?: { content?: string } }>
          }
          const rawContent = data.choices?.[0]?.message?.content?.trim() ?? ''
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as {
              headline?: unknown
              insights?: unknown
            }
            const cleanHeadline = sanitizePlainText(parsed.headline, 220)
            const cleanInsights = Array.isArray(parsed.insights)
              ? parsed.insights
                  .map((line) => sanitizePlainText(line, 380))
                  .filter((line) => line.length > 0)
                  .slice(0, 4)
              : []

            if (cleanHeadline && cleanInsights.length >= 2) {
              const aiDiagnosis: DiagnosisSummary = {
                ...baseSummary,
                headline: cleanHeadline,
                aiInsights: cleanInsights,
                source: 'ai',
                generatedAt: new Date().toISOString(),
              }
              return NextResponse.json({ ok: true, diagnosis: aiDiagnosis }, { headers: NO_STORE_HEADERS })
            }
          }
        }
      } catch {
        // Continúa hacia la síntesis determinista verificada si el proveedor externo no responde a tiempo
      }
    }

    return NextResponse.json({ ok: true, diagnosis: baseSummary }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible procesar el diagnóstico en este momento.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
