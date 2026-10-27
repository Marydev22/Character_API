---
name: rediseno-neon-series
description: "Aplica una identidad visual oscura, neón, retrofuturista y animada inspirada en Rick and Morty a pantallas, tarjetas, botones y pestañas React Native con Expo. Úsala para rediseños de UI, navegación con flechas, estados de carga/error/vacío y ocultación de pantallas técnicas de consulta de API."
argument-hint: "Indica qué pantalla o componente rediseñar y qué flujo visual debe conservarse."
user-invocable: true
disable-model-invocation: false
---

# Identidad visual neón retrofuturista para series animadas

## Cuándo usar esta skill

- Crear o rediseñar pantallas, tarjetas, botones o pestañas de la aplicación.
- Aplicar una estética retrofuturista de exploración espacial con verde y morado neón.
- Mejorar paginación, estados de carga/error/vacío o formularios pendientes de enviar.
- Ocultar una vista técnica de consulta de API y mantener la API como detalle interno.
- Añadir microanimaciones simples relacionadas con la serie sin cambiar la lógica de datos.

## Regla principal

Ningún componente escribe colores, espacios ni radios a mano. Todo se importa desde `@/constants/theme`:

- `Paleta`: colores base.
- `Colors`: colores que usa la barra de pestañas.
- `Espacio`: márgenes y separaciones.
- `Radio`: bordes redondeados.
- `Tipografia`: tamaños y pesos de texto.

Si falta un token, añádelo en `@/constants/theme` antes de usarlo. No escribas valores visuales sueltos en pantallas o componentes.

## Composición

- El fondo siempre es oscuro. El color da jerarquía, no decoración.
- Verde neón (`verdeNeon`): acción principal, como guardar o confirmar.
- Morado neón (`moradoNeon`): acento secundario, como estados, etiquetas y campos activos.
- Máximo un elemento de neón brillante por pantalla.
- Bordes de 1 px con el color `borde`.
- La tarjeta activa puede tener un brillo suave del color neón, pero nunca en todas las tarjetas a la vez.
- Construye patrones retrofuturistas básicos con paneles modulares, marcos finos, encabezados de misión, indicadores de estado y microinteracciones sutiles.
- Usa animaciones simples de entrada, pulso o escaneo relacionadas con la serie. Evita movimiento constante y respeta las preferencias de reducción de movimiento cuando sea posible.

## Experiencia de usuario

- Da a la aplicación un nombre visible y atractivo, y usa mensajes con personalidad para orientar al usuario.
- No uses emojis como decoración.
- Los botones de atrás y siguiente muestran iconos de flecha correspondientes y mantienen etiquetas accesibles cuando sean necesarias.
- Reutiliza el sistema de iconos existente; no agregues una dependencia nativa sin verificar compatibilidad con la versión de Expo.
- La página de consulta de la API no debe verse: no debe aparecer como ruta pública, tab, enlace, encabezado ni estado vacío. La API solo alimenta la interfaz de la aplicación.
- Conserva Expo Router y la navegación funcional.
- No cambies la lógica de datos, hooks, consultas ni contratos para conseguir el rediseño.

## Evitar un diseño genérico

- No usar degradados morados sobre fondo blanco.
- No usar sombras grises por defecto.
- Los títulos usan peso alto y el texto secundario tiene espacio para respirar.
- Cada pantalla tiene una idea visual clara: un elemento protagonista, no varios compitiendo.

## Accesibilidad

- El texto sobre fondo debe tener contraste mínimo de 4.5:1. Verifícalo con una herramienta de contraste antes de cerrar un componente.
- Los botones y elementos táctiles miden al menos 44 px de alto.
- Un estado nunca se comunica solo con color: acompáñalo de texto.
- Los iconos de flecha tienen nombres accesibles y los estados deshabilitados también se entienden sin depender solo del color.

## Estados obligatorios

Cada pantalla diseña estos cuatro estados:

- Cargando.
- Error, con botón de reintento.
- Vacío, con un mensaje claro.
- Pendiente de enviar, cuando aplique.

## Procedimiento de implementación

1. Lee `AGENTS.md`, `package.json`, `@/constants/theme` y los componentes/rutas afectados.
2. Antes de usar una API de Expo, React Native o Expo Router, lee la versión mayor de `expo` en `package.json` y consulta `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Localiza la consulta de API y confirma qué pantalla o ruta técnica debe dejar de estar expuesta.
4. Reutiliza tokens y componentes existentes; crea o amplía tokens únicamente en `@/constants/theme`.
5. Aplica la composición retrofuturista con un solo protagonista visual, nombre/mensajes atractivos y microanimaciones relacionadas con la serie.
6. Actualiza la paginación para que atrás/siguiente tenga el icono de flecha correcto, objetivo táctil de al menos 44 px y accesibilidad.
7. Diseña explícitamente los estados de carga, error con reintento, vacío y pendiente de enviar cuando corresponda.
8. Comprueba contraste y revisa que ningún componente tenga colores, espacios o radios escritos manualmente.
9. Ejecuta `npx expo lint` y `npx tsc --noEmit`. Si falla una validación, corrige el problema relacionado con el cambio antes de finalizar.

## Checklist

- [ ] No hay colores escritos a mano en el componente.
- [ ] No hay espacios ni radios escritos a mano en el componente.
- [ ] Los cuatro estados están diseñados.
- [ ] El contraste del texto se verificó.
- [ ] Los botones atrás/siguiente muestran iconos de flecha.
- [ ] La página de consulta de la API permanece oculta.
- [ ] La app muestra un nombre y mensajes atractivos.
- [ ] Los patrones retrofuturistas son claros pero no recargados.
- [ ] Las animaciones son simples y relacionadas con la serie.
- [ ] Se probó en Expo Go.
- [ ] La lógica de datos no cambió.
