import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { orientacaoService } from '@/services';
import type { OrientacaoResponse } from '@/types';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

export default function OrientacoesScreen() {
  const { sessao } = useAuth();
  const [orientacao, setOrientacao] = useState<OrientacaoResponse | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ehGestor = sessao?.papel === 'GESTOR';

  async function gerar() {
    if (!sessao?.bairroId) {
      setErro('Escolha seu bairro na tela Início primeiro.');
      return;
    }
    setGerando(true);
    setErro(null);
    try {
      setOrientacao(await orientacaoService.gerar(sessao.bairroId));
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setGerando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={28} color={colors.accent} />
        <AppText variant="subtitle">
          {ehGestor ? 'Plano de ação do bairro' : 'O que fazer agora'}
        </AppText>
      </View>
      <AppText muted>
        {ehGestor
          ? 'A IA cruza o nível de risco do bairro com os protocolos do Ministério da Saúde e sugere um plano de ação.'
          : 'A IA explica, em linguagem simples, o que fazer de acordo com o risco atual do seu bairro.'}
      </AppText>

      <Button
        title={
          orientacao ? 'Gerar novamente' : ehGestor ? 'Gerar plano de ação' : 'Gerar orientação'
        }
        onPress={gerar}
        loading={gerando}
      />

      {erro ? (
        <View style={styles.alert} accessibilityRole="alert">
          <AppText style={{ color: colors.danger }}>{erro}</AppText>
        </View>
      ) : null}

      {orientacao ? (
        <Card>
          <AppText variant="caption" muted>
            {orientacao.bairroNome}
          </AppText>
          <AppText selectable>{orientacao.texto}</AppText>
          <AppText variant="caption" muted>
            {orientacao.geradaPorIa
              ? 'Conteúdo gerado por IA.'
              : 'A IA está indisponível agora: esta é a orientação padrão do protocolo.'}{' '}
            Em caso de sintomas, procure a unidade de saúde mais próxima.
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alert: { backgroundColor: colors.dangerLight, padding: spacing.md, borderRadius: 12 },
});
