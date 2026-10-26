export type Muscle = 'PECHO' | 'ESPALDA' | 'HOMBRO' | 'BRAZO' | 'PIERNA' | 'ABDOMEN' | 'CARDIO'

export const MUSCLES: readonly Muscle[] = ['PECHO', 'ESPALDA', 'HOMBRO', 'BRAZO', 'PIERNA', 'ABDOMEN', 'CARDIO']

export type Equipment = 'barra' | 'mancuerna' | 'maquina' | 'polea' | 'banda' | 'peso-corporal' | 'trx'

export const EQUIPMENT: readonly Equipment[] = ['barra', 'mancuerna', 'maquina', 'polea', 'banda', 'peso-corporal', 'trx']

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barra: 'Barra',
  mancuerna: 'Mancuerna',
  maquina: 'Máquina',
  polea: 'Polea',
  banda: 'Banda',
  'peso-corporal': 'Peso corporal',
  trx: 'TRX',
}

export type PoseId =
  | 'press-banca'
  | 'press-pecho'
  | 'press-hombro'
  | 'press-hombro-pie'
  | 'lateral'
  | 'jalon'
  | 'sentadilla'
  | 'remo'
  | 'remo-sentado'
  | 'remo-trx'
  | 'curl'
  | 'triceps'
  | 'fondos'
  | 'bisagra'
  | 'zancada'
  | 'extension'
  | 'curl-femoral'
  | 'prensa'
  | 'plancha'
  | 'flexion'
  | 'estiramiento'
  | 'puente'
  | 'deadbug'
  | 'aperturas'
  | 'movilidad'
  | 'trote'
  | 'pallof'
  | 'y-raise'

export interface Gear {
  bench?: 'flat' | 'seat'
  bar?: 'hands' | 'back'
  dumbbells?: boolean
  cable?: 'high' | 'mid' | 'low'
  machine?: boolean
  dips?: boolean
  band?: boolean
  trx?: boolean
}

export type Goal =
  | 'masa'
  | 'grasa'
  | 'fuerza'
  | 'recomposicion'
  | 'cero'
  | 'ganar_masa'
  | 'marcar_tonificar'
  | 'bajar_peso'
export type Days = 2 | 3 | 4 | 5 | 6
export type Minutes = 30 | 45 | 60 | 75 | 90 | 120
export type Place = 'gym' | 'barra-mancuernas' | 'maquinas' | 'casa' | 'trx'
export type Level = 'nuevo' | 'intermedio' | 'avanzado' | 'principiante'
export type Care = 'hombro' | 'rodilla' | 'espalda-baja' | 'ninguna'

export type Gender = 'hombre' | 'mujer'
export type JointAlert = 'hombro' | 'rodilla' | 'codo' | 'espalda-baja' | 'manguito_rotador_preventivo'

export type SlotId =
  | 'SUP_01'
  | 'SUP_02_A'
  | 'SUP_02_B'
  | 'SUP_03'
  | 'SUP_04'
  | 'SUP_05'
  | 'SUP_06_A'
  | 'SUP_06_B'
  | 'SUP_06_C'
  | 'SUP_07'
  | 'SUP_08'
  | 'SUP_10'
  | 'SUP_11'
  | 'SUP_12'
  | 'SUP_13'
  | 'INF_01'
  | 'INF_02'
  | 'INF_03_A'
  | 'INF_03_B'
  | 'INF_04_A'
  | 'INF_04_B'
  | 'INF_05'
  | 'INF_06'
  | 'INF_07_A'
  | 'INF_07_B'
  | 'INF_08'

export type EffortType = 'RIR_1_2' | 'TECHNICAL_FAILURE' | 'PROTECTED_RIR_1'
export type RoutineClusterId = 'H-3' | 'H-4' | 'H-5' | 'M-3' | 'M-4' | 'M-5'
export type TimeMode = '60_MIN' | '90_MIN' | '120_MIN'
export type AbsCircuitId = 'ABS_CIRCUIT_A' | 'ABS_CIRCUIT_B' | 'ABS_CIRCUIT_C' | 'ABS_CIRCUIT_D'
export type WarmupBlockId = 'WARMUP_UPPER' | 'WARMUP_LOWER'

export type SessionPhase = 'warmup' | 'strength' | 'abs' | 'cardio'
export type BodyCategory = 'bajo_peso' | 'peso_ideal' | 'sobrepeso' | 'obesidad'

export interface DiagnosisSummary {
  bmi: number
  category: BodyCategory
  categoryLabel: string
  idealWeightMinKg: number
  idealWeightMaxKg: number
  weightDeltaKg: number
  suggestedGoal: Goal
  headline: string
  aiInsights: string[]
  source: 'ai' | 'deterministic'
  generatedAt: string
}

export interface Exercise {
  id: string
  name: string
  short?: string
  equipment: Equipment
  muscle: Muscle
  pose: PoseId
  gear: Gear
  sets: number
  reps: string
  rest: number
  rpe?: number
  steps: readonly [string, string, string]
  mistake: string
  breathing: string
  closer?: boolean
  trx?: boolean
  slot_id?: SlotId
  effort_type?: EffortType
  safety_note?: string
  phase?: SessionPhase
  block_number?: number
  block_badge?: string
}

export interface BiomechanicalSlot {
  id: SlotId
  name: string
  targetMuscle: string
  defaultExerciseId: string
  machineAltId: string
  freeAltId: string
  safetyOverride?: {
    alert: JointAlert
    replaceWith: string
    reason: string
  }
}

export interface TimeModulation {
  mode: TimeMode
  totalMinutes: 60 | 90 | 120
  warmupMinutes: number
  strengthMinutes: number
  absMinutes: number
  cardioMinutes: number
  seriesCount: number
  restSeconds: number
  absLaps: number
  hasCardio: boolean
}

export interface NaiuRecommendation {
  show_naiu_card: boolean
  product_slug:
    | 'maca-negra'
    | 'maca-roja'
    | 'camu-camu'
    | 'chontaduro'
    | 'cafe-seynekun'
    | 'cacao-seynekun'
    | 'cafe-cooagronevada'
    | 'chocolate-mesa-cooagronevada'
  product_name: string
  price?: string
  reason: string
  dosage: string
  cta_text: string
  cta_url: string
}

export interface Profile {
  name: string
  goal: Goal
  days: Days
  minutes: Minutes
  place: Place
  level: Level
  care: Care
  gender?: Gender
  session_duration_min?: 60 | 90 | 120
  joint_alerts?: JointAlert[]
  cluster_id?: RoutineClusterId
  time_mode?: TimeMode
  age?: number
  weight_kg?: number
  height_cm?: number
  energy_level?: 'bajo' | 'normal' | 'alto'
  favorite_overrides?: Record<string, string>
  naiu_stack?: string[]
  diagnosis?: DiagnosisSummary
}

export const GOAL_LABEL: Record<Goal, string> = {
  masa: 'Ganar masa',
  grasa: 'Perder grasa',
  fuerza: 'Fuerza',
  recomposicion: 'Recomposición',
  cero: 'Empezar de cero',
  ganar_masa: 'Ganar masa muscular',
  marcar_tonificar: 'Marcar / Recomposición',
  bajar_peso: 'Bajar de peso (con pesas)',
}

export const GOAL_SHORT: Record<Goal, string> = {
  masa: 'masa',
  grasa: 'grasa',
  fuerza: 'fuerza',
  recomposicion: 'recomposición',
  cero: 'desde cero',
  ganar_masa: 'masa',
  marcar_tonificar: 'definición',
  bajar_peso: 'bajar peso',
}

export const PLACE_LABEL: Record<Place, string> = {
  gym: 'Gym completo',
  'barra-mancuernas': 'Mancuernas y barra',
  maquinas: 'Máquinas y poleas',
  casa: 'Casa',
  trx: 'TRX',
}

export const LEVEL_LABEL: Record<Level, string> = {
  nuevo: 'Nuevo',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

export const CARE_LABEL: Record<Care, string> = {
  hombro: 'Hombro',
  rodilla: 'Rodilla',
  'espalda-baja': 'Espalda baja',
  ninguna: 'Ninguna',
}

export interface HistoryEntry {
  date: string
  sessionId: string
  sessionName: string
  setsDone: number
}
