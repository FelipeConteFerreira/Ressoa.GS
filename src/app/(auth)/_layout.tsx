import { Stack } from 'expo-router';

import { colors, fonts } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
    </Stack>
  );
}
