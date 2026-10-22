import type { BiomechanicalSlot, JointAlert, SlotId } from './types'

export const BIOMECHANICAL_SLOTS: Record<SlotId, BiomechanicalSlot> = {
  SUP_01: {
    id: 'SUP_01',
    name: 'Pecho Superior (Clavicular)',
    targetMuscle: 'Pectoral mayor clavicular',
    defaultExerciseId: 'press-inclinado-mancuernas',
    machineAltId: 'press-inclinado-maquina',
    freeAltId: 'flexiones-declinadas',
  },
  SUP_02_A: {
    id: 'SUP_02_A',
    name: 'Pecho Inferior / Empuje',
    targetMuscle: 'Pectoral inferior y tríceps',
    defaultExerciseId: 'fondos',
    machineAltId: 'press-pecho-maquina',
    freeAltId: 'flexiones',
    safetyOverride: {
      alert: 'hombro',
      replaceWith: 'press-pecho-maquina',
      reason: 'Cuidado en manguito rotador: sustitución de fondos por press de pecho sentado en máquina con agarre neutro.',
    },
  },
  SUP_02_B: {
    id: 'SUP_02_B',
    name: 'Pecho Medio / Masa',
    targetMuscle: 'Pectoral esternal',
    defaultExerciseId: 'press-banca-mancuernas',
    machineAltId: 'press-pecho-maquina',
    freeAltId: 'press-banca-barra',
  },
  SUP_03: {
    id: 'SUP_03',
    name: 'Pecho Aislamiento',
    targetMuscle: 'Pectoral mayor',
    defaultExerciseId: 'aperturas-inclinadas-mancuernas',
    machineAltId: 'cruce-poleas',
    freeAltId: 'flexiones-abiertas',
  },
  SUP_04: {
    id: 'SUP_04',
    name: 'Espalda Amplitud (Prono/Neutro)',
    targetMuscle: 'Dorsal ancho y redondo mayor',
    defaultExerciseId: 'dominadas-pronas',
    machineAltId: 'jalon-polea',
    freeAltId: 'dominadas-asistidas-banda',
  },
  SUP_05: {
    id: 'SUP_05',
    name: 'Espalda + Bíceps (Supino)',
    targetMuscle: 'Dorsal inferior y bíceps braquial',
    defaultExerciseId: 'dominadas-supinas',
    machineAltId: 'jalon-polea-supino',
    freeAltId: 'dominadas-supinas-negativas',
  },
  SUP_06_A: {
    id: 'SUP_06_A',
    name: 'Espalda Densidad Pesada',
    targetMuscle: 'Trapecio medio, romboides y dorsal',
    defaultExerciseId: 'remo-t-bar',
    machineAltId: 'remo-maquina-pecho',
    freeAltId: 'remo-barra-supino',
  },
  SUP_06_B: {
    id: 'SUP_06_B',
    name: 'Espalda Espesor Medio',
    targetMuscle: 'Romboides y dorsal medio',
    defaultExerciseId: 'remo-polea-sentado',
    machineAltId: 'remo-maquina',
    freeAltId: 'remo-mancuernas-inclinado',
  },
  SUP_06_C: {
    id: 'SUP_06_C',
    name: 'Espalda Media / Escápulas',
    targetMuscle: 'Trapecio medio y deltoides posterior',
    defaultExerciseId: 'trx-remo',
    machineAltId: 'remo-alto-maquina',
    freeAltId: 'remo-invertido-multipower',
  },
  SUP_07: {
    id: 'SUP_07',
    name: 'Hombro Frontal / Medio',
    targetMuscle: 'Deltoides anterior y lateral',
    defaultExerciseId: 'press-arnold-mancuernas',
    machineAltId: 'press-hombro-maquina',
    freeAltId: 'press-militar-barra',
  },
  SUP_08: {
    id: 'SUP_08',
    name: 'Hombro Lateral (Anchura)',
    targetMuscle: 'Deltoides lateral',
    defaultExerciseId: 'elevaciones-laterales',
    machineAltId: 'elevaciones-laterales-polea',
    freeAltId: 'elevaciones-laterales-banda',
  },
  SUP_10: {
    id: 'SUP_10',
    name: 'Tríceps Cabeza Larga / Interna',
    targetMuscle: 'Tríceps braquial cabeza larga',
    defaultExerciseId: 'press-frances-barra-z',
    machineAltId: 'triceps-polea-alta-overhead',
    freeAltId: 'press-frances-mancuernas',
    safetyOverride: {
      alert: 'codo',
      replaceWith: 'triceps-polea-alta-overhead',
      reason: 'Cuidado en tendón de codo: sustitución de press francés con barra por extensión en polea alta con cuerda.',
    },
  },
  SUP_11: {
    id: 'SUP_11',
    name: 'Tríceps Cabeza Lateral',
    targetMuscle: 'Tríceps cabeza lateral',
    defaultExerciseId: 'triceps-polea',
    machineAltId: 'triceps-polea-barra-v',
    freeAltId: 'flexiones-diamante',
  },
  SUP_12: {
    id: 'SUP_12',
    name: 'Bíceps Masa General',
    targetMuscle: 'Bíceps braquial y braquiorradial',
    defaultExerciseId: 'curl-barra-z',
    machineAltId: 'curl-biceps-polea',
    freeAltId: 'curl-martillo-mancuernas',
  },
  SUP_13: {
    id: 'SUP_13',
    name: 'Bíceps Estiramiento / Pico',
    targetMuscle: 'Bíceps braquial cabeza larga',
    defaultExerciseId: 'curl-biceps-inclinado',
    machineAltId: 'curl-predicador-maquina',
    freeAltId: 'curl-arana',
  },
  INF_01: {
    id: 'INF_01',
    name: 'Cuádriceps / Base Pierna',
    targetMuscle: 'Cuádriceps femoral y glúteos',
    defaultExerciseId: 'sentadilla-barra',
    machineAltId: 'sentadilla-hack',
    freeAltId: 'sentadilla-goblet',
    safetyOverride: {
      alert: 'rodilla',
      replaceWith: 'prensa',
      reason: 'Cuidado en articulación de rodilla: sustitución de sentadilla libre por Prensa 45° con apoyo completo y pies medios.',
    },
  },
  INF_02: {
    id: 'INF_02',
    name: 'Glúteo Mayor (Potencia)',
    targetMuscle: 'Glúteo mayor',
    defaultExerciseId: 'hip-thrust-barra',
    machineAltId: 'hip-thrust-maquina',
    freeAltId: 'puente-gluteo-mancuerna',
  },
  INF_03_A: {
    id: 'INF_03_A',
    name: 'Unilateral Cuádriceps / Glúteo',
    targetMuscle: 'Cuádriceps y glúteo medio/mayor',
    defaultExerciseId: 'sentadilla-bulgara',
    machineAltId: 'sentadilla-bulgara-multipower',
    freeAltId: 'zancadas-estaticas-mancuernas',
  },
  INF_03_B: {
    id: 'INF_03_B',
    name: 'Unilateral Énfasis Glúteo',
    targetMuscle: 'Glúteo mayor e isquios',
    defaultExerciseId: 'sentadilla-bulgara-gluteo',
    machineAltId: 'step-up-polea',
    freeAltId: 'step-up-cajon-mancuernas',
  },
  INF_04_A: {
    id: 'INF_04_A',
    name: 'Cadena Posterior / Isquios',
    targetMuscle: 'Isquiotibiales y glúteos',
    defaultExerciseId: 'peso-muerto-rumano',
    machineAltId: 'buenos-dias-maquina',
    freeAltId: 'peso-muerto-rumano-unilateral',
    safetyOverride: {
      alert: 'espalda-baja',
      replaceWith: 'buenos-dias-maquina',
      reason: 'Cuidado en espalda baja / lumbares: sustitución de peso muerto libre por máquina guiada con soporte o hiperextensión 45°.',
    },
  },
  INF_04_B: {
    id: 'INF_04_B',
    name: 'Glúteo + Aductores',
    targetMuscle: 'Glúteo mayor y aductores',
    defaultExerciseId: 'peso-muerto-sumo',
    machineAltId: 'prensa-pies-altos-gluteo',
    freeAltId: 'sentadilla-sumo-mancuerna',
  },
  INF_05: {
    id: 'INF_05',
    name: 'Aislamiento Cuádriceps',
    targetMuscle: 'Recto femoral y vastos',
    defaultExerciseId: 'extension-rodilla',
    machineAltId: 'prensa-horizontal-unilateral',
    freeAltId: 'sissy-squat-asistida',
  },
  INF_06: {
    id: 'INF_06',
    name: 'Aislamiento Isquiotibiales',
    targetMuscle: 'Bíceps femoral y semitendinoso',
    defaultExerciseId: 'curl-femoral',
    machineAltId: 'curl-femoral-unilateral-pie',
    freeAltId: 'curl-nordico-asistido',
  },
  INF_07_A: {
    id: 'INF_07_A',
    name: 'Glúteo Medio (Redondez)',
    targetMuscle: 'Glúteo medio y menor',
    defaultExerciseId: 'abduccion-cadera-maquina',
    machineAltId: 'abduccion-polea-tobillera',
    freeAltId: 'monster-walk-banda',
  },
  INF_07_B: {
    id: 'INF_07_B',
    name: 'Glúteo Mayor Aislamiento',
    targetMuscle: 'Glúteo mayor (extensión de cadera)',
    defaultExerciseId: 'patada-gluteo-polea',
    machineAltId: 'patada-gluteo-maquina',
    freeAltId: 'patada-gluteo-cuadrupedia',
  },
  INF_08: {
    id: 'INF_08',
    name: 'Gemelos y Sóleo',
    targetMuscle: 'Gastrocnemio y sóleo',
    defaultExerciseId: 'gemelos-maquina-pie',
    machineAltId: 'gemelos-sentado-maquina',
    freeAltId: 'gemelos-unilateral-escalon',
  },
}

export function getSlot(slotId: SlotId): BiomechanicalSlot {
  return BIOMECHANICAL_SLOTS[slotId]
}

export function getSlotExerciseId(slotId: SlotId, jointAlerts?: JointAlert[], preferredVariant: 'default' | 'machine' | 'free' = 'default'): string {
  const slot = BIOMECHANICAL_SLOTS[slotId]
  if (!slot) return ''

  // Verificar alertas de seguridad articular primero
  if (jointAlerts && jointAlerts.length > 0 && slot.safetyOverride) {
    const hasAlert = jointAlerts.some(
      (a) => a === slot.safetyOverride?.alert || (slot.safetyOverride?.alert === 'hombro' && a === 'manguito_rotador_preventivo'),
    )
    if (hasAlert) {
      return slot.safetyOverride.replaceWith
    }
  }

  if (preferredVariant === 'machine') return slot.machineAltId
  if (preferredVariant === 'free') return slot.freeAltId
  return slot.defaultExerciseId
}

export function getSlotAlternatives(slotId: SlotId): { defaultId: string; machineId: string; freeId: string } {
  const slot = BIOMECHANICAL_SLOTS[slotId]
  return {
    defaultId: slot.defaultExerciseId,
    machineId: slot.machineAltId,
    freeId: slot.freeAltId,
  }
}
