import { useQuery } from '@tanstack/react-query';
import { favoritosService } from '@/api/favoritos.service';
import { queryKeys } from '@/query/queryKeys';
import { STALE_FAVORITOS } from '@/query/queryClient';

// Lista de favoritos guardados en MockAPI
export function useFavoritos() {
  return useQuery({
    queryKey: queryKeys.favoritos.lista(),
    queryFn: () => favoritosService.getAll(),
    select: (favoritos) => {
      const unicos = new Map<number, (typeof favoritos)[number]>();
      favoritos.forEach((favorito) => {
        if (!unicos.has(favorito.personajeId)) {
          unicos.set(favorito.personajeId, favorito);
        }
      });
      return Array.from(unicos.values());
    },
    // cada vez que se abre la pantalla, se comprueba el servidor
    staleTime: STALE_FAVORITOS,
  });
}