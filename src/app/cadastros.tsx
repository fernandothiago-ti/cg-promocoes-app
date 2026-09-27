import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function CadastrosScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function carregarTema() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.isDarkMode !== undefined) {
        setIsDarkMode(user.user_metadata.isDarkMode);
      }
    }
    carregarTema();
  }, []);

  const abrirGerenciador = (tabela: string, titulo: string) => {
    router.push({
      pathname: '/gerenciar',
      params: { tabela, titulo }
    } as any);
  };

  const temaFundo = isDarkMode ? '#000000' : '#F5F5F5';
  const textoCor = isDarkMode ? '#FFFFFF' : '#111111';
  const cardFundo = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: temaFundo }]}>
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/home' as any)}>
        <Text style={styles.textoBotaoVoltar}>← Voltar ao Painel</Text>
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: textoCor }]}>Cadastros Base</Text>
      <Text style={styles.subtitulo}>Selecione a categoria que deseja gerir</Text>

      <View style={styles.listaBotoes}>
        <TouchableOpacity style={[styles.botaoCard, { backgroundColor: cardFundo }]} onPress={() => abrirGerenciador('clientes', 'Cliente / Marca')}>
          <Text style={styles.iconeCard}>🏢</Text>
          <Text style={[styles.textoCard, { color: textoCor }]}>Clientes / Marcas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoCard, { backgroundColor: cardFundo }]} onPress={() => abrirGerenciador('mercados', 'Mercado / Local')}>
          <Text style={styles.iconeCard}>🏪</Text>
          <Text style={[styles.textoCard, { color: textoCor }]}>Mercados / Locais</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoCard, { backgroundColor: cardFundo }]} onPress={() => abrirGerenciador('promotores', 'Promotor(a)')}>
          <Text style={styles.iconeCard}>👥</Text>
          <Text style={[styles.textoCard, { color: textoCor }]}>Promotores</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoCard, { backgroundColor: cardFundo }]} onPress={() => abrirGerenciador('tipos_servico', 'Tipo de Serviço')}>
          <Text style={styles.iconeCard}>🧀</Text>
          <Text style={[styles.textoCard, { color: textoCor }]}>Tipos de Serviço</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  botaoVoltar: { marginBottom: 15, paddingVertical: 10, marginTop: 20 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 30 },
  listaBotoes: { flex: 1 },
  botaoCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  iconeCard: { fontSize: 24, marginRight: 15 },
  textoCard: { fontSize: 18, fontWeight: 'bold' },
});