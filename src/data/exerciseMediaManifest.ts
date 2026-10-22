/**
 * GIFs animados vía CDN de
 * [ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB) (MIT).
 * Índice completo: `https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/es/exercises.json`
 */
export const EXERCISE_GIF_CDN =
  'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0'

export interface ExerciseMediaSource {
  forjaId: string
  /** Ruta en el repo (sin .gif), ej. `pectorals/barbell-bench-press` */
  gymGifsDbId: string
  sourceName: string
}

export const EXERCISE_MEDIA_SOURCES: readonly ExerciseMediaSource[] = [
  {
    forjaId: 'press-banca-barra',
    gymGifsDbId: 'pectorals/barbell-bench-press',
    sourceName: 'Press de banca con barra',
  },
  {
    forjaId: 'remo-barra-supino',
    gymGifsDbId: 'upper-back/barbell-reverse-grip-bent-over-row',
    sourceName: 'Remo inclinado con barra, agarre invertido',
  },
  {
    forjaId: 'press-hombro-mancuernas',
    gymGifsDbId: 'delts/dumbbell-seated-shoulder-press',
    sourceName: 'Press de hombros con mancuerna, sentado',
  },
  {
    forjaId: 'jalon-polea',
    gymGifsDbId: 'lats/cable-bar-lateral-pulldown',
    sourceName: 'Jalón al pecho en polea, barra lateral',
  },
  {
    forjaId: 'fondos',
    gymGifsDbId: 'pectorals/chest-dip-on-dip-pull-up-cage',
    sourceName: 'Fondos de pecho en jaula de dominadas',
  },
  {
    forjaId: 'plancha-frontal',
    gymGifsDbId: 'abs/weighted-front-plank',
    sourceName: 'Plancha frontal con peso',
  },
  {
    forjaId: 'sentadilla-barra',
    gymGifsDbId: 'glutes/barbell-low-bar-squat',
    sourceName: 'Sentadilla con barra',
  },
  {
    forjaId: 'peso-muerto-rumano',
    gymGifsDbId: 'glutes/barbell-romanian-deadlift',
    sourceName: 'Peso muerto rumano con barra',
  },
  {
    forjaId: 'zancada-barra',
    gymGifsDbId: 'glutes/barbell-lunge',
    sourceName: 'Zancada con barra',
  },
  {
    forjaId: 'extension-rodilla',
    gymGifsDbId: 'quads/lever-leg-extension',
    sourceName: 'Extensión de cuádriceps en máquina',
  },
  {
    forjaId: 'estiramiento-isquios',
    gymGifsDbId: 'hamstrings/hamstring-stretch',
    sourceName: 'Estiramiento de isquiotibiales',
  },
  {
    forjaId: 'press-inclinado-mancuernas',
    gymGifsDbId: 'pectorals/dumbbell-incline-bench-press',
    sourceName: 'Press con mancuerna en banco inclinado',
  },
  {
    forjaId: 'remo-mancuerna',
    gymGifsDbId: 'upper-back/dumbbell-one-arm-bent-over-row',
    sourceName: 'Remo inclinado con mancuerna, a una mano',
  },
  {
    forjaId: 'press-militar-barra',
    gymGifsDbId: 'delts/barbell-standing-close-grip-military-press',
    sourceName: 'Press militar con barra, de pie',
  },
  {
    forjaId: 'remo-polea-sentado',
    gymGifsDbId: 'upper-back/cable-seated-wide-grip-row',
    sourceName: 'Remo en polea, sentado, agarre ancho',
  },
  {
    forjaId: 'curl-barra',
    gymGifsDbId: 'biceps/barbell-biceps-curl-with-arm-blaster',
    sourceName: 'Curl de bíceps con barra',
  },
  {
    forjaId: 'triceps-polea',
    gymGifsDbId: 'triceps/cable-pushdown',
    sourceName: 'Pushdown en polea',
  },
  {
    forjaId: 'peso-muerto-barra',
    gymGifsDbId: 'glutes/barbell-deadlift',
    sourceName: 'Peso muerto con barra',
  },
  {
    forjaId: 'prensa',
    gymGifsDbId: 'glutes/sled-45-leg-press',
    sourceName: 'Prensa de piernas a 45°',
  },
  {
    forjaId: 'sentadilla-bulgara',
    gymGifsDbId: 'quads/barbell-single-leg-split-squat',
    sourceName: 'Split squat con barra, a una pierna',
  },
  {
    forjaId: 'curl-femoral',
    gymGifsDbId: 'hamstrings/lever-lying-leg-curl',
    sourceName: 'Curl femoral en máquina, tumbado',
  },
  {
    forjaId: 'flexiones',
    gymGifsDbId: 'pectorals/push-up',
    sourceName: 'Flexión de pecho',
  },
  {
    forjaId: 'sentadilla-libre',
    gymGifsDbId: 'glutes/band-squat',
    sourceName: 'Sentadilla con banda',
  },
  {
    forjaId: 'elevaciones-laterales',
    gymGifsDbId: 'delts/dumbbell-lateral-raise',
    sourceName: 'Elevación lateral con mancuerna',
  },
  {
    forjaId: 'curl-mancuernas',
    gymGifsDbId: 'biceps/dumbbell-alternate-biceps-curl',
    sourceName: 'Curl de bíceps con mancuerna, alternado',
  },
  {
    forjaId: 'cruce-poleas',
    gymGifsDbId: 'pectorals/cable-standing-up-straight-crossovers',
    sourceName: 'Cruce de poleas, de pie',
  },
  {
    forjaId: 'press-pecho-maquina',
    gymGifsDbId: 'pectorals/lever-chest-press',
    sourceName: 'Press de pecho en máquina',
  },
  {
    forjaId: 'press-hombro-maquina',
    gymGifsDbId: 'delts/lever-shoulder-press',
    sourceName: 'Press de hombros en máquina',
  },
  {
    forjaId: 'press-hombro-banda',
    gymGifsDbId: 'delts/band-shoulder-press',
    sourceName: 'Press de hombros con banda',
  },
  {
    forjaId: 'deadbug',
    gymGifsDbId: 'abs/dead-bug',
    sourceName: 'Dead bug',
  },
  {
    forjaId: 'dominadas-pronas',
    gymGifsDbId: 'lats/pull-up',
    sourceName: 'Dominadas pronas',
  },
  {
    forjaId: 'dominadas-supinas',
    gymGifsDbId: 'lats/chin-up',
    sourceName: 'Dominadas supinas (Chin-ups)',
  },
  {
    forjaId: 'remo-t-bar',
    gymGifsDbId: 'upper-back/lever-t-bar-row',
    sourceName: 'Remo T-Bar con apoyo',
  },
  {
    forjaId: 'press-arnold-mancuernas',
    gymGifsDbId: 'delts/dumbbell-arnold-press',
    sourceName: 'Press Arnold con mancuernas',
  },
  {
    forjaId: 'press-frances-barra-z',
    gymGifsDbId: 'triceps/ez-barbell-lying-close-grip-triceps-extension-behind-head',
    sourceName: 'Press francés acostado con barra Z',
  },
  {
    forjaId: 'curl-barra-z',
    gymGifsDbId: 'biceps/ez-barbell-curl',
    sourceName: 'Curl de bíceps con barra Z',
  },
  {
    forjaId: 'curl-biceps-inclinado',
    gymGifsDbId: 'biceps/dumbbell-incline-biceps-curl',
    sourceName: 'Curl de bíceps en banco inclinado con mancuernas',
  },
  {
    forjaId: 'hip-thrust-barra',
    gymGifsDbId: 'glutes/barbell-hip-thrust',
    sourceName: 'Hip Thrust con barra',
  },
  {
    forjaId: 'sentadilla-bulgara-gluteo',
    gymGifsDbId: 'quads/barbell-single-leg-split-squat',
    sourceName: 'Sentadilla búlgara con mancuernas',
  },
  {
    forjaId: 'peso-muerto-sumo',
    gymGifsDbId: 'glutes/barbell-sumo-deadlift',
    sourceName: 'Peso muerto sumo con barra',
  },
  {
    forjaId: 'abduccion-cadera-maquina',
    gymGifsDbId: 'glutes/lever-seated-hip-abduction',
    sourceName: 'Abducción de cadera en máquina sentado',
  },
  {
    forjaId: 'gemelos-maquina-pie',
    gymGifsDbId: 'calves/lever-standing-calf-raise',
    sourceName: 'Elevación de gemelos de pie en máquina',
  },
  {
    forjaId: 'face-pulls-polea-alta',
    gymGifsDbId: 'delts/cable-rear-delt-row-with-rope',
    sourceName: 'Face Pulls en polea alta con cuerda',
  },
  {
    forjaId: 'rueda-abdominal',
    gymGifsDbId: 'abs/wheel-roller',
    sourceName: 'Rueda abdominal (Ab Wheel)',
  },
  {
    forjaId: 'elevacion-piernas-barra',
    gymGifsDbId: 'abs/hanging-leg-raise',
    sourceName: 'Elevación de piernas colgado en barra',
  },
  {
    forjaId: 'crunch-polea-alta-rodillas',
    gymGifsDbId: 'abs/cable-kneeling-crunch',
    sourceName: 'Crunch abdominal en polea alta de rodillas',
  },
]
