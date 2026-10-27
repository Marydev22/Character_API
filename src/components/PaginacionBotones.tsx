import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Dimensiones, Espacio, Paleta, Tipografia } from '@/constants/theme';

type Props = {
  pagina: number;
  tienePrev: boolean;
  tieneNext: boolean;
  onAnterior: () => void;
  onSiguiente: () => void;
};

export default function PaginacionBotones({
  pagina,
  tienePrev,
  tieneNext,
  onAnterior,
  onSiguiente,
}: Props) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Espacio.md, borderTopWidth: 1, borderTopColor: Paleta.borde }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a la página anterior"
        accessibilityState={{ disabled: !tienePrev }}
        disabled={!tienePrev}
        onPress={onAnterior}
        style={{ opacity: tienePrev ? 1 : 0.35, minHeight: Dimensiones.toqueMinimo, minWidth: Dimensiones.toqueMinimo, flexDirection: 'row', alignItems: 'center', gap: Espacio.xs }}
      >
        <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} tintColor={tienePrev ? Paleta.verdeNeon : Paleta.textoSecundario} size={18} />
        <Text style={{ ...Tipografia.etiqueta, color: tienePrev ? Paleta.verdeNeon : Paleta.textoSecundario }}>
          Anterior
        </Text>
      </Pressable>

      <View style={{ alignItems: 'center', gap: Espacio.xs }}>
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>SECTOR EXPLORADO</Text>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto }}>
          Página {pagina}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a la página siguiente"
        accessibilityState={{ disabled: !tieneNext }}
        disabled={!tieneNext}
        onPress={onSiguiente}
        style={{ opacity: tieneNext ? 1 : 0.35, minHeight: Dimensiones.toqueMinimo, minWidth: Dimensiones.toqueMinimo, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Espacio.xs }}
      >
        <Text style={{ ...Tipografia.etiqueta, color: tieneNext ? Paleta.verdeNeon : Paleta.textoSecundario }}>
          Siguiente
        </Text>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={tieneNext ? Paleta.verdeNeon : Paleta.textoSecundario} size={18} />
      </Pressable>
    </View>
  );
}
