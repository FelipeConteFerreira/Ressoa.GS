import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const inativo = disabled || loading;
  const corDoTexto = variant === 'secondary' ? colors.primary : colors.textOnPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inativo, busy: loading }}
      disabled={inativo}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && styles.pressed,
        inativo && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={corDoTexto} />
      ) : (
        <AppText variant="bodyStrong" style={{ color: corDoTexto }}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50, // área de toque confortável (guidelines Apple/Google: 44–48)
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
