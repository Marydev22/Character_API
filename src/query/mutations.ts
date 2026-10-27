import { queryClient } from '@/query/queryClient';
import { queryKeys } from '@/query/queryKeys';
import { favoritosService } from '@/api/favoritos.service';
import type { Favorito, NuevoFavorito } from '@/types/favorito';

// Identificadores de las mutaciones: se usan para registrarlas y para buscarlas
export const MUTATION_KEYS = {
  crearFavorito: ['crearFavorito'] as const,
  actualizarNota: ['actualizarNota'] as const,
};

// Registro de la mutación de creación
queryClient.setMutationDefaults(MUTATION_KEYS.crearFavorito, {
  mutationFn: (nuevo: NuevoFavorito) => favoritosService.crear(nuevo),
  onSuccess: () => {
    // Hay un favorito nuevo: la lista debe volver a pedirse
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.lista() });
  },
});

// Registro de la mutación de edición
queryClient.setMutationDefaults(MUTATION_KEYS.actualizarNota, {
  mutationFn: (favorito: Favorito) => favoritosService.actualizar(favorito),
  onSuccess: (_data, favorito) => {
    // Cambió el dato en la lista y en su detalle
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.lista() });
    queryClient.invalidateQueries({ queryKey: queryKeys.favoritos.detalle(favorito.id) });
  },
});