import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button, DeviceCard, EmptyView, ErrorView, LoadingView } from '@/components';
import { dispositivoService } from '@/services';
import { colors, radius, spacing } from '@/theme';
import type { Dispositivo } from '@/types';
import { getErrorMessage } from '@/utils/errors';

const TAMANHO_PAGINA = 10;

export default function AparelhosScreen() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [pagina, setPagina] = useState(0);
  const [ultimaPagina, setUltimaPagina] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPrimeiraPagina = useCallback(async () => {
    setErro(null);
    try {
      const resposta = await dispositivoService.listar(0, TAMANHO_PAGINA);
      setDispositivos(resposta.content);
      setPagina(0);
      setUltimaPagina(resposta.last);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega sempre que a aba ganha foco (ex.: voltando do formulário).
  useFocusEffect(
    useCallback(() => {
      void carregarPrimeiraPagina();
    }, [carregarPrimeiraPagina]),
  );

  async function carregarMais() {
    if (ultimaPagina || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const resposta = await dispositivoService.listar(pagina + 1, TAMANHO_PAGINA);
      setDispositivos((atuais) => [...atuais, ...resposta.content]);
      setPagina(resposta.page);
      setUltimaPagina(resposta.last);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregandoMais(false);
    }
  }

  const abrirFormulario = () => router.push('/aparelho/form');

  if (carregando) return <LoadingView mensagem="Carregando aparelhos..." />;
  if (erro && dispositivos.length === 0)
    return <ErrorView mensagem={erro} onRetry={carregarPrimeiraPagina} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={dispositivos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <DeviceCard
            dispositivo={item}
            onPress={() => router.push({ pathname: '/aparelho/[id]', params: { id: item.id } })}
          />
        )}
        contentContainerStyle={dispositivos.length === 0 ? styles.emptyContent : styles.content}
        refreshing={atualizando}
        onRefresh={() => {
          setAtualizando(true);
          void carregarPrimeiraPagina();
        }}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          carregandoMais ? <ActivityIndicator color={colors.primary} /> : undefined
        }
        ListEmptyComponent={
          <EmptyView mensagem="Você ainda não cadastrou nenhum aparelho Ressoa.">
            <Button title="Cadastrar aparelho" onPress={abrirFormulario} />
          </EmptyView>
        }
      />

      {dispositivos.length > 0 ? (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={abrirFormulario}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo aparelho"
        >
          <Ionicons name="add" size={30} color={colors.textOnPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: 96 },
  emptyContent: { flexGrow: 1 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.85 },
});
