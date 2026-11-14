import { StyleSheet, View } from 'react-native';

import { radius, riskColors, spacing } from '@/theme';
import type { NivelRisco } from '@/types';

import { AppText } from './AppText';

/** Nível de risco com cor E texto (nunca só cor, por acessibilidade). */
export function RiskBadge({ nivel, size = 'md' }: { nivel: NivelRisco; size?: 'md' | 'lg' }) {
  const cores = riskColors[nivel];
  return (
    <View
      accessible
      accessibilityLabel={`Nível de risco ${nivel.toLowerCase()}`}
      style={[styles.badge, size === 'lg' && styles.large, { backgroundColor: cores.background }]}
    >
      <AppText variant={size === 'lg' ? 'title' : 'label'} style={{ color: cores.text }}>
        {nivel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  large: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
