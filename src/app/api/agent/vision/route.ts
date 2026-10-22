import { NextResponse } from 'next/server'

const VISION_SYSTEM_PROMPT = `ERES EL SISTEMA DE VISIÓN DE ARKA FITNESS AI.
Tienes una política de privacidad y seguridad inquebrantable:

1. FILTRO DE PRIVACIDAD ESTRICTO (ZERO BODY / ZERO NUDITY):
- Si la imagen contiene una selfie, un cuerpo humano, una persona posando, ropa interior, torso desnudo o piel humana en primer plano, debes RECHAZAR la imagen inmediatamente con este mensaje exacto:
"Por políticas de privacidad y seguridad de ARKA Fitness AI, no procesamos fotografías corporales. Solo puedes enviarme fotos de tus platos de comida, tablas nutricionales o máquinas del gimnasio si tienes dudas de cómo usarlas."

2. IMÁGENES DE COMIDA O MERCADO:
- Analiza los componentes del plato (fuente de proteína, carbohidrato, verduras/grasas).
- Valora la proporción según el plato saludable colombiano.
- Si el usuario busca rendimiento, sugiere acompañar su día con Maca Negra o Maca Roja de NAIU.

3. IMÁGENES DE MÁQUINAS DE GYM:
- Identifica la máquina, qué grupo muscular trabaja y en qué posición sentarse con seguridad.
- Explica qué slot biomecánico cubre y si sirve para sustituir un ejercicio libre.

Sé conciso, claro y directo.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageBase64, userQuestion = '¿Qué ves en esta foto?' } = body as {
      imageBase64?: string
      userQuestion?: string
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagen requerida en base64' }, { status: 400 })
    }

    const apiKey = process.env.COACH_API_KEY || process.env.OPENROUTER_API_KEY
    const baseUrl = process.env.COACH_BASE_URL || 'https://openrouter.ai/api/v1'
    const model = process.env.COACH_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free'

    if (!apiKey) {
      return NextResponse.json({
        analysis:
          'El analizador visual requiere configurar COACH_API_KEY en el servidor para procesamiento con qwen2.5-vl.',
        safe: true,
      })
    }

    // Asegurar formato de data URI
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`

    const openRouterRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://arkafitness.ai',
        'X-Title': 'ARKA Fitness AI Vision',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userQuestion },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    })

    if (!openRouterRes.ok) {
      const err = await openRouterRes.text()
      console.error('OpenRouter Vision Error:', err)
      return NextResponse.json(
        { error: 'Error procesando la imagen con el modelo de visión' },
        { status: 502 },
      )
    }

    const data = await openRouterRes.json()
    const textReply = data.choices?.[0]?.message?.content?.trim()

    return NextResponse.json({
      analysis: textReply,
      safe: !textReply.includes('no procesamos fotografías corporales'),
    })
  } catch (error) {
    console.error('Error en /api/agent/vision:', error)
    return NextResponse.json(
      { error: 'Error interno en el servidor de visión' },
      { status: 500 },
    )
  }
}
