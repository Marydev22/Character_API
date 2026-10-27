import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { usePersonaje } from '@/hooks/usePersonajes';
import { Dimensiones, Espacio, Paleta, Radio, Tipografia } from '@/constants/theme';

// Misma funcion visual que en TarjetaPersonaje: color segun estado del personaje
function colorEstado(status: string): string {
  if (status === 'Alive') return Paleta.verdeNeon;
  if (status === 'Dead') return Paleta.error;
  return Paleta.moradoNeon;
}

export default function PersonajeDetalleScreen() {
  // Lee el parametro "id" de la URL, que llega como texto
  const { id } = useLocalSearchParams<{ id: string }>();
  const personajeId = Number(id);

  const { data, isPending, isError, refetch } = usePersonaje(personajeId);

  // Carga: indicador verde neon centrado sobre fondo oscuro
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Paleta.fondo }}>
        <ActivityIndicator accessibilityLabel="Cargando personaje" size="large" color={Paleta.verdeNeon} />
      </View>
    );
  }

  // Error: boton "Reintentar" en verde neon como unica accion disponible
  if (isError || !data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Espacio.md, backgroundColor: Paleta.fondo }}>
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>SEÑAL INTERRUMPIDA</Text>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto, textAlign: 'center' }}>No se pudo cargar el personaje.</Text>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={{ minHeight: Dimensiones.toqueMinimo, justifyContent: 'center', paddingHorizontal: Espacio.lg, borderWidth: 1, borderColor: Paleta.verdeNeon, borderRadius: Radio.sm }}>
          <Text style={{ ...Tipografia.cuerpo, color: Paleta.verdeNeon, fontWeight: 'bold' }}>Reintentar conexión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {/* Encabezado del stack: fondo oscuro, tint verde neon, titulo con tipografia subtitulo */}
      <Stack.Screen options={{
        title: data.name,
        headerStyle: { backgroundColor: Paleta.fondo },
        headerTintColor: Paleta.verdeNeon,
        headerTitleStyle: { ...Tipografia.subtitulo, color: Paleta.texto },
      }} />

      <ScrollView contentContainerStyle={{ padding: Espacio.lg, backgroundColor: Paleta.fondo, flexGrow: 1 }}>
        {/* Imagen principal: radio lg y borde morado neon de 1 px como marco de acento */}
        <Image
          source={{ uri: data.image }}
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: Radio.lg,
            borderWidth: 1,
            borderColor: Paleta.moradoNeon,
          }}
        />

        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon, marginTop: Espacio.lg }}>
          ARCHIVO DE ENTIDAD
        </Text>
        <Text style={{ ...Tipografia.titulo, color: Paleta.texto, marginTop: Espacio.lg }}>
          {data.name}
        </Text>

        {/* Etiquetas de datos: superficie como fondo para destacar del fondo de pantalla */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Espacio.sm, marginTop: Espacio.md }}>
          {/* Estado con color semantico: el color comunica vivo/muerto/desconocido */}
          <View style={{ backgroundColor: Paleta.superficie, borderRadius: Radio.sm, paddingHorizontal: Espacio.sm, paddingVertical: Espacio.xs }}>
            <Text style={{ ...Tipografia.etiqueta, color: colorEstado(data.status) }}>
              Estado: {data.status}
            </Text>
          </View>

          {/* Especie en textoSecundario: informacion de apoyo, sin competir con el estado */}
          <View style={{ backgroundColor: Paleta.superficie, borderRadius: Radio.sm, paddingHorizontal: Espacio.sm, paddingVertical: Espacio.xs }}>
            <Text style={{ ...Tipografia.etiqueta, color: Paleta.textoSecundario }}>
              Especie: {data.species}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}