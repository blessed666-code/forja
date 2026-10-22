# DESIGN — ARKA FITNESS AI (FORJA)

## 1. Modo de Diseño
**Operate (PWA Móvil para Gimnasio)**  
La interfaz está optimizada para su uso en una sala de pesas con una sola mano, bajo iluminación variable de gimnasio y con tiempos de descanso cronometrados.

## 2. Paleta de Color (Modo Oscuro Obsidiana de Alto Contraste)
- **Fondo Base (`--color-bg`):** `#0C0F0E` (Obsidiana carbón profundo, reduce consumo de batería OLED).
- **Superficie Tarjetas (`--color-surface`):** `#161B19`.
- **Superficie Activa / Elevada (`--color-surface-2`):** `#1E2623`.
- **Texto Principal (`--color-text`):** `#F4F7F4` (Contraste 17.5:1 sobre fondo, supera WCAG AAA).
- **Texto Secundario / Muted (`--color-muted`):** `#C5CEC8` (Contraste 10.9:1, supera WCAG AAA).
- **Acento Primario (`--color-primary`):** `#D6FF3F` (Lima neón atlético para CTAs principales, cheques y selección).
- **Texto sobre Primario (`--color-primary-ink`):** `#14180A` (Contraste 14.8:1).
- **Acento de Alerta / Timer (`--color-accent`):** `#FF5C39` (Coral para conteo regresivo de descanso y advertencias).
- **Secundario (`--color-secondary`):** `#7EE0C6` (Menta fresca para respiración y datos técnicos).
- **Bordes (`--color-border`):** `rgba(214, 255, 63, 0.18)` (Líneas ultra-finas de 1px con destello lima).

## 3. Tipografía
- **Display:** `Big Shoulders` (Google Fonts, variable 72 opsz, 700 wght, condensada, mayúsculas deportivas de alto impacto).
- **Cuerpo / Lectura:** `Figtree` (Google Fonts, 400 y 600, legibilidad limpia en pantallas móviles).
- **Datos / Métricas:** `IBM Plex Mono` (Números tabulares para cronómetros, repeticiones, series y pesos).

## 4. Superficies del Navegador (Craft Floor)
- **Selección de texto:** Fondo lima `#D6FF3F` con texto `#14180A`.
- **Caret cursor:** Color lima `#D6FF3F`.
- **Scrollbars:** Barra delgada personalizada de 6px integrada con la paleta.
- **Focus Rings:** Anillo visible de 2px en color lima con offset de 3px (`:focus-visible`).

## 5. Accesibilidad (WCAG 2.2 Nivel AA)
- Touch targets mínimos: **≥44×44px** en todos los botones y enlaces.
- Diálogos modales accesibles implementados con `<dialog>` nativo y método `.showModal()`.
- Soporte para `prefers-reduced-motion` mediante toggle explícito `PauseMotionButton` y reglas CSS.
- Navegación por teclado con skip link `#contenido`.
