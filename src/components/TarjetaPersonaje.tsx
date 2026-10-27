import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Personaje } from '@/types/personaje';
import { useCrearFavorito } from '@/hooks/useCrearFavorito';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useCreacionesPendientes } from '@/hooks/usePendientes';
import { Dimensiones, Espacio, Paleta, Radio, Tipografia } from '@/constants/theme';

type Props = {
  personaje: Personaje;
  ancho: number;
  /** Cuando es true, la tarjeta muestra un borde morado sutil (es la activa del carrusel) */
  activa?: boolean;
};

// Funcion visual pura: devuelve el color segun el estado del personaje.
// No cambia datos, solo decide el color de presentacion.
function colorEstado(status: string): string {
  if (status === 'Alive') return Paleta.verdeNeon;
  if (status === 'Dead') return Paleta.error;
  return Paleta.moradoNeon; // 'unknown' u otro valor
}

export default function TarjetaPersonaje({ personaje, ancho, activa = false }: Props) {
  const router = useRouter();
  const { mutate, isPending, isError, reset } = useCrearFavorito();
  const { data: favoritos = [] } = useFavoritos();
  const pendientes = useCreacionesPendientes();

  const enFavoritos = favoritos.some((f) => f.personajeId === personaje.id);
  const pendiente = pendientes.some((p) => p.datos.personajeId === personaje.id);
  const yaGuardado = enFavoritos || pendiente || isPending;

  const guardar = () => {
    reset();
    mutate({
      personajeId: personaje.id,
      nombre: personaje.name,
      imagen: personaje.image,
      nota: '',
      creadoEn: new Date().toISOString(),
    });
  };

  const etiqueta = isError
    ? 'Reintentar'
    : pendiente
      ? 'Pendiente de enviar'
      : enFavoritos
        ? 'Ya esta en favoritos'
        : isPending
          ? 'Guardando...'
          : 'Guardar en favoritos';

  // Estilos del boton segun estado:
  // - Habilitado: fondo verde neon, texto oscuro (fondo) para maximo contraste
  // - Pendiente: borde morado, fondo superficieAlta, texto morado — comunica espera sin verde
  // - Deshabilitado: superficieAlta opaco — nunca usa neon para no confundir con accion activa
  const estiloBoton = pendiente
    ? { backgroundColor: Paleta.superficieAlta, borderWidth: 1, borderColor: Paleta.moradoNeon }
    : yaGuardado
      ? { backgroundColor: Paleta.superficieAlta }
      : { backgroundColor: Paleta.verdeNeon };

  const colorTextoBoton = pendiente
    ? Paleta.moradoNeon
    : yaGuardado
      ? Paleta.texto
      : Paleta.fondo; // texto oscuro sobre verde neon para contraste

  return (
    <Pressable
      onPress={() => router.push({ pathname: '../components/personaje/[id]', params: { id: String(personaje.id) } })}
      style={{
        width: ancho,
        padding: Espacio.md,
        borderRadius: Radio.lg,
        backgroundColor: Paleta.superficie,
        // La tarjeta activa tiene borde morado sutil; las demas tienen borde neutro
        borderWidth: 1,
        borderColor: activa ? Paleta.moradoNeon : Paleta.borde,
      }}
    >
      {/* Imagen con radio md para armonizar con la tarjeta */}
      <Image
        source={{ uri: personaje.image }}
        style={{ width: '100%', aspectRatio: 1, borderRadius: Radio.md }}
      />

      {/* Nombre: tipografia subtitulo, peso alto, color texto principal */}
      <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto, marginTop: Espacio.sm }}>
        {personaje.name}
      </Text>

      {/* Estado con color semantico; especie en textoSecundario para jerarquia */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Espacio.xs, marginTop: Espacio.xs }}>
        <Text style={{ ...Tipografia.cuerpo, color: colorEstado(personaje.status) }}>
          {personaje.status}
        </Text>
        <Text style={{ ...Tipografia.cuerpo, color: Paleta.textoSecundario }}>
          · {personaje.species}
        </Text>
      </View>

      {/* Boton de guardar: minHeight 44 cumple requisito de toque accesible */}
      <Pressable
        disabled={yaGuardado}
        onPress={guardar}
        style={{
          marginTop: Espacio.sm,
          paddingVertical: Espacio.sm,
          paddingHorizontal: Espacio.md,
          borderRadius: Radio.sm,
          minHeight: Dimensiones.toqueMinimo,
          justifyContent: 'center',
          opacity: yaGuardado && !pendiente ? 0.6 : 1,
          ...estiloBoton,
        }}
      >
        <View>
          <Text style={{ ...Tipografia.etiqueta, textAlign: 'center', fontWeight: 'bold', color: colorTextoBoton }}>
            {etiqueta}
          </Text>
        </View>
      </Pressable>

      {/* Mensaje de error: color error, texto secundario para no competir con el boton neon */}
      {isError && (
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.error, marginTop: Espacio.xs, textAlign: 'center' }}>
          No se pudo guardar. Comprueba tu conexion e intentalo de nuevo.
        </Text>
      )}
    </Pressable>
  );
}
