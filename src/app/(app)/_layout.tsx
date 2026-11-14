import { Stack } from 'expo-router';

import { colors, fonts } from '@/theme';

/** Área logada: as abas + telas empilhadas (detalhe, formulário e "Sobre"). */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.textOnPrimary,
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { fontFamily: fonts.semiBold },
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="aparelho/[id]" options={{ title: 'Detalhe do aparelho' }} />
      <Stack.Screen name="aparelho/form" options={{ title: 'Aparelho' }} />
      <Stack.Screen name="sobre" options={{ title: 'Sobre o App' }} />
    </Stack>
  );
}
