'use client'

import { m } from 'framer-motion'
import { ExternalLink, Loader2, SendHorizontal, Sparkles } from 'lucide-react'
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
  '¿Cómo va el press hoy?',
  '¿Qué tomo como pre-entreno natural?',
  '¿Qué como antes de entrenar?',
  '¿Cuánto llevo esta semana?',
]

export function CoachScreen() {
  const profile = useProfile()
  const history = useHistory()
  const nextSession = useNextSession()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<CoachMessage[]>(() => [
    {
      id: 0,
      from: 'coach',
      lines: [
        `Hola, ${firstName(profile.name)}. Soy tu Coach ARKA Fitness AI.`,
        'Pregúntame por tu técnica de ejercicios, equivalentes en máquinas, alimentación de plaza colombiana o superalimentos NAIU.',
      ],
    },
  ])
  const endRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, loading])

  const send = async (raw: string): Promise<void> => {
    const message = raw.trim()
    if (!message || loading) return

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: nextMessages.slice(-6).map((m) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.lines.join('\n'),
          })),
          profile,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const replyLines = data.reply ? data.reply.split('\n').filter((l: string) => l.trim().length > 0) : []
        setMessages((current) => [
          ...current,
          {
            id: current.length,
            from: 'coach',
            lines: replyLines.length > 0 ? replyLines : [data.reply],
            naiuCard: data.naiuRecommendation,
          },
        ])
        setLoading(false)
        return
      }
    } catch (e) {
      console.warn('Fallo en API remota, usando motor local determinista:', e)
    }

    // Fallback local determinista si la API no está disponible
    const fallbackReply = getCoachReply(message, { profile, history, nextSession })
    setMessages((current) => [
      ...current,
      {
        id: current.length,
        from: 'coach',
        lines: fallbackReply.lines,
      },
    ])
    setLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-5xl leading-none font-bold uppercase">Coach</h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-sm">
            {firstName(profile.name)} · {profile.days} días · {GOAL_SHORT[profile.goal]}
          </p>
          {profile.cluster_id && (
            <span className="w-fit rounded-full border border-primary/40 bg-surface-2 px-3 py-1 font-mono text-xs text-primary">
              {profile.cluster_id} · Modo {profile.time_mode?.replace('_', ' ') ?? '120 MIN'}
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
            className={`flex max-w-[88%] flex-col gap-2 rounded-xl px-4 py-3 leading-relaxed ${
              message.from === 'user' ? 'self-end bg-surface-2' : 'self-start border border-border bg-surface'
            }`}
          >
            <span className="sr-only">{message.from === 'user' ? 'Tú:' : 'Coach ARKA:'}</span>
            {message.lines.map((line, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-text">
                {line}
              </p>
            ))}

            {/* TARJETA NAIU EN EL CHAT */}
            {message.naiuCard && (
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-primary/50 bg-bg p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Superalimento Oficial NAIU
                </div>
                <h4 className="font-semibold text-text">{message.naiuCard.product_name}</h4>
                <p className="text-xs text-muted leading-relaxed">{message.naiuCard.reason}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] text-muted">Dosis: {message.naiuCard.dosage}</span>
                  <a
                    href={message.naiuCard.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-ink transition-opacity hover:opacity-90"
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
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Coach analizando...</span>
          </li>
        )}

        <li ref={endRef} aria-hidden="true" />
      </ol>

      <div className="sticky bottom-24 flex flex-col gap-2 bg-bg pt-2" data-lenis-prevent>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => send(suggestion)}
              className="min-h-11 shrink-0 rounded-full border border-border bg-surface px-4 text-sm hover:border-primary disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            send(text)
          }}
          className="flex items-end gap-2"
        >
          <label className="flex-1">
            <span className="sr-only">Mensaje para el coach</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.shiftKey) return
                event.preventDefault()
                send(text)
              }}
              rows={1}
              placeholder="Pregúntale a tu Coach ARKA..."
              className="max-h-32 min-h-12 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-text focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={!text.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-ink disabled:opacity-40"
          >
            <SendHorizontal className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
        <p className="text-xs text-muted">
          Asistente de entrenamiento y hábitos. No sustituye valoración médica ni fisioterapéutica.
        </p>
      </div>
    </div>
  )
}
