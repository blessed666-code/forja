# PRODUCT — ARKA FITNESS AI (FORJA)

## 1. Misión del Producto
FORJA es una aplicación web progresiva (PWA) de entrenamiento determinista y coaching inteligente diseñada para usuarios de gimnasio en Colombia, clientes de superalimentos NAIU y gimnasios comerciales bajo modelo SaaS / marca blanca.

## 2. Pilares Fundamentales

### 2.1 Asignación 100% Determinista (Zero AI Hallucination)
- La IA **nunca** inventa ni prescribe rutinas iniciales al azar.
- Un motor en TypeScript cruza 4 variables (`gender`, `days_per_week` [3, 4, 5], `session_duration_min` [60, 90, 120] y `joint_alerts`) y asigna uno de los 6 Clusters Oficiales (`H-3`, `H-4`, `H-5`, `M-3`, `M-4`, `M-5`).
- El Cluster `H-5` en Modo 120 Minutos es la Rutina Oficial del Fundador Danniel Mena.

### 2.2 Diccionario de Slots Biomecánicos
- 26 slots biomecánicos (`SUP_01` a `SUP_13`, `INF_01` a `INF_08`).
- Cada slot cuenta con opción estándar (`default`), máquina/polea (`machine_alt`) y libre/calistenia (`free_alt`).
- Si una máquina está ocupada, el usuario pulsa "Sustituir" y la app ofrece la alternativa biomecánica exacta sin alterar el estímulo.

### 2.3 Seguridad Articular Preventiva
- Prohibición estricta de ejercicios de alto riesgo (press tras nuca, jalón tras nuca).
- Elevaciones laterales con tope a 80° en plano escapular.
- Face Pulls en polea alta con cuerda obligatorios en calentamiento de torso.
- Reemplazo automático de Fondos por Press en Máquina si hay alerta en hombros/manguito rotador.

### 2.4 Nutrición Real & Alianza Exclusiva NAIU
- Fórmulas de Mifflin-St Jeor para calorías y macronutrientes (proteína 2.0 g/kg).
- Alimentos de plaza y supermercado colombiano.
- Recomendación comercial exclusiva de superalimentos NAIU (Maca Negra para fuerza/pre-entreno en hombres, Maca Roja para glúteo/balance hormonal en mujeres, Maca Amarilla para fatiga/adaptógeno).

### 2.5 Coach IA con Privacidad Estricta (Zero Nudity)
- Servidor Serverless (`/api/agent/chat` y `/api/agent/vision`) con modelo `qwen2.5-vl-72b-instruct:free` vía OpenRouter.
- Bloqueo total de fotos corporales y selfies. Solo se permite análisis visual de platos de comida, etiquetas de mercado o máquinas de gimnasio.

## 3. Público Objetivo
1. **Usuarios de Gimnasio:** Rutinas estructuradas, timer de descanso automático y registro de series.
2. **Clientes NAIU:** Acompañamiento funcional para potenciar sus hábitos y consumo de superalimentos.
3. **Gimnasios B2B:** Plataforma escalable para fidelizar socios bajo suscripción o marca personalizada.
