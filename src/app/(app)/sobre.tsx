import Constants from 'expo-constants';
import { Image, StyleSheet, View } from 'react-native';

import { AppText, Card, Screen } from '@/components';
import { colors, fonts, spacing } from '@/theme';

/** Exigida pela publicação no Firebase: mostra o hash do commit do build. Não conta para as 6 telas. */
export default function SobreScreen() {
  const commitHash =
    (Constants.expoConfig?.extra?.commitHash as string | undefined) ?? 'desconhecido';
  const versao = Constants.expoConfig?.version ?? '—';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          accessibilityLabel="Logo do Ressoa"
        />
        <AppText variant="title" style={{ color: colors.primaryDark }}>
          Ressoa
        </AppText>
        <AppText muted style={styles.center}>
          Ultrassom contra a larva do Aedes na água guardada, com uma plataforma de risco que diz
          onde instalar e quando agir.
        </AppText>
      </View>

      <Card>
        <Linha rotulo="Versão" valor={versao} />
        <Linha rotulo="Commit" valor={commitHash} mono />
      </Card>

      <Card>
        <AppText variant="bodyStrong">Global Solution 2026/2 · FIAP</AppText>
        <AppText muted>Mobile Application Development</AppText>
        <AppText muted>Altamir Lima · RM562906</AppText>
        <AppText muted>Felipe Conte · RM562248</AppText>
        <AppText muted>Luiz Gustavo · RM564495</AppText>
        <AppText muted>Olavo Porto Neves · RM563558</AppText>
        <AppText muted>Pedro Henrique Dias França · RM561940</AppText>
      </Card>
    </Screen>
  );
}

function Linha({ rotulo, valor, mono = false }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <View style={styles.linha}>
      <AppText muted>{rotulo}</AppText>
      <AppText variant="bodyStrong" style={mono ? styles.mono : undefined} selectable>
        {valor}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  logo: { width: 96, height: 96 },
  center: { textAlign: 'center' },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  mono: { fontFamily: fonts.medium, letterSpacing: 1 },
});
