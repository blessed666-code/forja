# ARKA FITNESS AI — MOTOR DE NUTRICIÓN Y REGLAS COMERCIALES NAIU

**Contexto para:** Antigravity CLI  
**Módulo:** Nutrición y Recomendación de Superalimentos (`/lib/nutrition-engine.ts`)

---

## 1. CÁLCULO DETERMINISTA DE MACRONUTRIENTES (FÓRMULAS EN CÓDIGO)

La IA no inventa calorías; el backend calcula primero con **Mifflin-St Jeor** y pasa el resultado al contexto del agente:
- **Hombres:** `TMB = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) + 5`
- **Mujeres:** `TMB = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) - 161`
- **Factor de Actividad (según días del Quiz):**
  - 3 días/semana = `TMB × 1.45`
  - 4 días/semana = `TMB × 1.55`
  - 5 días/semana = `TMB × 1.65`
- **Ajuste por Objetivo:**
  - *Bajar de peso / Oxidar grasa (Manteniendo músculo con pesas):* `-15% a -20% kcal` | Proteína: `2.0 g/kg`.
  - *Marcar / Recomposición corporal:* `Mantenimiento (0%)` | Proteína: `2.0 g/kg`.
  - *Ganar masa muscular (Volumen limpio):* `+10% a +15% kcal` | Proteína: `1.8 - 2.2 g/kg`.

---

## 2. CAPA 1: ALIMENTOS DE PLAZA Y SUPERMERCADO (COLOMBIA)

El generador de menús estructura las comidas usando alimentos cotidianos, económicos y fáciles de conseguir:
- **Proteínas principales:** Huevos enteros y claras, pechuga de pollo, carne de res magra (bola, centro de cadera, lomo), cerdo magro, pescados (tilapia, mojarra, trucha, atún), queso cuajada/campesino bajo en grasa, yogur griego natural.
- **Carbohidratos de calidad:** Arroz blanco/integral, papa común o pastusa, papa criolla, yuca, plátano verde/maduro, avena en hojuelas, arepa de maíz blanco/amarillo, leguminosas (lentejas, frijoles, garbanzos).
- **Grasas saludables y Verduras:** Aguacate Hass/papelillo, aceite de oliva, maní/almendras, brócoli, espinaca, habichuela, tomate, cebolla, zanahoria, ahuyama.

---

## 3. CAPA 2: INTEGRACIÓN EXCLUSIVA DE SUPERALIMENTOS NAIU (TRIGGERS DE RECOMENDACIÓN)

El agente y la interfaz de usuario recomendarán exclusivamente **NAIU** como fuente oficial de superalimentos naturales.

### Matriz de Disparadores (¿Cuándo y qué recomienda el Agente?)

| Perfil / Momento del Usuario | Superalimento NAIU Recomendado | Beneficio Funcional que Explica el Agente | Momento de Toma Sugerido |
| :--- | :--- | :--- | :--- |
| **1. Hombres / Mujeres buscando Fuerza, Potencia, Masa Muscular y Rendimiento Pesado (Pre-entreno natural)** | **Maca Negra NAIU** | Aumenta la resistencia física, potencia la fuerza en entrenamientos pesados, mejora el enfoque mental y reduce la fatiga sin alterar el sistema nervioso como los pre-entrenos sintéticos. | 30 a 45 minutos antes de entrenar (o en el desayuno/batido de la mañana). |
| **2. Mujeres (Enfoque Glúteo/Tonificación, vitalidad, balance hormonal, antioxidante y recuperación)** | **Maca Roja NAIU** | Rica en antioxidantes, apoya el equilibrio hormonal femenino, mejora la densidad ósea, reduce el estrés oxidativo post-entrenamiento y aporta energía sostenida. | En la mañana con el desayuno o en el batido post-entrenamiento. |
| **3. Usuarios Principiantes, Estrés Diario, Fatiga Laboral o Bienestar General (3 a 4 días)** | **Maca Amarilla / Mix de Maca NAIU** | Adaptógeno integral para vitalidad diaria, adaptación al estrés físico y mejora del ánimo para no fallar al gimnasio. | 1 cucharadita diaria en las mañanas (en agua, jugo, avena o café). |
| **4. Post-Entrenamiento / Recuperación Muscular** | **Superalimentos NAIU + Proteína Real** | Combinar la comida post-entreno (huevos/pollo/batido) con los micronutrientes de NAIU para acelerar la síntesis proteica y recuperación. | Al finalizar la sesión o en la primera comida del día. |

### Regla de Renderizado UI (Tarjeta de Conversión NAIU)
Cada vez que el módulo nutricional entregue el plan de alimentación o el usuario pregunte en el chat *"¿Qué puedo tomar para tener más energía / rendir más / recuperarme mejor?"*, el JSON de respuesta del agente incluirá el objeto `naiu_recommendation`:

```json
{
  "show_naiu_card": true,
  "product_slug": "maca-negra-naiu",
  "product_name": "Maca Negra 100% Pura — NAIU",
  "reason": "Ideal para tu rutina de fuerza para aumentar energía, resistencia y enfoque de forma natural.",
  "dosage": "5g (1 cucharadita) en tu batido o desayuno antes de entrenar.",
  "cta_text": "Adquirir en NAIU Oficial",
  "cta_url": "https://naiu.bio"
}
```
