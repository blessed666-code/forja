# Diagnóstico — FORJA

**Slug:** `forja`  
**Fecha:** 27 de septiembre de 2026  
**Reemplaza:** el diagnóstico del 24 de septiembre de 2026, borrado  
**Tipo:** producto propio de ARKA · aliado NAIU  
**Ciudad:** Bogotá  
**Dueño:** Danniel Mena

---

## 1. Negocio

FORJA es la app de entreno que ARKA enseña a gimnasios. La persona responde un quiz y sale con una semana según los días que sí entrena y según su objetivo. Cada músculo entra dos veces por semana. Cuatro días significan torso y pierna con series, descansos y RPE de trabajo.

Cubre gym, casa, banda y un bloque escrito de TRX. NAIU aparece como estante de superalimentos, con salida a naiu.bio. FORJA no los vende.

Nombre de trabajo: **FORJA**. Wordmark. Tagline: «Entrena los días que elegiste. Con exigencia.» Perfil 6 Fitness, intensidad 4/5.

## 2. Qué se rehízo

El corte del 24 de septiembre apoyaba la sesión en videos MP4 de un dataset abierto (maniquí sobre fondo claro) y el coach en Groq. Eso quedó fuera.

El stack de interfaz vigente en ARKA, cerrado el 25 de septiembre de 2026, pone la escena que reacciona al ejercicio en 3D en tiempo real: Next.js 16, React 19, Tailwind v4, Three.js 0.186, React Three Fiber 9 y drei 10. Lenis y el scrollytelling sirven para una puerta pública. La zona interna de FORJA usa scroll nativo, porque ahí hay timer, chat y quiz.

Hoy se pide solo esa base interna, lista para v0. La llamada al modelo no entra todavía. La escena 3D sí: es el centro de la sesión.

## 3. Sesión 3D

Nivel visual **4**, limitado al reproductor y a la ficha. El resto es interfaz.

El maniquí es de FORJA: cuerpo en primitivas, músculo activo en `#FF5C39`, barra, banco o polea según el ejercicio, estudio `#0C0F0E`. El mismo músculo está escrito arriba de la escena. Si no hay WebGL o la persona pide menos movimiento, se ve un póster del mismo encuadre.

YouCan (Toned LLC) sigue siendo la referencia de recorrido: un ejercicio a la vez, músculo nombrado, cuerpo en el centro, series debajo. No se usa su marca, sus renders ni su suscripción.

TRX no tiene modelo propio. La ficha lo dice y muestra el patrón corporal más cercano.

La biblioteca de nombres de ejercicios del dataset abierto puede seguir como lista de patrones. El medio de la sesión ya no es ese MP4.

## 4. Coach interno

Un solo chat. Cinco roles, invisibles para quien entrena:

| Rol | Cuándo entra |
|---|---|
| instructor | técnica, series, descanso, sustitución |
| avances | racha, semana, estancamiento, cargas anotadas |
| nutricion | comida del día a día y el estante NAIU |
| sueno | descanso nocturno y fatiga |
| animo | no querer ir, soltar el jueves |

El system prompt de producción lleva la ficha del quiz, las sesiones guardadas y el rol. No diagnostica ni reemplaza a un nutricionista clínico.

### API que pone el cliente

Tres variables de servidor: `COACH_BASE_URL`, `COACH_MODEL`, `COACH_API_KEY`. El adaptador habla el formato de chat de OpenAI, que es el que usan OpenRouter y la mayoría de proveedores. Cambiar de modelo es cambiar esas variables.

### Prueba sin costo

Modelo: **`qwen/qwen3.8-27b:free`** en OpenRouter. Es el Qwen gratuito vigente más capaz para una conversación de coach: denso, contexto de hasta 1M de tokens en la variante de pago y la gratis publicada el 14 de agosto de 2026, con razonamiento, herramientas y entrada de imagen. Qwen3 Coder, aunque es más grande, está afinado para código y no para acompañar un entreno en español. Ficha: [Qwen3.8 27B (free)](https://openrouter.ai/qwen/qwen3.8-27b:free).

El tier gratis de OpenRouter alcanza para una demo (del orden de decenas a unos pocos cientos de mensajes al día, según la cuenta). Un gym en uso real conecta su API de pago. ARKA no factura esos tokens.

En el corte de hoy, `getCoachReply()` devuelve guiones ya clasificados. El Route Handler queda previsto y apagado.

## 5. Dónde vive

| Pieza | Dónde | Costo de la muestra |
|---|---|---|
| App interna | Vercel | $0 |
| Cuentas, cuando se enciendan | Supabase free | $0 |
| Escena 3D | en el navegador, primitivas | $0 |
| Coach de prueba | OpenRouter, Qwen3.8 27B free | $0, con cupo corto |
| Coach del gym | la API que ellos peguen | lo paga el gym |

## 6. Precio estimado del coach

La App Web básica del portafolio ($3.490.000 COP, 15–25 días hábiles) ya incluye un ayudante simple dentro de la app. El coach de este diagnóstico es más que eso: cinco roles, lectura de avances y un enchufe para cualquier API. Ese alcance no tiene línea en el portafolio.

**Estimación ARKA: $890.000 COP, pago único.** Sin mensualidad de ARKA. Se mueve cuando se cierre el detalle de los roles. No incluye el consumo del modelo.

Identidad del gym, si no quieren el wordmark FORJA: $260.000 COP.

## 7. Corte de hoy

`docs/prompt-v0-forja.md` construye la base interna: login de demostración, quiz, Hoy, sesión 3D, semana, biblioteca, chat con roles internos en guion, perfil y estante NAIU.

Queda listo cuando en 390px el press de Camila se ve en el maniquí con el pecho encendido, la sentadilla cambia la pose, y «no quiero ir» recibe una respuesta de ánimo sin un menú de oficios.

## 8. Después

1. `POST /api/coach` con Qwen de prueba.
2. Supabase.
3. Modelos 3D de suspensión, cuando existan.
4. Puerta pública y `/arka-seo`, si FORJA necesita descubrirse en Google. Caso A.
