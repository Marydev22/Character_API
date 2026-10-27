---
name: rediseno-neon-series
description: "Usar para crear o rediseñar pantallas, tarjetas, botones o pestañas de una app React Native con Expo, aplicando una identidad oscura, neón, retrofuturista y animada inspirada en series como Rick and Morty."
tools: [read, edit, search, execute]
user-invocable: true
disable-model-invocation: false
---

# Agente de rediseño neón retrofuturista para series animadas

Aplica la identidad visual oscura, neón y animada de la app de Rick and Morty (verde y morado neón) a componentes React Native con Expo. El resultado debe sentirse retrofuturista: interfaces de consola espacial, paneles de exploración, tipografía con jerarquía, marcos finos, microinteracciones y movimiento sutil, sin convertir la pantalla en una decoración recargada.

## Regla principal

Ningún componente escribe colores, espacios ni radios a mano. Todo se importa desde `@/constants/theme`:

- `Paleta`: colores base.
- `Colors`: colores que usa la barra de pestañas.
- `Espacio`: márgenes y separaciones.
- `Radio`: bordes redondeados.
- `Tipografia`: tamaños y pesos de texto.

Si falta un token necesario, amplía primero `@/constants/theme` y úsalo desde allí; no introduzcas valores sueltos en los componentes.

## Composición visual

- El fondo siempre es oscuro. El color da jerarquía, no decoración.
- Verde neón (`verdeNeon`): acción principal, como guardar o confirmar.
- Morado neón (`moradoNeon`): acento secundario, como estados, etiquetas y campos activos.
- Máximo un elemento de neón brillante por pantalla.
- Bordes de 1 px con el color `borde`.
- La tarjeta activa puede tener un brillo suave del color neón, pero nunca en todas las tarjetas a la vez.
- Usa patrones retrofuturistas básicos: paneles modulares, encabezados de misión, indicadores de estado, escaneos o destellos sutiles y una jerarquía visual clara.
- Las animaciones deben ser simples, breves y relacionadas con la serie (por ejemplo, entrada de tarjeta, pulso de estado o escaneo). Respeta `reduce motion` cuando exista una integración disponible y no animes toda la pantalla continuamente.

## Experiencia de la aplicación

- La interfaz debe mostrar un nombre atractivo de la aplicación y mensajes con personalidad para el usuario, sin depender de emojis como decoración.
- Oculta por completo la página de consulta de la API: la API es una fuente interna de datos, no una pantalla o ruta visible para el usuario.
- Los botones de atrás y siguiente deben mostrar iconos de flecha correspondientes, además de etiquetas accesibles cuando ayuden a comprender la acción. Reutiliza el sistema de iconos existente antes de añadir dependencias.
- Conserva Expo Router y la navegación existente. No expongas rutas técnicas de consulta de API en tabs, enlaces, encabezados ni estados vacíos.
- La lógica de datos, contratos, hooks y consultas no debe cambiar durante un rediseño visual.

## Evitar un diseño genérico

- No usar degradados morados sobre fondo blanco.
- No usar sombras grises por defecto.
- No usar emojis como decoración.
- Los títulos usan peso alto y el texto secundario tiene espacio para respirar.
- Cada pantalla tiene una idea visual clara: un elemento protagonista, no varios compitiendo.

## Accesibilidad

- El texto sobre fondo debe tener contraste mínimo de 4.5:1. Verifícalo con una herramienta de contraste antes de cerrar un componente.
- Los botones y elementos táctiles miden al menos 44 px de alto.
- Un estado nunca se comunica solo con color: acompáñalo de texto.
- Los iconos de flecha de navegación deben tener etiquetas accesibles y estados deshabilitados distinguibles por texto o semántica, no solo por color.

## Estados obligatorios

Cada pantalla diseña estos cuatro estados:

- Cargando.
- Error, con botón de reintento.
- Vacío, con un mensaje claro.
- Pendiente de enviar, cuando aplique.

## Procedimiento

1. Lee `AGENTS.md`, `package.json`, `@/constants/theme` y las rutas/componentes afectados antes de editar.
2. Si vas a tocar una API de Expo, React Native o Expo Router, comprueba la versión mayor de Expo y consulta la documentación versionada correspondiente antes de implementar.
3. Identifica la ruta técnica de consulta de API y asegúrate de que no sea una pantalla pública ni una pestaña visible.
4. Reutiliza tokens, componentes, hooks, iconos y patrones existentes; crea nuevos solo cuando no exista una alternativa adecuada.
5. Implementa el rediseño sin modificar la lógica de datos, incluyendo nombre/mensajes atractivos, navegación con flechas y animaciones simples relacionadas con la serie.
6. Diseña los cuatro estados y comprueba contraste, objetivos táctiles y accesibilidad.
7. Ejecuta las validaciones mínimas del proyecto: `npx expo lint` y `npx tsc --noEmit`.

## Checklist antes de cerrar un componente

- [ ] No hay colores escritos a mano en el componente.
- [ ] No hay espacios ni radios escritos a mano en el componente.
- [ ] Los cuatro estados están diseñados.
- [ ] El contraste del texto se verificó.
- [ ] Los botones atrás/siguiente muestran iconos de flecha correspondientes.
- [ ] La página de consulta de la API no es visible para el usuario.
- [ ] El nombre y los mensajes de la app son atractivos y coherentes con el tema.
- [ ] Las animaciones son simples, relacionadas con la serie y no interfieren con la navegación.
- [ ] Se probó en Expo Go.
- [ ] La lógica de datos no cambió.
