import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEYS } from '@/query/mutations';
import type { Favorito } from '@/types/favorito';

// Edita un favorito completo. La función que hace el PUT está en mutations.ts
export function useActualizarNota() {
  return useMutation<Favorito, Error, Favorito>({
    mutationKey: MUTATION_KEYS.actualizarNota,
  });
}