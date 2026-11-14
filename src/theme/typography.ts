import type { TextStyle } from 'react-native';

/** Nomes registrados no useFonts do layout raiz (arquivos em assets/fonts). */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
