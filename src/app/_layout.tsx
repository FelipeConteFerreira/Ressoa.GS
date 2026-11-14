import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { fonts } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontesCarregadas] = useFonts({
    [fonts.regular]: require('../../assets/fonts/Inter_400Regular.ttf'),
    [fonts.medium]: require('../../assets/fonts/Inter_500Medium.ttf'),
    [fonts.semiBold]: require('../../assets/fonts/Inter_600SemiBold.ttf'),
    [fonts.bold]: require('../../assets/fonts/Inter_700Bold.ttf'),
  });

  return (
    <AuthProvider>
      <RootNavigator fontesCarregadas={fontesCarregadas} />
    </AuthProvider>
  );
}

function RootNavigator({ fontesCarregadas }: { fontesCarregadas: boolean }) {
  const { sessao, carregando } = useAuth();
  const pronto = fontesCarregadas && !carregando;

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <>
      <StatusBar style="dark" />
      {/* Proteção de rotas: sem sessão, só o grupo (auth) existe; com sessão, só o (app). */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!!sessao}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!sessao}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
