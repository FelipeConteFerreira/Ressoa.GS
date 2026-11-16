import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  ChipSelect,
  ErrorView,
  LoadingView,
  Screen,
  TextField,
} from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useBairros } from '@/hooks/useBairros';
import { dispositivoService } from '@/services';
import { colors, spacing } from '@/theme';
import type { TipoRecipiente } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { TIPO_RECIPIENTE_LABEL } from '@/utils/formatters';
import { validarInteiro, validarNumeroSerie } from '@/utils/validators';

const TIPOS = (Object.keys(TIPO_RECIPIENTE_LABEL) as TipoRecipiente[]).map((tipo) => ({
  value: tipo,
  label: TIPO_RECIPIENTE_LABEL[tipo],
}));

type Erros = Partial<Record<'numeroSerie' | 'tipo' | 'volume' | 'pulsos' | 'bairro', string>>;

/** Cria (sem id) ou edita (com ?id=) um aparelho Ressoa. */
export default function FormAparelhoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = !!id;
  const { sessao } = useAuth();
  const { bairros, carregando: carregandoBairros, erro: erroBairros, recarregar } = useBairros();

  const [numeroSerie, setNumeroSerie] = useState('');
  const [tipo, setTipo] = useState<TipoRecipiente>();
  const [volume, setVolume] = useState('');
  const [pulsos, setPulsos] = useState('1');
  const [bairroId, setBairroId] = useState<number | undefined>(sessao?.bairroId);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregandoAparelho, setCarregandoAparelho] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  // Na edição, preenche o formulário com os dados atuais.
  useEffect(() => {
    if (!editando) return;
    dispositivoService
      .buscarPorId(Number(id))
      .then((d) => {
        setNumeroSerie(d.numeroSerie);
        setTipo(d.tipoRecipiente);
        setVolume(String(d.volumeLitros));
        setPulsos(String(d.pulsosPorDia));
        setBairroId(d.bairroId);
      })
      .catch((e) => setErroGeral(getErrorMessage(e)))
      .finally(() => setCarregandoAparelho(false));
  }, [editando, id]);

  function validar(): boolean {
    const novosErros: Erros = {
      numeroSerie: editando ? undefined : validarNumeroSerie(numeroSerie),
      tipo: tipo ? undefined : 'Escolha o tipo de recipiente.',
      volume: validarInteiro(volume, 'o volume', 1, 20000),
      pulsos: validarInteiro(pulsos, 'os pulsos por dia', 1, 24),
      bairro: bairroId ? undefined : 'Escolha o bairro.',
    };
    setErros(novosErros);
    return Object.values(novosErros).every((mensagem) => !mensagem);
  }

  async function salvar() {
    setErroGeral(null);
    if (!validar() || !tipo || !bairroId) return;

    const dados = {
      tipoRecipiente: tipo,
      volumeLitros: Number(volume),
      pulsosPorDia: Number(pulsos),
      bairroId,
    };

    setSalvando(true);
    try {
      // O número de série só é enviado no cadastro: a API não permite alterá-lo.
      if (editando) await dispositivoService.atualizar(Number(id), dados);
      else
        await dispositivoService.criar({ ...dados, numeroSerie: numeroSerie.trim().toUpperCase() });
      router.back();
    } catch (e) {
      setErroGeral(getErrorMessage(e));
      setSalvando(false);
    }
  }

  if (carregandoBairros || carregandoAparelho) return <LoadingView />;
  if (erroBairros) return <ErrorView mensagem={erroBairros} onRetry={recarregar} />;

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: editando ? 'Editar aparelho' : 'Novo aparelho' }} />

      <TextField
        label="Número de série"
        placeholder="Ex.: RSA-2026-0004"
        autoCapitalize="characters"
        editable={!editando}
        style={editando ? styles.desabilitado : undefined}
        value={numeroSerie}
        onChangeText={setNumeroSerie}
        error={erros.numeroSerie}
      />
      <ChipSelect
        label="Tipo de recipiente"
        options={TIPOS}
        value={tipo}
        onChange={setTipo}
        error={erros.tipo}
      />
      <TextField
        label="Volume (litros)"
        placeholder="Ex.: 200"
        keyboardType="number-pad"
        value={volume}
        onChangeText={setVolume}
        error={erros.volume}
      />
      <TextField
        label="Pulsos por dia"
        placeholder="1"
        keyboardType="number-pad"
        value={pulsos}
        onChangeText={setPulsos}
        error={erros.pulsos}
      />
      <ChipSelect
        label="Bairro"
        options={bairros.map((b) => ({ value: b.id, label: b.nome }))}
        value={bairroId}
        onChange={setBairroId}
        error={erros.bairro}
      />

      {erroGeral ? (
        <View style={styles.alert} accessibilityRole="alert">
          <AppText style={{ color: colors.danger }}>{erroGeral}</AppText>
        </View>
      ) : null}

      <Button
        title={editando ? 'Salvar alterações' : 'Cadastrar aparelho'}
        onPress={salvar}
        loading={salvando}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  desabilitado: { backgroundColor: colors.background, color: colors.textMuted },
  alert: { backgroundColor: colors.dangerLight, padding: spacing.md, borderRadius: 12 },
});
