import type { Metadata } from 'next'
import { PerfilScreen } from '@/components/sections/PerfilScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Perfil del Atleta y Macronutrientes',
  description:
    'Administra tu cluster asignado, alertas articulares, cálculo clínico de macronutrientes Mifflin-St Jeor e historial de entreno en FORJA.',
  path: '/perfil',
  noIndex: true,
})

export default function PerfilPage() {
  return <PerfilScreen />
}
