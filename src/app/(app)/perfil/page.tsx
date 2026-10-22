import type { Metadata } from 'next'
import { PerfilScreen } from '@/components/sections/PerfilScreen'

export const metadata: Metadata = {
  title: 'Perfil',
}

export default function PerfilPage() {
  return <PerfilScreen />
}
