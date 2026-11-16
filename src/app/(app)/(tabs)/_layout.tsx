import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icone(nome: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={nome} color={color as string} size={size} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // Altura explícita + área segura: rótulos com a fonte Inter não ficam cortados.
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontFamily: fonts.semiBold },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{ title: 'Início', headerShown: false, tabBarIcon: icone('home') }}
      />
      <Tabs.Screen
        name="aparelhos"
        options={{ title: 'Meus aparelhos', tabBarLabel: 'Aparelhos', tabBarIcon: icone('water') }}
      />
      <Tabs.Screen
        name="orientacoes"
        options={{ title: 'Orientações', tabBarIcon: icone('sparkles') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: icone('person-circle') }}
      />
    </Tabs>
  );
}
