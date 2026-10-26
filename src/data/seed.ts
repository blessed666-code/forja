import type { Profile } from './types'

export const SEED_PROFILE: Profile = {
  name: 'Danniel',
  gender: 'hombre',
  goal: 'ganar_masa',
  days: 5,
  minutes: 120,
  session_duration_min: 120,
  place: 'gym',
  level: 'avanzado',
  care: 'hombro',
  joint_alerts: ['hombro'],
  cluster_id: 'H-5',
  time_mode: '120_MIN',
  favorite_overrides: {
    SUP_10: 'press-frances-barra-z',
  },
  naiu_stack: ['maca-negra', 'cacao-seynekun'],
  age: 28,
  weight_kg: 78,
  height_cm: 178,
  energy_level: 'alto',
}

export const CLEAN_DEFAULT_PROFILE: Profile = {
  name: '',
  gender: 'hombre',
  goal: 'ganar_masa',
  days: 4,
  minutes: 90,
  session_duration_min: 90,
  place: 'gym',
  level: 'intermedio',
  care: 'ninguna',
  joint_alerts: [],
  cluster_id: 'H-4',
  time_mode: '90_MIN',
  naiu_stack: ['maca-negra'],
  age: 26,
  weight_kg: 70,
  height_cm: 170,
  energy_level: 'normal',
}
