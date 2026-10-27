import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { queryClient } from '@/query/queryClient';

// Timeout del fetch HEAD de verificacion (3 segundos)
// Con expo-network el fetch podia bloquearse hasta ~75 s al perder conexion
const FETCH_TIMEOUT_MS = 3_000;
const INTERVALO_COMPROBACION = 10_000;
const URL_COMPROBACION = 'https://rickandmortyapi.com/api/character?page=1';

// Guarda el ultimo estado conocido para detectar la transicion offline -> online
let ultimoEstado: boolean | null = null;

async function comprobarConexion(setOnline: (online: boolean) => void): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const estado = await NetInfo.fetch();
    if (estado.isConnected === false || estado.isInternetReachable === false) {
      clearTimeout(timer);
      actualizarEstado(false, setOnline);
      return;
    }

    const respuesta = await fetch(URL_COMPROBACION, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timer);
    actualizarEstado(respuesta.ok, setOnline);
  } catch {
    clearTimeout(timer);
    actualizarEstado(false, setOnline);
  }
}

function actualizarEstado(online: boolean, setOnline: (online: boolean) => void): void {
  const timestamp = new Date().toISOString();
  console.log(`[red] ${online ? 'en linea' : 'sin conexion'} — ${timestamp}`);
  setOnline(online);

  // Al recuperar la conexion, reenviar mutaciones pausadas
  if (online && ultimoEstado === false) {
    console.log(`[red] reconectado — reanudando mutaciones pendientes — ${timestamp}`);
    void queryClient.resumePausedMutations();
  }

  ultimoEstado = online;
}

onlineManager.setEventListener((setOnline) => {
  // Comprobacion inicial al registrar el listener
  void comprobarConexion(setOnline);

  // NetInfo: listener nativo que detecta cualquier cambio de conectividad real
  // (no solo cambio de tipo de red como hacia expo-network)
  const unsubscribeNetInfo = NetInfo.addEventListener(() => {
    void comprobarConexion(setOnline);
  });

  // Comprobacion adicional al volver la app al primer plano
  const appStateSubscription = AppState.addEventListener('change', (estado) => {
    if (estado === 'active') void comprobarConexion(setOnline);
  });

  // Polling de seguridad: garantiza deteccion aunque el listener no dispare
  const interval = setInterval(() => {
    void comprobarConexion(setOnline);
  }, INTERVALO_COMPROBACION);

  return () => {
    unsubscribeNetInfo();
    appStateSubscription.remove();
    clearInterval(interval);
  };
});
