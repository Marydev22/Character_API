import { useMutationState } from '@tanstack/react-query';
import { MUTATION_KEYS } from '@/query/mutations';
import type { Favorito, NuevoFavorito } from '@/types/favorito';


export function useCreacionesPendientes() {
  const pendientes = useMutationState({
    // Solo las mutaciones de creación que están en curso o pausadas
    filters: { mutationKey: MUTATION_KEYS.crearFavorito, status: 'pending' },
    select: (mutation) => ({
      datos: mutation.state.variables as NuevoFavorito,
      pausada: mutation.state.isPaused,
    }),
  });

  const unicos = new Map<number, (typeof pendientes)[number]>();
  pendientes.forEach((pendiente) => {
    if (!unicos.has(pendiente.datos.personajeId)) {
      unicos.set(pendiente.datos.personajeId, pendiente);
    }
  });
  return Array.from(unicos.values());
}

// Ediciones de nota que todavía no se han enviado al servidor
export function useEdicionesPendientes() {
  return useMutationState({
    filters: { mutationKey: MUTATION_KEYS.actualizarNota, status: 'pending' },
    select: (mutation) => mutation.state.variables as Favorito,
  });
}