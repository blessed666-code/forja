import { repsWords, restWords, type PlanSession } from './routines'
import type { HistoryEntry, Profile } from './types'

export type CoachRole = 'instructor' | 'avances' | 'nutricion' | 'sueno' | 'animo'

const RULES: ReadonlyArray<readonly [CoachRole, readonly string[]]> = [
  ['animo', ['no quiero ir', 'flojera', 'dejarlo', 'pereza', 'no tengo ganas', 'rendirme']],
  ['sueno', ['dormir', 'descanso nocturno', 'cansancio', 'cansada', 'cansado', 'sueño', 'insomnio']],
  ['nutricion', ['proteína', 'proteina', 'comer', 'comida', 'dieta', 'maca', 'cacao', 'desayuno']],
  ['avances', ['racha', 'cuánto llevo', 'cuanto llevo', 'esta semana', 'estancado', 'estancada', 'progreso']],
  ['instructor', ['press', 'serie', 'descanso', 'técnica', 'tecnica', 'sentadilla', 'remo', 'peso', 'ejercicio']],
]

export function classifyMessage(message: string): CoachRole {
  const text = message.toLowerCase()
  for (const [role, words] of RULES) {
    if (words.some((w) => text.includes(w))) return role
  }
  return 'instructor'
}

export interface CoachContext {
  profile: Profile
  history: HistoryEntry[]
  nextSession: PlanSession | undefined
}

export interface CoachReply {
  role: CoachRole
  lines: string[]
}

function weekCount(history: HistoryEntry[]): number {
  const now = new Date()
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return history.filter((h) => new Date(h.date) >= monday).length
}

const SCRIPTS: Record<CoachRole, (ctx: CoachContext) => string[]> = {
  instructor: ({ profile, nextSession }) => {
    const first = nextSession?.exercises.find((e) => !e.closer)
    const name = first?.short ?? first?.name.toLowerCase() ?? 'primer ejercicio'
    return [
      `Con ${profile.days} días, el ${name} de hoy son ${first?.sets ?? 3} series de ${repsWords(first?.reps ?? '8')} y ${restWords(first?.rest ?? 90)} de descanso.`,
      'La última repetición de cada serie debe costar, pero sin perder la técnica.',
      profile.care === 'hombro'
        ? 'Si el hombro molesta, paras esa serie y pasas el press a mancuernas.'
        : 'Si algo duele en la articulación, paras esa serie y usas Sustituir.',
      'El descanso se cumple completo: el timer manda, no el afán.',
    ]
  },
  avances: ({ history, nextSession }) => {
    const done = weekCount(history)
    return [
      done === 0
        ? `Llevas el ${nextSession?.name.toLowerCase() ?? 'entreno'} de esta semana sin marcar.`
        : `Esta semana llevas ${done} ${done === 1 ? 'sesión cerrada' : 'sesiones cerradas'}.`,
      'Cuando cierres la sesión, la racha suma un día.',
      'El peso de la barra se anota al terminar, no a mitad de serie.',
      'Si llevas tres semanas con el mismo peso, sube una repetición antes que subir kilos.',
    ]
  },
  nutricion: ({ profile }) => [
    profile.goal === 'masa'
      ? 'Para ganar masa, reparte la proteína en tres o cuatro comidas: huevo, pollo, fríjol, lenteja o queso.'
      : 'Arma cada plato con una fuente de proteína, una de carbohidrato y verdura.',
    'Antes de entrenar, algo liviano: arepa con queso o banano con yogur, una hora antes.',
    'Después de entrenar, come en las siguientes dos horas, sin afán pero sin saltártela.',
    profile.goal === 'masa'
      ? 'Si quieres un apoyo natural, la maca negra o el cacao de NAIU van bien en el batido.'
      : 'El agua cuenta: lleva el termo lleno al gym.',
    'Para un plan con cantidades exactas, habla con un nutricionista.',
  ],
  sueno: () => [
    'El músculo se construye mientras duermes, no mientras entrenas.',
    'Apunta a siete u ocho horas y a la misma hora de acostarte, también el fin de semana.',
    'Deja la pantalla media hora antes y la pieza oscura y fresca.',
    'Si llegas muy cansada al gym, baja una serie hoy y no el descanso.',
  ],
  animo: ({ profile, nextSession }) => [
    `${profile.name}, entiendo, hay días así. No tienes que hacerlo perfecto, solo ir.`,
    `Hoy toca ${nextSession?.name ?? 'tu sesión'}. Haz el primer ejercicio y decides después.`,
    'Casi siempre las ganas llegan en la segunda serie, no antes.',
    `Elegiste ${profile.days} días por algo. Uno de ellos es hoy.`,
    'Ponte los tenis y abre la sesión. Yo cuento las series.',
  ],
}

export function getCoachReply(message: string, ctx: CoachContext): CoachReply {
  // En producción este método llama a POST /api/coach con la ficha y el rol; la clave vive solo en el servidor.
  const role = classifyMessage(message)
  return { role, lines: SCRIPTS[role](ctx) }
}
