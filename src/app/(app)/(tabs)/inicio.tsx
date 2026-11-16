import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, ChipSelect, ErrorView, LoadingView, RiskBadge } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useBairros } from '@/hooks/useBairros';
import { bairroService } from '@/services';
import { colors, spacing } from '@/theme';
import type { Bairro, NivelRisco } from '@/types';
import { getErrorMessage } from '@/utils/errors';

// Texto reserva, caso a API não devolva a ação recomendada do nível.
const ACAO_POR_NIVEL: Record<NivelRisco, string> = {
  VERDE: 'El Niño forte na previsão. É hora de instalar o Ressoa nos recipientes de água guardada.',
  AMARELO:
    'Calor e seca favorecem o mosquito. O Ressoa vai pulsar mais vezes. Tampe bem os recipientes.',
  LARANJA:
    'A transmissão começou no bairro. Fique atento a febre e procure a UBS ao primeiro sintoma.',
  VERMELHO:
    'Epidemia no bairro. Prioridade para bebês, gestantes e idosos. Hidrate-se e procure atendimento.',
};

export default function InicioScreen() {
  const { sessao, atualizarBairro } = useAuth();
  const [bairro, setBairro] = useState<Bairro | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const bairroId = sessao?.bairroId;

  const carregar = useCallback(async () => {
    if (!bairroId) return;
    setCarregando(true);
    setErro(null);
    try {
      setBairro(await bairroService.buscarPorId(bairroId));
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }, [bairroId]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  // Se a API de login não devolver o bairro, o usuário escolhe aqui uma vez.
  if (!sessao?.bairroId) return <EscolherBairro onEscolher={atualizarBairro} />;
  if (carregando && !bairro) return <LoadingView mensagem="Consultando o risco do seu bairro..." />;
  if (erro && !bairro) return <ErrorView mensagem={erro} onRetry={carregar} />;
  if (!bairro) return null;

  const nivel = bairro.nivelRisco;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} />
      }
    >
      <AppText variant="subtitle">
        Olá{sessao.nome ? `, ${sessao.nome.split(' ')[0]}` : ''}!
      </AppText>

      <Card>
        <AppText muted>Risco de dengue em</AppText>
        <AppText variant="subtitle">
          {bairro.nome} · {bairro.municipio}/{bairro.uf}
        </AppText>
        {nivel ? (
          <>
            <RiskBadge nivel={nivel} size="lg" />
            <AppText>{bairro.acaoRecomendada ?? ACAO_POR_NIVEL[nivel]}</AppText>
          </>
        ) : (
          <AppText muted>Ainda não há avaliação de risco para este bairro.</AppText>
        )}
      </Card>

      {bairro.aguaIntermitente ? (
        <Card style={styles.info}>
          <AppText variant="bodyStrong">Abastecimento intermitente</AppText>
          <AppText>
            Seu bairro guarda água em tambores e caixas. Esses recipientes são os principais
            criadouros na seca: mantenha um Ressoa em cada um.
          </AppText>
        </Card>
      ) : null}
    </ScrollView>
  );
}

function EscolherBairro({ onEscolher }: { onEscolher: (id: number) => Promise<void> }) {
  const { bairros, carregando, erro, recarregar } = useBairros();
  const [selecionado, setSelecionado] = useState<number>();

  if (carregando) return <LoadingView mensagem="Carregando bairros..." />;
  if (erro) return <ErrorView mensagem={erro} onRetry={recarregar} />;

  return (
    <View style={[styles.container, styles.content]}>
      <AppText variant="subtitle">Qual é o seu bairro?</AppText>
      <ChipSelect
        label="Bairro"
        options={bairros.map((b) => ({ value: b.id, label: b.nome }))}
        value={selecionado}
        onChange={setSelecionado}
      />
      <Button
        title="Confirmar"
        disabled={!selecionado}
        onPress={() => selecionado && onEscolher(selecionado)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  info: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
});
