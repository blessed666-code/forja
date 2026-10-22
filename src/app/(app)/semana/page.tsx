import type { Metadata } from 'next'
import { SemanaScreen } from '@/components/sections/SemanaScreen'

export const metadata: Metadata = {
  title: 'Semana',
}

export default function SemanaPage() {
  return <SemanaScreen />
}
