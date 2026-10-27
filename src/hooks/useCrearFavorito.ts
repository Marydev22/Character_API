import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEYS } from '@/query/mutations';
import type { Favorito, NuevoFavorito } from '@/types/favorito';

export function useCrearFavorito() {
  return useMutation<Favorito, Error, NuevoFavorito>({

    mutationKey: MUTATION_KEYS.crearFavorito,
  });
}