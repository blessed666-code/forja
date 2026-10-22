import type { Metadata } from 'next'
import { HoyLive } from '@/components/sections/HoyLive'

export const metadata: Metadata = {
  title: 'Hoy',
}

export default function HoyPage() {
  return <HoyLive />
}
