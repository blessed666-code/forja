---
target: src/components/session/SessionView.tsx
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/home/danniel/arka-clients/forja/src/components/session/SessionView.tsx"
target_fingerprint: "sha256:35f1ed10763f7f55a1b359768c52e075c90d1c5cad06615ad0a483024156b69c"
target_path: /home/danniel/arka-clients/forja/src/components/session/SessionView.tsx
timestamp: 2026-10-21T20-05-30Z
slug: src-components-session-sessionview-tsx
---
# Critique: src/components/session/SessionView.tsx

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Timer visual claro, pero falta vibración o pulso háptico cuando el descanso llega a cero. |
| 2 | Match System / Real World | 3 | Terminología biomecánica real (RIR, RPE, Slots), pero falta input opcional de peso levantado. |
| 3 | User Control and Freedom | 3 | Sustitución y salto de ejercicios fluido; falta botón para deshacer una serie marcada por error. |
| 4 | Consistency and Standards | 3 | Tokens y fuentes consistentes con DESIGN.md; botones de diálogo optimizados para móvil. |
| 5 | Error Prevention | 2 | El botón X sale inmediatamente a /hoy sin confirmación; riesgo de toque accidental en el gym. |
| 6 | Recognition Rather Than Recall | 3 | Lista de chequeo, GIF animado y pasos biomecánicos visibles sin memorizar. |
| 7 | Flexibility and Efficiency | 3 | Barra fija inferior ideal para uso con una sola mano; falta atajo de teclado para desktop. |
| 8 | Aesthetic and Minimalist Design | 4 | Excelente estética obsidiana de alto contraste (17.5:1), sin ruido visual innecesario. |
| 9 | Error Recovery | 3 | Notas de seguridad claras para proteger articulaciones; advertencias contextuales visibles. |
| 10 | Help and Documentation | 3 | Pasos de ejecución numerados, errores comunes y pautas de respiración integradas. |
| **Total** | | **30/40** | **Good (Foundation solid, actionable UX enhancements)** |

#### Design Specificity Verdict

**LLM assessment**: La interfaz está íntimamente adaptada a su caso de uso real: una sesión activa de entrenamiento en sala de pesas. La botonera fija inferior (`Hecho`, `Saltar descanso`, `Sustituir`), el identificador de slot biomecánico y los badges de esfuerzo (RIR 1-2 / Fallo técnico) no son genéricos de una app de tareas, sino específicos de musculación seria.

**Deterministic scan**: El escaneo mecánico de Impeccable reportó **0 violaciones** (`[]`). Las clases de Tailwind cumplen la paleta oscura, los contrastes son superiores a WCAG AA y los touch targets miden 56px (`h-14`).

#### Overall Impression
La pantalla es robusta, enfocada y estéticamente atractiva. Transmite la autoridad de un sistema de forja y entrenamiento riguroso. Su mayor oportunidad está en la resiliencia en sala de pesas: proteger al usuario de toques accidentales al salir y avisarle con vibración háptica cuando se termina el tiempo de descanso.

#### What's Working
1. **Ergonomía del pulgar (Thumb-zone):** La barra de acciones inferior fija (`h-14`) permite completar series o saltar descanso con una sola mano sin forzar la postura.
2. **Sustitución Biomecánica Transparente:** El diálogo nativo `<dialog>` resalta con badge `Mismo Slot` los ejercicios que preservan el vector de fuerza exacto.
3. **Jerarquía Visual y Contraste:** El músculo en tipografía Big Shoulders de 60px y el color lima neón `#D6FF3F` ofrecen visibilidad instantánea bajo los focos del gimnasio.

#### Priority Issues
- **[P1] Salida accidental sin confirmación**: Pulsar `X` en el header abandona la sesión de inmediato sin consultar si se desea pausar o terminar.
  - *Why it matters*: Dedos sudorosos o guardar el teléfono en el bolsillo pueden abortar un entreno a la mitad.
  - *Fix*: Agregar un diálogo ligero "¿Deseas pausar o salir del entreno?".
  - *Suggested command*: `/impeccable harden`
- **[P2] Alerta de fin de descanso sin vibración/sonido**: Al llegar a `00:00`, el timer simplemente se detiene en silencio.
  - *Why it matters*: En un gimnasio con música alta, el usuario mira a otro lado o conversa y pierde el ritmo de descanso.
  - *Fix*: Disparar `navigator.vibrate([120, 80, 120])` y un pulso visual de color lima/coral.
  - *Suggested command*: `/impeccable delight`
- **[P2] Imposibilidad de deshacer serie (Undo Set)**: Si se pulsa "Hecho" dos veces seguidas, se avanza a la siguiente serie/ejercicio sin vuelta atrás.
  - *Why it matters*: Errores de doble toque obligan a recargar la página o descalibrar el contador.
  - *Fix*: Añadir acción "Deshacer última serie".
  - *Suggested command*: `/impeccable polish`

#### Persona Red Flags
- **Casey (Gimnasta con una sola mano en sala)**: Si apaga la pantalla o pasa a Spotify, `setTimeout` puede desacelerarse en background en móviles.
- **Alex (Power User)**: Quiere ingresar rápidamente el peso en kg utilizado en la serie en lugar de solo marcar completado.
- **Sam (Accesibilidad)**: El diálogo modal nativo debe recibir foco programático directo al abrirse.

#### Minor Observations
- La fuente mono de los segundos del timer (`tabular-nums`) previene saltos de layout en el cronómetro, lo cual es excelente.
- El botón de `PauseMotionButton` en el header cumple estrictamente con el principio de reducción de movimiento.

#### Questions to Consider
- "¿Debería el timer de descanso sonar o vibrar automáticamente en el teléfono al llegar a 0?"
- "¿Conviene agregar un registro opcional de peso (kg) en cada serie para que el usuario recuerde cuánto cargó la semana pasada?"
