import type { Metadata } from 'next'
import { HoyLive } from '@/components/sections/HoyLive'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Rutina de Gym según tus Días en Bogotá',
  description:
    'Consulta tu sesión de fuerza de hoy con series, descansos modulados a 60, 90 o 120 minutos y soporte de superalimentos NAIU. Entrena en FORJA por ARKA.',
  path: '/hoy',
})

export default function HoyPage() {
  return <HoyLive />
}
