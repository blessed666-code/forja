import { NextResponse } from 'next/server'
import { NAIU_AI_CATALOG_CONTEXT } from '@/data/naiu'
import { verifyOriginHeader } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { sanitizePlainText } from '@/lib/security/validation'
import { getAuthenticatedAccount, isGatekeeperEnforced } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

// Límite estricto: máximo ~4 MB binarios (~5.5 MB en cadena Base64)
const MAX_BASE64_LENGTH = 5_500_000

const VISION_SYSTEM_PROMPT = `ERES EL SISTEMA DE VISIÓN DE FORJA · ARKA FITNESS AI.
Tienes una política de privacidad y seguridad inquebrantable:

1. FILTRO DE PRIVACIDAD ESTRICTO (ZERO BODY / ZERO NUDITY):
- Si la imagen contiene una selfie, un cuerpo humano, una persona posando, ropa interior, torso desnudo o piel humana en primer plano, RECHAZA la imagen inmediatamente con este mensaje exacto:
"Por políticas de privacidad y seguridad de ARKA Fitness AI, no procesamos fotografías corporales. Solo puedes enviarme fotos de tus platos de comida, tablas nutricionales o máquinas del gimnasio si tienes dudas de cómo usarlas."

2. IMÁGENES DE COMIDA O TABLAS NUTRICIONALES:
- Analiza visualmente las fuentes de proteína, carbohidrato, grasas y vegetales según el mercado colombiano.
- Si es oportuno para rendimiento o recuperación, sugiere acompañar con alguno de los productos oficiales reales de NAIU:
${NAIU_AI_CATALOG_CONTEXT}

3. IMÁGENES DE MÁQUINAS DE GIMNASIO:
- Identifica la máquina, el grupo muscular principal, cómo ajustar el asiento con seguridad articular y qué ejercicio libre permite sustituir.

Responde en español claro, máximo 2 párrafos cortos.`

/**
 * Valida la firma binaria (magic bytes) del buffer en memoria para garantizar que el archivo
 * realmente sea una imagen JPEG, PNG o WebP y nunca se almacena en disco.
 * TODO(security): Si en el futuro se almacenan imágenes de forma persistente, integrar escaneo antivirus en sandbox y limpieza de metadatos EXIF/CDR.
 */
function parseAndVerifyImageDataUri(input: string): { ok: true; dataUri: string } | { ok: false; error: string } {
  if (input.length > MAX_BASE64_LENGTH) {
    return { ok: false, error: 'La imagen supera el tamaño máximo permitido de 4 MB.' }
  }

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(input.trim())
  if (!match) {
    return { ok: false, error: 'Formato no permitido. Usa únicamente imágenes JPG, PNG o WebP.' }
  }

  const mime = match[1]
  const b64 = match[2]
  const head = Buffer.from(b64.slice(0, 64), 'base64')
  if (head.length < 12) {
    return { ok: false, error: 'Archivo de imagen incompleto o inválido.' }
  }

  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  const isPng =
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  const isWebp =
    head[0] === 0x52 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x46 &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50

  if ((mime === 'image/jpeg' && !isJpeg) || (mime === 'image/png' && !isPng) || (mime === 'image/webp' && !isWebp)) {
    return { ok: false, error: 'El contenido del archivo no coincide con una imagen válida.' }
  }

  return { ok: true, dataUri: `data:${mime};base64,${b64}` }
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'agent:vision', 8, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Límite de análisis visual alcanzado. Espera ${rl.retryAfterSec}s.` },
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
        { error: 'Inicia sesión con tu cuenta autorizada para analizar imágenes.' },
        { status: 401, headers: NO_STORE_HEADERS },
      )
    }
  }

  try {
    const body = (await req.json()) as {
      imageBase64?: unknown
      userQuestion?: unknown
    }

    if (typeof body.imageBase64 !== 'string' || !body.imageBase64.trim()) {
      return NextResponse.json({ error: 'Imagen requerida.' }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const verified = parseAndVerifyImageDataUri(body.imageBase64)
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const userQuestion =
      sanitizePlainText(body.userQuestion, 300) ||
      'Analiza este plato de comida, etiqueta nutricional o máquina de gimnasio.'

    const apiKey = (process.env.COACH_API_KEY || process.env.OPENROUTER_API_KEY || '').trim()
    const baseUrl = (process.env.COACH_BASE_URL || 'https://openrouter.ai/api/v1').trim().replace(/\/+$/, '')
    const visionModel = (process.env.COACH_VISION_MODEL || process.env.COACH_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free').trim()

    if (!apiKey) {
      return NextResponse.json(
        {
          analysis:
            'Para activar la lectura automática de fotos de platos y máquinas con visión IA, agrega tu clave COACH_API_KEY de OpenRouter en las variables de entorno. Mientras tanto, descríbeme por texto qué hay en tu plato o qué máquina tienes al frente y te guío al instante.',
          safe: true,
        },
        { headers: NO_STORE_HEADERS },
      )
    }

    const openRouterRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://forja.arka.co',
        'X-Title': 'FORJA · ARKA Fitness AI Vision',
      },
      body: JSON.stringify({
        model: visionModel,
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userQuestion },
              { type: 'image_url', image_url: { url: verified.dataUri } },
            ],
          },
        ],
      }),
    })

    if (!openRouterRes.ok) {
      return NextResponse.json(
        { error: 'El proveedor de visión no pudo procesar la imagen en este momento. Intenta de nuevo o descríbela por texto.' },
        { status: 502, headers: NO_STORE_HEADERS },
      )
    }

    const data = (await openRouterRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const textReply = data.choices?.[0]?.message?.content?.trim() ?? 'No se obtuvo análisis de la imagen.'

    return NextResponse.json(
      {
        analysis: textReply,
        safe: !textReply.includes('no procesamos fotografías corporales'),
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      { error: 'Error procesando la imagen en el servidor.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
