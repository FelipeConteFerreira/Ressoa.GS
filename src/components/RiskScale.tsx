import { StyleSheet, View } from 'react-native';

import { colors, radius, riskColors, spacing } from '@/theme';
import type { NivelRisco } from '@/types';

import { AppText } from './AppText';

const NIVEIS: NivelRisco[] = ['VERDE', 'AMARELO', 'LARANJA', 'VERMELHO'];

/** Régua dos 4 níveis do briefing, com o nível atual em destaque. */
export function RiskScale({ nivel, onDark = false }: { nivel: NivelRisco; onDark?: boolean }) {
  const atual = NIVEIS.indexOf(nivel);

  return (
    <View
      accessible
      accessibilityLabel={`Nível ${atual + 1} de 4: ${nivel.toLowerCase()}`}
      style={styles.container}
    >
      <View style={styles.barra}>
        {NIVEIS.map((n, i) => (
          <View
            key={n}
            style={[
              styles.segmento,
              {
                backgroundColor:
                  i <= atual
                    ? riskColors[n].background
                    : onDark
                      ? 'rgba(255,255,255,0.18)'
                      : colors.border,
              },
              i === atual && styles.atual,
            ]}
          />
        ))}
      </View>
      <View style={styles.legenda}>
        {NIVEIS.map((n, i) => (
          <AppText
            key={n}
            variant="caption"
            style={[
              styles.rotulo,
              i === atual ? styles.rotuloAtual : styles.rotuloInativo,
              onDark && (i === atual ? styles.rotuloAtualEscuro : styles.rotuloInativoEscuro),
            ]}
          >
            {n.charAt(0) + n.slice(1).toLowerCase()}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  barra: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  segmento: { flex: 1, height: 8, borderRadius: radius.pill },
  atual: { height: 12 },
  legenda: { flexDirection: 'row' },
  rotulo: { flex: 1, textAlign: 'center', fontSize: 11 },
  rotuloAtual: { color: colors.text, fontFamily: 'Inter-SemiBold' },
  rotuloInativo: { color: colors.textMuted },
  rotuloAtualEscuro: { color: '#FFFFFF' },
  rotuloInativoEscuro: { color: 'rgba(255,255,255,0.6)' },
});
