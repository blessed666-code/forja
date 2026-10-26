import type { Metadata } from 'next'
import { SemanaScreen } from '@/components/sections/SemanaScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Plan Semanal de Entreno',
  description:
    'Revisa la distribución semanal de tus bloques de fuerza, abdomen y cardio modulados según tu perfil determinista dentro de FORJA.',
  path: '/semana',
  noIndex: true,
})

export default function SemanaPage() {
  return <SemanaScreen />
}
