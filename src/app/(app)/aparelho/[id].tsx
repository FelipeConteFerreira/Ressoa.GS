import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, ErrorView, LoadingView, StatusBadge } from '@/components';
import { dispositivoService, telemetriaService } from '@/services';
import { colors, spacing } from '@/theme';
import type { Dispositivo, Leitura, StatusTelemetria } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { formatarDataHora, TIPO_RECIPIENTE_LABEL } from '@/utils/formatters';

export default function DetalheAparelhoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispositivoId = Number(id);

  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [status, setStatus] = useState<StatusTelemetria | null>(null);
  const [historico, setHistorico] = useState<Leitura[]>([]);
  const [erroTelemetria, setErroTelemetria] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDispositivo(await dispositivoService.buscarPorId(dispositivoId));
    } catch (e) {
      setErro(getErrorMessage(e));
      setCarregando(false);
      return;
    }

    // A telemetria vem da API .NET: se ela falhar, o resto da tela continua funcionando.
    try {
      const [ultimo, leituras] = await Promise.all([
        telemetriaService.ultimoStatus(dispositivoId),
        telemetriaService.historico(dispositivoId),
      ]);
      setStatus(ultimo);
      setHistorico(leituras);
      setErroTelemetria(null);
    } catch (e) {
      setErroTelemetria(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }, [dispositivoId]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  async function excluir() {
    setExcluindo(true);
    try {
      await dispositivoService.excluir(dispositivoId);
      router.back();
    } catch (e) {
      setExcluindo(false);
      const mensagem = getErrorMessage(e);
      if (Platform.OS === 'web') setErro(mensagem);
      else Alert.alert('Não foi possível excluir', mensagem);
    }
  }

  function confirmarExclusao() {
    if (Platform.OS === 'web') {
      void excluir();
      return;
    }
    Alert.alert('Excluir aparelho', `Remover o aparelho ${dispositivo?.numeroSerie}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
    ]);
  }

  if (carregando && !dispositivo) return <LoadingView mensagem="Carregando aparelho..." />;
  if (erro || !dispositivo)
    return <ErrorView mensagem={erro ?? 'Aparelho não encontrado.'} onRetry={carregar} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <AppText variant="subtitle">{dispositivo.numeroSerie}</AppText>
        <StatusBadge status={dispositivo.status} />
        <Linha rotulo="Recipiente" valor={TIPO_RECIPIENTE_LABEL[dispositivo.tipoRecipiente]} />
        <Linha rotulo="Volume" valor={`${dispositivo.volumeLitros} L`} />
        <Linha rotulo="Pulsos por dia" valor={String(dispositivo.pulsosPorDia)} />
        <Linha rotulo="Instalado em" valor={formatarDataHora(dispositivo.instaladoEm)} />
      </Card>

      <Card>
        <View style={styles.titulo}>
          <AppText variant="bodyStrong">Último status do aparelho</AppText>
          {status ? (
            <AppText
              variant="caption"
              style={{ color: status.online ? colors.success : colors.textMuted }}
            >
              {status.online ? '● Online' : '○ Sem sinal'}
            </AppText>
          ) : null}
        </View>

        {erroTelemetria ? (
          <AppText style={{ color: colors.danger }}>
            Telemetria indisponível: {erroTelemetria}
          </AppText>
        ) : status?.ultimaLeituraEm ? (
          <>
            {status.bateriaPct !== null ? (
              <Linha
                rotulo="Bateria"
                valor={`${status.bateriaPct}%`}
                destaque={status.bateriaPct < 15}
              />
            ) : null}
            {status.temperaturaAgua !== null ? (
              <Linha
                rotulo="Temperatura da água"
                valor={`${Number(status.temperaturaAgua).toFixed(1)} °C`}
              />
            ) : null}
            {status.ultimoPulsoOk !== null ? (
              <Linha
                rotulo="Último pulso"
                valor={status.ultimoPulsoOk ? 'Executado' : 'Falhou'}
                destaque={!status.ultimoPulsoOk}
              />
            ) : null}
            {status.taxaSucessoPulso7Dias !== null ? (
              <Linha
                rotulo="Pulsos ok em 7 dias"
                valor={`${status.taxaSucessoPulso7Dias}% (${status.leiturasUltimos7Dias} leituras)`}
              />
            ) : null}
            <Linha rotulo="Recebido em" valor={formatarDataHora(status.ultimaLeituraEm)} />
          </>
        ) : (
          <AppText muted>O aparelho ainda não enviou nenhum status.</AppText>
        )}

        {status && status.alertas.length > 0 ? (
          <View style={styles.alertas} accessibilityRole="alert">
            {status.alertas.map((alerta) => (
              <AppText key={alerta} variant="caption" style={{ color: colors.warning }}>
                ⚠ {alerta}
              </AppText>
            ))}
          </View>
        ) : null}
      </Card>

      {historico.length > 0 ? (
        <Card>
          <AppText variant="bodyStrong">Últimas leituras</AppText>
          {historico.map((leitura) => (
            <Linha
              key={leitura.id}
              rotulo={formatarDataHora(leitura.registradaEm)}
              valor={`${leitura.bateriaPct}% · ${leitura.pulsoOk ? 'pulso ok' : 'sem pulso'}`}
            />
          ))}
        </Card>
      ) : null}

      <Button
        title="Editar"
        variant="secondary"
        onPress={() => router.push({ pathname: '/aparelho/form', params: { id: dispositivo.id } })}
      />
      <Button title="Excluir" variant="danger" onPress={confirmarExclusao} loading={excluindo} />
    </ScrollView>
  );
}

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <View style={styles.linha}>
      <AppText muted>{rotulo}</AppText>
      <AppText variant="bodyStrong" style={destaque ? { color: colors.danger } : undefined}>
        {valor}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  titulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertas: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#FFF4E0',
  },
});
