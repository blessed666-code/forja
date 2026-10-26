'use client'

import { HoyScreen } from '@/components/sections/HoyScreen'
import { getHoyContent } from '@/lib/hoy'
import { useHistory, useProfile } from '@/lib/store'

export function HoyLive() {
  const profile = useProfile()
  const history = useHistory()
  const content = getHoyContent(profile, history.length, history)

  if (!content) {
    return <p>No hay sesión para hoy.</p>
  }

  return <HoyScreen {...content} />
}
