import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing } from '@/theme';

export default function PerfilScreen() {
  const { sessao, sair } = useAuth();

  function confirmarSaida() {
    // Alert com botões não funciona no navegador; lá, sai direto.
    if (Platform.OS === 'web') {
      void sair();
      return;
    }
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void sair() },
    ]);
  }

  const inicial = (sessao?.nome ?? sessao?.email ?? '?').charAt(0).toUpperCase();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText variant="title" style={{ color: colors.textOnPrimary }}>
            {inicial}
          </AppText>
        </View>
        {sessao?.nome ? <AppText variant="subtitle">{sessao.nome}</AppText> : null}
        <AppText muted>{sessao?.email}</AppText>
        <View style={styles.papel}>
          <AppText variant="caption" style={{ color: colors.primary }}>
            {sessao?.papel === 'GESTOR' ? 'Gestor da vigilância' : 'Cidadão'}
          </AppText>
        </View>
      </View>

      <Card>
        <Pressable
          style={styles.item}
          onPress={() => router.push('/sobre')}
          accessibilityRole="button"
          accessibilityLabel="Sobre o App"
        >
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <AppText style={styles.itemText}>Sobre o App</AppText>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </Card>

      <Button title="Sair" variant="danger" onPress={confirmarSaida} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, marginVertical: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  papel: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  itemText: { flex: 1 },
});
