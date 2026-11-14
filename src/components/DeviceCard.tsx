import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { Dispositivo } from '@/types';
import { TIPO_RECIPIENTE_LABEL } from '@/utils/formatters';

import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

interface DeviceCardProps {
  dispositivo: Dispositivo;
  onPress: () => void;
}

export function DeviceCard({ dispositivo, onPress }: DeviceCardProps) {
  const tipo = TIPO_RECIPIENTE_LABEL[dispositivo.tipoRecipiente];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Aparelho ${dispositivo.numeroSerie}, ${tipo}`}
      accessibilityHint="Abre os detalhes do aparelho"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Ionicons name="water" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <AppText variant="bodyStrong">{dispositivo.numeroSerie}</AppText>
        <AppText variant="caption" muted>
          {tipo} · {dispositivo.volumeLitros} L · {dispositivo.pulsosPorDia} pulso(s)/dia
        </AppText>
        <StatusBadge status={dispositivo.status} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: spacing.xs },
});
