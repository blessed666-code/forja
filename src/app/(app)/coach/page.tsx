import type { Metadata } from 'next'
import { CoachScreen } from '@/components/sections/CoachScreen'

export const metadata: Metadata = {
  title: 'Coach',
}

export default function CoachPage() {
  return <CoachScreen />
}
