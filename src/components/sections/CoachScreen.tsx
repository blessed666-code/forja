'use client'

import { m } from 'framer-motion'
import { Camera, ExternalLink, Loader2, SendHorizontal, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getCoachReply } from '@/data/coach'
import { GOAL_SHORT, type NaiuRecommendation } from '@/data/types'
import { useHistory, useProfile } from '@/lib/store'
import { firstName, useNextSession } from '@/lib/usePlan'

interface CoachMessage {
  id: number
  from: 'user' | 'coach'
  lines: string[]
  naiuCard?: NaiuRecommendation | null
}

const SUGGESTIONS = [
  '¿Qué productos vende NAIU?',
  '¿Qué tomo como pre-entreno natural?',
  '¿Cómo va mi primer ejercicio hoy?',
  '¿Qué como antes de entrenar?',
  '¿Qué sirve para cuidar tendones y fatiga?',
]

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export function CoachScreen() {
  const profile = useProfile()
  const history = useHistory()
  const nextSession = useNextSession()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [visionError, setVisionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<CoachMessage[]>(() => [
    {
      id: 0,
      from: 'coach',
      lines: [
        `Hola, ${firstName(profile.name || 'Atleta')}. Soy tu Coach FORJA · ARKA Fitness AI.`,
        'Pregúntame por tu técnica, sustituciones por Slot Biomecánico, comidas de plaza colombiana o el catálogo oficial de superalimentos NAIU.',
      ],
    },
  ])
  const endRef = useRef<HTMLLIElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, loading])

  const send = async (raw: string): Promise<void> => {
    const message = raw.trim()
    if (!message || loading) return
    setVisionError(null)

    const userMsgId = messages.length
    const nextMessages: CoachMessage[] = [
      ...messages,
      { id: userMsgId, from: 'user', lines: [message] },
    ]
    setMessages(nextMessages)
    setText('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: nextMessages.slice(-6).map((item) => ({
            role: item.from === 'user' ? 'user' : 'assistant',
            content: item.lines.join('\n'),
          })),
          profile,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          reply?: string
          naiuRecommendation?: NaiuRecommendation | null
        }
        const replyText = data.reply ?? ''
        const replyLines = replyText.split('\n').filter((l) => l.trim().length > 0)
        setMessages((current) => [
          ...current,
          {
            id: current.length,
            from: 'coach',
            lines: replyLines.length > 0 ? replyLines : [replyText],
            naiuCard: data.naiuRecommendation,
          },
        ])
        setLoading(false)
        return
      }
    } catch {
      // Continuar al motor local determinista sin caída de servicio
    }

    const fallbackReply = getCoachReply(message, { profile, history, nextSession })
    setMessages((current) => [
      ...current,
      {
        id: current.length,
        from: 'coach',
        lines: fallbackReply.lines,
        naiuCard: fallbackReply.naiuCard,
      },
    ])
    setLoading(false)
  }

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || loading) return
    setVisionError(null)

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setVisionError('Solo se admiten fotos JPG, PNG o WebP de platos de comida o máquinas de gimnasio.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setVisionError('La foto supera 4 MB. Toma una foto más liviana de tu plato o máquina.')
      return
    }

    const questionText = text.trim() || 'Analiza esta foto (plato de comida, tabla nutricional o máquina de gym).'
    setText('')
    setLoading(true)
    setMessages((current) => [
      ...current,
      { id: current.length, from: 'user', lines: [`[Foto enviada] ${questionText}`] },
    ])

    try {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Lectura inválida')))
        reader.onerror = () => reject(new Error('Error leyendo imagen'))
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/agent/vision', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUri,
          userQuestion: questionText,
        }),
      })

      const data = (await res.json()) as { analysis?: string; error?: string }
      const answer = res.ok
        ? (data.analysis ?? 'Imagen analizada.')
        : (data.error ?? 'No se pudo analizar la foto en este momento.')

      setMessages((current) => [
        ...current,
        {
          id: current.length,
          from: 'coach',
          lines: answer.split('\n').filter((l) => l.trim().length > 0),
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: current.length,
          from: 'coach',
          lines: ['No fue posible procesar la imagen. Descríbeme tu plato o la máquina por texto y te asesoro de inmediato.'],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-5xl leading-none font-bold uppercase">Coach</h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-sm">
            {firstName(profile.name || 'Atleta')} · {profile.days} días · {GOAL_SHORT[profile.goal]}
          </p>
          {profile.cluster_id && (
            <span className="w-fit rounded-full border border-primary/40 bg-surface-2 px-3 py-1 font-mono text-xs text-primary">
              {profile.cluster_id} · Modo {profile.time_mode?.replace('_', ' ') ?? '90 MIN'}
            </span>
          )}
        </div>
      </header>

      <ol aria-live="polite" aria-label="Conversación con Coach" className="flex flex-col gap-3">
        {messages.map((message) => (
          <m.li
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex max-w-[90%] flex-col gap-2 rounded-xl px-4 py-3 leading-relaxed ${
              message.from === 'user' ? 'self-end bg-surface-2' : 'self-start border border-border bg-surface'
            }`}
          >
            <span className="sr-only">{message.from === 'user' ? 'Tú:' : 'Coach ARKA:'}</span>
            {message.lines.map((line, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-text">
                {line}
              </p>
            ))}

            {message.naiuCard && (
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-primary/50 bg-bg p-3.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Superalimento Oficial NAIU
                  </span>
                  {message.naiuCard.price && (
                    <span className="font-mono text-xs font-bold text-primary">{message.naiuCard.price}</span>
                  )}
                </div>
                <p className="font-semibold text-text">{message.naiuCard.product_name}</p>
                <p className="text-xs leading-relaxed text-muted">{message.naiuCard.reason}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-[11px] text-muted">Dosis: {message.naiuCard.dosage}</span>
                  <a
                    href={message.naiuCard.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center gap-1 rounded bg-primary px-2.5 text-xs font-semibold text-primary-ink transition-opacity hover:opacity-90"
                  >
                    <span>{message.naiuCard.cta_text}</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                </div>
              </div>
            )}
          </m.li>
        ))}

        {loading && (
          <li className="flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span>Coach analizando...</span>
          </li>
        )}

        <li ref={endRef} aria-hidden="true" />
      </ol>

      <div className="sticky bottom-24 flex flex-col gap-2 bg-bg pt-2" data-lenis-prevent>
        {visionError && (
          <p role="alert" className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs text-text">
            {visionError}
          </p>
        )}

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void send(suggestion)}
              className="min-h-11 shrink-0 rounded-full border border-border bg-surface px-4 text-sm hover:border-primary disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void send(text)
          }}
          className="flex items-end gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void handleImageSelected(e)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Subir foto de plato de comida o máquina de gimnasio"
            title="Foto de plato o máquina (Privacidad estricta: sin fotos corporales)"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted hover:border-primary hover:text-primary disabled:opacity-40"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
          </button>

          <label className="flex-1" htmlFor="coach-mensaje">
            <span className="sr-only">Mensaje para el coach</span>
            <textarea
              id="coach-mensaje"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.shiftKey) return
                event.preventDefault()
                void send(text)
              }}
              rows={1}
              maxLength={1000}
              placeholder="Pregunta sobre tu rutina, comida o NAIU..."
              className="max-h-32 min-h-12 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-text focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={!text.trim() || loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-ink disabled:opacity-40"
          >
            <SendHorizontal className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
        <p className="text-xs text-muted">
          No sustituyo a un médico ni a un nutricionista clínico. Fotos solo de platos o máquinas (cero fotos corporales).
        </p>
      </div>
    </div>
  )
}
