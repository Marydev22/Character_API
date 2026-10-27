/**
 * Design tokens del universo neon de Rick and Morty.
 * Este archivo es la unica fuente de colores, espacios, radios y tipografia.
 * Ningun componente debe escribir un valor de color fuera de este archivo.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Colors (barra de pestanas — conservado para NativeTabs y compatibilidad)
// Ambos modos usan la misma paleta oscura neon.
// ---------------------------------------------------------------------------
export const Colors = {
  light: {
    text: '#F2F2F7',
    background: '#0A0A12',
    backgroundElement: '#1E1E2E',
    backgroundSelected: '#1E1E2E',
    textSecondary: '#A0A0B8',
    accent: '#39FF14',
    accentSecundario: '#B44BFF',
  },
  dark: {
    text: '#F2F2F7',
    background: '#0A0A12',
    backgroundElement: '#1E1E2E',
    backgroundSelected: '#1E1E2E',
    textSecondary: '#A0A0B8',
    accent: '#39FF14',
    accentSecundario: '#B44BFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ---------------------------------------------------------------------------
// Paleta — todos los colores de la app en un solo lugar
// ---------------------------------------------------------------------------
export const Paleta = {
  /** Fondo principal de todas las pantallas */
  fondo: '#0A0A12',
  /** Fondo de tarjetas y filas */
  superficie: '#14141F',
  /** Botones deshabilitados y elementos sobre tarjetas */
  superficieAlta: '#1E1E2E',
  /** Borde fino de 1 px */
  borde: '#2A2A3A',
  /** Texto principal — contraste alto sobre fondo */
  texto: '#F2F2F7',
  /** Texto secundario, datos de apoyo */
  textoSecundario: '#A0A0B8',
  /** Verde neon — accion principal */
  verdeNeon: '#39FF14',
  /** Morado neon — acento secundario */
  moradoNeon: '#B44BFF',
  /** Color de error */
  error: '#FF4D6D',
  /** Rojo para el banner offline */
  bannerOffline: '#CC2200',
  /** Sombra de paneles para separar superficies sin gris neutro */
  sombra: '#000000',
} as const;

// ---------------------------------------------------------------------------
// Espaciado — usar siempre Espacio.xx; no escribir numeros sueltos
// ---------------------------------------------------------------------------
export const Espacio = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Dimensiones = {
  /** Altura minima de controles interactivos */
  toqueMinimo: 44,
  /** Tamano de miniaturas en listas */
  miniatura: 72,
} as const;

// ---------------------------------------------------------------------------
// Radio de bordes
// ---------------------------------------------------------------------------
export const Radio = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

// ---------------------------------------------------------------------------
// Tipografia — combinar con el color que corresponda al contexto
// ---------------------------------------------------------------------------
export const Tipografia = {
  titulo: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  cuerpo: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
} as const;

// ---------------------------------------------------------------------------
// Fuentes del sistema (conservado para web y componentes heredados)
// ---------------------------------------------------------------------------
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ---------------------------------------------------------------------------
// Constantes heredadas — conservadas para compatibilidad
// ---------------------------------------------------------------------------
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
