import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

import { AppText } from './AppText';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, focado && styles.focused, !!error && styles.inputError, style]}
        onFocus={(e) => {
          setFocado(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  focused: { borderColor: colors.primary, borderWidth: 1.5 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger },
});
