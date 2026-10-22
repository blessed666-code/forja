# Storyboard — FORJA

Fase 1 · `/ui-ux-pro-max` · 28 de septiembre de 2026

App interna de entreno. Bogotá. Muestra de ARKA. Perfil 6 Fitness, intensidad 4/5. Nivel visual 4 solo en la sesión. El resto es interfaz. Sin landing.

La consulta de la base propuso una landing tipo tienda de apps, naranja `#F97316`, verde `#22C55E` y Barlow. No se usa. Mandan los tokens de `.cursorrules`.

## Tokens

| Rol | Token | Uso |
|---|---|---|
| Fondo | `--color-bg` `#0C0F0E` | Estudio |
| Superficie | `--color-surface` `#161B19` | Tarjetas |
| Superficie 2 | `--color-surface-2` `#1E2623` | Filas y composer |
| Texto | `--color-text` `#F4F7F4` | Cuerpo, 16px, line-height 1.55 |
| Apagado | `--color-muted` `#C5CEC8` | Meta, nunca lima pequeño |
| Lima | `--color-primary` `#D6FF3F` | Relleno de botón |
| Tinta | `--color-primary-ink` `#14180A` | Texto sobre lima |
| Menta | `--color-secondary` `#7EE0C6` | Estado secundario |
| Naranja | `--color-accent` `#FF5C39` | Músculo activo y serie en curso |
| Borde | `--color-border` | Lima al 18% |

Display y rótulo muscular: Big Shoulders Display 700. Cuerpo: Figtree 400. Timer: IBM Plex Mono. Iconos: Lucide, outline. Wordmark FORJA. Mark pequeño: letra F en tinta sobre cuadrado lima. Sin isotipo, sin fotos de ejercicios, sin emoji.

## Qué no entra

Lenis, escena fija, SplitText, parallax, video por scroll, secuencia en canvas 2D, landing, login real, listado de rutinas, imágenes de ejercicios, API del coach, un canvas por tarjeta.

Scroll nativo en toda la zona interna. La barra inferior tiene cinco destinos y se oculta dentro de la sesión.

## Puerta de movimiento

| Valor | Sesión | Resto |
|---|---|---|
| `full` | Maniquí 3D en loop | Microinteracciones de interfaz |
| `lite` | Póster del mismo encuadre | Igual que `full`, sin WebGL |
| `static` | Póster quieto | Contenido visible, sin entrada animada |

`static` también cuando `prefers-reduced-motion: reduce` o no hay WebGL. El botón «Pausar movimiento» vive en la barra superior, con nombre accesible. Si el sistema pide menos movimiento, ese botón no vuelve a encender la escena.

## Mapa

| Pantalla | Técnica | Componentes | Movimiento |
|---|---|---|---|
| Hoy | Interfaz | `TopBar`, `SaludoHoy`, `TarjetaDia`, `LineaEntreno` | Framer Motion: opacidad y desplazamiento corto al entrar. Spring `stiffness: 400`, `damping: 25` |
| Sesión | 3D en tiempo real | `RotuloMusculo`, `SiluetasHtml`, `SesionCanvas`, `PosterSesion`, `SerieTimer`, `AccionesSesion`, `SheetSustituir` | El loop vive en `useFrame`. Framer Motion solo en los botones y en la hoja, nunca sobre el canvas |
| Semana | Interfaz | `ListaDias`, `FilaDia` | Press en la fila. Sin stagger de rejilla |
| Biblioteca | Interfaz. La ficha abierta reutiliza la técnica de Sesión | `FiltrosBiblioteca`, `TarjetaEjercicio`, `FichaEjercicio` | La grilla es texto. Un solo canvas, y solo con la ficha abierta |
| Coach | Interfaz | `PastillaFicha`, `HiloCoach`, `BurbujaCoach`, `ComposerCoach`, `AvisoClinico` | Aparición del mensaje en opacidad. Scroll nativo del hilo |
| Perfil | Interfaz | `FichaPersona`, `TaglinePerfil`, `EstanteNaiu`, `PieArka` | Press en la tarjeta del estante. El enlace sale a naiu.bio |

## Por pantalla

### Hoy

Saludo con el nombre y una sola sesión: la de hoy. Una línea dice la serie y el descanso de ese ejercicio. No hay catálogo de rutinas. Si el objetivo es masa, una línea de texto hacia el estante, sin carrito. En 390px la tarjeta ocupa el ancho y el destino es la sesión.

### Sesión

Nivel 4. Un ejercicio a la vez. Arriba, el músculo en HTML (PECHO, ESPALDA, HOMBRO, BRAZO, PIERNA, ABDOMEN o CARDIO). Tres siluetas propias; la central marca el músculo en naranja y un anillo lima. El canvas va a 16:9, fondo de estudio, maniquí de primitivas, equipo simple (barra, banco o polea) y loop corto del patrón. `dpr` de 1 a 1,5. Sin sombras de alta resolución. `frameloop="always"` solo mientras la sesión está abierta; al salir, el canvas se desmonta.

El nombre, «serie 2 de 4» y el descanso en mono están en HTML. El canvas es `aria-hidden`. Hecho, Saltar descanso y Sustituir quedan abajo, a pulgar, mínimo 44px. Sustituir lista ejercicios del mismo músculo y del equipo elegido, en una hoja; al elegir, cambian la pose y el rótulo sin salir de la sesión. La barra inferior no se muestra.

`lite` y `static`: no se monta el canvas. Se ve el póster del mismo encuadre, con `alt` del ejercicio. No es una foto de stock.

### Semana

Los días que la persona ya eligió, en orden. Cada fila es un día del split (en la semilla: Torso A, Pierna A, Torso B, Pierna B), no un menú para escoger programas. Tocar una fila abre la sesión de ese día.

### Biblioteca

Unas fichas de texto: nombre, equipo y músculo. Filtros por equipo y por músculo. Sin miniatura y sin canvas en la grilla. Abrir una ficha muestra el mismo reproductor de la sesión, en corto, con un solo canvas. Cerrar la ficha lo desmonta.

### Coach

Una conversación. Pastilla visible con la ficha («Camila · 4 días · masa»). El rol (`instructor`, `avances`, `nutricion`, `sueno`, `animo`) no se muestra ni se elige. La respuesta de este corte es un guion. No hay llamada de red. Bajo el composer: «No sustituyo a un médico ni a un nutricionista clínico.»

### Perfil

Wordmark, tagline «Entrena los días que elegiste. Con exigencia.» y la ficha guardada en texto. Estante NAIU: tarjetas con nombre, para qué sirve, precio y enlace externo. Pie: «Una muestra de ARKA · aliado NAIU».

## Fase siguiente

`/arka-build-ui` construye la interfaz de Hoy, Semana, Biblioteca, Coach y Perfil. La escena 3D de la sesión espera a `/react-three-fiber`. `/arka-scenes` no tiene escena de scroll en este corte.
