import type { Metadata } from 'next'
import { SessionView } from '@/components/session/SessionView'
import { buildPageMetadata } from '@/lib/seo/metadata'

interface SesionPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SesionPageProps): Promise<Metadata> {
  const { id } = await params
  const safeSlug = encodeURIComponent(id)

  return buildPageMetadata({
    title: 'Sesión Activa de Entreno',
    description:
      'Ejecuta tu sesión guiada con temporizador háptico, control de esfuerzo RIR y sustitución inmediata por slot biomecánico en FORJA.',
    path: `/sesion/${safeSlug}`,
    noIndex: true,
  })
}

export default async function SesionPage({ params }: SesionPageProps) {
  const { id } = await params
  return <SessionView sessionId={id} />
}
