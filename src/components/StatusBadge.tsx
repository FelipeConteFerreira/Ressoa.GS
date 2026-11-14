import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { StatusDispositivo } from '@/types';
import { STATUS_LABEL } from '@/utils/formatters';

import { AppText } from './AppText';

const COR_STATUS: Record<StatusDispositivo, string> = {
  ATIVO: colors.success,
  SEM_SINAL: colors.textMuted,
  BATERIA_BAIXA: colors.warning,
  INATIVO: colors.danger,
};

export function StatusBadge({ status }: { status: StatusDispositivo }) {
  const cor = COR_STATUS[status];
  return (
    <View style={[styles.badge, { borderColor: cor }]}>
      <View style={[styles.dot, { backgroundColor: cor }]} />
      <AppText variant="caption" style={{ color: cor }}>
        {STATUS_LABEL[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
