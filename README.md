# FORJA

App web de entreno. Muestra de ARKA para gimnasios. Aliado: NAIU.

El quiz arma la semana. En la sesión hay checklist, timer de descanso y **GIFs animados** de referencia ([ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB) vía jsDelivr). Un coach interno contesta técnica, avances, comida, sueño y constancia. La persona ve un solo chat. El rol lo elige el sistema.

**Tagline:** Entrena los días que elegiste. Con exigencia.

## Cómo seguir

Abrir `~/arka-clients/forja` en Cursor. Rama: `forja-trabajo`.

| Quién | Qué leer |
|---|---|
| v0, Devin o la sesión que arme el front | `docs/prompt-v0-forja.md` |
| Cualquier agente de este repo | `.cursorrules` y este README |
| Rutinas y catálogo | `docs/rutinas-y-ejercicios.md` |
| Comercial | `docs/propuesta-cliente-forja.md` |
| Decisiones | `docs/diagnostico-forja.md` y `docs/resumen-comercial-forja.md` |
| SEO, después | `docs/plan-seo-forja.md` |

Caso SEO: **A**.

## Qué cambió el 27 de septiembre de 2026

Fase **arka-build-ui** cerrada en frontend móvil (390px): Hoy, Semana, Biblioteca, Coach, Perfil, Quiz y Sesión con checklist. Sin landing, sin login real, sin API del coach (guiones locales). Demos de ejercicio con GIFs desde ExerciseGymGifsDB (CDN).

```bash
cd forja && npm install && npm run dev
```

Coach previsto con [Qwen3.8 27B free](https://openrouter.ai/qwen/qwen3.8-27b:free) en OpenRouter cuando exista `POST /api/coach`.

## Precios de referencia

| Concepto | Valor |
|---|---|
| App Web básica, si un gym la pide con su marca | $3.490.000 COP |
| Coach interno multi-rol (estimado, no está en la tabla fija) | $890.000 COP, pago único |
| Identidad propia del gym | $260.000 COP |

El consumo del modelo lo paga la API que conecte el gym. La prueba no genera factura de tokens.

## Después de este corte

1. Construir la base interna con `docs/prompt-v0-forja.md`.
2. Encender `POST /api/coach` con la ficha, las sesiones y el rol.
3. Supabase para cuentas reales.
4. Modelos propios de TRX cuando existan.
5. `/arka-seo` si aparece una puerta pública. Esa puerta, si se hace, puede llevar Lenis. La sesión no.
