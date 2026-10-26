import type { Metadata } from 'next'
import { QuizFlow } from '@/components/sections/QuizFlow'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Quiz de Rutina Personalizada de Gimnasio',
  description:
    'Responde 7 pasos rápidos sobre tus días de entreno, duración, nivel y articulaciones para recibir tu cluster oficial de fuerza y macros en FORJA por ARKA.',
  path: '/quiz',
})

export default function QuizPage() {
  return <QuizFlow />
}
