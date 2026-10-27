import { FlatList, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import TarjetaPersonaje from '@/components/TarjetaPersonaje';
import type { Personaje } from '@/types/personaje';
import { Espacio } from '@/constants/theme';

type Props = {
  personajes: Personaje[];
  ancho: number;
  indiceInicial: number; // -1 significa "la ultima tarjeta"
  hayAnterior: boolean;
  haySiguiente: boolean;
  alBorde: (direccion: 'siguiente' | 'anterior') => void;
};

export default function CarruselPersonajes({
  personajes,
  ancho,
  indiceInicial,
  hayAnterior,
  haySiguiente,
  alBorde,
}: Props) {
  const inicio = indiceInicial < 0 ? personajes.length - 1 : indiceInicial;

  // Se ejecuta cuando el usuario termina de deslizar
  const alTerminarDeslizar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const indice = Math.round(e.nativeEvent.contentOffset.x / ancho);

    if (indice === personajes.length - 1 && haySiguiente) {
      alBorde('siguiente');
    } else if (indice === 0 && hayAnterior) {
      alBorde('anterior');
    }
  };

  return (
    <FlatList
      data={personajes}
      keyExtractor={(p) => String(p.id)}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={inicio}
      // getItemLayout usa ancho exacto para que pagingEnabled funcione correctamente
      getItemLayout={(_, index) => ({ length: ancho, offset: ancho * index, index })}
      onMomentumScrollEnd={alTerminarDeslizar}
      renderItem={({ item, index }) => (
        // El contenedor ocupa el ancho completo de pantalla para que pagingEnabled deslice de a una tarjeta
        <View style={{ width: ancho, alignItems: 'center', justifyContent: 'center', paddingVertical: Espacio.md }}>
          {/* La tarjeta activa (primer elemento visible) recibe activa=true para borde morado */}
          <TarjetaPersonaje
            personaje={item}
            ancho={ancho * 0.8}
            activa={index === inicio}
          />
        </View>
      )}
    />
  );
}
