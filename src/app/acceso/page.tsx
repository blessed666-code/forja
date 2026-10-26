import type { Metadata } from 'next'
import { AccesoScreen } from '@/components/sections/AccesoScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Acceso Exclusivo con Código de Cortesía',
  description:
    'Inicia sesión o activa tu membresía exclusiva con código de cortesía en FORJA · ARKA Fitness AI.',
  path: '/acceso',
  noIndex: true,
})

export default function AccesoPage() {
  return <AccesoScreen />
}
