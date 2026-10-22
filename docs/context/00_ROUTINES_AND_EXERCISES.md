# ARKA FITNESS AI — MOTOR DETERMINISTA DE RUTINAS Y CATÁLOGO MAESTRO

**Contexto para:** Antigravity CLI (AGY CLI)  
**Arquitectura:** Asignación 100% Determinista por Código (Zero-AI Hallucination en Rutinas)

---

## 1. ARQUITECTURA DE DECISIÓN: CÓDIGO DETERMINISTA VS. AGENTE IA

### 1.1 ¿Quién asigna la rutina? (El Motor Determinista)
La IA **NO** inventa ni elige la rutina inicial.  
Cuando el usuario completa el Quiz de Onboarding (o inicia sesión con su perfil), una función pura del backend (`assignDeterministicRoutine(userProfile)`) cruza 4 variables:
- `gender`: `'hombre' | 'mujer'`
- `days_per_week`: `3 | 4 | 5`
- `session_duration_min`: `60 | 90 | 120`
- `joint_alerts`: `['hombro', 'rodilla', 'codo', 'espalda-baja']` (Opcional)

Con ese cruce, el sistema asigna uno de los **6 Clusters Oficiales** (`H-3`, `H-4`, `H-5`, `M-3`, `M-4`, `M-5`) y le aplica el **Modulador de Tiempo** (`60m`, `90m`, `120m`).

> **Caso de Prueba (Login del Fundador / Admin):** Si el usuario logueado tiene el perfil `gender: 'hombre'`, `days_per_week: 5`, `session_duration_min: 120`, el sistema carga de forma determinista e inmediata el **Cluster H-5 (Modo 120 Minutos)**, que corresponde exactamente a la Rutina Oficial del Fundador.

### 1.2 ¿Dónde actúa el Agente de IA (`qwen2.5-vl-72b-instruct:free`)?
El Agente IA solo vive en el módulo de Chatbot (`/api/agent/chat`) y Analizador Visual de Comida/Máquinas (`/api/agent/vision`). Sus funciones exclusivas son:
1. Recomendar alimentación de plaza colombiana y superalimentos exclusivos de NAIU (Maca Negra, Maca Roja, Maca Amarilla) según el objetivo.
2. Explicar técnica de ejercicios o guiar al usuario a usar el botón de intercambio (`slot_id`) si una máquina está ocupada.
3. Analizar fotos de platos de comida o máquinas de gimnasio (bloqueando estrictamente fotos de cuerpos humanos o desnudos por privacidad).

---

## 2. ALGORITMO DE TIEMPO: ¿CÓMO REPARTE LA SESIÓN LA APP SEGÚN LA DURACIÓN?

Todos los usuarios dentro de un mismo Grupo (ej. `H-5`) realizan los mismos ejercicios base, pero el motor modifica dinámicamente la cantidad de series, los tiempos de descanso y las vueltas de abdomen según el tiempo elegido:

| Bloque de la Sesión | Modo 60_MIN (1 Hora - Express) | Modo 90_MIN (1h 30m - Estándar) | Modo 120_MIN (2 Horas - Pro / Fundador) |
|---|---|---|---|
| **1. Blindaje / Movilidad** | 8 min (Compacto: 3 ejercicios seguidos sin pausa) | 10 min (Protocolo completo de calentamiento) | 10 min (Protocolo completo + serie de aproximación) |
| **2. Bloque de Fuerza (Pesas/Calistenia)** | 40 min | 55 min | 70 min (Incluye 10m de margen de transición entre máquinas) |
| **Regla de Series y Descansos** | • Todos los ejercicios pasan a 3 series.<br>• Descanso estricto: 60 a 90 seg.<br>• Los bloques 4 y 5 se agrupan en Biserie automática. | • Ejercicios 1 y 2 (Básicos): 4 series (Descanso: 120 seg).<br>• Ejercicios 3, 4 y 5: 3 series (Descanso: 90 seg). | • Bloques principales: 4 series pesadas (salvo indicación específica de 3 series).<br>• Descanso completo de fuerza: 120 a 180 seg. |
| **3. Bloque de Abdomen** | 12 min (2 vueltas al circuito del día, sin descanso largo) | 15 min (2 a 3 vueltas al circuito del día) | 20 min (3 vueltas completas: 45s trabajo / 15s pausa + 1m entre vueltas) |
| **4. Bloque de Cardio** | 0 min (Omitido en gym; se sugiere caminata externa) | 10 min (HIIT en días de Torso / Caminata inclinada en Pierna) | 10 min (HIIT en días de Torso / Caminata inclinada en Pierna) |

---

## 3. REGLAS BIOMECÁNICAS Y DE SEGURIDAD (HARDCODED EN UI/BACKEND)

### Regla de Esfuerzo (`effort_type`):
- **`RIR_1_2` (Dejar 1-2 repeticiones en reserva, prohibido ir al fallo total):** Aplicado a Dominadas, Press Inclinado, Press Plano, Remo T-Bar/Polea, Fondos, Press Arnold/Militar, Sentadilla, Peso Muerto Rumano, Hip Thrust y Sentadilla Búlgara.
- **`TECHNICAL_FAILURE` (Fallo técnico permitido solo en la última serie):** Aplicado a Aperturas/Cruces, Elevaciones Laterales, Curls de Bíceps, Extensiones de Tríceps en Polea, Extensión de Cuádriceps, Curl Femoral, Abducciones y Gemelos.
- **`PROTECTED_RIR_1` (Fallo controlado cuidando codo):** Aplicado a Press Francés Acostado con Barra Z.

### Reglas de Oro del Manguito Rotador y Rodillas:
- **Prohibidos en la BD:** Press tras nuca, Jalón tras nuca, Remo al mentón con agarre cerrado.
- **Tope en Elevaciones Laterales:** Mostrar alerta visual: *"Subir máximo hasta 80° (debajo de la línea horizontal del hombro) en plano escapular"*.
- **Fondos en Paralelas:** Bajar máximo a 90° de flexión de codo. Si el usuario tiene activada la alerta `joint_alerts: ['hombro']`, el motor reemplaza automáticamente Fondos por Press de Pecho Sentado en Máquina.

---

## 4. BLOQUES FIJOS: CALENTAMIENTOS Y CIRCUITOS DE ABDOMEN

### 4.1 Protocolos de Calentamiento y Blindaje (10 Minutos)
* **`WARMUP_UPPER` (Obligatorio en todos los días de Torso):**
  1. Rotaciones externas de hombro con banda elástica: 2 × 15 reps por lado (codo pegado al torso).
  2. Face Pulls en polea alta con cuerda (Regla de Oro): 3 × 20 reps (tirar a la frente, rotar externamente y sostener 1-2s; nunca al fallo).
  3. Wall Slides (Deslizamientos de antebrazos en pared): 2 × 10 reps.
  4. Dislocaciones de hombro con bastón/PVC: 1 × 15 reps (agarre amplio).
* **`WARMUP_LOWER` (Obligatorio en todos los días de Pierna/Glúteo):**
  1. Sentadilla profunda isométrica sostenida (abriendo cadera): 2 × 30 seg.
  2. Balanceos dinámicos de pierna (frontales y laterales): 2 × 15 reps por pierna.
  3. Puentes de glúteo en suelo sin peso (activación con pausa de 2s arriba): 2 × 15 reps.
  4. Extensión suave de rodillas en máquina con peso mínimo (lubricación rotuliana): 1 × 20 reps.

### 4.2 Circuitos Oficiales de Abdomen (Formato 45s trabajo / 15s transición / 60s descanso entre vueltas)
- **`ABS_CIRCUIT_A`:** 1. Elevación de piernas colgado en barra | 2. Crunch abdominal en polea alta (de rodillas) | 3. TRX Pike (o encogimiento invertido) | 4. Russian Twists con disco | 5. Plancha abdominal isométrica (60s).
- **`ABS_CIRCUIT_B`:** 1. Rueda abdominal (Ab Wheel desde rodillas) | 2. Elevación de rodillas al pecho colgado | 3. Leñador en polea (Cable Woodchops) | 4. L-Sit en paralelas o suelo (20s) | 5. Bicicletas abdominales controladas.
- **`ABS_CIRCUIT_C`:** 1. Dragon Flags (o regresión bajando piernas lentas en banco) | 2. Limpiaparabrisas colgado (Windshield Wipers con rodillas semiflexionadas) | 3. TRX Fallout (inclinación antiextensión) | 4. Crunch en máquina abdominal | 5. Plancha lateral con elevación dinámica de cadera (30s por lado).
- **`ABS_CIRCUIT_D`:** 1. L-Sit colgado en barra fija (20s) | 2. Crunch en polea alta con cuerda | 3. TRX Oblique Knee Tuck (rodillas a codos alternados) | 4. V-Ups o Jackknife en suelo/banco | 5. Escaladores dinámicos (Mountain Climbers - 30s).

---

## 5. DICCIONARIO DE SLOTS BIOMECÁNICOS Y EQUIVALENCIAS (BOTÓN "CAMBIAR EJERCICIO")

| `slot_id` | Zona Muscular | Opción Estándar (default) | Variante Máquina / Polea (machine_alt) | Variante Libre / Calistenia (free_alt) |
|---|---|---|---|---|
| `SUP_01` | Pecho Superior (Clavicular) | Press de Banca Inclinado con Mancuernas (30°-45°) | Press Inclinado en Máquina Convergente / Multipower | Flexiones Declinadas (Pies elevados en banco) |
| `SUP_02_A` | Pecho Inferior / Empuje | Fondos en Paralelas (Bajada estricta a 90°) | Press de Pecho Sentado en Máquina / Máquina de Fondos | Flexiones Clásicas con Pausa Abajo |
| `SUP_02_B` | Pecho Medio / Masa | Press de Banca Plano con Mancuernas | Press Plano en Máquina Sentado / Multipower | Press de Banca Plano con Barra Olímpica |
| `SUP_03` | Pecho Aislamiento | Aperturas Inclinadas con Mancuernas (30°) | Cruces en Polea Alta/Media (Cable Crossover) o Pec Deck | Flexiones Abiertas Controladas |
| `SUP_04` | Espalda Amplitud (Prono/Neutro) | Dominadas Pronas o Neutras | Jalón al Pecho en Polea Alta (Agarre Prono o Neutro) | Dominadas Asistidas con Banda Elástica |
| `SUP_05` | Espalda + Bíceps (Supino) | Dominadas Supinas (Chin-ups) | Jalón al Pecho con Agarre Supino o Triángulo (V) | Dominadas Supinas Negativas (Bajada en 4s) |
| `SUP_06_A` | Espalda Densidad Pesada | Remo T-Bar o Remo con Mancuerna (Agarre Neutro) | Remo en Máquina con Apoyo al Pecho (Agarre Neutro) | Remo Inclinado con Barra (Agarre Prono/Supino) |
| `SUP_06_B` | Espalda Espesor Medio | Remo Sentado en Polea Baja (Agarre V / Neutro) | Remo Convergente en Máquina Sentado | Remo con Mancuernas en Banco Inclinado |
| `SUP_06_C` | Espalda Media / Escápulas | Remo Australiano en TRX o Barra Baja | Remo Alto en Máquina (Enfoque Espalda Alta) | Remo Invertido en Multipower |
| `SUP_07` | Hombro Frontal / Medio | Press Arnold Sentado con Mancuernas | Press de Hombro en Máquina Convergente (Agarre Neutro) | Press Militar Sentado con Mancuernas (Plano Escapular) |
| `SUP_08` | Hombro Lateral (Anchura) | Elevaciones Laterales con Mancuernas (Máx 80°) | Elevaciones Laterales en Máquina o en Polea Baja | Elevaciones Laterales con Banda Pisada |
| `SUP_10` | Tríceps Cabeza Larga / Interna | Press Francés Acostado con Barra Z (Hacia atrás) | Extensión de Tríceps sobre la Cabeza en Polea Alta | Press Francés Acostado con Mancuernas (Agarre Neutro) |
| `SUP_11` | Tríceps Cabeza Lateral | Extensión de Tríceps en Polea Alta con Cuerda | Extensión de Tríceps en Polea con Barra V / Máquina | Flexiones Diamante / Patada de Tríceps |
| `SUP_12` | Bíceps Masa General | Curl de Bíceps de Pie con Barra Z | Curl de Bíceps en Polea Baja con Barra Z o Recta | Curl Martillo con Mancuernas de Pie |
| `SUP_13` | Bíceps Estiramiento / Pico | Curl de Bíceps en Banco Inclinado con Mancuernas | Curl de Bíceps en Máquina Predicador (Scott) | Curl Araña (Spider Curl) o Curl en Polea tras Espalda |
| `INF_01` | Cuádriceps / Base Pierna | Sentadilla Trasera con Barra | Sentadilla Hack (Hack Squat) o Prensa 45° | Sentadilla Goblet Pesada con Mancuerna |
| `INF_02` | Glúteo Mayor (Potencia) | Hip Thrust con Barra Libre (Pausa 2s arriba) | Máquina de Hip Thrust o Hip Thrust en Multipower | Puente de Glúteo Pesado con Mancuerna |
| `INF_03_A` | Unilateral Cuádriceps/Glúteo | Sentadilla Búlgara con Mancuernas (Torso Vertical) | Sentadilla Búlgara en Multipower / Prensa a 1 Pierna | Zancadas Estáticas con Mancuernas |
| `INF_03_B` | Unilateral Énfasis Glúteo | Sentadilla Búlgara con Mancuernas (Torso Inclinado 30°) | Subida al Cajón Alto (Step-Up) en Polea o Multipower | Zancada Atrás Cruzada Moderada / Step-Up Mancuernas |
| `INF_04_A` | Cadena Posterior / Isquios | Peso Muerto Rumano con Barra o Mancuernas | Buenos Días en Máquina / Hiperextensión a 45° para Glúteo | Peso Muerto Rumano Unilateral con Mancuerna |
| `INF_04_B` | Glúteo + Aductores | Peso Muerto Sumo con Barra o Mancuerna Pesada | Prensa 45° con Pies Altos y Anchos (Enfoque Glúteo) | Sentadilla Sumo Profunda con Mancuerna |
| `INF_05` | Aislamiento Cuádriceps | Extensión de Cuádriceps en Máquina Sentado | Prensa Horizontal Unilateral (Rango constante) | Sissy Squat Asistida / Sentadilla Española con Banda |
| `INF_06` | Aislamiento Isquiotibiales | Curl Femoral Sentado o Acostado en Máquina | Curl Femoral Unilateral de Pie en Máquina | Curl Nórdico Asistido / Deslizamiento Femoral en Suelo |
| `INF_07_A` | Glúteo Medio (Redondez) | Abducción de Cadera en Máquina Sentado | Abducción de Cadera en Polea Baja con Tobillera | Caminata Lateral (Monster Walk) con Banda Elástica |
| `INF_07_B` | Glúteo Mayor Aislamiento | Patada de Glúteo en Polea Baja con Tobillera | Máquina de Patada de Glúteo (Glute Kickback Machine) | Patada Cuadrúpeda con Banda / Mancuerna |
| `INF_08` | Gemelos y Sóleo | Elevación de Gemelos de Pie en Máquina (o Prensa) | Elevación de Gemelos Sentado en Máquina (Sóleo) | Elevación de Gemelos Unilateral con Mancuerna en Escalón |

---

## 6. CATÁLOGO COMPLETO DE LOS 6 CLUSTERS (HOMBRES Y MUJERES)

### ⭐ CLUSTER H-5 — HOMBRE · 5 DÍAS (3 TORSO + 2 PIERNA) — [RUTINA OFICIAL FUNDADOR]
*Asignada automáticamente cuando `gender == 'hombre'` y `days_per_week == 5`.*

#### DÍA 1 — Torso A: Fuerza Híbrida (Pecho Superior, Espalda Ancha, Hombros y Fondos)
- **Calentamiento:** `WARMUP_UPPER` (Incluye 3×20 Face Pulls).
- **Bloque de Fuerza:**
  1. `SUP_04` — Dominadas Pronas o Neutras: 120m/90m: 4 × 6-8 | 60m: 3 × 6-8 (RIR 1).
  2. `SUP_01` — Press de Banca Inclinado con Mancuernas (30°-45°): 120m/90m: 4 × 6-8 | 60m: 3 × 6-8 (RIR 1-2).
  3. `SUP_06_A` — Remo T-Bar o Remo con Mancuerna (Agarre Neutro): 120m: 4 × 8-10 | 90m/60m: 3 × 8-10 (RIR 1).
  4. `SUP_02_A` — Fondos en Paralelas (hasta 90°): 120m/90m/60m: 3 × 8-10 (RIR 1).
  5. `SUP_07` — Press Arnold Sentado con Mancuernas: 120m/90m/60m: 3 × 8-10 (RIR 1-2).
- **Abdomen:** `ABS_CIRCUIT_A` (120m: 20 min / 3 vueltas | 90m: 15 min | 60m: 12 min).
- **Cardio:** 120m/90m: 10 min Bicicleta Estática HIIT | 60m: 0 min.

#### DÍA 2 — Pierna A: Fuerza y Masa (Cuádriceps + Glúteo Pesado)
- **Calentamiento:** `WARMUP_LOWER`.
- **Bloque de Fuerza:**
  1. `INF_01` — Sentadilla Trasera con Barra: 120m/90m: 4 × 6-8 | 60m: 3 × 6-8 (RIR 1-2).
  2. `INF_02` — Hip Thrust con Barra (Pausa 2s arriba): 120m/90m: 4 × 8-10 | 60m: 3 × 8-10 (RIR 1).
  3. `INF_03_A` — Sentadilla Búlgara con Mancuernas: 120m: 4 × 10-12 por pierna | 90m/60m: 3 × 10-12 (RIR 1-2).
  4. `INF_05` — Extensión de Cuádriceps en Máquina: 120m: 4 × 12-15 | 90m/60m: 3 × 12-15 (Última al Fallo Técnico).
  5. `INF_06` + `INF_08` — Biserie Final: Curl Femoral + Elevación de Gemelo de Pie: 3 × 12-15 c/u.
- **Abdomen:** `ABS_CIRCUIT_B`.
- **Cardio:** 120m/90m: 10 min Caminadora Inclinada o Elíptica Suave | 60m: 0 min.

#### DÍA 3 — Torso B: Empuje Estético (Pecho Medio, Hombro Lateral y Tríceps Barra Z)
- **Calentamiento:** `WARMUP_UPPER`.
- **Bloque de Fuerza:**
  1. `SUP_02_B` — Press de Banca Plano con Mancuernas: 120m/90m: 4 × 8-10 | 60m: 3 × 8-10 (RIR 1-2).
  2. `SUP_03` — Aperturas Inclinadas con Mancuernas (o Cruces en Polea): 120m/90m/60m: 3 × 12-15 (Última al Fallo Técnico).
  3. `SUP_08` — Elevaciones Laterales con Mancuernas (Máx 80°): 120m/90m: 4 × 15-20 | 60m: 3 × 15-20 (Última al Fallo Técnico).
  4. `SUP_10` — Press Francés Acostado con Barra Z: 120m: 4 × 8-12 | 90m/60m: 3 × 10-12 (PROTECTED_RIR_1).
  5. `SUP_11` — Extensión de Tríceps en Polea Alta con Cuerda: 120m/90m/60m: 3 × 12-15.
- **Abdomen:** `ABS_CIRCUIT_C`.
- **Cardio:** 120m/90m: 10 min Caminadora Inclinación 12-15% | 60m: 0 min.

#### DÍA 4 — Torso C: Tracción y Brazos (Espalda Completa y Bíceps)
- **Calentamiento:** `WARMUP_UPPER`.
- **Bloque de Fuerza:**
  1. `SUP_05` — Dominadas Supinas (Chin-ups): 120m/90m: 4 × 6-8 | 60m: 3 × 6-8 (RIR 1).
  2. `SUP_06_B` — Remo Sentado en Polea Baja (Agarre V / Neutro): 120m/90m: 4 × 8-10 | 60m: 3 × 8-10 (RIR 1).
  3. `SUP_06_C` — Remo Australiano en TRX o Barra Baja: 120m/90m/60m: 3 × 10-12 (RIR 1).
  4. `SUP_12` — Curl de Bíceps de Pie con Barra Z: 120m: 4 × 8-10 | 90m/60m: 3 × 8-10 (RIR 1).
  5. `SUP_13` — Curl de Bíceps en Banco Inclinado con Mancuernas: 120m/90m/60m: 3 × 10-12.
- **Abdomen:** `ABS_CIRCUIT_D`.
- **Cardio:** 120m/90m: 10 min Bicicleta o Remo HIIT | 60m: 0 min.

#### DÍA 5 — Pierna B: Cadena Posterior, Glúteo e Isquiotibiales
- **Calentamiento:** `WARMUP_LOWER`.
- **Bloque de Fuerza:**
  1. `INF_04_A` — Peso Muerto Rumano con Barra o Mancuernas: 120m/90m: 4 × 8-10 | 60m: 3 × 8-10 (RIR 1-2).
  2. `INF_02` — Hip Thrust con Barra: 120m/90m: 4 × 10-12 | 60m: 3 × 10-12 (RIR 1).
  3. `INF_03_B` — Sentadilla Búlgara con Mancuernas (Torso inclinado 30°): 120m: 4 × 10-12 por pierna | 90m/60m: 3 × 10-12 (RIR 1-2).
  4. `INF_06` — Curl Femoral Sentado o Acostado en Máquina: 120m: 4 × 10-12 | 90m/60m: 3 × 10-12.
  5. `INF_05` + `INF_08` — Biserie Final: Extensión de Cuádriceps + Gemelo Sentado: 3 × 12-15 / 15-20.
- **Abdomen:** `ABS_CIRCUIT_A`.
- **Cardio:** 120m/90m: 10 min Caminadora Inclinada suave | 60m: 0 min.

---

### CLUSTER H-4 — HOMBRE · 4 DÍAS (2 TORSO + 2 PIERNA)
- **Día 1 (Torso A - Fuerza):** `SUP_04` Dominadas (4×6-8) + `SUP_01` Press Inclinado Mancuernas (4×6-8) + `SUP_06_A` Remo T-Bar/Mancuerna (4×8-10) + `SUP_02_A` Fondos en Paralelas (3×8-10) + `SUP_07` Press Arnold (3×8-10) + `ABS_CIRCUIT_A`.
- **Día 2 (Pierna A):** Idéntico al Día 2 de H-5.
- **Día 3 (Torso B - Hipertrofia y Brazos):** `SUP_05` Dominadas Supinas (4×6-8) + `SUP_02_B` Press Plano Mancuernas (4×8-10) + `SUP_06_B` Remo Sentado Polea (3×10-12) + `SUP_08` Elevaciones Laterales 80° (4×15-20) + Superserie Brazos (`SUP_10` Press Francés Barra Z 3×10 + `SUP_12` Curl Barra Z 3×10) + `ABS_CIRCUIT_C`.
- **Día 4 (Pierna B):** Idéntico al Día 5 de H-5.

---

### CLUSTER H-3 — HOMBRE · 3 DÍAS (TORSO / PIERNA / FULL BODY)
- **Día 1 (Torso Completo):** `SUP_01` Press Inclinado (4×6-8) + `SUP_04` Dominadas/Jalón (4×8-10) + `SUP_06_B` Remo Polea (3×8-10) + Biserie Hombro (`SUP_07` Press Hombro + `SUP_08` Elevación Lateral 3×12) + Biserie Brazos (`SUP_10` Press Francés Barra Z + `SUP_12` Curl Barra Z 3×10) + `ABS_CIRCUIT_A`.
- **Día 2 (Pierna Completa):** `INF_01` Sentadilla/Hack (4×6-8) + `INF_04_A` Peso Muerto Rumano (4×8-10) + `INF_02` Hip Thrust (3×8-10) + `INF_03_A` Sentadilla Búlgara (3×10-12) + Biserie (`INF_05` Extensión Cuádriceps + `INF_06` Curl Femoral 3×12-15) + `ABS_CIRCUIT_B`.
- **Día 3 (Full Body Estético):** `INF_01` Prensa 45° (4×10-12) + `SUP_02_B` Press Plano Mancuernas/Fondos (4×8-10) + `SUP_05` Dominadas Supinas/Jalón (4×8-10) + Biserie Pierna (`INF_06` Curl Femoral + `INF_08` Gemelos 3×15) + Biserie Torso (`SUP_08` Elevación Lateral + `SUP_11` Tríceps Cuerda 3×15) + `ABS_CIRCUIT_C`.

---

### ⭐ CLUSTER M-5 — MUJER · 5 DÍAS (3 PIERNA/GLÚTEO + 2 TORSO ESTÉTICO)
*Asignada automáticamente cuando `gender == 'mujer'` y `days_per_week == 5`.*

- **Día 1 (Pierna y Glúteo A - Empuje y Cuádriceps):** `WARMUP_LOWER` -> 1. `INF_02` Hip Thrust Barra/Máquina (4×8-10) | 2. `INF_01` Sentadilla Libre/Hack (4×8-10) | 3. `INF_03_B` Sentadilla Búlgara torso inclinado (4×10-12) | 4. `INF_05` Extensión de Cuádriceps (3×12-15) | 5. `INF_07_A` Abducción de Cadera en Máquina (4×15-20) -> `ABS_CIRCUIT_A` + Caminadora Inclinada.
- **Día 2 (Torso A - Espalda Estética y Hombro):** `WARMUP_UPPER` -> 1. `SUP_04` Jalón al Pecho Polea (4×8-10) | 2. `SUP_06_B` Remo Sentado en Polea (4×10-12) | 3. `SUP_01` Press Inclinado Mancuernas (3×10-12) | 4. `SUP_07` Press de Hombro Mancuernas/Máquina (3×10-12) | 5. `SUP_08` Elevaciones Laterales 80° (4×12-15) -> `ABS_CIRCUIT_B` + Cardio HIIT.
- **Día 3 (Pierna y Glúteo B - Isquios y Estiramiento):** `WARMUP_LOWER` -> 1. `INF_04_A` Peso Muerto Rumano (4×8-10) | 2. `INF_04_B` Prensa 45° Pies Altos (4×10-12) | 3. `INF_03_B` Subida al Cajón Alto (Step-Up) o Zancadas (3×10-12) | 4. `INF_06` Curl Femoral en Máquina (4×12-15) | 5. `INF_08` Elevación de Gemelos (4×15-20) -> `ABS_CIRCUIT_C` + Caminadora Inclinada.
- **Día 4 (Torso B - Brazos Tonificados y Postura):** `WARMUP_UPPER` -> 1. `SUP_05` Jalón Supino o Dominadas Asistidas (4×10-12) | 2. `SUP_06_C` Remo en TRX o Máquina (3×10-12) | 3. `SUP_10` Press Francés Mancuernas/Barra Z (3×10-12) | 4. `SUP_11` Extensión de Tríceps Cuerda (3×12-15) | 5. `SUP_12` Curl de Bíceps Mancuernas/Polea (3×12-15) -> `ABS_CIRCUIT_D` + Cardio HIIT.
- **Día 5 (Pierna y Glúteo C - Bombeo Glúteo 10/10):** `WARMUP_LOWER` -> 1. `INF_02` Hip Thrust con Pausa 2s (4×10-12) | 2. `INF_04_B` Peso Muerto Sumo (4×8-10) | 3. `INF_03_B` Sentadilla Búlgara o Goblet Profunda (3×10-12) | 4. `INF_07_B` Patada de Glúteo en Polea/Máquina (4×12-15) | 5. `INF_07_A` Abducción en Máquina inclinada adelante (4×20) -> `ABS_CIRCUIT_A` + Caminadora Inclinada.

---

### CLUSTER M-4 — MUJER · 4 DÍAS (2 PIERNA/GLÚTEO + 2 TORSO)
- **Día 1 (Pierna/Glúteo A):** Idéntico al Día 1 de M-5.
- **Día 2 (Torso A):** Idéntico al Día 2 de M-5.
- **Día 3 (Pierna/Glúteo B):** 1. `INF_04_A` Peso Muerto Rumano (4×8-10) | 2. `INF_02` Hip Thrust (4×10-12) | 3. `INF_04_B` Peso Muerto Sumo o Prensa Pies Altos (3×10-12) | 4. `INF_06` Curl Femoral (4×12-15) | 5. Biserie Glúteo (`INF_07_B` Patada en Polea + `INF_07_A` Abducción en Máquina 3×15) + `ABS_CIRCUIT_C`.
- **Día 4 (Torso B):** Idéntico al Día 4 de M-5.

---

### CLUSTER M-3 — MUJER · 3 DÍAS (2 PIERNA/GLÚTEO + 1 TORSO COMPLETO)
- **Día 1 (Pierna/Glúteo A):** Idéntico al Día 1 de M-5.
- **Día 2 (Torso Completo Estético):** 1. `SUP_04` Jalón al Pecho (4×10-12) | 2. `SUP_06_B` Remo Sentado Polea (3×10-12) | 3. `SUP_01` Press Inclinado Mancuernas (3×10-12) | 4. `SUP_08` Elevaciones Laterales 80° (3×12-15) | 5. Biserie Brazos (`SUP_11` Tríceps Cuerda + `SUP_12` Curl Bíceps 3×12-15) + `ABS_CIRCUIT_B`.
- **Día 3 (Pierna/Glúteo B):** Idéntico al Día 3 de M-4.

---

## 7. SEED DE BASE DE DATOS: USUARIO DE PRUEBA (LOGIN DEL FUNDADOR)

```json
{
  "user_id": "founder-danniel-001",
  "email": "danniel@arkafitness.ai",
  "name": "Danniel",
  "role": "ADMIN_FOUNDER",
  "onboarding_completed": true,
  "quiz_profile": {
    "gender": "hombre",
    "goal": "ganar_masa_y_marcar",
    "days_per_week": 5,
    "session_duration_min": 120,
    "experience_level": "intermedio_avanzado",
    "joint_alerts": ["manguito_rotador_preventivo"]
  },
  "assigned_plan": {
    "cluster_id": "H-5",
    "time_mode": "120_MIN",
    "favorite_overrides": {
      "SUP_10": "Press Francés Acostado con Barra Z"
    },
    "naiu_stack": ["maca-negra-naiu", "maca-roja-naiu"]
  }
}
```
