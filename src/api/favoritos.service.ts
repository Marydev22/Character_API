import { mockApi } from '@/api/client';
import type { Favorito, NuevoFavorito } from '@/types/favorito';

const creacionesEnCurso = new Map<number, Promise<Favorito>>();

export const favoritosService = {
  // Trae todos los favoritos: GET /favoritos
  getAll: async (): Promise<Favorito[]> => {
    const { data } = await mockApi.get<Favorito[]>('favoritos');
    return data;
  },

  // Crea un favorito: POST /favoritos
  crear: async (nuevo: NuevoFavorito): Promise<Favorito> => {
    const creacionAnterior = creacionesEnCurso.get(nuevo.personajeId);
    if (creacionAnterior) return creacionAnterior;

    const creacion = (async () => {
      const favoritos = await favoritosService.getAll();
      const existente = favoritos.find((favorito) => favorito.personajeId === nuevo.personajeId);
      if (existente) return existente;

      const { data } = await mockApi.post<Favorito>('favoritos', nuevo);
      return data;
    })();

    creacionesEnCurso.set(nuevo.personajeId, creacion);
    try {
      return await creacion;
    } finally {
      creacionesEnCurso.delete(nuevo.personajeId);
    }
  },

  // Reemplaza un favorito completo: PUT /favoritos/ID
  actualizar: async (favorito: Favorito): Promise<Favorito> => {
    const { data } = await mockApi.put<Favorito>(`favoritos/${favorito.id}`, favorito);
    return data;
  },
};