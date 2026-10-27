// Un favorito tal como lo devuelve MockAPI (con id)
export interface Favorito {
  id: string;
  personajeId: number;
  nombre: string;
  imagen: string;
  nota: string;
  creadoEn: string;
}

// Lo que enviamos al crear: el id lo genera MockAPI
export type NuevoFavorito = Omit<Favorito, 'id'>;