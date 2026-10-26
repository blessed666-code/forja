import type { Metadata } from 'next'
import { CoachScreen } from '@/components/sections/CoachScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Coach Asistente de Técnica y Nutrición',
  description:
    'Consulta dudas de técnica por slot biomecánico, ajustes de comida real colombiana y superalimentos NAIU con tu Coach de FORJA.',
  path: '/coach',
  noIndex: true,
})

export default function CoachPage() {
  return <CoachScreen />
}
