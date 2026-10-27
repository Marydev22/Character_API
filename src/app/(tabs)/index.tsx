import CarruselPersonajes from "@/components/CarruselPersonajes";
import PaginacionBotones from "@/components/PaginacionBotones";
import { usePersonajesPagina } from "@/hooks/usePersonajes";
import { Dimensiones, Espacio, Paleta, Radio, Tipografia } from "@/constants/theme";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function PersonajesScreen() {
  const [pagina, setPagina] = useState(1);
  const [indiceInicial, setIndiceInicial] = useState(0);
  const { width } = useWindowDimensions();

  const { data, isPending, isError, isPlaceholderData, refetch } =
    usePersonajesPagina(pagina);

  const irSiguiente = () => {
    if (!data?.info.next) return;
    setIndiceInicial(0);
    setPagina((p) => p + 1);
  };

  const irAnterior = () => {
    if (pagina <= 1) return;
    setIndiceInicial(-1);
    setPagina((p) => p - 1);
  };

  const alBorde = (direccion: "siguiente" | "anterior") =>
    direccion === "siguiente" ? irSiguiente() : irAnterior();

  // Estado de carga inicial: indicador verde neon centrado sobre fondo oscuro
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Paleta.fondo }}>
        <ActivityIndicator accessibilityLabel="Cargando personajes" size="large" color={Paleta.verdeNeon} />
      </View>
    );
  }

  // Estado de error: texto claro, boton "Reintentar" en verde neon como unica accion disponible
  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: Espacio.md,
          backgroundColor: Paleta.fondo,
        }}
      >
        <Text style={{ ...Tipografia.etiqueta, color: Paleta.moradoNeon }}>
          SEÑAL INTERRUMPIDA
        </Text>
        <Text style={{ ...Tipografia.subtitulo, color: Paleta.texto, textAlign: "center" }}>
          El portal no encontró personajes en esta coordenada.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={{ minHeight: Dimensiones.toqueMinimo, justifyContent: "center", paddingHorizontal: Espacio.lg, borderWidth: 1, borderColor: Paleta.verdeNeon, borderRadius: Radio.sm }}>
          <Text style={{ ...Tipografia.cuerpo, color: Paleta.verdeNeon, fontWeight: "bold" }}>
            Reintentar conexión
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    // paddingTop xl respeta la barra del sistema sin usar SafeAreaView adicional
    <View style={{ flex: 1, backgroundColor: Paleta.fondo, paddingTop: Espacio.xl }}>
      {/* Titulo de seccion: tipografia titulo, color texto, espacio lateral md */}
      <Text style={{ ...Tipografia.titulo, color: Paleta.texto, paddingHorizontal: Espacio.md, marginBottom: Espacio.sm }}>
        Portal de personajes
      </Text>
      <Animated.Text
        entering={FadeInDown.duration(700).springify()}
        accessibilityRole="header"
        style={{
          ...Tipografia.etiqueta,
          color: Paleta.moradoNeon,
          paddingHorizontal: Espacio.md,
          marginBottom: Espacio.md,
        }}
      >
        Explora por los personajes de Rick and Morty
      </Animated.Text>

      {/* Durante cambio de pagina: spinner de placeholder, sin destruir el layout */}
      {isPlaceholderData ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel="Cargando personajes" size="large" color={Paleta.verdeNeon} />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <CarruselPersonajes
            key={`${pagina}-${indiceInicial}`}
            personajes={data.results}
            ancho={width}
            indiceInicial={indiceInicial}
            hayAnterior={pagina > 1}
            haySiguiente={data.info.next !== null}
            alBorde={alBorde}
          />
        </View>
      )}

      <PaginacionBotones
        pagina={pagina}
        tienePrev={pagina > 1}
        tieneNext={!!data?.info.next}
        onAnterior={irAnterior}
        onSiguiente={irSiguiente}
      />
    </View>
  );
}
