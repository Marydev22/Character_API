import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tiempos en milisegundos
const UN_DIA = 1000 * 60 * 60 * 24;
const SIETE_DIAS = UN_DIA * 7;

// Tiempos de frescura por tipo de dato (DEFINICIÓN DEL staleTime)

export const STALE_PERSONAJES = UN_DIA; // Personajes: datos públicos que casi no cambian

export const STALE_FAVORITOS = 0; // Favoritos: datos del usuario, siempre se comprueban


// Tiempo máximo que la caché guardada en el teléfono sigue siendo válida
export const PERSIST_MAX_AGE = SIETE_DIAS;

// Tiempo por defecto de los datos en memoria (DEFINICIÓN DE gcTime y de la persistencia)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      
      // Debe ser igual o mayor que PERSIST_MAX_AGE, caso contrario la cache se borrara antes de tiempo
      gcTime: SIETE_DIAS,
    },
  },
});

// Persister: traduce la caché a texto y la guarda en AsyncStorage
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});