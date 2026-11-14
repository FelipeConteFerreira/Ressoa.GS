import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
}

/** Texto com a fonte e as cores do tema. Use no lugar do <Text> do React Native. */
export function AppText({ variant = 'body', muted = false, style, ...rest }: AppTextProps) {
  return (
    <Text style={[typography[variant], muted ? styles.muted : styles.default, style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  default: { color: colors.text },
  muted: { color: colors.textMuted },
});
