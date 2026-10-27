# Bugfix Requirements Document

## Introduction

El `onlineManager` de TanStack Query usa `expo-network` (`Network.addNetworkStateListener`) para detectar cambios de conectividad en tiempo real. En Android (y en algunos dispositivos iOS) este listener no dispara cuando se pierde la conexión — solo reacciona cuando cambia el *tipo* de red (p.ej., WiFi → datos móviles). Como resultado, al desactivar el WiFi o los datos, el `onlineManager` permanece marcado como online, las mutaciones pendientes no se pausan, y el indicador visual de conexión (inexistente aún) no se muestra. Adicionalmente, el fetch HEAD de verificación no tiene timeout explícito, por lo que puede tardar hasta ~75 segundos en fallar cuando el dispositivo acaba de perder red.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN el usuario desactiva el WiFi o los datos móviles en Android THEN el sistema no dispara `Network.addNetworkStateListener` y el `onlineManager` permanece marcado como online

1.2 WHEN el `onlineManager` permanece online sin conexión real THEN el sistema intenta ejecutar mutaciones pendientes que no pueden completarse en lugar de pausarlas

1.3 WHEN se ejecuta el fetch HEAD de verificación con el dispositivo recién desconectado THEN el sistema espera hasta ~75 segundos (timeout del SO) antes de detectar la pérdida de conexión

1.4 WHEN la app no tiene conexión THEN el sistema no muestra ningún indicador visual al usuario informando el estado offline

### Expected Behavior (Correct)

2.1 WHEN el usuario desactiva el WiFi o los datos móviles en Android o iOS THEN el sistema SHALL detectar el cambio de conectividad en menos de 2 segundos usando `@react-native-community/netinfo`

2.2 WHEN `@react-native-community/netinfo` detecta pérdida de conexión THEN el sistema SHALL marcar el `onlineManager` como offline, imprimir `[red] sin conexión` con timestamp en consola, y mostrar un banner de "Sin conexión" en pantalla

2.3 WHEN se ejecuta el fetch HEAD de verificación THEN el sistema SHALL aplicar un timeout de entre 3 y 5 segundos para no bloquear la detección de estado offline

2.4 WHEN el usuario recupera la conexión THEN el sistema SHALL marcar el `onlineManager` como online en menos de 2 segundos, imprimir `[red] en línea` con timestamp, ocultar el banner con animación suave, y ejecutar `resumePausedMutations()`

2.5 WHEN una mutación se crea mientras el `onlineManager` está offline THEN el sistema SHALL mantener esa mutación en estado `paused` (no `error`) y enviarla automáticamente al recuperar la conexión

2.6 WHEN el `onlineManager` cambia de estado THEN el sistema SHALL mostrar u ocultar un banner no intrusivo (parte superior o inferior de pantalla) con animación suave

### Unchanged Behavior (Regression Prevention)

3.1 WHEN la app arranca con conexión activa THEN el sistema SHALL CONTINUE TO marcar el `onlineManager` como online y ejecutar las mutaciones pausadas del ciclo anterior

3.2 WHEN la app vuelve al primer plano (`AppState` cambia a `active`) THEN el sistema SHALL CONTINUE TO re-verificar el estado de conexión

3.3 WHEN la conexión es estable y las queries se ejecutan normalmente THEN el sistema SHALL CONTINUE TO comportarse sin interrupciones ni regresiones en la obtención de datos

3.4 WHEN el layout raíz importa el módulo `onlineManager` THEN el sistema SHALL CONTINUE TO no requerir cambios en `src/app/_layout.tsx` salvo agregar el componente de indicador visual

3.5 WHEN el proyecto se construye con TypeScript estricto THEN el sistema SHALL CONTINUE TO compilar sin errores de tipos
