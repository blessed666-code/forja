import type { Metadata } from 'next'
import { BibliotecaScreen } from '@/components/sections/BibliotecaScreen'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Biblioteca Biomecánica de Ejercicios de Gym',
  description:
    'Explora el catálogo de ejercicios seguros por grupo muscular y los 26 slots biomecánicos con variantes en máquina, polea o peso libre en FORJA por ARKA.',
  path: '/biblioteca',
})

export default function BibliotecaPage() {
  return <BibliotecaScreen />
}
