import { useState } from 'react';
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
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { validarEmail, validarObrigatorio, validarSenha } from '@/utils/validators';

interface ErrosCadastro {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacao?: string;
  bairro?: string;
}

export default function CadastroScreen() {
  const { cadastrar } = useAuth();
  const { bairros, carregando, erro, recarregar } = useBairros();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [bairroId, setBairroId] = useState<number>();
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): boolean {
    const novosErros: ErrosCadastro = {
      nome: validarObrigatorio(nome, 'seu nome'),
      email: validarEmail(email),
      senha: validarSenha(senha),
      confirmacao: senha !== confirmacao ? 'As senhas não conferem.' : undefined,
      bairro: bairroId ? undefined : 'Escolha seu bairro.',
    };
    setErros(novosErros);
    return Object.values(novosErros).every((mensagem) => !mensagem);
  }

  async function handleCadastrar() {
    setErroGeral(null);
    if (!validar() || !bairroId) return;

    setEnviando(true);
    try {
      await cadastrar({ nome: nome.trim(), email, senha, bairroId });
    } catch (e) {
      setErroGeral(getErrorMessage(e));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <LoadingView mensagem="Carregando bairros..." />;
  if (erro) return <ErrorView mensagem={erro} onRetry={recarregar} />;

  return (
    <Screen scroll>
      <AppText muted>
        Pedimos só o necessário (LGPD): nome, e-mail e bairro, para avisar quando o risco subir.
      </AppText>

      <TextField
        label="Nome"
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
        error={erros.nome}
        autoComplete="name"
      />
      <TextField
        label="E-mail"
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={erros.email}
      />
      <TextField
        label="Senha"
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
        autoComplete="new-password"
        value={senha}
        onChangeText={setSenha}
        error={erros.senha}
      />
      <TextField
        label="Confirmar senha"
        placeholder="Repita a senha"
        secureTextEntry
        value={confirmacao}
        onChangeText={setConfirmacao}
        error={erros.confirmacao}
      />
      <ChipSelect
        label="Seu bairro"
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

      <Button title="Criar conta" onPress={handleCadastrar} loading={enviando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  alert: { backgroundColor: colors.dangerLight, padding: spacing.md, borderRadius: 12 },
});
