import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useCreacionesPendientes, useEdicionesPendientes } from '@/hooks/usePendientes';
import { Dimensiones, Espacio, Paleta, Radio, Tipografia } from '@/constants/theme';

// Una fila de la lista, venga de MockAPI o de la cola de pendientes
type Fila = {
  clave: string;
  id?: string; // no existe mientras la creacion esta pendiente
  nombre: string;
  imagen: string;
  nota: string;
  etiqueta: string | null;
};

export default function FavoritosScreen() {
  const router = useRouter();
  const { data: favoritos, isPending, isError, refetch } = useFavoritos();
  const creaciones = useCreacionesPendientes();
  const ediciones = useEdicionesPendientes();

  const filasPorPersonaje = new Map<number, Fila>();

  creaciones.forEach((c) => {
    filasPorPersonaje.set(c.datos.personajeId, {
      clave: `nuevo-${c.datos.personajeId}`,
      nombre: c.datos.nombre,
      imagen: c.datos.imagen,
      nota: c.datos.nota,
      etiqueta: 'Pendiente de enviar',
    });
  });

  (favoritos ?? []).forEach((f) => {
    if (filasPorPersonaje.has(f.personajeId)) return;
    const editada = ediciones.find((e) => e.id === f.id);
    filasPorPersonaje.set(f.personajeId, {
      clave: `favorito-${f.personajeId}`,
      id: f.id,
      nombre: f.nombre,
      imagen: f.imagen,
      nota: editada?.nota ?? f.nota,
      etiqueta: editada ? 'Nota pendiente de enviar' : null,
    });
  });

  const filas = Array.from(filasPorPersonaje.values());

  // Carga inicial: indicador verde neon sobre fondo oscuro
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Paleta.fondo }}>
        <ActivityIndicator accessibilityLabel="Cargando favoritos" size="large" color={Paleta.verdeNeon} />
      </View>
    );
  }

  // Error: "Reintentar" en verde neon es la unica accion disponible
  if (isError && !favoritos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Espacio.md, backgroundColor: Paleta.fondo }}>
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>ARCHIVO FUERA DE LÍNEA</Text>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto, textAlign: 'center' }}>No se pudieron cargar tus favoritos.</Text>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={{ minHeight: Dimensiones.toqueMinimo, justifyContent: 'center', paddingHorizontal: Espacio.lg, borderWidth: 1, borderColor: Paleta.verdeNeon, borderRadius: Radio.sm }}>
          <Text style={{ ...Tipografia.cuerpo, color: Paleta.verdeNeon, fontWeight: 'bold' }}>Reintentar conexión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    // paddingTop xl respeta la barra del sistema
    <View style={{ flex: 1, backgroundColor: Paleta.fondo, paddingTop: Espacio.xl }}>
      {/* Boton de borde: usa solo borde verde neon sin relleno, para no competir con acciones de las filas */}
      <Pressable
        onPress={() => router.navigate('/(tabs)')}
        style={{
          marginHorizontal: Espacio.md,
          marginBottom: Espacio.md,
          padding: Espacio.sm,
          borderRadius: Radio.sm,
          borderWidth: 1,
          borderColor: Paleta.verdeNeon,
          minHeight: Dimensiones.toqueMinimo,
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...Tipografia.cuerpo, color: Paleta.verdeNeon, textAlign: 'center', fontWeight: 'bold' }}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={Paleta.verdeNeon} size={16} /> Ver personajes
        </Text>
      </Pressable>

      <FlatList
        data={filas}
        keyExtractor={(f) => f.clave}
        contentContainerStyle={{ padding: Espacio.md, gap: Espacio.sm }}
        ListEmptyComponent={
          // Texto vacio: textoSecundario para jerarquia, no compite con el boton superior
          <Text style={{ ...Tipografia.cuerpo, color: Paleta.textoSecundario, textAlign: 'center', marginTop: Espacio.xl }}>
            Aun no tienes favoritos.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            disabled={!item.id}
            onPress={() => router.push({ pathname: '/favorito/[id]', params: { id: item.id! } })}
            style={{
              flexDirection: 'row',
              gap: Espacio.sm,
              padding: Espacio.md,
              borderRadius: Radio.md,
              backgroundColor: Paleta.superficie,
              borderWidth: 1,
              borderColor: Paleta.borde,
              // Filas sin id (creaciones pendientes) se ven opacas: aun no estan en el servidor
              opacity: item.id ? 1 : 0.5,
            }}
          >
            <Image source={{ uri: item.imagen }} style={{ width: Dimensiones.miniatura, height: Dimensiones.miniatura, borderRadius: Radio.sm }} />
            <View style={{ flex: 1 }}>
              {/* Nombre: subtitulo para jerarquia dentro de la fila */}
              <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto }}>{item.nombre}</Text>
              {/* Nota o placeholder: textoSecundario comunica ausencia sin alarmar */}
              <Text style={{ ...Tipografia.cuerpo, color: item.nota ? Paleta.textoSecundario : Paleta.textoSecundario, marginTop: Espacio.xs }} numberOfLines={2}>
                {item.nota || 'Sin nota'}
              </Text>
              {/* Etiqueta de pendiente: moradoNeon acompana al texto para no comunicar solo por color */}
              {item.etiqueta && (
                <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon, marginTop: Espacio.xs }}>
                  {item.etiqueta}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}