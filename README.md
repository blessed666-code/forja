# FORJA · ARKA Fitness AI

> **Progressive Web App (PWA) de Entrenamiento Determinista, Biomecánica Rigurosa y Nutrición Funcional.**  
> *Desarrollado por ARKA para salas de musculación, atletas exigentes y aliado oficial de superalimentos NAIU.*

![Next.js 16](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![WCAG 2.2 AA](https://img.shields.io/badge/WCAG%202.2-Nivel%20AA-success)
![PWA](https://img.shields.io/badge/PWA-Mobile--First-brightgreen)
![License](https://img.shields.io/badge/License-Copyright%20ARKA-lightgrey)

---

## ⚡ Visión del Producto

**FORJA** resuelve el fallo principal de las aplicaciones de fitness modernas: **la alucinación y la improvisación de las rutinas**. 

En lugar de delegar la prescripción de ejercicios a un modelo generativo que invente repeticiones o biomecánicas lesivas, FORJA opera sobre un **Motor Determinista de Asignación por Código (Zero-AI Hallucination)** respaldado por principios de hipertrofia seria, protección articular preventiva y cálculo metabólico clínico.

---

## 🏛️ Pilares de Ingeniería

### 1. Asignación Determinista de Rutinas
El sistema cruza 4 variables del atleta mediante una función pura en TypeScript:
- **Enfoque Anatómico:** Hombre (Torso en V, hombros 3D, espalda y pierna) o Mujer (Glúteos en 3 planos, cadera, pierna estética y torso funcional).
- **Frecuencia Semanal:** 3, 4 o 5 días por semana.
- **Modulador de Tiempo Real:** 60, 90 o 120 minutos por sesión (modula volumen de series efectivas, pausas de descanso y circuitos de core).
- **Filtro de Blindaje Articular:** Alertas preventivas en hombro, rodilla, codo o zona lumbar que reemplazan automáticamente ejercicios de riesgo por variantes guiadas.

### 2. Diccionario de 26 Slots Biomecánicos con Sustitución en Vivo
Cada ejercicio pertenece a un vector de fuerza específico (`SUP_01` a `SUP_13`, `INF_01` a `INF_08`). Si una máquina o polea está ocupada en el gimnasio, el atleta presiona **"Sustituir"** y el sistema le ofrece la variante biomecánica exacta (**Mismo Slot**) sin alterar el estímulo neuromuscular.

### 3. Nutrición Clínica & Alianza Oficial NAIU
- **Metabolismo Basal (TMB/TDEE):** Fórmulas clínicas de **Mifflin-St Jeor** con factor de actividad ajustado por días de entreno.
- **Macronutrientes:** Ratio óptimo de proteína a **2.0 g/kg**, grasas funcionales y carbohidratos de energía limpia.
- **Superalimentos Funcionales NAIU:** Recomendación contextual exclusiva del catálogo real de NAIU Vital (`naiu.bio`): Maca Peruana Negra para fuerza y pre-entreno, Maca Roja Peruana para balance hormonal y glúteo, Camu Camu para síntesis de colágeno articular y cortisol, Chontaduro en Polvo para energía sostenida, y Café / Cacao orgánico de la Sierra Nevada.

### 4. Accesibilidad Web Obligatoria (WCAG 2.2 Nivel AA)
- **Targets Táctiles:** Botonera ergonómica en zona del pulgar con altura mínima de **56px** (`h-14`), superando el mínimo de 44px.
- **Contraste Extremo:** Modo oscuro obsidiana (`#0C0F0E`) con contraste de **17.5:1** en texto y **14.8:1** en botones primarios lima neón (`#D6FF3F`).
- **Alerta Sensorial Háptica:** Temporizador de descanso con vibración (`navigator.vibrate`) para avisar en salas ruidosas.
- **Resiliencia en Sesión:** Diálogo de confirmación ante pulsaciones accidentales (`Exit Guard`) y botón de **Deshacer Serie** (`undoSet`).
- **Navegación Asistida:** Soporte para lectores de pantalla con etiquetas ARIA descriptivas, regiones activas (`aria-live="polite"`) y skip link directo `#contenido`.

### 5. Coach Asistente con Filtro de Privacidad Estricto
- Asistente de técnica y hábitos integrado con modelo multimodal.
- **Filtro Cero Desnudez / Privacidad:** Bloquea de raíz fotos corporales o selfies. Solo procesa imágenes de platos de comida, tablas nutricionales o máquinas de gimnasio.
- **Fallback Determinista:** Si la conexión a la API se interrumpe, el motor local responde con total solvencia técnica.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Microinteracciones:** [Framer Motion](https://www.framer.com/motion/) con soporte de `prefers-reduced-motion`
- **PWA:** Service Worker con registro de manifest web y soporte offline
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Visuales de Ejercicios:** Biblioteca biomecánica servida vía CDN optimizado

---

## 🚀 Puesta en Marcha Local

```bash
# Clonar el repositorio
git clone https://github.com/blessed666-code/forja.git
cd forja

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador (o emula vista móvil de 390px en DevTools).

---

## 📄 Licencia y Derechos

Copyright © 2026 **Danniel Mena · ARKA**. Todos los derechos reservados.  
Diseñado como producto digital de alto rendimiento para gimnasios comerciales y clientes de superalimentos NAIU. Prohibida su reproducción comercial no autorizada.
