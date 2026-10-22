export type MotionLevel = 'full' | 'lite' | 'static'

export const MOTION_STORAGE_KEY = 'arka-motion'

// Se serializa con toString() dentro de <head>: no puede usar imports ni constantes externas.
export function applyMotionLevel(): void {
  const root = document.documentElement
  try {
    const isPaused = window.localStorage.getItem('arka-motion') === 'static'
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isPaused || prefersReducedMotion) {
      root.dataset.motion = 'static'
      return
    }
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    const hasWebgl2 = 'WebGL2RenderingContext' in window
    const cores = device.hardwareConcurrency || 4
    const isWeakDevice = cores < 4 || (typeof device.deviceMemory === 'number' && device.deviceMemory < 4)
    const isSavingData = device.connection?.saveData === true
    root.dataset.motion = !hasWebgl2 || isWeakDevice || isSavingData ? 'lite' : 'full'
  } catch {
    root.dataset.motion = 'lite'
  }
}
