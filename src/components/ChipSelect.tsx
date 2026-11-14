import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

interface Opcao<T> {
  value: T;
  label: string;
}

interface ChipSelectProps<T> {
  label: string;
  options: Opcao<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  error?: string;
}

/** Seleção única em "chips": usada para bairro e tipo de recipiente. */
export function ChipSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
}: ChipSelectProps<T>) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((opcao) => {
          const selecionado = opcao.value === value;
          return (
            <Pressable
              key={String(opcao.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selecionado }}
              accessibilityLabel={opcao.label}
              onPress={() => onChange(opcao.value)}
              style={[styles.chip, selecionado && styles.chipSelected]}
            >
              <AppText
                variant="label"
                style={{ color: selecionado ? colors.textOnPrimary : colors.text }}
              >
                {opcao.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="caption" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  errorText: { color: colors.danger },
});
