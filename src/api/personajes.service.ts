import { rickMortyApi } from '@/api/client';
import type { Personaje, PersonajesPagina } from '@/types/personaje';

export const personajesService = {
  // Trae una página de 20 personajes: /character?page=N
  getPagina: async (page: number): Promise<PersonajesPagina> => {
    console.log('[rm] baseURL:', rickMortyApi.defaults.baseURL, 'página:', page);
    const { data } = await rickMortyApi.get<PersonajesPagina>('character', {
      params: { page },
      
    });
    return data;
  },

  // Trae un personaje por su id: /character/N
  getPorId: async (id: number): Promise<Personaje> => {
    const { data } = await rickMortyApi.get<Personaje>(`character/${id}`);
    return data;
  },
};