import type {
  AbsCircuitId,
  RoutineClusterId,
  SlotId,
  TimeMode,
  TimeModulation,
  WarmupBlockId,
} from './types'

export type StrengthSlotEntry = SlotId | readonly [SlotId, SlotId]

export interface ClusterSessionDef {
  id: string
  name: string
  weekday: number
  warmup: WarmupBlockId
  slots: SlotId[]
  strengthBlocks: readonly [
    StrengthSlotEntry,
    StrengthSlotEntry,
    StrengthSlotEntry,
    StrengthSlotEntry,
    StrengthSlotEntry,
  ]
  absCircuit: AbsCircuitId
  cardioExerciseId: string
  cardioNotes: string
}

export interface RoutineClusterDef {
  id: RoutineClusterId
  name: string
  gender: 'hombre' | 'mujer'
  daysPerWeek: 3 | 4 | 5
  description: string
  sessions: ClusterSessionDef[]
}

export const TIME_MODULATIONS: Record<TimeMode, TimeModulation> = {
  '60_MIN': {
    mode: '60_MIN',
    totalMinutes: 60,
    warmupMinutes: 8,
    strengthMinutes: 40,
    absMinutes: 12,
    cardioMinutes: 0,
    seriesCount: 3,
    restSeconds: 75,
    absLaps: 2,
    hasCardio: false,
  },
  '90_MIN': {
    mode: '90_MIN',
    totalMinutes: 90,
    warmupMinutes: 10,
    strengthMinutes: 55,
    absMinutes: 15,
    cardioMinutes: 10,
    seriesCount: 4,
    restSeconds: 90,
    absLaps: 3,
    hasCardio: true,
  },
  '120_MIN': {
    mode: '120_MIN',
    totalMinutes: 120,
    warmupMinutes: 10,
    strengthMinutes: 70,
    absMinutes: 20,
    cardioMinutes: 10,
    seriesCount: 4,
    restSeconds: 120,
    absLaps: 3,
    hasCardio: true,
  },
}

export const ROUTINE_CLUSTERS: Record<RoutineClusterId, RoutineClusterDef> = {
  // ⭐ CLUSTER H-5: HOMBRE · 5 DÍAS (3 TORSO + 2 PIERNA) — RUTINA OFICIAL FUNDADOR
  'H-5': {
    id: 'H-5',
    name: 'Hombre 5 Días · Torso / Pierna Híbrido (Rutina Oficial Fundador)',
    gender: 'hombre',
    daysPerWeek: 5,
    description: 'Frecuencia óptima con énfasis en Pecho Superior, Espalda Ancha en V, Brazos y Pierna pesada.',
    sessions: [
      {
        id: 'h5-dia-1',
        name: 'Torso A: Fuerza Híbrida',
        weekday: 0, // Lunes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_04', 'SUP_01', 'SUP_06_A', 'SUP_02_A', 'SUP_07'],
        strengthBlocks: ['SUP_04', 'SUP_01', 'SUP_06_A', 'SUP_02_A', 'SUP_07'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Bicicleta estática HIIT (20s sprint / 40s suave).',
      },
      {
        id: 'h5-dia-2',
        name: 'Pierna A: Fuerza y Cuádriceps + Glúteo Pesado',
        weekday: 1, // Martes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_01', 'INF_02', 'INF_03_A', 'INF_05', 'INF_06', 'INF_08'],
        strengthBlocks: ['INF_01', 'INF_02', 'INF_03_A', 'INF_05', ['INF_06', 'INF_08']],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinación 12-15% sin trote.',
      },
      {
        id: 'h5-dia-3',
        name: 'Torso B: Empuje Estético & Tríceps Barra Z',
        weekday: 2, // Miércoles
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_02_B', 'SUP_03', 'SUP_08', 'SUP_10', 'SUP_11'],
        strengthBlocks: ['SUP_02_B', 'SUP_03', 'SUP_08', 'SUP_10', 'SUP_11'],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinación suave o elíptica.',
      },
      {
        id: 'h5-dia-4',
        name: 'Torso C: Tracción y Densidad de Brazos',
        weekday: 4, // Viernes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_05', 'SUP_06_B', 'SUP_06_C', 'SUP_12', 'SUP_13'],
        strengthBlocks: ['SUP_05', 'SUP_06_B', 'SUP_06_C', 'SUP_12', 'SUP_13'],
        absCircuit: 'ABS_CIRCUIT_D',
        cardioExerciseId: 'remo-ergometro-hiit',
        cardioNotes: '10 min Remo HIIT o Bici estática.',
      },
      {
        id: 'h5-dia-5',
        name: 'Pierna B: Cadena Posterior, Isquios & Glúteo',
        weekday: 5, // Sábado
        warmup: 'WARMUP_LOWER',
        slots: ['INF_04_A', 'INF_02', 'INF_03_B', 'INF_06', 'INF_05', 'INF_08'],
        strengthBlocks: ['INF_04_A', 'INF_02', 'INF_03_B', 'INF_06', ['INF_05', 'INF_08']],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada suave.',
      },
    ],
  },

  // CLUSTER H-4: HOMBRE · 4 DÍAS (2 TORSO + 2 PIERNA)
  'H-4': {
    id: 'H-4',
    name: 'Hombre 4 Días · Torso / Pierna Clásico',
    gender: 'hombre',
    daysPerWeek: 4,
    description: 'Split Torso/Pierna de alta eficiencia con 48h de recuperación muscular.',
    sessions: [
      {
        id: 'h4-dia-1',
        name: 'Torso A: Fuerza y Amplitud',
        weekday: 0, // Lunes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_04', 'SUP_01', 'SUP_06_A', 'SUP_02_A', 'SUP_07'],
        strengthBlocks: ['SUP_04', 'SUP_01', 'SUP_06_A', 'SUP_02_A', 'SUP_07'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min HIIT cardio.',
      },
      {
        id: 'h4-dia-2',
        name: 'Pierna A: Fuerza y Cuádriceps',
        weekday: 1, // Martes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_01', 'INF_02', 'INF_03_A', 'INF_05', 'INF_06', 'INF_08'],
        strengthBlocks: ['INF_01', 'INF_02', 'INF_03_A', 'INF_05', ['INF_06', 'INF_08']],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
      {
        id: 'h4-dia-3',
        name: 'Torso B: Hipertrofia & Brazos',
        weekday: 3, // Jueves
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_05', 'SUP_02_B', 'SUP_06_B', 'SUP_08', 'SUP_10', 'SUP_12'],
        strengthBlocks: ['SUP_05', 'SUP_02_B', 'SUP_06_B', 'SUP_08', ['SUP_10', 'SUP_12']],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora suave.',
      },
      {
        id: 'h4-dia-4',
        name: 'Pierna B: Cadena Posterior & Isquios',
        weekday: 4, // Viernes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_04_A', 'INF_02', 'INF_03_B', 'INF_06', 'INF_05', 'INF_08'],
        strengthBlocks: ['INF_04_A', 'INF_02', 'INF_03_B', 'INF_06', ['INF_05', 'INF_08']],
        absCircuit: 'ABS_CIRCUIT_D',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada suave.',
      },
    ],
  },

  // CLUSTER H-3: HOMBRE · 3 DÍAS (TORSO / PIERNA / FULL BODY)
  'H-3': {
    id: 'H-3',
    name: 'Hombre 3 Días · Torso / Pierna / Full Body',
    gender: 'hombre',
    daysPerWeek: 3,
    description: 'Máximo estímulo muscular en 3 días no consecutivos para agendas exigentes.',
    sessions: [
      {
        id: 'h3-dia-1',
        name: 'Torso Completo & Brazos',
        weekday: 0, // Lunes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_01', 'SUP_04', 'SUP_06_B', 'SUP_07', 'SUP_08', 'SUP_10', 'SUP_12'],
        strengthBlocks: ['SUP_01', 'SUP_04', 'SUP_06_B', ['SUP_07', 'SUP_08'], ['SUP_10', 'SUP_12']],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Bici HIIT.',
      },
      {
        id: 'h3-dia-2',
        name: 'Pierna Completa & Glúteo',
        weekday: 2, // Miércoles
        warmup: 'WARMUP_LOWER',
        slots: ['INF_01', 'INF_04_A', 'INF_02', 'INF_03_A', 'INF_05', 'INF_06'],
        strengthBlocks: ['INF_01', 'INF_04_A', 'INF_02', 'INF_03_A', ['INF_05', 'INF_06']],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
      {
        id: 'h3-dia-3',
        name: 'Full Body Estético',
        weekday: 4, // Viernes
        warmup: 'WARMUP_UPPER',
        slots: ['INF_01', 'SUP_02_B', 'SUP_05', 'INF_06', 'INF_08', 'SUP_08', 'SUP_11'],
        strengthBlocks: ['INF_01', 'SUP_02_B', 'SUP_05', ['INF_06', 'INF_08'], ['SUP_08', 'SUP_11']],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'eliptica-suave',
        cardioNotes: '10 min Elíptica suave.',
      },
    ],
  },

  // ⭐ CLUSTER M-5: MUJER · 5 DÍAS (3 PIERNA/GLÚTEO + 2 TORSO ESTÉTICO)
  'M-5': {
    id: 'M-5',
    name: 'Mujer 5 Días · Glúteo / Pierna Focus & Torso Tonificado',
    gender: 'mujer',
    daysPerWeek: 5,
    description: 'Enfoque biomecánico en glúteo mayor, medio y cadena posterior con cintura estética.',
    sessions: [
      {
        id: 'm5-dia-1',
        name: 'Pierna y Glúteo A: Empuje & Cuádriceps',
        weekday: 0, // Lunes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        strengthBlocks: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada 12-15%.',
      },
      {
        id: 'm5-dia-2',
        name: 'Torso A: Espalda Estética & Hombros Redondos',
        weekday: 1, // Martes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_07', 'SUP_08'],
        strengthBlocks: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_07', 'SUP_08'],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Cardio HIIT.',
      },
      {
        id: 'm5-dia-3',
        name: 'Pierna y Glúteo B: Isquios & Estiramiento',
        weekday: 2, // Miércoles
        warmup: 'WARMUP_LOWER',
        slots: ['INF_04_A', 'INF_04_B', 'INF_03_B', 'INF_06', 'INF_08'],
        strengthBlocks: ['INF_04_A', 'INF_04_B', 'INF_03_B', 'INF_06', 'INF_08'],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada suave.',
      },
      {
        id: 'm5-dia-4',
        name: 'Torso B: Brazos Tonificados & Postura',
        weekday: 4, // Viernes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_05', 'SUP_06_C', 'SUP_10', 'SUP_11', 'SUP_12'],
        strengthBlocks: ['SUP_05', 'SUP_06_C', 'SUP_10', 'SUP_11', 'SUP_12'],
        absCircuit: 'ABS_CIRCUIT_D',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min HIIT en bicicleta o elíptica.',
      },
      {
        id: 'm5-dia-5',
        name: 'Pierna y Glúteo C: Bombeo Glúteo 10/10',
        weekday: 5, // Sábado
        warmup: 'WARMUP_LOWER',
        slots: ['INF_02', 'INF_04_B', 'INF_03_B', 'INF_07_B', 'INF_07_A'],
        strengthBlocks: ['INF_02', 'INF_04_B', 'INF_03_B', 'INF_07_B', 'INF_07_A'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
    ],
  },

  // CLUSTER M-4: MUJER · 4 DÍAS (2 PIERNA/GLÚTEO + 2 TORSO)
  'M-4': {
    id: 'M-4',
    name: 'Mujer 4 Días · Glúteo / Pierna & Torso',
    gender: 'mujer',
    daysPerWeek: 4,
    description: 'Equilibrio perfecto de estímulo en glúteo y definición de tren superior.',
    sessions: [
      {
        id: 'm4-dia-1',
        name: 'Pierna y Glúteo A: Empuje & Cuádriceps',
        weekday: 0, // Lunes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        strengthBlocks: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
      {
        id: 'm4-dia-2',
        name: 'Torso A: Espalda Estética & Hombros',
        weekday: 1, // Martes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_07', 'SUP_08'],
        strengthBlocks: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_07', 'SUP_08'],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Cardio HIIT.',
      },
      {
        id: 'm4-dia-3',
        name: 'Pierna y Glúteo B: Isquios & Glúteo Medio',
        weekday: 3, // Jueves
        warmup: 'WARMUP_LOWER',
        slots: ['INF_04_A', 'INF_02', 'INF_04_B', 'INF_06', 'INF_07_B', 'INF_07_A'],
        strengthBlocks: ['INF_04_A', 'INF_02', 'INF_04_B', 'INF_06', ['INF_07_B', 'INF_07_A']],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
      {
        id: 'm4-dia-4',
        name: 'Torso B: Brazos Tonificados & Core',
        weekday: 4, // Viernes
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_05', 'SUP_06_C', 'SUP_10', 'SUP_11', 'SUP_12'],
        strengthBlocks: ['SUP_05', 'SUP_06_C', 'SUP_10', 'SUP_11', 'SUP_12'],
        absCircuit: 'ABS_CIRCUIT_D',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Bici HIIT.',
      },
    ],
  },

  // CLUSTER M-3: MUJER · 3 DÍAS (2 PIERNA/GLÚTEO + 1 TORSO COMPLETO)
  'M-3': {
    id: 'M-3',
    name: 'Mujer 3 Días · Glúteo / Pierna Focus & Torso Integral',
    gender: 'mujer',
    daysPerWeek: 3,
    description: '2 días de enfoque supremo en glúteo + 1 día de torso completo y cintura.',
    sessions: [
      {
        id: 'm3-dia-1',
        name: 'Pierna y Glúteo A: Empuje & Cuádriceps',
        weekday: 0, // Lunes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        strengthBlocks: ['INF_02', 'INF_01', 'INF_03_B', 'INF_05', 'INF_07_A'],
        absCircuit: 'ABS_CIRCUIT_A',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
      {
        id: 'm3-dia-2',
        name: 'Torso Completo Estético',
        weekday: 2, // Miércoles
        warmup: 'WARMUP_UPPER',
        slots: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_08', 'SUP_11', 'SUP_12'],
        strengthBlocks: ['SUP_04', 'SUP_06_B', 'SUP_01', 'SUP_08', ['SUP_11', 'SUP_12']],
        absCircuit: 'ABS_CIRCUIT_B',
        cardioExerciseId: 'bici-estatica-hiit',
        cardioNotes: '10 min Bici HIIT.',
      },
      {
        id: 'm3-dia-3',
        name: 'Pierna y Glúteo B: Isquios & Glúteo Aislamiento',
        weekday: 4, // Viernes
        warmup: 'WARMUP_LOWER',
        slots: ['INF_04_A', 'INF_02', 'INF_04_B', 'INF_06', 'INF_07_B', 'INF_07_A'],
        strengthBlocks: ['INF_04_A', 'INF_02', 'INF_04_B', 'INF_06', ['INF_07_B', 'INF_07_A']],
        absCircuit: 'ABS_CIRCUIT_C',
        cardioExerciseId: 'caminadora-inclinada',
        cardioNotes: '10 min Caminadora inclinada.',
      },
    ],
  },
}

export function resolveClusterId(gender: 'hombre' | 'mujer', days: number): RoutineClusterId {
  const g = gender === 'mujer' ? 'M' : 'H'
  const d = days <= 3 ? 3 : days === 4 ? 4 : 5
  return `${g}-${d}` as RoutineClusterId
}

export function resolveTimeMode(minutes: number): TimeMode {
  if (minutes >= 110) return '120_MIN'
  if (minutes >= 80) return '90_MIN'
  return '60_MIN'
}
