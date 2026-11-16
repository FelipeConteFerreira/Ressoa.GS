import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ComponentProps } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppText,
  Button,
  Card,
  ChipSelect,
  ErrorView,
  FadeInView,
  LoadingView,
  RiskScale,
  SonarPulse,
} from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useBairros } from '@/hooks/useBairros';
import { bairroService, dispositivoService } from '@/services';
import { colors, fonts, radius, riskColors, spacing } from '@/theme';
import type { Bairro, Dispositivo, NivelRisco, StatusDispositivo } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { STATUS_LABEL, TIPO_RECIPIENTE_LABEL } from '@/utils/formatters';

type IconName = ComponentProps<typeof Ionicons>['name'];

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

const COR_STATUS: Record<StatusDispositivo, string> = {
  ATIVO: colors.success,
  SEM_SINAL: colors.textMuted,
  BATERIA_BAIXA: colors.warning,
  INATIVO: colors.danger,
};

interface ProximoPasso {
  icone: IconName;
  cor: string;
  titulo: string;
  descricao: string;
  destino: Href;
}

/** Escolhe a ação mais importante para o usuário agora, a partir dos aparelhos. */
function definirProximoPasso(dispositivos: Dispositivo[], ehGestor: boolean): ProximoPasso {
  const detalhe = (d: Dispositivo): Href => ({
    pathname: '/aparelho/[id]',
    params: { id: d.id },
  });

  if (dispositivos.length === 0) {
    return {
      icone: 'add-circle',
      cor: colors.primary,
      titulo: 'Instale seu primeiro Ressoa',
      descricao: "Cadastre o aparelho do seu tambor, balde ou caixa d'água.",
      destino: '/aparelho/form',
    };
  }
  const bateria = dispositivos.find((d) => d.status === 'BATERIA_BAIXA');
  if (bateria) {
    return {
      icone: 'battery-dead',
      cor: colors.warning,
      titulo: 'Recarregue a bateria',
      descricao: `O aparelho ${bateria.numeroSerie} está com bateria baixa.`,
      destino: detalhe(bateria),
    };
  }
  const semSinal = dispositivos.find((d) => d.status === 'SEM_SINAL');
  if (semSinal) {
    return {
      icone: 'wifi',
      cor: colors.textMuted,
      titulo: 'Verifique o Wi-Fi',
      descricao: `${semSinal.numeroSerie} está sem sinal. O pulso diário continua mesmo assim.`,
      destino: detalhe(semSinal),
    };
  }
  const inativo = dispositivos.find((d) => d.status === 'INATIVO');
  if (inativo) {
    return {
      icone: 'power',
      cor: colors.danger,
      titulo: 'Religue o aparelho',
      descricao: `${inativo.numeroSerie} está desligado: a água desse recipiente não está protegida.`,
      destino: detalhe(inativo),
    };
  }
  return {
    icone: 'sparkles',
    cor: colors.accent,
    titulo: ehGestor ? 'Gere o plano de ação' : 'Veja a orientação da IA',
    descricao: ehGestor
      ? 'A IA sugere as ações para o nível de risco atual do bairro.'
      : 'Todos os aparelhos estão ok. Veja o que fazer no nível de risco atual.',
    destino: '/orientacoes',
  };
}

export default function InicioScreen() {
  const { sessao, atualizarBairro } = useAuth();
  const insets = useSafeAreaInsets();
  const [bairro, setBairro] = useState<Bairro | null>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [totalDispositivos, setTotalDispositivos] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const bairroId = sessao?.bairroId;
  const ehGestor = sessao?.papel === 'GESTOR';

  const carregar = useCallback(async () => {
    if (!bairroId) return;
    setCarregando(true);
    setErro(null);

    // Risco do bairro e aparelhos em paralelo; uma falha nos aparelhos não esconde o risco.
    const [resultadoBairro, resultadoDispositivos] = await Promise.allSettled([
      bairroService.buscarPorId(bairroId),
      dispositivoService.listar(0, 50),
    ]);

    if (resultadoBairro.status === 'fulfilled') setBairro(resultadoBairro.value);
    else setErro(getErrorMessage(resultadoBairro.reason));

    if (resultadoDispositivos.status === 'fulfilled') {
      setDispositivos(resultadoDispositivos.value.content);
      setTotalDispositivos(resultadoDispositivos.value.totalElements);
    }

    setCarregando(false);
  }, [bairroId]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  // Se a API de login não devolver o bairro, o usuário escolhe aqui uma vez.
  if (!bairroId) return <EscolherBairro onEscolher={atualizarBairro} />;
  if (carregando && !bairro) return <LoadingView mensagem="Consultando o risco do seu bairro..." />;
  if (erro && !bairro) return <ErrorView mensagem={erro} onRetry={carregar} />;
  if (!bairro) return null;

  const nivel = bairro.nivelRisco;
  const corNivel = nivel ? riskColors[nivel] : { background: colors.primary, text: '#FFFFFF' };
  const ativos = dispositivos.filter((d) => d.status === 'ATIVO').length;
  const comAlerta = dispositivos.filter((d) => d.status !== 'ATIVO').length;
  const primeiroNome = sessao?.nome?.split(' ')[0];
  const inicial = (sessao?.nome ?? sessao?.email ?? '?').charAt(0).toUpperCase();
  const passo = definirProximoPasso(dispositivos, ehGestor);
  const irParaAparelhos = () => router.push('/aparelhos');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} />
      }
    >
      {/* Ícones da barra de status em branco, sobre o topo azul-escuro */}
      <StatusBar style="light" />

      {/* Topo: sonar com o risco do bairro */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTopo}>
          <View style={styles.local}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <AppText variant="caption" style={styles.localTexto} numberOfLines={1}>
              {bairro.nome} · {bairro.uf}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push('/perfil')}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            style={({ pressed }) => [styles.avatar, pressed && styles.pressionado]}
          >
            <AppText variant="bodyStrong" style={{ color: colors.primaryDark }}>
              {inicial}
            </AppText>
          </Pressable>
        </View>

        <FadeInView>
          <AppText style={styles.saudacao}>{primeiroNome ? `Oi, ${primeiroNome}.` : 'Oi.'}</AppText>
          <AppText style={styles.subtitulo}>Este é o risco de dengue no seu bairro hoje:</AppText>
        </FadeInView>

        <SonarPulse color={corNivel.background}>
          <AppText variant="caption" style={[styles.sonarRotulo, { color: corNivel.text }]}>
            RISCO
          </AppText>
          <AppText style={[styles.sonarNivel, { color: corNivel.text }]}>{nivel ?? '—'}</AppText>
        </SonarPulse>

        {nivel ? (
          <View style={styles.heroRodape}>
            <RiskScale nivel={nivel} onDark />
            <AppText style={styles.acao}>{bairro.acaoRecomendada ?? ACAO_POR_NIVEL[nivel]}</AppText>
          </View>
        ) : (
          <AppText style={styles.acao}>Ainda não há avaliação de risco para este bairro.</AppText>
        )}
      </View>

      <View style={styles.content}>
        {/* Painel de status: um card só, com três colunas */}
        <FadeInView delay={100}>
          <Pressable
            onPress={irParaAparelhos}
            accessibilityRole="button"
            accessibilityLabel={`${totalDispositivos} aparelhos, ${ativos} ativos, ${comAlerta} pedem atenção`}
            style={({ pressed }) => [styles.painel, pressed && styles.pressionado]}
          >
            <Indicador
              valor={totalDispositivos}
              rotulo={ehGestor ? 'no sistema' : 'aparelhos'}
              cor={colors.primary}
            />
            <View style={styles.divisor} />
            <Indicador valor={ativos} rotulo="protegendo" cor={colors.success} />
            <View style={styles.divisor} />
            <Indicador valor={comAlerta} rotulo="pedem atenção" cor={colors.warning} />
          </Pressable>
        </FadeInView>

        {/* Próximo passo, conforme a situação */}
        <FadeInView delay={180}>
          <AppText variant="label" muted style={styles.secao}>
            PRÓXIMO PASSO
          </AppText>
          <Pressable
            onPress={() => router.push(passo.destino)}
            accessibilityRole="button"
            accessibilityLabel={`${passo.titulo}. ${passo.descricao}`}
            style={({ pressed }) => [styles.passo, pressed && styles.pressionado]}
          >
            <View style={[styles.passoIcone, { backgroundColor: passo.cor }]}>
              <Ionicons name={passo.icone} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.passoTexto}>
              <AppText variant="bodyStrong">{passo.titulo}</AppText>
              <AppText variant="caption" muted>
                {passo.descricao}
              </AppText>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color={colors.primary} />
          </Pressable>
        </FadeInView>

        {/* Carrossel de aparelhos */}
        <FadeInView delay={260}>
          <View style={styles.secaoLinha}>
            <AppText variant="label" muted>
              {ehGestor ? 'APARELHOS RECENTES' : 'SEUS APARELHOS'}
            </AppText>
            {dispositivos.length > 0 ? (
              <Pressable onPress={irParaAparelhos} accessibilityRole="link">
                <AppText variant="label" style={styles.link}>
                  Ver todos
                </AppText>
              </Pressable>
            ) : null}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carrossel}
          >
            {dispositivos.slice(0, 6).map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push({ pathname: '/aparelho/[id]', params: { id: d.id } })}
                accessibilityRole="button"
                accessibilityLabel={`Aparelho ${d.numeroSerie}, ${STATUS_LABEL[d.status]}`}
                style={({ pressed }) => [styles.mini, pressed && styles.pressionado]}
              >
                <View style={styles.miniTopo}>
                  <Ionicons name="water" size={22} color={colors.primary} />
                  <View style={[styles.miniStatus, { backgroundColor: COR_STATUS[d.status] }]} />
                </View>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {d.numeroSerie}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {TIPO_RECIPIENTE_LABEL[d.tipoRecipiente]} · {d.volumeLitros} L
                </AppText>
                <AppText variant="caption" style={{ color: COR_STATUS[d.status] }}>
                  {STATUS_LABEL[d.status]}
                </AppText>
              </Pressable>
            ))}
            <Pressable
              onPress={() => router.push('/aparelho/form')}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar novo aparelho"
              style={({ pressed }) => [styles.mini, styles.miniNovo, pressed && styles.pressionado]}
            >
              <Ionicons name="add" size={28} color={colors.primary} />
              <AppText variant="label" style={styles.link}>
                Novo aparelho
              </AppText>
            </Pressable>
          </ScrollView>
        </FadeInView>

        {bairro.aguaIntermitente ? (
          <FadeInView delay={340}>
            <Card style={styles.info}>
              <View style={styles.infoTitulo}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <AppText variant="bodyStrong">Abastecimento intermitente</AppText>
              </View>
              <AppText>
                Seu bairro guarda água em tambores e caixas. Esses recipientes são os principais
                criadouros na seca: mantenha um Ressoa em cada um.
              </AppText>
            </Card>
          </FadeInView>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Indicador({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <View style={styles.indicador}>
      <AppText style={[styles.indicadorValor, { color: cor }]}>{valor}</AppText>
      <AppText variant="caption" muted style={styles.indicadorRotulo}>
        {rotulo}
      </AppText>
    </View>
  );
}

function EscolherBairro({ onEscolher }: { onEscolher: (id: number) => Promise<void> }) {
  const { bairros, carregando, erro, recarregar } = useBairros();
  const insets = useSafeAreaInsets();
  const [selecionado, setSelecionado] = useState<number>();

  if (carregando) return <LoadingView mensagem="Carregando bairros..." />;
  if (erro) return <ErrorView mensagem={erro} onRetry={recarregar} />;

  return (
    <View style={[styles.container, styles.content, { paddingTop: insets.top + spacing.md }]}>
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
  scroll: { paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  heroTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    maxWidth: '75%',
  },
  localTexto: { color: '#FFFFFF' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saudacao: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: '#FFFFFF' },
  subtitulo: { fontFamily: fonts.regular, fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  sonarRotulo: { letterSpacing: 3, fontFamily: fonts.semiBold },
  sonarNivel: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  heroRodape: { gap: spacing.sm },
  acao: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: '#FFFFFF' },
  content: { padding: spacing.md, gap: spacing.lg },
  painel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -spacing.xl,
    elevation: 3,
    shadowColor: '#0A3D62',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  divisor: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  indicador: { flex: 1, alignItems: 'center' },
  indicadorValor: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  indicadorRotulo: { textAlign: 'center' },
  secao: { letterSpacing: 1.5, marginBottom: spacing.sm },
  secaoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  link: { color: colors.primary },
  passo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passoIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoTexto: { flex: 1, gap: 2 },
  carrossel: { gap: spacing.sm, paddingRight: spacing.md },
  mini: {
    width: 176,
    padding: spacing.md,
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  miniStatus: { width: 10, height: 10, borderRadius: 5 },
  miniNovo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressionado: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  info: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  infoTitulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
