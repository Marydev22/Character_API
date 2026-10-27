# Deber 4: Consumo de APIs y caché offline con TanStack Query

**Asignatura:** Aplicaciones Móviles (Desarrollo de Software, EPN)

**Estudiante:** Girón Cedeño María Paula

**Tecnologías:** React Native · Expo SDK 58 · TypeScript · Expo Router · Axios · TanStack Query v5 · AsyncStorage · @react-native-community/netinfo



## 1. Descripción

La aplicación muestra un catálogo de personajes de la serie *Rick and Morty* consumido desde una API pública de solo lectura. El usuario puede guardar personajes como favoritos y escribir una nota personal sobre cada uno. Los favoritos se almacenan en MockAPI, un servicio externo de datos simulados.

La app está diseñada para funcionar sin conexión: los datos se guardan en el teléfono y las mutaciones realizadas sin red se conservan y se envían automáticamente al recuperar la conexión.



## 2. Cómo ejecutar el proyecto

### Requisitos

- Node.js 18 o superior
- Expo Go instalado en el teléfono (para probar sin compilar), o un emulador de Android/iOS

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno en la raíz del proyecto
# (ver plantilla en la sección 4.1)

# 3. Iniciar el servidor de desarrollo
npx expo start
```

Una vez iniciado, escanear el QR con Expo Go (Android) o con la cámara (iOS). También se puede presionar `a` para abrir en emulador Android o `i` para iOS.

> **Nota:** si se añade una librería con código nativo, Expo Go deja de ser suficiente y se necesita un development build. En ese caso: `npx expo run:android` o `npx expo run:ios`.



## 3. Fuentes de datos

| Fuente | Tipo | URL base | Uso en la app |
|---|---|---|---|
| Rick and Morty API | Pública, solo lectura | `https://rickandmortyapi.com/api` | Lista y detalle de personajes |
| MockAPI | Propia, lectura y escritura | `https://6ade5e984e88f1bba4a51d48.mockapi.io/` | Favoritos del usuario |

### Endpoints utilizados

| Operación | Método | Endpoint |
|---|---|---|
| Lista paginada de personajes | GET | `/character?page=N` |
| Detalle de un personaje | GET | `/character/{id}` |
| Listar favoritos | GET | `/favoritos` |
| Crear favorito | POST | `/favoritos` |
| Actualizar favorito | PUT | `/favoritos/{id}` |

**Por qué Rick and Morty API:** su lista ya trae los datos necesarios para cada tarjeta (nombre, imagen, estado y especie). PokeAPI, en cambio, devuelve solo el nombre y una URL en la lista, lo que obliga a hacer una segunda petición por cada elemento.



## 4. Configuración del entorno

### 4.1 Variables de entorno

Las URLs base se guardan en `.env` en la raíz del proyecto. El archivo no se sube al repositorio (está en `.gitignore`):

```
EXPO_PUBLIC_MOCKAPI_URL=https://6ade5e984e88f1bba4a51d48.mockapi.io/
EXPO_PUBLIC_RM_API_URL=https://rickandmortyapi.com/api
```

**Por qué el prefijo `EXPO_PUBLIC_`:** Expo reemplaza esas variables por su valor al empaquetar la app, quedando incluidas en el código que se instala en el teléfono. Por esa razón, en este archivo solo van URLs públicas — nunca contraseñas, tokens ni claves privadas.

### 4.2 Clientes HTTP

Se crean dos clientes de Axios independientes con `axios.create`, uno por API. Cada cliente define su URL base y un `timeout` para que una petición sin respuesta falle en lugar de quedarse esperando indefinidamente:

```typescript
// src/api/client.ts
export const mockApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_MOCKAPI_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 segundos
});

export const rickMortyApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_RM_API_URL,
  timeout: 15000, // 15 segundos (la API pública puede ser más lenta)
});
```

**Por qué dos clientes separados:** si cambia la URL de MockAPI, solo se edita una línea en `client.ts`. Los servicios y hooks no sufren el cambio.



## 5. Arquitectura

La aplicación se organiza en capas con una sola responsabilidad cada una. Las pantallas nunca construyen URLs ni llaman directamente a la red.

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Pantallas | `src/app/` | Mostrar datos y capturar acciones del usuario |
| Componentes | `src/components/` | Piezas de UI reutilizables (tarjetas, carrusel, paginación) |
| Hooks | `src/hooks/` | Conectar las pantallas con los datos mediante TanStack Query |
| Servicios | `src/api/` | Agrupar las llamadas HTTP por entidad |
| Cliente HTTP | `src/api/client.ts` | Configurar Axios una sola vez por API |
| Tipos | `src/types/` | Describir la forma de los datos con TypeScript |
| Caché y claves | `src/query/` | Configurar TanStack Query, claves de consulta y mutaciones |



## 6. Navegación

La app usa **Expo Router**, donde cada archivo dentro de `src/app/` es automáticamente una pantalla. Los paréntesis en `(tabs)` crean un grupo que no aparece en la URL.

| Archivo | Pantalla | Cómo llegar |
|---|---|---|
| `src/app/_layout.tsx` | Layout raíz | Siempre activo — configura `PersistQueryClientProvider` y el `Stack` |
| `src/app/(tabs)/_layout.tsx` | Barra de pestañas | Pantalla de inicio |
| `src/app/(tabs)/index.tsx` | Carrusel de personajes | Tab "Personajes" (primera pestaña) |
| `src/app/(tabs)/favoritos.tsx` | Lista de favoritos | Tab "Favoritos" (segunda pestaña) |
| `src/components/personaje/[id].tsx` | Detalle de personaje | Al tocar una tarjeta en el carrusel |
| `src/app/favorito/[id].tsx` | Editar nota de favorito | Al tocar un favorito en la lista |

Los corchetes en `[id]` indican un parámetro dinámico. En el código se lee así:

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```



## 7. Modelo de datos

### 7.1 Personaje (Rick and Morty API)

Solo se tipan los campos que usa la app:

```typescript
// src/types/personaje.ts
export type EstadoPersonaje = 'Alive' | 'Dead' | 'unknown';

export interface Personaje {
  id: number;
  name: string;
  status: EstadoPersonaje;
  species: string;
  image: string;
}
```

La respuesta paginada incluye `info` (`count`, `pages`, `next`, `prev`) y `results`.

### 7.2 Favorito (MockAPI)

| Campo | Tipo | Origen |
|---|---|---|
| `id` | `string` | Lo genera MockAPI automáticamente |
| `personajeId` | `number` | ID del personaje en Rick and Morty API |
| `nombre` | `string` | Copia del nombre, para mostrarlo sin conexión |
| `imagen` | `string` | Copia de la URL de la imagen |
| `nota` | `string` | Escrita por el usuario |
| `creadoEn` | `string` ISO 8601 | Fecha de creación |

`NuevoFavorito` es `Favorito` sin el campo `id`, porque el id lo asigna el servidor:

```typescript
export type NuevoFavorito = Omit<Favorito, 'id'>;
```

**Por qué copiar nombre e imagen:** si la API pública no responde, el favorito sigue mostrando su información sin depender de una segunda petición.

### 7.3 PUT como reemplazo completo

MockAPI trata `PUT` como reemplazo total del registro. Si se enviara solo `{ nota }`, el registro perdería `nombre`, `imagen` y `personajeId`. Por eso `actualizar` siempre recibe el objeto `Favorito` completo.



## 8. Claves de consulta (`queryKeys`)

Las claves de consulta son el "identificador postal" de cada dato en la caché. TanStack Query las usa para saber qué dato devolver, cuándo está desactualizado y qué invalidar después de una mutación.

Se organizan en jerarquía: invalidar la clave raíz afecta a todo el grupo.

```typescript
// src/query/queryKeys.ts
export const queryKeys = {
  personajes: {
    all: ['personajes'] as const,                              // invalida todos los personajes
    lista: (pagina: number) => ['personajes', 'lista', pagina] as const,
    detalle: (id: number) => ['personajes', 'detalle', id] as const,
  },
  favoritos: {
    all: ['favoritos'] as const,                               // invalida todos los favoritos
    lista: () => ['favoritos', 'lista'] as const,
    detalle: (id: string) => ['favoritos', 'detalle', id] as const,
  },
};
```

Las claves de mutación viven en `src/query/mutations.ts`:

```typescript
export const MUTATION_KEYS = {
  crearFavorito: ['crearFavorito'] as const,
  actualizarNota: ['actualizarNota'] as const,
};
```

### 8.1 Qué se invalida después de cada mutación

| Mutación | Claves invalidadas | Motivo |
|---|---|---|
| Crear favorito | `favoritos.lista()` | Hay un elemento nuevo en la lista |
| Editar nota | `favoritos.lista()` y `favoritos.detalle(id)` | Cambió el dato tanto en la lista como en el detalle |

No se invalidan los personajes de la API pública porque esas operaciones no los modifican.



## 9. Tiempos de caché

### 9.1 Valores configurados

```typescript
// src/query/queryClient.ts
const UN_DIA    = 1000 * 60 * 60 * 24;
const SIETE_DIAS = UN_DIA * 7;

export const STALE_PERSONAJES  = UN_DIA;    // 24 horas
export const STALE_FAVORITOS   = 0;         // siempre desactualizado
export const PERSIST_MAX_AGE   = SIETE_DIAS;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: SIETE_DIAS },
  },
});
```

| Parámetro | Dato | Valor | Justificación |
|---|---|---|---|
| `staleTime` | Personajes (API pública) | 24 h | Los personajes de la serie no cambian. No hace falta volver a pedirlos en cada visita. |
| `staleTime` | Favoritos (MockAPI) | 0 s | Los favoritos los modifica el propio usuario. Cada apertura debe comprobar el servidor para mostrar el estado real. |
| `gcTime` | Toda la caché en memoria | 7 días | Debe ser igual o mayor que `maxAge` del persister. |
| `maxAge` | Caché guardada en el teléfono | 7 días | Permite abrir la app sin conexión durante una semana y ver datos. |

**`staleTime` no está en `defaultOptions`:** cada hook importa la constante que le corresponde y la pasa directamente. Esto hace explícito qué tiempo aplica a qué dato:

```typescript
// src/hooks/usePersonajes.ts
return useQuery({
  queryKey: queryKeys.personajes.lista(pagina),
  queryFn:  () => personajesService.getPagina(pagina),
  staleTime: STALE_PERSONAJES, // 24 h
  placeholderData: keepPreviousData,
});

// src/hooks/useFavoritos.ts
return useQuery({
  queryKey: queryKeys.favoritos.lista(),
  queryFn:  () => favoritosService.getAll(),
  staleTime: STALE_FAVORITOS,  // 0
});
```

### 9.2 Por qué `gcTime` debe ser mayor o igual que `maxAge`

`gcTime` es el tiempo que un dato sin uso permanece en **memoria**. `maxAge` es la vigencia de lo que está guardado en **el teléfono**.

Si `gcTime` fuera menor que `maxAge`, TanStack Query borraría el dato de la memoria antes de que el persister lo pudiera guardar o considerarlo vigente. Al abrir la app sin conexión, no habría nada que mostrar.

**Ejemplo concreto:** si `gcTime = 1 hora` y `maxAge = 7 días`, el dato se borra de memoria al cabo de una hora. La próxima vez que se abre la app, el persister intenta restaurar la caché, pero TanStack Query la descarta de inmediato porque ya expiró por `gcTime`. Pantalla en blanco sin conexión.



## 10. Persistencia de la caché

La caché se guarda en el teléfono con `@tanstack/query-async-storage-persister` sobre AsyncStorage. El proveedor `PersistQueryClientProvider` la restaura al iniciar la app, de modo que los datos aparecen en pantalla **antes** de que termine la petición de red.

```typescript
// src/app/_layout.tsx
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: PERSIST_MAX_AGE }}
  onSuccess={() => {
    // 1. Reenvía las mutaciones que quedaron pausadas sin conexión
    queryClient.resumePausedMutations().then(() => {
      // 2. Marca todos los datos como desactualizados para refrescarlos en segundo plano
      queryClient.invalidateQueries();
    });
  }}
>
```

**Flujo de arranque:**

1. La app abre → `PersistQueryClientProvider` carga la caché de AsyncStorage
2. Los datos aparecen en pantalla de inmediato (desde la caché)
3. Cuando termina de restaurar, `onSuccess` llama a `resumePausedMutations()` → las mutaciones pendientes se envían al servidor
4. Luego llama a `invalidateQueries()` → TanStack pide versiones frescas en segundo plano sin bloquear la pantalla



## 11. Mutaciones sin conexión

Cinco archivos trabajan juntos para que las operaciones hechas sin red se reenvíen solas al recuperar la conexión y el usuario vea el estado en pantalla en tiempo real.

### 11.1 `onlineManager.ts` — detección de conectividad real

#### Por qué `@react-native-community/netinfo` en lugar de `expo-network`

`expo-network` tiene un problema crítico en Android: su listener (`Network.addNetworkStateListener`) solo dispara cuando **cambia el tipo de red** (por ejemplo, de WiFi a datos móviles). Si el usuario apaga el WiFi sin que haya otra red disponible, el evento nunca llega. El `onlineManager` de TanStack se queda creyendo que hay conexión, las mutaciones pendientes no se pausan y los logs de consola no muestran nada.

`@react-native-community/netinfo` usa APIs nativas de cada plataforma (Android `ConnectivityManager`, iOS `NWPathMonitor`) y dispara ante **cualquier cambio de conectividad real**, sin importar el tipo de red. Es la biblioteca que la documentación oficial de TanStack Query recomienda para este uso.

Adicionalmente, el fetch HEAD que verifica la conexión real tampoco tenía límite de tiempo: si el teléfono acaba de perder red, el sistema operativo puede tardar hasta 75 segundos en cerrar la conexión. Eso significa 75 segundos de ventana donde la app sigue pareciendo online. La solución es un `AbortController` con un timeout de 3 segundos.

| Aspecto | `expo-network` (antes) | `@react-native-community/netinfo` (ahora) |
|---|---|---|
| Detecta pérdida de WiFi en Android | ❌ Solo detecta cambio de tipo | ✅ Detecta cualquier cambio de conectividad |
| API subyacente | JavaScript polling | Nativa: `ConnectivityManager` / `NWPathMonitor` |
| Timeout del fetch HEAD | ❌ Sin límite (~75 s) | ✅ AbortController de 3 s |
| Recomendado por TanStack Query | ❌ | ✅ |

#### Implementación

```typescript
// src/query/onlineManager.ts
const FETCH_TIMEOUT_MS = 3_000; // aborta si no responde en 3 s

async function comprobarConexion(setOnline: (online: boolean) => void) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Paso 1: consulta rápida a NetInfo (sin red → sale aquí)
    const estado = await NetInfo.fetch();
    if (estado.isConnected === false || estado.isInternetReachable === false) {
      clearTimeout(timer);
      actualizarEstado(false, setOnline);
      return;
    }
    // Paso 2: HEAD real a la API para confirmar internet funcional
    const respuesta = await fetch(URL_COMPROBACION, {
      method: 'HEAD',
      signal: controller.signal, // se cancela en 3 s
    });
    clearTimeout(timer);
    actualizarEstado(respuesta.ok, setOnline);
  } catch {
    clearTimeout(timer);
    actualizarEstado(false, setOnline);
  }
}

onlineManager.setEventListener((setOnline) => {
  void comprobarConexion(setOnline);

  // NetInfo: dispara ante cualquier cambio de conectividad real
  const unsubscribeNetInfo = NetInfo.addEventListener(() => {
    void comprobarConexion(setOnline);
  });
  // Respaldo al volver la app al primer plano
  const appStateSub = AppState.addEventListener('change', (estado) => {
    if (estado === 'active') void comprobarConexion(setOnline);
  });
  // Polling de seguridad cada 10 s
  const interval = setInterval(() => void comprobarConexion(setOnline), 10_000);

  return () => {
    unsubscribeNetInfo(); // NetInfo devuelve una función directa (no .remove())
    appStateSub.remove();
    clearInterval(interval);
  };
});
```

La función `actualizarEstado` es la que imprime el log con timestamp y detecta la transición `offline → online` para llamar a `queryClient.resumePausedMutations()`:

```typescript
function actualizarEstado(online: boolean, setOnline: (online: boolean) => void) {
  const timestamp = new Date().toISOString();
  console.log(`[red] ${online ? 'en linea' : 'sin conexion'} — ${timestamp}`);
  setOnline(online);

  // Solo al reconectarse (transición false → true)
  if (online && ultimoEstado === false) {
    console.log(`[red] reconectado — reanudando mutaciones pendientes — ${timestamp}`);
    void queryClient.resumePausedMutations();
  }
  ultimoEstado = online;
}
```

Los logs con timestamp ISO son útiles para el video de demostración: muestran exactamente cuándo la app detectó el cambio de red.

### 11.2 `ConnectionBanner.tsx` — indicador visual de estado de red

El componente `ConnectionBanner` muestra un banner animado en la parte superior de la pantalla. Está montado en el layout raíz (`_layout.tsx`) para que aparezca en cualquier pantalla sin importar en qué tab esté el usuario.

**Comportamiento:**
- Al **perder** la conexión: aparece un banner rojo `#FF4444` con el texto "✕ Sin conexión". Se desliza desde arriba con una animación de 300 ms.
- Al **recuperar** la conexión: el banner cambia a verde neón `#39FF14` con "✓ Conexión restaurada" y desaparece solo después de 1.5 segundos.
- Cuando la app arranca con conexión activa: no muestra nada.

Usa Reanimated v4 (`useSharedValue`, `withTiming`, `withDelay`) para que la animación corra en el hilo de UI y no bloquee el hilo de JavaScript.

El estado de red llega a través del hook `useOnlineStatus`, que se suscribe directamente al `onlineManager` de TanStack. Así hay una única fuente de verdad: el mismo objeto que controla las mutaciones controla el banner.

```typescript
// src/components/ConnectionBanner.tsx
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => {
    // onlineManager.subscribe devuelve la función de limpieza directamente
    const unsubscribe = onlineManager.subscribe((online) => setIsOnline(online));
    return unsubscribe;
  }, []);

  return isOnline;
}
```

El componente se monta en `_layout.tsx` con `position: 'absolute'` y `zIndex: 9999` para superponerse a cualquier contenido. Usa `useSafeAreaInsets` para respetar el notch del teléfono:

```tsx
// src/app/_layout.tsx
<ThemeProvider value={...}>
  <AnimatedSplashOverlay />
  <ConnectionBanner />  {/* siempre visible sobre todo el contenido */}
  <Stack>...</Stack>
</ThemeProvider>
```

### 11.3 `mutations.ts` — registro de mutaciones con `setMutationDefaults`

`setMutationDefaults` le dice a TanStack Query cómo ejecutar cada mutación cuando se reanude. Sin esto, TanStack no sabría qué función llamar al reconectarse.

```typescript
// src/query/mutations.ts
queryClient.setMutationDefaults(MUTATION_KEYS.crearFavorito, {
  mutationFn: (nuevo: NuevoFavorito) => favoritosService.crear(nuevo),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.lista() });
  },
});

queryClient.setMutationDefaults(MUTATION_KEYS.actualizarNota, {
  mutationFn: (favorito: Favorito) => favoritosService.actualizar(favorito),
  onSuccess: (_data, favorito) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.lista() });
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.detalle(favorito.id) });
  },
});
```

### 11.4 `usePendientes.ts` — leer las mutaciones en vuelo

`useMutationState` devuelve el estado actual de todas las mutaciones que coincidan con una clave. Las pantallas lo usan para mostrar el indicador visual.

```typescript
// src/hooks/usePendientes.ts
export function useCreacionesPendientes() {
  return useMutationState({
    filters: { mutationKey: MUTATION_KEYS.crearFavorito, status: 'pending' },
    select: (mutation) => ({
      datos: mutation.state.variables as NuevoFavorito,
      pausada: mutation.state.isPaused,
    }),
  });
}
```

### 11.5 Indicadores visuales en pantalla

**`TarjetaPersonaje`** muestra el estado del botón "Guardar en favoritos":

| Estado | Etiqueta en pantalla |
|---|---|
| Guardando (con red) | `Guardando...` |
| Mutación pausada (sin red) | `Pendiente de enviar` |
| Ya guardado en MockAPI | `Ya está en favoritos` |
| Error en el envío | `Reintentar` |

**`FavoritosScreen`** muestra una etiqueta morada junto a cada fila:

| Estado | Etiqueta |
|---|---|
| Creación aún no enviada | `Pendiente de enviar` (fila semitransparente, no se puede tocar) |
| Nota editada aún no enviada | `Nota pendiente de enviar` |

### 11.6 Deduplicación en `favoritos.service.ts`

Cuando se recupera la red y `resumePausedMutations()` reenvía las mutaciones acumuladas, puede haber más de una petición de creación para el mismo personaje. Para evitar duplicados en MockAPI, el servicio hace un GET antes del POST:

```typescript
crear: async (nuevo: NuevoFavorito) => {
  // Evita condición de carrera si se llama dos veces seguido
  const creacionAnterior = creacionesEnCurso.get(nuevo.personajeId);
  if (creacionAnterior) return creacionAnterior;

  const creacion = (async () => {
    const favoritos = await favoritosService.getAll();
    const existente = favoritos.find(f => f.personajeId === nuevo.personajeId);
    if (existente) return existente; // ya existe, no hace falta el POST
    const { data } = await mockApi.post('favoritos', nuevo);
    return data;
  })();

  creacionesEnCurso.set(nuevo.personajeId, creacion);
  // ...
}
```



## 12. Componentes propios

| Componente | Archivo | Función |
|---|---|---|
| `TarjetaPersonaje` | `src/components/TarjetaPersonaje.tsx` | Muestra imagen, nombre, estado y especie de un personaje. Tiene el botón de guardar en favoritos con todos sus estados. |
| `CarruselPersonajes` | `src/components/CarruselPersonajes.tsx` | `FlatList` horizontal paginada. Al llegar al último elemento desliza a la siguiente página; al llegar al primero, a la anterior. |
| `PaginacionBotones` | `src/components/PaginacionBotones.tsx` | Botones "Anterior" y "Siguiente" con número de página. Se deshabilitan cuando no hay más páginas. |
| `ConnectionBanner` | `src/components/ConnectionBanner.tsx` | Banner animado (Reanimated v4) que aparece al perder conexión (rojo) y al recuperarla (verde neón). Se superpone a cualquier pantalla. |
| Detalle de personaje | `src/components/personaje/[id].tsx` | Pantalla de detalle que muestra imagen, nombre, estado y especie. Usa `usePersonaje(id)` con `staleTime` de 24 h. |



## 13. Estado del proyecto

| Bloque | Contenido | Estado |
|---|---|---|
| 1 | Proyecto y dependencias | ✅ Completado |
| 2 | Variables de entorno y clientes HTTP | ✅ Completado |
| 3 | Tipos y servicios | ✅ Completado |
| 4 | `queryKeys`, `QueryClient` y persistencia | ✅ Completado |
| 5 | Detección de conexión (`@react-native-community/netinfo`) y banner visual | ✅ Completado |
| 6 | Pantalla de personajes (carrusel y paginación) | ✅ Completado |
| 7 | Favoritos: crear, editar y mutaciones sin conexión | ✅ Completado |
| 8 | Tema oscuro neón | ✅ Completado |



## 14. Glosario

- **Query:** lectura de datos del servidor administrada por TanStack Query.
- **Mutación:** operación que modifica datos en el servidor (crear, editar o eliminar).
- **Clave de consulta (`queryKey`):** identificador de un dato en la caché. Si dos hooks usan la misma clave, comparten el mismo dato.
- **`mutationKey`:** identificador de una mutación, usado para registrarla con `setMutationDefaults` y consultarla con `useMutationState`.
- **`staleTime`:** tiempo durante el cual un dato se considera fresco y no se vuelve a pedir al servidor.
- **`gcTime`:** tiempo que un dato sin uso permanece en memoria antes de eliminarse.
- **Invalidación:** marcar un dato como desactualizado para que TanStack Query lo vuelva a pedir en la próxima oportunidad.
- **Persistencia:** guardar la caché en el almacenamiento del teléfono para que esté disponible al abrir la app sin conexión.
- **`onlineManager`:** componente de TanStack Query que le indica si hay conexión. Cuando pasa de offline a online, reanuda las mutaciones pausadas.
- **`setMutationDefaults`:** registra la función y el comportamiento de una mutación antes de ejecutarla. Permite que TanStack la reanude tras reconexión.
- **`resumePausedMutations()`:** reenvía al servidor todas las mutaciones que quedaron pausadas sin conexión.
- **`useMutationState`:** hook que lee el estado actual de todas las mutaciones activas por su clave. Se usa para mostrar indicadores visuales de "pendiente".
- **`placeholderData` / `keepPreviousData`:** muestra los datos de la página anterior mientras carga la siguiente, evitando pantallas en blanco al paginar.
- **`PersistQueryClientProvider`:** proveedor que carga y guarda la caché en AsyncStorage automáticamente al iniciar y cerrar la app.
- **`AbortController`:** API estándar del navegador/Node disponible en React Native. Permite cancelar un `fetch` en curso. Se usa para que el HEAD de verificación de conexión no bloquee más de 3 segundos.
- **`ConnectionBanner`:** componente que muestra el estado de red en pantalla. Se suscribe al `onlineManager` mediante `onlineManager.subscribe()` para reaccionar en tiempo real sin lógica duplicada.



## 15. Referencias

- TanStack Query v5: https://tanstack.com/query/latest
- Expo docs: https://docs.expo.dev/
- Rick and Morty API: https://rickandmortyapi.com/documentation
- MockAPI: https://mockapi.io/docs
- Expo Router: https://docs.expo.dev/router/introduction
- AsyncStorage: https://docs.expo.dev/versions/latest/sdk/async-storage/
- @react-native-community/netinfo: https://github.com/react-native-netinfo/react-native-netinfo
- TanStack Query — onlineManager: https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
