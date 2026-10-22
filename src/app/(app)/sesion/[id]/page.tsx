import type { Metadata } from 'next'
import { SessionView } from '@/components/session/SessionView'

export const metadata: Metadata = {
  title: 'Sesión',
}

interface SesionPageProps {
  params: Promise<{ id: string }>
}

export default async function SesionPage({ params }: SesionPageProps) {
  const { id } = await params
  return <SessionView sessionId={id} />
}
