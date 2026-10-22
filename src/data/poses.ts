import type { PoseId } from './types'

/** Angles in degrees; dy in meters. sp = shoulder pitch, sa = abduction, el/elz = elbow sagittal/frontal, hp = hip, kn = knee, tl = torso lean. */
export interface Joints {
  sp: number
  sa: number
  el: number
  elz: number
  hp: number
  kn: number
  tl: number
  dy: number
  split: number
}

export type Base = 'stand' | 'seat' | 'lie' | 'prone' | 'floor'

export interface PoseDef {
  base: Base
  a: Partial<Joints>
  b: Partial<Joints>
  speed?: number
}

const SEAT = { hp: 90, kn: 90 }
const BAR_BACK = { sa: 70, elz: 110 }

export const POSES: Record<PoseId, PoseDef> = {
  'press-banca': { base: 'lie', a: { sp: 20, sa: 12, el: 70, kn: 90 }, b: { sp: 90, sa: 10, el: 0, kn: 90 } },
  'press-pecho': { base: 'seat', a: { ...SEAT, sp: -10, sa: 55, el: 100 }, b: { ...SEAT, sp: 90, sa: 10, el: 0 } },
  'press-hombro': { base: 'seat', a: { ...SEAT, sa: 85, elz: 95 }, b: { ...SEAT, sa: 165, elz: 15 } },
  'press-hombro-pie': { base: 'stand', a: { sa: 85, elz: 95 }, b: { sa: 165, elz: 15 } },
  lateral: { base: 'stand', a: { sa: 10, elz: 10 }, b: { sa: 85, elz: 10 } },
  jalon: { base: 'seat', a: { ...SEAT, sa: 160, elz: 10 }, b: { ...SEAT, sa: 30, elz: 130 } },
  sentadilla: {
    base: 'stand',
    a: { ...BAR_BACK },
    b: { ...BAR_BACK, hp: 95, kn: 110, tl: 30, dy: -0.45 },
  },
  remo: {
    base: 'stand',
    a: { tl: 45, kn: 20, hp: 10, sp: 45, sa: 8, dy: -0.03 },
    b: { tl: 45, kn: 20, hp: 10, sp: -15, el: 95, sa: 8, dy: -0.03 },
  },
  'remo-sentado': {
    base: 'seat',
    a: { hp: 80, kn: 30, sp: 85, el: 0, sa: 8 },
    b: { hp: 80, kn: 30, sp: -10, el: 100, sa: 8, tl: -5 },
  },
  'remo-trx': { base: 'stand', a: { tl: -30, sp: 80, sa: 8, dy: -0.08 }, b: { tl: -15, sp: 30, el: 100, sa: 8, dy: -0.04 } },
  curl: { base: 'stand', a: { sp: 0, el: 5, sa: 6 }, b: { sp: 10, el: 135, sa: 6 } },
  triceps: { base: 'stand', a: { sp: 10, el: 100, sa: 6, tl: 10 }, b: { sp: 5, el: 5, sa: 6, tl: 10 } },
  fondos: {
    base: 'stand',
    a: { sp: -5, el: 0, sa: 10, kn: 70, hp: 20, dy: 0.2 },
    b: { sp: -40, el: 85, sa: 10, kn: 70, hp: 20, dy: -0.05 },
  },
  bisagra: { base: 'stand', a: { tl: 0, kn: 8, sa: 6 }, b: { tl: 75, kn: 18, sp: 75, sa: 6 } },
  zancada: {
    base: 'stand',
    a: { ...BAR_BACK },
    b: { ...BAR_BACK, split: 70, kn: 95, dy: -0.35 },
  },
  extension: { base: 'seat', a: { ...SEAT }, b: { hp: 90, kn: 10 } },
  'curl-femoral': { base: 'seat', a: { hp: 90, kn: 10 }, b: { ...SEAT, kn: 100 } },
  prensa: { base: 'seat', a: { hp: 120, kn: 110, tl: -25 }, b: { hp: 75, kn: 10, tl: -25 } },
  plancha: { base: 'prone', a: { sp: 90, el: 90 }, b: { sp: 90, el: 90, dy: 0.02 }, speed: 0.8 },
  flexion: { base: 'prone', a: { sp: 90, el: 0, dy: 0.26 }, b: { sp: 75, el: 80, dy: 0.06 } },
  estiramiento: { base: 'stand', a: { tl: 20, sp: 20 }, b: { tl: 70, sp: 70 }, speed: 0.7 },
  puente: { base: 'floor', a: { hp: 60, kn: 100 }, b: { hp: 10, kn: 95, dy: 0.18 } },
  deadbug: { base: 'floor', a: { sp: 90, hp: 90, kn: 90 }, b: { sp: 160, hp: 40, kn: 20 } },
  aperturas: { base: 'stand', a: { sp: 20, sa: 75, el: 15 }, b: { sp: 75, sa: 15, el: 15 } },
  movilidad: { base: 'stand', a: { sa: 20 }, b: { sa: 170, tl: -5, dy: -0.05 }, speed: 0.8 },
  trote: { base: 'stand', a: { split: 35, kn: 40, sp: -25, el: 80 }, b: { split: -35, kn: 40, sp: 25, el: 80 }, speed: 3.2 },
  pallof: { base: 'stand', a: { sp: 20, el: 70, sa: 6, kn: 10 }, b: { sp: 90, el: 0, sa: 6, kn: 10 } },
  'y-raise': { base: 'stand', a: { sp: 90, tl: -20, dy: -0.05 }, b: { sp: 160, sa: 25, tl: -15, dy: -0.03 } },
}
