# onlineManager NetInfo Fix — Bugfix Design

## Overview

El `onlineManager` actual usa `expo-network` para detectar cambios de conectividad,
pero su listener no dispara de forma confiable en Android al perder WiFi o datos
móviles. El fix reemplaza ese listener por `@react-native-community/netinfo`, que
expone eventos nativos de red en ambas plataformas. Además se agrega un timeout
explícito de 3 s al fetch HEAD de verificación y un banner animado (Reanimated v4)
que informa al usuario del estado offline/online.

Archivos afectados:
- `src/query/onlineManager.ts` — cambio de listener, timeout del fetch
- `src/components/ConnectionBanner.tsx` — nuevo banner animado
- `src/app/_layout.tsx` — montar el banner

## Glossary

- **Bug_Condition (C)**: La condición que activa el fallo — el usuario pierde
  conectividad en Android/iOS y el `onlineManager` no lo detecta porque
  `Network.addNetworkStateListener` de `expo-network` no dispara.
- **Property (P)**: El comportamiento correcto cuando C se cumple — el
  `onlineManager` debe marcarse offline en < 2 s, pausar mutaciones y mostrar
  el banner.
- **Preservation**: Comportamiento existente que no debe cambiar — arranque
  con conexión, re-verificación al volver al primer plano, queries normales,
  sin cambios en `_layout.tsx` salvo agregar el banner, compilación TypeScript
  estricta.
- **onlineManager**: Instancia global de TanStack Query (`@tanstack/react-query`)
  que comunica el estado de red al cliente de queries.
- **setEventListener**: Método de `onlineManager` que registra la función que
  recibe el callback `setOnline(boolean)`.
- **NetInfo**: `@react-native-community/netinfo` — biblioteca con listener nativo
  que dispara ante cualquier cambio de conectividad (no solo cambio de tipo de red).
- **AbortController**: API estándar para cancelar fetch en curso; se usa para
  implementar el timeout de 3 s en el fetch HEAD de verificación.
- **ConnectionBanner**: Nuevo componente `src/components/ConnectionBanner.tsx`
  que muestra un banner animado con Reanimated v4.
- **useOnlineStatus**: Nuevo hook que suscribe el componente al `onlineManager`
  mediante `onlineManager.subscribe()` para evitar duplicar lógica de red.

## Bug Details

### Bug Condition

El fallo se manifiesta cuando el usuario desactiva el WiFi o los datos móviles en
Android (y en algunos dispositivos iOS). `expo-network` solo dispara su listener
cuando cambia el *tipo* de red (p. ej. WiFi → datos), no cuando la red desaparece
por completo. Por eso el `onlineManager` permanece marcado como online pese a no
haber conexión real.

**Formal Specification:**
```
FUNCTION isBugCondition(event)
  INPUT: event — cambio de estado de red en el dispositivo
  OUTPUT: boolean

  RETURN event.connectivityLost = true
         AND listenerSource = EXPO_NETWORK          -- listener actual, no NetInfo
         AND onlineManager.isOnline() = true        -- permanece online (incorrecto)
END FUNCTION
```

### Examples

- **Ejemplo 1**: Usuario en Android desactiva el WiFi → `expo-network` no dispara
  el listener → `onlineManager` sigue online → la mutación de "guardar favorito"
  se intenta enviar en lugar de pausarse → falla con error de red.
- **Ejemplo 2**: Usuario en iOS pierde cobertura en zona sin señal → mismo
  comportamiento descrito arriba; el fetch HEAD bloquea ~75 s antes de fallar.
- **Ejemplo 3**: Usuario desactiva datos móviles → el listener tampoco dispara
  porque no hubo cambio de *tipo* de red → `onlineManager` permanece online.
- **Edge case**: Dispositivo oscila entre conectado y sin conexión muy rápido
  (< 2 s) → con NetInfo se recibe cada evento; con el AbortController el fetch
  HEAD aborta en 3 s sin bloquear detecciones posteriores.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Al arrancar la app con conexión activa el `onlineManager` se marca online y
  se ejecutan las mutaciones pausadas del ciclo anterior.
- Cuando la app vuelve al primer plano (`AppState` cambia a `active`) se
  re-verifica el estado de conexión.
- Cuando la conexión es estable las queries se ejecutan con normalidad sin
  interrupciones ni regresiones.
- `src/app/_layout.tsx` solo requiere agregar `<ConnectionBanner />` como
  componente adicional; ninguna otra línea debe cambiar.
- El proyecto compila sin errores con TypeScript estricto.

**Scope:**
Todo input que NO involucre pérdida de conectividad (queries normales, mutaciones
con red activa, navegación entre tabs, AppState changes con red activa) debe
quedar completamente inalterado.

## Hypothesized Root Cause

1. **Listener insuficiente de `expo-network`**: `Network.addNetworkStateListener`
   solo dispara cuando cambia el *tipo* de interfaz de red activa, no cuando
   la conectividad desaparece en la misma interfaz. En Android esto es especialmente
   notorio porque al desactivar WiFi el SO puede demorar en reportar cambio de tipo.

2. **Sin timeout en el fetch HEAD**: La llamada `fetch(URL, { method: 'HEAD' })`
   no tiene AbortController, por lo que depende del timeout del SO (~75 s en
   Android). Esto retrasa drásticamente la detección por polling.

3. **Sin indicador visual**: El usuario no recibe feedback del estado offline,
   lo que degrada la UX aunque el sistema eventualmente detecte la pérdida.

4. **NetInfo ausente**: La solución estándar para detección de red en React
   Native — `@react-native-community/netinfo` — no está instalada en el proyecto.
   Esta biblioteca usa APIs nativas de cada plataforma y notifica cualquier cambio
   de conectividad real, no solo de tipo de red.

## Correctness Properties

Property 1: Bug Condition — Detección de pérdida de conexión con NetInfo

_For any_ evento de red donde el dispositivo pierde conectividad (isBugCondition
returns true), el `onlineManager` fijado con el listener de NetInfo SHALL marcar
el estado como offline en menos de 2 segundos, imprimir `[red] sin conexión` con
timestamp en consola, pausar las mutaciones pendientes y mostrar el banner de
"Sin conexión".

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Comportamiento sin pérdida de conexión

_For any_ evento o acción donde la condición del bug NO se cumple (isBugCondition
returns false — arranque con red, AppState active con red, queries normales), el
`onlineManager` fijado SHALL producir exactamente el mismo comportamiento que el
original, preservando el arranque online, la re-verificación por AppState y la
ejecución normal de queries y mutaciones.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

#### Archivo 1: `src/query/onlineManager.ts`

**Cambio 1 — Reemplazar `expo-network` por `@react-native-community/netinfo`**
- Eliminar `import * as Network from 'expo-network'`.
- Agregar `import NetInfo from '@react-native-community/netinfo'`.
- Sustituir `Network.addNetworkStateListener(...)` por
  `NetInfo.addEventListener(state => { ... })`.
- El callback recibe `NetInfo.NetInfoState`; usar
  `state.isConnected && state.isInternetReachable !== false` como condición online.

**Cambio 2 — Timeout de 3 s en el fetch HEAD**
- Crear un `AbortController` antes de llamar a `fetch`.
- Iniciar `setTimeout(() => controller.abort(), 3000)`.
- Pasar `{ method: 'HEAD', signal: controller.signal }` al fetch.
- Limpiar el timeout con `clearTimeout` tanto en el bloque `try` como en `catch`.

**Cambio 3 — Log con timestamp**
- Cambiar los `console.log('[red] ...')` para incluir
  `new Date().toISOString()` tal como requiere el punto 2.2 del bugfix.md.

**Cambio 4 — Llamar a `resumePausedMutations` al volver online**
- Importar `queryClient` desde `@/query/queryClient`.
- En el callback de NetInfo, cuando `isOnline` pase de `false` a `true`,
  llamar a `queryClient.resumePausedMutations()`.

#### Archivo 2: `src/components/ConnectionBanner.tsx` (nuevo)

**Cambio 5 — Hook `useOnlineStatus`**
- Definir `useOnlineStatus()` dentro del mismo archivo (o en `src/hooks/`).
- Usar `onlineManager.subscribe(cb)` para suscribirse a cambios de estado.
- Retornar un booleano `isOnline`.

**Cambio 6 — Animación con Reanimated v4**
- Usar `useSharedValue` para `translateY` (slide desde arriba) y `opacity`.
- Usar `useAnimatedStyle` para construir el estilo animado.
- Usar `withTiming` para animar entrada (offline) y salida (online tras 1.5 s).
- Al volver online: mostrar banner verde neón (`#39FF14`) brevemente y luego
  ocultarlo con `withDelay(1500, withTiming(...))`.

**Cambio 7 — Colores y diseño del banner**
- Offline: fondo `#FF4444` (rojo), texto blanco, texto "Sin conexión".
- Reconexión: fondo `#39FF14` (verde neón), texto `#0A0A12`, texto "Conexión restaurada".
- Posición: parte superior de la pantalla, bajo el status bar (SafeAreaView).
- `zIndex` alto para superponerse a cualquier contenido.

#### Archivo 3: `src/app/_layout.tsx`

**Cambio 8 — Montar el banner**
- Importar `ConnectionBanner` desde `@/components/ConnectionBanner`.
- Agregar `<ConnectionBanner />` dentro del `ThemeProvider`, como primer hijo
  del `Stack` o como hijo directo del `ThemeProvider` antes del `Stack`.
- El banner debe estar dentro del `ThemeProvider` para acceder al contexto de
  tema si fuera necesario en el futuro, pero fuera del `Stack` para que no
  interaccione con la navegación.

### Justificaciones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Listener de red | `@react-native-community/netinfo` | Detecta pérdida de conectividad real (no solo cambio de tipo); soporte nativo Android/iOS |
| Timeout fetch | `AbortController` + 3 s | API estándar, cancelación limpia, sin dependencias extra |
| Posición del banner | Dentro de `ThemeProvider`, fuera de `Stack` | No interfiere con navegación; puede leer tema si se necesita |
| Estado online en componente | `useOnlineStatus` via `onlineManager.subscribe` | Fuente única de verdad; no duplica lógica de red |
| Animación | Slide desde arriba con Reanimated v4 | Patrón estándar para banners de sistema; discreta y clara |
| Color banner offline | `#FF4444` | Contraste con fondo oscuro `#0A0A12`; señal de alerta clara |
| Color banner online | `#39FF14` | Consistente con el verde neón del tema; feedback positivo |

## Testing Strategy

### Validation Approach

El plan de testing sigue dos fases: primero confirmar el bug en el código sin
arreglar (exploratory), luego verificar que el fix corrige el bug (fix checking)
y que no rompe nada (preservation checking).

### Exploratory Bug Condition Checking

**Goal**: Reproducir el fallo en el código actual para confirmar la hipótesis de
root cause antes de escribir el fix.

**Test Plan**: Mockear `NetInfo` y `expo-network` por separado; simular eventos
de pérdida de red; comprobar si `setOnline(false)` se llama.

**Test Cases**:
1. **expo-network no dispara en pérdida de WiFi**: Simular que el listener de
   `expo-network` NO dispara al desactivar WiFi; verificar que `onlineManager`
   permanece online (demostrará el bug).
2. **Fetch HEAD sin timeout bloquea**: Simular un fetch que tarda > 3 s; verificar
   que el código actual espera sin abortar.
3. **NetInfo sí dispara**: Con el código arreglado, simular evento NetInfo de
   pérdida de conexión; verificar que `setOnline(false)` se llama en < 2 s.

**Expected Counterexamples**:
- `setOnline` no es llamado con `false` cuando el listener de `expo-network`
  no dispara.
- El fetch HEAD no se aborta al superar 3 s.

### Fix Checking

**Goal**: Verificar que para todos los inputs donde la condición del bug se cumple,
el sistema corregido produce el comportamiento esperado.

**Pseudocode:**
```
FOR ALL event WHERE isBugCondition(event) DO
  result := onlineManagerFixed.handleNetworkChange(event)
  ASSERT result.isOnline = false
  ASSERT result.detectedIn < 2000ms
  ASSERT result.mutationsPaused = true
  ASSERT result.bannerShown = true
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todos los inputs donde la condición del bug NO se
cumple, el sistema produce el mismo resultado que el original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT onlineManager_original(input) = onlineManager_fixed(input)
END FOR
```

**Testing Approach**: Se recomienda property-based testing para preservation
checking porque genera automáticamente muchos escenarios (arranques con red,
cambios de AppState, queries normales) y asegura que ninguno queda roto.

**Test Cases**:
1. **Arranque con red activa**: Verificar que `setOnline(true)` se llama al
   inicializar con NetInfo reportando conexión.
2. **AppState active con red**: Verificar que volver al primer plano con red
   activa re-verifica y mantiene `isOnline = true`.
3. **Queries normales no interrumpidas**: Verificar que el módulo no interfiere
   con queries en curso cuando hay conexión.
4. **Reconexión dispara `resumePausedMutations`**: Verificar que al pasar de
   offline a online se llama `queryClient.resumePausedMutations()`.

### Unit Tests

- Verificar que el listener de NetInfo llama a `setOnline(false)` al recibir
  `{ isConnected: false }`.
- Verificar que el fetch HEAD se aborta a los 3 s con AbortController.
- Verificar que el log incluye timestamp ISO al cambiar de estado.
- Verificar que `ConnectionBanner` renderiza el banner rojo cuando `isOnline`
  es `false` y el banner verde cuando vuelve a `true`.
- Verificar que `ConnectionBanner` no renderiza nada cuando `isOnline` es `true`
  pasados los 1.5 s de animación de salida.

### Property-Based Tests

- Generar estados de NetInfo aleatorios (`isConnected: boolean`,
  `isInternetReachable: boolean | null`) y verificar que la lógica de
  `comprobarConexion` produce el valor correcto de `setOnline`.
- Generar secuencias aleatorias de online/offline y verificar que el banner
  siempre muestra el estado correcto.
- Verificar que para cualquier estado donde `isConnected = true &&
  isInternetReachable !== false`, el `onlineManager` queda online.

### Integration Tests

- Flujo completo: app arranca con red → pierde red → banner aparece → red vuelve
  → banner de reconexión → se oculta → mutación pendiente se reintenta.
- Verificar que cambiar de tab mientras el banner está visible no lo oculta
  prematuramente.
- Verificar que el layout `_layout.tsx` compila y monta sin errores TypeScript
  después de agregar `<ConnectionBanner />`.
