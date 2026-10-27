import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors, Tipografia } from '@/constants/theme';

// La barra de pestanas siempre usa la paleta oscura neon.
// accent (verde neon) para la pestana activa; textSecondary para las inactivas.
export default function AppTabs() {
  const scheme = useColorScheme();
  // Ambos modos apuntan a la misma paleta oscura; se lee del objeto Colors.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      // backgroundElement es superficieAlta: resalta el indicador sin usar neon directo
      indicatorColor={colors.backgroundElement}
      labelStyle={{
        // Texto activo en verde neon; inactivo en textSecondary
        selected: { color: colors.accent, ...Tipografia.etiqueta },
        default: { color: colors.textSecondary, ...Tipografia.etiqueta },
      }}>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Personajes</NativeTabs.Trigger.Label>
        {/* renderingMode="template" permite colorear el icono con tintColor */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favoritos">
        <NativeTabs.Trigger.Label>Favoritos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
