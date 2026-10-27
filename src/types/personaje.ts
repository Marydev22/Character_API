// Estados posibles que la API devuelve en el campo "status"
export type EstadoPersonaje = 'Alive' | 'Dead' | 'unknown';

// Un personaje, con solo los campos que usa la app
export interface Personaje {
  id: number;
  name: string;
  status: EstadoPersonaje;
  species: string;
  image: string;
}

// Lo que devuelve /character?page=N
export interface PersonajesPagina {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Personaje[];
}