# Plan Maestro de Ejecución — ARKA Fitness AI (FORJA)

**Versión:** 1.0 (MVP)  
**Arquitectura:** Motor Determinista en Código + Agente IA OpenRouter + Nutrición NAIU + PWA Mobile  
**Estado:** En progreso — Rama `forja-trabajo`

---

## Resumen Ejecutivo de Arquitectura

1. **El Motor de Rutinas es 100% Determinista (Zero-AI Hallucination):** La IA **no** inventa series, repeticiones ni ejercicios. Una función pura cruza `gender` + `days` + `duration` + `joint_alerts` y entrega uno de los 6 Clusters oficiales (`H-3, H-4, H-5, M-3, M-4, M-5`) con modulador de tiempo (`60m, 90m, 120m`).
2. **El Agente IA vive en el Servidor (`/api/agent/*`):** Modelo `qwen2.5-vl-72b-instruct:free` vía OpenRouter. Se encarga de responder dudas, explicar técnica por `slot_id`, calcular macros (Mifflin-St Jeor), recomendar superalimentos exclusivos de NAIU y analizar fotos de platos/máquinas con **política estricta anti-desnudez**.
3. **Distribución:** PWA móvil en Next.js App Router (Vercel) + Base de datos y control de acceso (Supabase) + Microservicios de IA (Edge / VPS).

---

## Checklist de Ejecución por Fases

### Fase 1: Motor Determinista & Catálogo Maestro en Código
*Objetivo: Integrar los 6 Clusters oficiales, el modulador de 60/90/120 min, reglas biomecánicas y el diccionario de slots.*

- [x] **1.1 Documentación base guardada en `/docs/context/`:**
  - [x] `00_ROUTINES_AND_EXERCISES.md` (Catálogo de clusters, slots y reglas biomecánicas).
  - [x] `01_AGENT_OPENROUTER_AND_PRIVACY.md` (Arquitectura del agente, OpenRouter y privacidad).
  - [x] `02_NAIU_NUTRITION_ENGINE.md` (Mifflin-St Jeor y reglas comerciales NAIU).
  - [x] `03_QUIZ_AND_DECISION_TREE.md` (Lógica del Quiz de 7 pasos).
- [ ] **1.2 Modelo de Datos y Tipos (`src/data/types.ts`):**
  - [ ] Añadir campos `gender: 'hombre' | 'mujer'`.
  - [ ] Ajustar `days: 3 | 4 | 5` (restringir a las opciones científicas oficiales).
  - [ ] Añadir `session_duration_min: 60 | 90 | 120`.
  - [ ] Definir tipo `SlotId` (`SUP_01` a `SUP_13`, `INF_01` a `INF_08`).
  - [ ] Definir tipo `EffortType`: `'RIR_1_2' | 'TECHNICAL_FAILURE' | 'PROTECTED_RIR_1'`.
- [ ] **1.3 Diccionario de Slots y Variantes (`src/data/slots.ts`):**
  - [ ] Estructurar mapeo de `slot_id` con `default`, `machine_alt` y `free_alt`.
  - [ ] Reglas de reemplazo automático (ej. `hombro` reemplaza Fondos por Press de Pecho Sentado).
- [ ] **1.4 Catálogo Completo de Ejercicios y GIFs (`src/data/exercises.ts` + `exerciseMediaManifest.ts`):**
  - [ ] Completar los ejercicios faltantes del catálogo oficial (ej. Press Francés con Barra Z, Wall Slides, Face Pulls, Dragon Flags, etc.).
  - [ ] Mapear sus demostraciones con `ExerciseGymGifsDB` vía jsDelivr.
- [ ] **1.5 Bloques Fijos y Circuitos de Abdomen (`src/data/routines.ts`):**
  - [ ] Protocolos de calentamiento: `WARMUP_UPPER` (con 3×20 Face Pulls obligatorios) y `WARMUP_LOWER`.
  - [ ] Circuitos de abdomen: `ABS_CIRCUIT_A`, `ABS_CIRCUIT_B`, `ABS_CIRCUIT_C`, `ABS_CIRCUIT_D` (45s trabajo / 15s pausa).
- [ ] **1.6 Implementación de los 6 Clusters Oficiales (`src/data/routines.ts`):**
  - [ ] Clusters Hombres: `H-5` (Rutina Oficial Fundador 3 Torso + 2 Pierna), `H-4`, `H-3`.
  - [ ] Clusters Mujeres: `M-5` (3 Pierna/Glúteo + 2 Torso Estético), `M-4`, `M-3`.
  - [ ] Algoritmo modulador de tiempo (`60_MIN`, `90_MIN`, `120_MIN`).
- [ ] **1.7 Actualización del Onboarding Quiz (`src/components/sections/QuizFlow.tsx`):**
  - [ ] Paso 1: Género (hombre / mujer).
  - [ ] Paso 2: Objetivo (ganar masa, marcar/tonificar, bajar peso + banner educativo).
  - [ ] Paso 3: Días (3, 4, 5).
  - [ ] Paso 4: Tiempo (60m, 90m, 120m).
  - [ ] Paso 5: Nivel (principiante máx 4, intermedio máx 5, avanzado 5-6).
  - [ ] Paso 6: Alertas articulares (hombros, rodillas, codos, espalda baja).
  - [ ] Paso 7: Datos nutricionales (edad, peso, estatura, energía).
- [ ] **1.8 Semilla del Fundador (`src/data/seed.ts`):**
  - [ ] Actualizar a `founder-danniel-001`, `H-5`, `120_MIN`, 5 días.
- [ ] **1.9 Botón de Sustitución por `slot_id` en Sesión (`SessionView.tsx`):**
  - [ ] Desplegar únicamente las 3 variantes del `slot_id` correspondiente al pulsar "Sustituir".

---

### Fase 2: Motor Nutricional & Recomendación Comercial NAIU
*Objetivo: Integrar el cálculo de macros en código y los disparadores de venta exclusiva de NAIU.*

- [ ] **2.1 Motor de Macronutrientes (`src/lib/nutritionEngine.ts`):**
  - [ ] Fórmulas Mifflin-St Jeor para TMB según género, peso, estatura y edad.
  - [ ] Modulador por días de entreno (1.45, 1.55, 1.65).
  - [ ] Modulador por objetivo (-20% déficit, 0% recomposición, +15% volumen limpio).
  - [ ] Capa de alimentos de plaza colombiana (huevos, pechuga, carne magra, papa pastusa/criolla, arroz, aguacate, plátano).
- [ ] **2.2 Motor de Recomendación NAIU (`src/lib/naiuRecommendations.ts`):**
  - [ ] Disparador Maca Negra: Hombres/Mujeres fuerza pesada / pre-entreno.
  - [ ] Disparador Maca Roja: Mujeres glúteo, balance hormonal y recuperación.
  - [ ] Disparador Maca Amarilla: Principiantes, estrés o fatiga.
- [ ] **2.3 Componente UI Tarjeta NAIU (`src/components/nutrition/NaiuCard.tsx`):**
  - [ ] Tarjeta estética con dosificación, beneficio directo y botón de compra hacia `naiu.bio`.
  - [ ] Integración en `/hoy` y `/perfil`.

---

### Fase 3: Agente de IA, Visión y Privacidad
*Objetivo: Conectar el Chatbot con OpenRouter bajo políticas estrictas de privacidad.*

- [ ] **3.1 Route Handler de Chat (`src/app/api/agent/chat/route.ts`):**
  - [ ] Conexión a OpenRouter (`qwen/qwen2.5-vl-72b-instruct:free`).
  - [ ] System Prompt oficial inquebrantable (cuidado articular, nutrición colombiana, exclusividad NAIU).
  - [ ] Streaming de respuestas con `ReadableStream`.
- [ ] **3.2 Route Handler de Visión Segura (`src/app/api/agent/vision/route.ts`):**
  - [ ] Filtro estricto anti-desnudez / fotos corporales.
  - [ ] Procesamiento efímero en memoria (sin almacenar fotos en buckets).
  - [ ] Clasificación exclusiva de platos de comida, etiquetas y máquinas de gym.
- [ ] **3.3 Interfaz del Chatbot en la App (`src/components/sections/CoachScreen.tsx`):**
  - [ ] Integración con el endpoint real de streaming.
  - [ ] Soporte para adjuntar foto de plato o máquina.

---

### Fase 4: Pulido Visual, Accesibilidad y QA (Arnés ARKA)
*Objetivo: Elevar la interfaz a estándar cinematográfico premium y certificar WCAG 2.2 AA.*

- [ ] **4.1 Auditoría Determinista con Impeccable:**
  - [ ] Ejecutar `npx -y impeccable detect app/ components/`.
  - [ ] Corregir áreas táctiles menores a 44px, jerarquías y contrastes.
- [ ] **4.2 Pulido Mobile-First a 390px (`/impeccable polish`):**
  - [ ] Asegurar visualización impecable en pantallas estrechas (iPhone 13-16 / Pixel).
  - [ ] Transición fluida entre ejercicios y animación de descanso.
- [ ] **4.3 Pantalla de Finalización de Sesión:**
  - [ ] Resumen de entreno al completar la última serie (tiempo total, series realizadas, поздравления).
- [ ] **4.4 Certificación de Accesibilidad (`/arka-wcag22`):**
  - [ ] Foco de teclado visible en todos los botones y cronómetros.
  - [ ] `aria-live` en el timer de descanso para lectores de pantalla.
  - [ ] Contrastes de texto y etiquetas legibles en modo oscuro.

---

### Fase 5: Despliegue Provisional en Vercel & Control de Acceso
*Objetivo: Publicar la app con subdominio propio gratuito y bloquear el acceso para que no sea pública.*

- [ ] **5.1 Configuración de Proyecto en Vercel:**
  - [ ] Proyecto bajo el nombre `forja` (URL tipo `forja-app.vercel.app`).
  - [ ] Variables de entorno configuradas (`OPENROUTER_API_KEY`, etc.).
- [ ] **5.2 Base de Datos Supabase (PostgreSQL):**
  - [ ] Esquema de tablas: `profiles`, `workout_plans`, `workout_history`, `authorized_users`.
  - [ ] Row Level Security (RLS) activo para aislar los datos de cada alumno.
- [ ] **5.3 Control de Acceso / Gatekeeper:**
  - [ ] Bloqueo de registro público: solo usuarios con invitación o dados de alta por Danniel pueden acceder a la app.
  - [ ] Pantalla de bienvenida con solicitud de membresía para usuarios no autorizados.

---

### Fase 6: Cierre Comercial y SEO
*Objetivo: Dejar el producto listo para comercializar con gimnasios y clientes NAIU.*

- [ ] **6.1 Paquete SEO y Metadatos (`/arka-seo`):**
  - [ ] OpenGraph, Twitter Cards, JSON-LD de aplicación deportiva.
  - [ ] `robots.txt` y `sitemap.xml`.
- [ ] **6.2 Preparación para Modelo SaaS / Marca Blanca:**
  - [ ] Parámetros de personalización de marca por gimnasio (logo y colores institucionales).
- [ ] **6.3 Dominio Comercial Definitivo:**
  - [ ] Conectar dominio final (`forja.co` o similar) al cerrar el primer acuerdo comercial.
