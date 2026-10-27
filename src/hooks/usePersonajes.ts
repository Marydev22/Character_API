import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { personajesService } from '@/api/personajes.service';
import { queryKeys } from '@/query/queryKeys';
import { STALE_PERSONAJES } from '@/query/queryClient';

// Una página de la lista de personajes
export function usePersonajesPagina(pagina: number) {

    // useQuery recibe una clave y una función. queryKey dice dónde guardar el 
    // dato en la caché. queryFn dice cómo obtenerlo. Si otra pantalla pide 
    // la misma página, TanStack reutiliza la copia en lugar de repetir la petición.
  return useQuery({
    queryKey: queryKeys.personajes.lista(pagina),
    queryFn: () => personajesService.getPagina(pagina),
    staleTime: STALE_PERSONAJES,
    
    placeholderData: keepPreviousData,
  });
}

// personaje por su id
export function usePersonaje(id: number) {
  return useQuery({
    queryKey: queryKeys.personajes.detalle(id),
    queryFn: () => personajesService.getPorId(id),
    staleTime: STALE_PERSONAJES, // 24h del dato "fresco" antes de volver a pedirlo
  });
}