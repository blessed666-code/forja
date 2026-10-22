# FORJA — Rutinas, catálogo y fotos de referencia

Guía para armar y ajustar rutinas en el prototipo (solo frontend, sin API).

## Flujo en la app

1. **Quiz** (`/quiz`) o perfil semilla → guarda `Profile` en `localStorage` (`forja.profile`).
2. **`buildPlan(profile)`** en `src/data/routines.ts` arma la semana: split según días, plantillas por día, sustitución por equipo y duración.
3. **Hoy / Semana** leen el plan y enlazan a **`/sesion/dia-N`**.
4. **Sesión**: checklist (`ListaChequeo`), series, descanso, sustitutos del mismo músculo.
5. **Biblioteca**: todos los ejercicios de `EXERCISES`; foto si existe en el manifiesto.

Perfil de ejemplo (semilla): Camila Ríos, 4 días, gimnasio, 60 min → split **Torso / Pierna** (`torso-a`, `pierna-a`, `torso-b`, `pierna-b`).

## Tres capas de datos

| Capa | Archivo | Qué define |
|------|---------|------------|
| Ejercicio | `src/data/exercises.ts` | `id`, nombre, músculo, equipo, series/reps/descanso, pasos, errores |
| Plantilla de día | `src/data/routines.ts` → `TEMPLATES` | Lista ordenada de `id` por sesión (Torso A, Pierna B, etc.) |
| Split semanal | `src/data/routines.ts` → `SPLITS` | Cuántos días (2–6), qué plantillas y qué día de la semana |

Los `id` de plantilla deben existir en `getExercise(id)`. Si falta el id, ese ejercicio se omite en ese día.

## Ejemplo completo: día «Torso A»

En `TEMPLATES['torso-a']` ya está el ejemplo de referencia:

```typescript
'torso-a': {
  name: 'Torso A',
  ids: [
    'press-banca-barra',
    'remo-barra-supino',
    'press-hombro-mancuernas',
    'jalon-polea',
    'fondos',
    'plancha-frontal',
  ],
},
```

Para **crear un día nuevo**:

1. Añade los ejercicios que falten en `exercises.ts` (copia la estructura de uno similar).
2. Registra el `id` en un nuevo `TemplateId` y en `TEMPLATES`.
3. Incluye ese template en el `SPLITS` que corresponda (o crea un split nuevo para `Days`).
4. Opcional: GIF en `exerciseMediaManifest.ts` (ver abajo).

`buildPlan` recorta ejercicios «main» si el usuario eligió 30 o 45 minutos; los marcados `closer: true` (movilidad, estiramientos) se mantienen al final. En **casa** se antepone `movilidad-8`.

## GIFs animados (ExerciseGymGifsDB)

- Repo: [JahelCuadrado/ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB) (~1.300 ejercicios, API en español).
- Manifiesto FORJA: `src/data/exerciseMediaManifest.ts` (`forjaId` ↔ `gymGifsDbId`).
- URL en runtime: `exerciseGifUrl(id)` en `src/data/exerciseMedia.ts` (jsDelivr, sin archivos locales).
- Catálogo completo: `https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/es/exercises.json`

## Añadir un ejercicio con GIF

1. En `exercises.ts`, nuevo objeto con `id` único en kebab-case español.
2. Busca el movimiento en el JSON de arriba y copia su `id` (ej. `pectorals/barbell-bench-press`).
3. Añade la fila en `exerciseMediaManifest.ts`.
4. Comprueba en **Biblioteca** (miniatura animada) y en **Sesión**.

## Probar otra rutina rápido

- **Rehacer quiz** desde Perfil, o borrar en DevTools: `localStorage.removeItem('forja.seeded')` y recargar.
- Cambiar semilla en `src/data/seed.ts` (`days`, `place`, `minutes`, `level`) antes del primer seed.

## Rutas útiles en desarrollo

```bash
npm run dev    # http://localhost:3000 (o el puerto libre)
npm run build
```

| Ruta | Uso |
|------|-----|
| `/hoy` | Entreno del día |
| `/sesion/dia-1` … `dia-4` | Sesión con checklist (4 días Camila) |
| `/semana` | Vista semanal |
| `/biblioteca` | Catálogo + filtros |
| `/coach` | Chat guionado |
| `/perfil` | Datos y NAIU |

## Siguiente paso (cuando quieras backend)

- Persistir planes custom por usuario (hoy todo sale de `buildPlan` + quiz).
- API coach (`POST /api/coach`) y OpenRouter.
- Más ejercicios TRX ya están en `exercises.ts`; faltan entradas en el manifiesto si quieres GIF en biblioteca/sesión.
