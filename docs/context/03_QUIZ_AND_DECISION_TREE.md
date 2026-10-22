# ARKA FITNESS AI — LÓGICA DEL QUIZ Y ÁRBOL DE DECISIÓN DE RUTINAS

**Contexto para:** Antigravity CLI  
**Módulo:** Onboarding Quiz & Asignador de Rutinas (`/components/quiz/*` y `/lib/routine-matcher.ts`)

---

## 1. COMPORTAMIENTO Y REGLAS DEL QUIZ DE ENTRADA

El Quiz debe ser rápido (máximo 7 pasos), visual y con validaciones cerradas para evitar combinaciones inválidas:

### Paso 1: Género / Enfoque Anatómico
- `hombre` -> Activa clusters `H-3`, `H-4`, `H-5` (Énfasis Torso en V, Pecho, Espalda, Brazos y Pierna sólida).
- `mujer` -> Activa clusters `M-3`, `M-4`, `M-5` (Énfasis Glúteo en 3 ángulos, Pierna estética y Torso tonificado).

### Paso 2: Objetivo Principal (Educación Integrada)
- `ganar_masa` (Hipertrofia y fuerza).
- `marcar_tonificar` (Recomposición corporal).
- `bajar_peso` (Oxidación de grasa).
- **Regla de Negocio UI:** Si el usuario selecciona `bajar_peso`, mostrar un banner educativo inmediato: *"En ARKA Fitness AI no perderás tu tiempo haciendo solo horas de cardio. La forma más efectiva y científica de oxidar grasa y definir tu cuerpo es entrenando fuerza con pesas + abdomen y un déficit calórico inteligente."*

### Paso 3: Días Disponibles por Semana (Restricción Estricta)
- Opciones únicas permitidas en la UI: **`3 días`**, **`4 días`** o **`5 días`**.
- *(Bloqueados 1-2 días por estímulo insuficiente para Frecuencia 2; bloqueados 6-7 días para prevenir sobreentrenamiento y lesiones articulares).*

### Paso 4: Tiempo Disponible por Sesión
- `60_min` (1 Hora — Express: series ajustadas a 3 y descansos de 60-90s).
- `90_min` (1 Hora 30 Min — Estándar: básicos a 4 series, accesorios a 3 series + Abdomen + Cardio).
- `120_min` (2 Horas — Pro: todos los bloques completos a 4 series + 20 min Abdomen + 10 min Cardio).

### Paso 5: Nivel de Experiencia (Tope de Ejercicios de Fuerza)
- `principiante` -> Tope máximo de **4 ejercicios** de pesas por sesión.
- `intermedio` -> Tope estándar de **5 ejercicios** de pesas por sesión.
- `avanzado` -> Tope máximo de **5 a 6 bloques** de pesas por sesión.

### Paso 6: Cuidado Articular (Filtros de Seguridad)
- Checkboxes opcionales: `Ninguna molestia`, `Cuidado especial en Hombros / Manguito Rotador`, `Cuidado en Rodillas`, `Cuidado en Codos`, `Cuidado en Espalda Baja`.
- **Acción del Motor:**
  - Si marca `Hombros`: Fuerza la sustitución preventiva de *Fondos en paralelas* por *Press en Máquina Sentado* y prioriza agarres neutros.
  - Si marca `Rodillas`: Cambia *Sentadilla Libre* por *Prensa 45° (pies medios/altos)* o *Hip Thrust* como primer ejercicio y exige *Curl Femoral* primero para calentar tendones antes de extender.

### Paso 7: Datos Básicos para Nutrición + NAIU
- Edad, Peso (kg), Estatura (cm) y nivel de energía percibido (`bajo`, `normal`, `alto`).

---

## 2. FUNCIÓN DETERMINISTA DE ASIGNACIÓN (`matchRoutineCluster`)

```typescript
export function matchRoutineCluster(quiz: QuizInput): AssignedPlan {
  // 1. Determinar el Grupo Base (H-3, H-4, H-5 o M-3, M-4, M-5)
  const prefix = quiz.gender === 'hombre' ? 'H' : 'M';
  const clusterId = `${prefix}-${quiz.daysPerWeek}`; // Ej: "H-5" (Rutina Ideal Fundador)

  // 2. Aplicar Modulador de Tiempo (60, 90 o 120 min)
  const timeConfig = TIME_MODULATORS[quiz.sessionMinutes];

  // 3. Aplicar Filtro de Nivel (4, 5 o 6 bloques)
  const maxExercises = quiz.level === 'principiante' ? 4 : 5;

  // 4. Seleccionar Superalimento NAIU según perfil
  const naiuProduct = selectNaiuSuperfood(quiz.gender, quiz.goal, quiz.energyLevel);

  return {
    clusterId,
    timeConfig,
    maxExercises,
    safetyOverrides: buildSafetyOverrides(quiz.jointIssues),
    naiuRecommendation: naiuProduct
  };
}
```
