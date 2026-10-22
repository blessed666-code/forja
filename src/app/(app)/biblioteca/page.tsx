import type { Metadata } from 'next'
import { BibliotecaScreen } from '@/components/sections/BibliotecaScreen'

export const metadata: Metadata = {
  title: 'Biblioteca',
}

export default function BibliotecaPage() {
  return <BibliotecaScreen />
}
