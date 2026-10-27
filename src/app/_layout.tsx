import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import ConnectionBanner from '@/components/ConnectionBanner';
import { PERSIST_MAX_AGE, queryClient, persister } from '@/query/queryClient';
import '@/query/onlineManager';
import '@/query/mutations';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: PERSIST_MAX_AGE }}
      onSuccess={() => {
        // Cuando termina de restaurar la cache: reenvía las mutaciones pendientes
        // y marca los datos como desactualizados para volver a pedirlos
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        {/* Banner de estado de conexion: se superpone a todo el contenido */}
        <ConnectionBanner />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="favorito/[id]" options={{ title: 'Editar registro' }} />
        </Stack>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
