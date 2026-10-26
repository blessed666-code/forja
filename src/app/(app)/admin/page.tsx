import type { Metadata } from 'next'
import { AdminScreen } from '@/components/sections/AdminScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Panel de Códigos de Cortesía y Clientes',
  description: 'Gestión exclusiva de códigos de cortesía y control de miembros en FORJA · ARKA Fitness AI.',
  path: '/admin',
  noIndex: true,
})

export default function AdminPage() {
  return <AdminScreen />
}
