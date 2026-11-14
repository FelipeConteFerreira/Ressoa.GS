import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

/** Estados de tela reaproveitados: carregando, erro (com "tentar de novo") e vazio. */

export function LoadingView({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText muted>{mensagem}</AppText>
    </View>
  );
}

export function ErrorView({ mensagem, onRetry }: { mensagem: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
      <AppText style={styles.text}>{mensagem}</AppText>
      {onRetry ? <Button title="Tentar de novo" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({
  mensagem,
  children,
}: {
  mensagem: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.center}>
      <Ionicons name="water-outline" size={48} color={colors.textMuted} />
      <AppText muted style={styles.text}>
        {mensagem}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: { textAlign: 'center' },
});
