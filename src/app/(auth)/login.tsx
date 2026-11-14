import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { validarEmail, validarSenha } from '@/utils/validators';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    const novosErros = { email: validarEmail(email), senha: validarSenha(senha) };
    setErros(novosErros);
    setErroGeral(null);
    if (novosErros.email || novosErros.senha) return;

    setEnviando(true);
    try {
      await entrar({ email, senha });
      // O redirecionamento para a área logada é feito pelo Stack.Protected do layout raiz.
    } catch (e) {
      setErroGeral(getErrorMessage(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          accessibilityIgnoresInvertColors
          accessibilityLabel="Logo do Ressoa"
        />
        <AppText variant="title" style={styles.brand}>
          Ressoa
        </AppText>
        <AppText muted style={styles.center}>
          Som contra a larva do Aedes, antes que a seca vire epidemia.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField
          label="E-mail"
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          error={erros.email}
        />
        <TextField
          label="Senha"
          placeholder="Sua senha"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          value={senha}
          onChangeText={setSenha}
          error={erros.senha}
          onSubmitEditing={handleEntrar}
        />

        {erroGeral ? (
          <View style={styles.alert} accessibilityRole="alert">
            <AppText style={{ color: colors.danger }}>{erroGeral}</AppText>
          </View>
        ) : null}

        <Button title="Entrar" onPress={handleEntrar} loading={enviando} />

        <View style={styles.footer}>
          <AppText muted>Ainda não tem conta? </AppText>
          <Link href="/cadastro" accessibilityRole="link">
            <AppText variant="bodyStrong" style={{ color: colors.primary }}>
              Cadastre-se
            </AppText>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logo: { width: 120, height: 120 },
  brand: { color: colors.primaryDark, fontSize: 34, lineHeight: 40 },
  center: { textAlign: 'center' },
  form: { gap: spacing.md },
  alert: { backgroundColor: colors.dangerLight, padding: spacing.md, borderRadius: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
