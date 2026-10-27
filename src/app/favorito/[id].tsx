import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useActualizarNota } from '@/hooks/useActualizarNota';
import { Dimensiones, Espacio, Paleta, Radio, Tipografia } from '@/constants/theme';

export default function EditarFavoritoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: favoritos, isPending: cargandoFavoritos, isError: errorFavoritos, refetch } = useFavoritos();
  const { mutate, isPending: guardando, isError: errorGuardando } = useActualizarNota();

  // null significa "el usuario todavia no escribio nada"
  const [notaEditada, setNotaEditada] = useState<string | null>(null);
  // Estado visual puro: controla el borde del campo de texto; no afecta la logica de notaEditada
  const [enfocado, setEnfocado] = useState(false);

  const favorito = favoritos?.find((f) => String(f.id) === String(id));

  // Carga: indicador verde neon sobre fondo oscuro
  if (cargandoFavoritos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Paleta.fondo }}>
        <ActivityIndicator accessibilityLabel="Cargando favorito" size="large" color={Paleta.verdeNeon} />
      </View>
    );
  }

  // Error: "Reintentar" en verde neon como unica accion
  if (errorFavoritos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Espacio.md, backgroundColor: Paleta.fondo }}>
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>SEÑAL DE ARCHIVO INTERRUMPIDA</Text>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto, textAlign: 'center' }}>No se pudo cargar el favorito.</Text>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={{ minHeight: Dimensiones.toqueMinimo, justifyContent: 'center', paddingHorizontal: Espacio.lg, borderWidth: 1, borderColor: Paleta.verdeNeon, borderRadius: Radio.sm }}>
          <Text style={{ ...Tipografia.cuerpo, color: Paleta.verdeNeon, fontWeight: 'bold' }}>Reintentar conexión</Text>
        </Pressable>
      </View>
    );
  }

  if (!favorito) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Paleta.fondo }}>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto }}>Favorito no encontrado.</Text>
      </View>
    );
  }

  // Si el usuario escribio, usa lo escrito; si no, la nota guardada
  const nota = notaEditada ?? favorito.nota;

  const guardar = () => {
    // PUT reemplaza el registro completo: enviamos el favorito entero con la nota nueva
    mutate({ ...favorito, nota }, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <>
      {/* Encabezado del stack: fondo oscuro, tint verde neon para el boton de regreso */}
      <Stack.Screen options={{
        title: favorito.nombre,
        headerStyle: { backgroundColor: Paleta.fondo },
        headerTintColor: Paleta.verdeNeon,
        headerTitleStyle: { ...Tipografia.subtitulo, color: Paleta.texto },
      }} />
      <View style={{ flex: 1, backgroundColor: Paleta.fondo, padding: Espacio.lg, gap: Espacio.md }}>
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>REGISTRO DE EXPLORADOR</Text>
        <Image source={{ uri: favorito.imagen }} style={{ width: '100%', aspectRatio: 1, borderRadius: Radio.lg }} />

        {/* Nombre del personaje: tipografia titulo para jerarquia clara */}
        <Text style={{ ...Tipografia.titulo, color: Paleta.texto }}>{favorito.nombre}</Text>

        {/* Etiqueta del campo: textoSecundario para no competir con el input */}
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.textoSecundario }}>Mi nota</Text>

        {/* Campo de texto: borde borde en reposo, moradoNeon al enfocar — solo cambia el estilo */}
        <TextInput
          value={nota}
          onChangeText={setNotaEditada}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          multiline
          placeholder="Escribe algo sobre este personaje"
          placeholderTextColor={Paleta.textoSecundario}
          style={{
            ...Tipografia.cuerpo,
            color: Paleta.texto,
            borderWidth: 1,
            // Borde moradoNeon al enfocar: retroalimentacion visual sin cambiar logica
            borderColor: enfocado ? Paleta.moradoNeon : Paleta.borde,
            borderRadius: Radio.md,
            padding: Espacio.md,
            minHeight: 100,
            textAlignVertical: 'top',
            backgroundColor: Paleta.superficie,
          }}
        />

        {/* Boton guardar: fondo verde neon, texto fondo oscuro para contraste maximo */}
        <Pressable
          onPress={guardar}
          disabled={guardando}
          style={{
            padding: Espacio.md,
            borderRadius: Radio.md,
            minHeight: Dimensiones.toqueMinimo,
            justifyContent: 'center',
            // Deshabilitado: superficieAlta apagada; habilitado: verde neon prominente
            backgroundColor: guardando ? Paleta.superficieAlta : Paleta.verdeNeon,
            opacity: guardando ? 0.6 : 1,
          }}
        >
          <Text style={{ ...Tipografia.cuerpo, textAlign: 'center', fontWeight: 'bold', color: guardando ? Paleta.textoSecundario : Paleta.fondo }}>
            Guardar nota
          </Text>
        </Pressable>

        {/* Error de guardado: color error con texto, no solo color */}
        {errorGuardando && (
          <Text style={{ ...Tipografia.etiqueta, color: Paleta.error, textAlign: 'center' }}>
            No se pudo guardar la nota. Intentalo nuevamente.
          </Text>
        )}
      </View>
    </>
  );
}