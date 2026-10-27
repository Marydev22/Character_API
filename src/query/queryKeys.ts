// Claves de consulta: la "dirección" de cada dato en la caché de TanStack Query.
// Se organizan en niveles: de lo más general a lo más específico.
export const queryKeys = {
  personajes: {
    // Nivel raíz: invalidar esta clave afecta a todos los personajes
    all: ['personajes'] as const,
    lista: (pagina: number) => ['personajes', 'lista', pagina] as const,
    detalle: (id: number) => ['personajes', 'detalle', id] as const,
  },
  favoritos: {
    // Nivel raíz: invalidar esta clave afecta a todos los favoritos
    all: ['favoritos'] as const,
    lista: () => ['favoritos', 'lista'] as const,
    detalle: (id: string) => ['favoritos', 'detalle', id] as const,
  },
};