# Prompt v0 — FORJA

Corte de hoy: la base interna de la app. Sin landing, sin backend y sin llamada real al modelo. El maniquí de la sesión es 3D de verdad.

Pégalo completo en v0, en Devin o al inicio de una sesión en Cursor.

---

Actúa como Senior Frontend Engineer y UI/UX Designer. Construye la zona interna de **FORJA**, app web de entreno (muestra de ARKA, Bogotá).

Quien entra ya está dentro del producto: quiz, día de entreno, sesión con maniquí 3D, semana, biblioteca, chat y perfil. No construyas una página pública de marketing.

## Stack de este corte

- Next.js 16 App Router · React 19 · TypeScript estricto. Prohibido `any`.
- Tailwind CSS v4, tokens en `@theme` y también como variables en `:root`.
- `next/font` · Lucide · Framer Motion 12, importado desde `'framer-motion'`.
- Escena: `three` 0.186 · `@react-three/fiber` 9 · `@react-three/drei` 10.
- El canvas se carga con `next/dynamic` y `ssr: false`.
- Framer Motion no envuelve el canvas, ni le aplica `scale` ni `layout`. El movimiento del maniquí vive en `useFrame`.
- Datos en TypeScript y `localStorage`.
- Scroll nativo en toda la zona interna. No montes Lenis aquí: el timer, el chat y el quiz no deben arrastrar el scroll.

## Qué se ve en la sesión

La referencia de recorrido es una app de maniquí en el gym: un ejercicio a la vez, el músculo nombrado arriba, el cuerpo en el centro y las series debajo. El maniquí, las máquinas y el texto de esa marca no se copian. FORJA tiene el suyo.

Escenario oscuro, estudio, sin logo ajeno:

1. Rótulo del músculo en mayúsculas: PECHO, ESPALDA, HOMBRO, BRAZO, PIERNA, ABDOMEN o CARDIO.
2. Tres siluetas SVG propias. La central lleva el músculo activo en `#FF5C39` y un anillo `#D6FF3F`.
3. Canvas 3D a 16:9, ancho completo. Fondo `#0C0F0E`. Un maniquí estilizado (grupo de mallas: cabeza, torso, brazos, piernas), de pie o en el banco según el ejercicio, con la zona activa en material emisivo `#FF5C39`. El resto del cuerpo en gris `#C8CDD2`. Una barra, un banco o una polea simples, según el equipo, hechos con primitivas. Luz de estudio, suave. El maniquí hace un loop corto del patrón (press: brazos suben y bajan; sentadilla: cadera baja; remo: codos atrás). Con `prefers-reduced-motion: reduce`, o si no hay WebGL, el canvas no se monta y se ve un póster del mismo encuadre con el nombre del ejercicio en HTML.
4. Nombre, «serie 2 de 4», descanso en mono.
5. Botones Hecho, Saltar descanso, Sustituir.

El nombre del músculo y los pasos también están en HTML. El canvas es `aria-hidden`. El póster lleva `alt` descriptivo.

`dpr={[1, 1.5]}`. Sin sombras de alta resolución. `frameloop="always"` solo mientras la sesión está abierta; al salir, se desmonta.

Presupuesto: la escena cabe en primitivas. No descargues un GLB pesado ni un asset de otra marca.

## Identidad

El logo de este corte es el wordmark **FORJA** en Big Shoulders Display. No inventes un isotipo, una pesa, una llama ni un escudo. Si hace falta un mark pequeño (favicon o barra), es solo la letra F en `#14180A` sobre un cuadrado `#D6FF3F`, con radio corto.
Tagline, solo en perfil: «Entrena los días que elegiste. Con exigencia.»
Pie de perfil: «Una muestra de ARKA · aliado NAIU».

```css
--color-bg: #0C0F0E;
--color-surface: #161B19;
--color-surface-2: #1E2623;
--color-text: #F4F7F4;
--color-muted: #C5CEC8;
--color-primary: #D6FF3F;
--color-primary-ink: #14180A;
--color-accent: #FF5C39;
--color-secondary: #7EE0C6;
--color-border: rgba(214, 255, 63, 0.18);
```

El lima es relleno de botón con texto tinta. El texto corrido es hueso. El naranja es el músculo activo y la serie en curso.

- Display y rótulo muscular: **Big Shoulders Display** 700.
- Cuerpo: **Figtree** 400, line-height 1.55.
- Timer: **IBM Plex Mono**.

Prohibido Inter, Roboto, Arial y púrpura neón.

## Arranque

Barra inferior: Hoy, Semana, Biblioteca, Coach, Perfil. Se oculta dentro de la sesión.

Login de demostración: cualquier correo y contraseña entran. Si no hay ficha, va al quiz. Si hay ficha, va a Hoy. Enlace «Rehacer quiz».

Semilla ya guardada:

- Camila Ríos · ganar masa · 4 días · 60 min · gym completo · intermedio
- Split: Torso A, Pierna A, Torso B, Pierna B

## Quiz

Una pregunta por pantalla. Atrás y progreso.

1. Nombre
2. Objetivo: ganar masa / perder grasa / fuerza / recomposición / empezar de cero
3. Días: 2, 3, 4, 5 o 6
4. Minutos: 30, 45, 60, 75
5. Dónde: gym completo / mancuernas y barra / máquinas y poleas / casa / TRX
6. Nivel: nuevo, intermedio, avanzado
7. Zona a cuidar, opcional: hombro, rodilla, espalda baja, ninguna
8. Cierre con el nombre del split y «Empezar hoy»

## Rutina

Cada músculo queda dos veces por semana. Quien marca 4 días recibe torso/pierna exigente. El estiramiento cierra, no reemplaza la sesión.

- 2 días: Full body A/B
- 3: Full body A/B/C
- 4: Torso/Pierna, cuatro sesiones
- 5: Empuje, Jalón, Pierna, Torso, Pierna
- 6: Empuje, Jalón, Pierna, repetido
- Casa: peso corporal y banda. Ocho minutos de movilidad al inicio.
- TRX: 12 patrones con pasos escritos y la etiqueta «Demostración 3D en producción». El escenario muestra el maniquí en el patrón más cercano y un aviso visible de que la suspensión todavía no tiene modelo propio.

Semilla, Torso A:

- Press de banca con barra — 4×6–8 — 150 s — RPE 8 — músculo PECHO — equipo barra y banco
- Remo con barra, agarre supino — 4×8 — 120 s — ESPALDA
- Press de hombros con mancuernas, sentado — 3×8–10 — 90 s — HOMBRO
- Jalón en polea — 3×8–12 — ESPALDA — equipo polea
- Fondos — 3×8–12 — PECHO
- Plancha frontal — 3×40 s — ABDOMEN

Pierna A:

- Sentadilla con barra — 4×6–8 — 180 s — RPE 8 — PIERNA
- Peso muerto rumano con mancuernas — 4×8 — PIERNA
- Zancada con barra — 3×8 por pierna — PIERNA
- Extensión de rodilla en máquina — 3×10–12 — PIERNA
- Estiramiento de isquios, de pie — 2×40 s — al cierre

Torso B y Pierna B repiten el patrón con otra variante del mismo equipo. Guarda todo en `src/data/` tipado: id, nombre, equipo, músculo, series, descanso, pasos (3 líneas), un error común y la respiración.

Biblioteca: unas 24 fichas que cubran barra, mancuerna, máquina, polea, banda y peso corporal, más las 12 de TRX. Filtros por equipo y músculo. Cada tarjeta abre la misma escena 3D en pequeño.

Sustituir, dentro de la sesión, lista ejercicios del mismo músculo y del equipo elegido. Al elegir, cambia la pose y el rótulo sin salir.

Hecho avanza la serie. Al cerrar: resumen y la fecha en `localStorage`.

Hoy saluda por el nombre, muestra la sesión del día y una línea: «Hoy el press va en 4 por 6 a 8. El descanso de dos minutos y medio se cumple.» Si el objetivo es masa, una línea hacia maca negra o cacao.

## Coach

Una sola conversación. La persona no elige un oficio.

Por dentro, cada mensaje se clasifica en un rol y la respuesta sale de ese rol. El tipo existe en código:

`instructor` · `avances` · `nutricion` · `sueno` · `animo`

Ejemplos de clasificación, por palabras:

- press, serie, descanso, técnica → instructor
- racha, cuánto llevo, esta semana, estancado → avances
- proteína, comer, comida → nutricion
- dormir, descanso nocturno, cansancio → sueno
- no quiero ir, flojera, dejarlo → animo

En este corte la respuesta es un guion de 4 o 5 líneas en español de Colombia, según el rol. No llames a ninguna API. Deja el adaptador preparado y apagado: `getCoachReply()` devuelve el guion; un comentario de una línea indica que en producción ese método llama a `POST /api/coach` con la ficha y el rol. La clave no existe en el cliente.

Pastilla visible: «Camila · 4 días · masa». No muestres el nombre del rol.

Cierre fijo bajo el composer: «No sustituyo a un médico ni a un nutricionista clínico.»

Tono de instructor: «Con 4 días, el press de hoy son 4 series de 6 a 8 y dos minutos y medio de descanso. Si el hombro molesta, paras esa serie y pasas el press a mancuernas.»

Tono de avances: «Llevas el torso A de esta semana sin marcar. Cuando cierres la sesión, la racha suma un día. El peso de la barra se anota al terminar, no a mitad de serie.»

## NAIU

Tarjetas con enlace externo. Sin carrito.

- Maca negra — rendimiento y enfoque — $75.000 — https://naiu.bio/tienda/naiu-vital/maca-negra
- Maca roja — vitalidad — $75.000 — https://naiu.bio/tienda/naiu-vital/maca-roja
- Camu camu — recuperación — $75.000 — https://naiu.bio/tienda/naiu-vital/camu-camu
- Chontaduro — energía — $35.000 — https://naiu.bio/tienda/naiu-vital/chontaduro
- Café Seynekun — por la mañana — $55.000 — https://naiu.bio/tienda/naiu-vital/cafe-seynekun
- Cacao Seynekun — $20.000 — https://naiu.bio/tienda/naiu-vital/cacao-seynekun
- Melena de león — https://naiu.bio/tienda/naiu-fungi/melena-de-leon

## Accesibilidad

Skip-link, foco visible, Tab, Enter y Escape. Botones reales. Contraste del texto hueso sobre `#0C0F0E`. El lima no es texto pequeño sobre oscuro. En 390px la sesión se usa con el pulgar: el canvas arriba, las acciones abajo, sin tapar el descanso.

## Listo cuando

En 390px: rehacer el quiz, abrir el torso de Camila, ver el maniquí en 3D haciendo el press con el pecho encendido, cambiar a la sentadilla y ver otra pose, marcar una serie, sustituir el ejercicio, y escribir «no quiero ir» en el coach y recibir una respuesta de ánimo sin que aparezca un selector de roles.

## Fuera de este corte

Landing, Lenis, Supabase, la llamada al modelo, carrito, CMS, copiar renders o el nombre de otra app de fitness, y un chat que diagnostique.
