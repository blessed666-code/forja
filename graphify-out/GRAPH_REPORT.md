# Graph Report - forja  (2026-10-21)

## Corpus Check
- 119 files · ~126,933 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 738 nodes · 928 edges · 54 communities (46 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df882219`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 16 edges
3. `cn()` - 12 edges
4. `Prompt v0 — FORJA` - 12 edges
5. `usePlan()` - 10 edges
6. `selectNaiuSuperfood()` - 9 edges
7. `Critique: src/components/session/SessionView.tsx` - 9 edges
8. `Diagnóstico — FORJA` - 9 edges
9. `FORJA — Rutinas, catálogo y fotos de referencia` - 9 edges
10. `usePlan()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `HoyPage()` --calls--> `getHoyContent()`  [EXTRACTED]
  src/app/(app)/hoy/page.tsx → src/lib/hoy.ts
- `HoyScreen()` --calls--> `useMotionLevel()`  [EXTRACTED]
  src/components/sections/HoyScreen.tsx → src/components/motion/useMotionLevel.ts
- `PerfilScreen()` --calls--> `usePlan()`  [EXTRACTED]
  src/components/sections/PerfilScreen.tsx → src/lib/usePlan.ts
- `matchRoutineCluster()` --calls--> `resolveClusterId()`  [EXTRACTED]
  src/lib/routineMatcher.ts → src/data/clusters.ts
- `buildPlan()` --calls--> `resolveClusterId()`  [INFERRED]
  src/data/routines.ts → src/data/clusters.ts

## Import Cycles
- None detected.

## Communities (54 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (12): Accesibilidad, Arranque, Coach, Fuera de este corte, Identidad, Listo cuando, NAIU, Prompt v0 — FORJA (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (11): 1. Negocio, 2. Qué se rehízo, 3. Sesión 3D, 4. Coach interno, 5. Dónde vive, 6. Precio estimado del coach, 7. Corte de hoy, 8. Después (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): 1. Lo que entendimos de tu negocio, 2. Nuestra recomendación, 3. Por qué este combo, 4. Inversión total estimada, 5. Forma de pago, 6. Próximo paso, Atención por WhatsApp, El coach dentro de la app (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (9): Caso A, Caso B, Checklist orientativo, Común, Datos que faltan, Derivación del Caso, Objetivo de negocio, Plan SEO — FORJA (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (5): Cómo seguir, Después de este corte, FORJA, Precios de referencia, Qué cambió el 27 de septiembre de 2026

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (4): Muestra (costo de infraestructura), Producto, Resumen comercial — FORJA, Si un gym la contrata

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (33): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next, react (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (29): AppLayoutProps, RootLayoutProps, AppShell(), AppShellProps, BottomNav(), ITEMS, MotionLink, NavItem (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (26): dependencies, framer-motion, gsap, lenis, lucide-react, next, react, react-dom (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (19): metadata, NaiuRecommendation, metadata, SesionPageProps, cn(), firstName(), useNextSession(), usePlan() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (13): Biblioteca, Coach, Fase siguiente, Hoy, Mapa, Perfil, Por pantalla, Puerta de movimiento (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): 1. Misión del Producto, 2.1 Asignación 100% Determinista (Zero AI Hallucination), 2.2 Diccionario de Slots Biomecánicos, 2.3 Seguridad Articular Preventiva, 2.4 Nutrición Real & Alianza Exclusiva NAIU, 2.5 Coach IA con Privacidad Estricta (Zero Nudity), 2. Pilares Fundamentales, 3. Público Objetivo (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (28): CoachChat(), Message, SUGGESTIONS, FilterChip(), LibraryView(), ProfileView(), Choice, CHOICES (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (21): AuthGuard(), BottomNav(), ITEMS, LoginView(), login(), logout(), useAuth(), useHydrated() (+13 more)

### Community 17 - "Community 17"
Cohesion: 0.09
Nodes (21): EffortType, Care, CARE_LABEL, Days, Equipment, EQUIPMENT_LABEL, Exercise, Gear (+13 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (20): Care, CARE_LABEL, Days, Equipment, EQUIPMENT_LABEL, Exercise, Gear, Goal (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (8): BASES, LIE, PRONE, UPRIGHT, Vec3, ZERO, Zone, ZONES

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (11): metadata, exerciseGifUrl(), exercisePhoto(), GIF_BY_ID, EXERCISE_MEDIA_SOURCES, ExerciseMediaSource, BibliotecaScreen(), ExercisePhoto() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (11): BIOMECHANICAL_SLOTS, getSlotExerciseId(), BiomechanicalSlot, ALLOWED_EQUIPMENT, Plan, PlanSession, REST_WORDS, SPLITS (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (14): SEED_PROFILE, addHistory(), cache, emit(), ensureSeed(), KEYS, listeners, NO_HISTORY (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (8): ALLOWED_EQUIPMENT, Plan, PlanSession, REST_WORDS, SPLITS, TemplateId, TEMPLATES, WEEKDAY_LABEL

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (7): classifyMessage(), CoachContext, CoachReply, CoachRole, getCoachReply(), RULES, SCRIPTS

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): classifyMessage(), CoachContext, CoachReply, CoachRole, getCoachReply(), RULES, SCRIPTS

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (6): BAR_BACK, Base, Joints, PoseDef, POSES, SEAT

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (5): bigShoulders, figtree, metadata, plexMono, viewport

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (6): BAR_BACK, Base, Joints, PoseDef, POSES, SEAT

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (9): Añadir un ejercicio con GIF, Ejemplo completo: día «Torso A», Flujo en la app, FORJA — Rutinas, catálogo y fotos de referencia, GIFs animados (ExerciseGymGifsDB), Probar otra rutina rápido, Rutas útiles en desarrollo, Siguiente paso (cuando quieras backend) (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (7): ABS_EXERCISES, ALL_EXERCISES_MAP, BASE_EXERCISES, WARMUP_EXERCISES, MASTER_EXERCISES, EXERCISES, TrxRow

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (17): HoyPage(), metadata, firstName(), getHoyContent(), HoyContent, enterContainer, enterItem, HoyLive() (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (3): EXERCISE_MAP, EXERCISES, TrxRow

### Community 43 - "Community 43"
Cohesion: 0.08
Nodes (25): 1.1 ¿Quién asigna la rutina? (El Motor Determinista), 1.2 ¿Dónde actúa el Agente de IA (`qwen2.5-vl-72b-instruct:free`)?, 1. ARQUITECTURA DE DECISIÓN: CÓDIGO DETERMINISTA VS. AGENTE IA, 2. ALGORITMO DE TIEMPO: ¿CÓMO REPARTE LA SESIÓN LA APP SEGÚN LA DURACIÓN?, 3. REGLAS BIOMECÁNICAS Y DE SEGURIDAD (HARDCODED EN UI/BACKEND), 4.1 Protocolos de Calentamiento y Blindaje (10 Minutos), 4.2 Circuitos Oficiales de Abdomen (Formato 45s trabajo / 15s transición / 60s descanso entre vueltas), 4. BLOQUES FIJOS: CALENTAMIENTOS Y CIRCUITOS DE ABDOMEN (+17 more)

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (11): POST(), Gender, calculateMacros(), MacroCalculationInput, MacroCalculationResult, selectNaiuSuperfood(), matchRoutineCluster(), metadata (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (10): 1. COMPORTAMIENTO Y REGLAS DEL QUIZ DE ENTRADA, 2. FUNCIÓN DETERMINISTA DE ASIGNACIÓN (`matchRoutineCluster`), ARKA FITNESS AI — LÓGICA DEL QUIZ Y ÁRBOL DE DECISIÓN DE RUTINAS, Paso 1: Género / Enfoque Anatómico, Paso 2: Objetivo Principal (Educación Integrada), Paso 3: Días Disponibles por Semana (Restricción Estricta), Paso 4: Tiempo Disponible por Sesión, Paso 5: Nivel de Experiencia (Tope de Ejercicios de Fuerza) (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.27
Nodes (9): ClusterSessionDef, ABS_CIRCUITS, AbsCircuit, WARMUP_LOWER, WARMUP_UPPER, WarmupProtocol, AbsCircuitId, SlotId (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.20
Nodes (9): Checklist de Ejecución por Fases, Fase 1: Motor Determinista & Catálogo Maestro en Código, Fase 2: Motor Nutricional & Recomendación Comercial NAIU, Fase 3: Agente de IA, Visión y Privacidad, Fase 4: Pulido Visual, Accesibilidad y QA (Arnés ARKA), Fase 5: Despliegue Provisional en Vercel & Control de Acceso, Fase 6: Cierre Comercial y SEO, Plan Maestro de Ejecución — ARKA Fitness AI (FORJA) (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (6): 1. CÁLCULO DETERMINISTA DE MACRONUTRIENTES (FÓRMULAS EN CÓDIGO), 2. CAPA 1: ALIMENTOS DE PLAZA Y SUPERMERCADO (COLOMBIA), 3. CAPA 2: INTEGRACIÓN EXCLUSIVA DE SUPERALIMENTOS NAIU (TRIGGERS DE RECOMENDACIÓN), ARKA FITNESS AI — MOTOR DE NUTRICIÓN Y REGLAS COMERCIALES NAIU, Matriz de Disparadores (¿Cuándo y qué recomienda el Agente?), Regla de Renderizado UI (Tarjeta de Conversión NAIU)

### Community 49 - "Community 49"
Cohesion: 0.27
Nodes (11): resolveClusterId(), resolveTimeMode(), ROUTINE_CLUSTERS, RoutineClusterDef, TIME_MODULATIONS, JointAlert, RoutineClusterId, TimeMode (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (6): 1. Modo de Diseño, 2. Paleta de Color (Modo Oscuro Obsidiana de Alto Contraste), 3. Tipografía, 4. Superficies del Navegador (Craft Floor), 5. Accesibilidad (WCAG 2.2 Nivel AA), DESIGN — ARKA FITNESS AI (FORJA)

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (4): 1. INFRAESTRUCTURA Y DESPLIEGUE DEL AGENTE, 2. POLÍTICA ESTRICTA DE PRIVACIDAD E IMÁGENES (ZERO NUDITY / SAFE VISION), 3. ROLES UNIFICADOS DEL AGENTE (SYSTEM PROMPT MODULAR), ARKA FITNESS AI — ARQUITECTURA DEL AGENTE IA, VISIÓN Y PRIVACIDAD

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (9): Critique: src/components/session/SessionView.tsx, Design Health Score, Design Specificity Verdict, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+1 more)

## Knowledge Gaps
- **389 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PauseMotionButton()` connect `Community 8` to `Community 10`, `Community 44`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `JointAlert` connect `Community 49` to `Community 25`, `Community 44`, `Community 17`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `SEED_PROFILE` connect `Community 26` to `Community 35`, `Community 44`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 8` be split into smaller, more focused modules?**
  _Cohesion score 0.061979648473635525 - nodes in this community are weakly interconnected._
- **Should `Community 9` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._