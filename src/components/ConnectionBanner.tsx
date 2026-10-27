import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onlineManager } from '@tanstack/react-query';
import { Espacio, Paleta, Radio, Tipografia } from '@/constants/theme';

// -------------------------------------------------------------------
// Hook: se suscribe al onlineManager y devuelve el estado de conexion
// -------------------------------------------------------------------
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}

// -------------------------------------------------------------------
// Duraciones de animacion
// -------------------------------------------------------------------
const DURACION_ENTRADA = 300;
const DURACION_SALIDA  = 300;
const RETRASO_SALIDA   = 1500;

// -------------------------------------------------------------------
// Componente principal
// -------------------------------------------------------------------
export default function ConnectionBanner() {
  const isOnline   = useOnlineStatus();
  const insets     = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity    = useSharedValue(0);

  const [visible, setVisible]       = useState(false);
  const [tipo, setTipo]             = useState<'offline' | 'online'>('offline');
  const prevOnlineRef               = useRef<boolean | null>(null);
  const hideTimerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    const prev = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (prev === null && isOnline) return;

    if (!isOnline) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setTipo('offline');
      setVisible(true);
      translateY.value = withTiming(0, { duration: DURACION_ENTRADA, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: DURACION_ENTRADA });
    } else if (prev === false) {
      setTipo('online');
      setVisible(true);
      translateY.value = withTiming(0, { duration: DURACION_ENTRADA, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: DURACION_ENTRADA });
      translateY.value = withDelay(RETRASO_SALIDA, withTiming(-80, { duration: DURACION_SALIDA, easing: Easing.in(Easing.quad) }));
      opacity.value = withDelay(RETRASO_SALIDA, withTiming(0, { duration: DURACION_SALIDA }));
      hideTimerRef.current = setTimeout(() => setVisible(false), RETRASO_SALIDA + DURACION_SALIDA + 50);
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.banner, animStyle, { top: insets.top + Espacio.sm }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Banner online: verde neon con texto oscuro; offline: rojo con texto claro */}
      <View style={[styles.inner, tipo === 'online' ? styles.bgOnline : styles.bgOffline]}>
        <Text style={[styles.texto, tipo === 'online' ? styles.textoOnline : styles.textoOffline]}>
          {tipo === 'online' ? 'Conexion restaurada' : 'Sin conexion'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Espacio.sm,
  },
  inner: {
    borderRadius: Radio.md,
    paddingVertical: Espacio.sm,
    paddingHorizontal: Espacio.md,
    alignItems: 'center',
    // Sombra neutra: usa negro puro (no hay token de sombra; el negro es universal)
    shadowColor: Paleta.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  bgOffline: {
    // bannerOffline: rojo mas oscuro para contraste con texto blanco
    backgroundColor: Paleta.bannerOffline,
  },
  bgOnline: {
    backgroundColor: Paleta.verdeNeon,
  },
  texto: {
    ...Tipografia.etiqueta,
  },
  textoOffline: {
    color: Paleta.texto,
  },
  textoOnline: {
    // Texto oscuro sobre verde neon para contraste minimo 4.5:1
    color: Paleta.fondo,
  },
});