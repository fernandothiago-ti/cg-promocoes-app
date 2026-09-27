import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function GerenciarScreen() {
  const { tabela, titulo } = useLocalSearchParams(); // Recebe qual tabela vamos gerenciar (ex: 'clientes')
  
  const [itens, setItens] = useState<any[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tabela) {
      buscarItens();
    }
  }, [tabela]);

  async function buscarItens() {
    setLoading(true);
    const { data, error } = await supabase
      .from(tabela as string)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } else {
      setItens(data || []);
    }
    setLoading(false);
  }

  async function adicionarItem() {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Escreva um nome antes de adicionar.');
      return;
    }

    setSalvando(true);
    const { error } = await supabase
      .from(tabela as string)
      .insert([{ nome: novoNome.trim() }]);

    setSalvando(false);

    if (error) {
      Alert.alert('Erro', 'Não foi possível salvar: ' + error.message);
    } else {
      setNovoNome('');
      buscarItens(); // Atualiza a lista
    }
  }

  async function excluirItem(id: number) {
    Alert.alert('Excluir', 'Tem a certeza que deseja apagar este registo?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sim, excluir', 
        style: 'destructive', 
        onPress: async () => {
          const { error } = await supabase
            .from(tabela as string)
            .delete()
            .eq('id', id);

          if (error) {
            Alert.alert('Erro', 'Não foi possível excluir.');
          } else {
            setItens(itens.filter(item => item.id !== id));
          }
        } 
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <Text style={styles.textoBotaoVoltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Gerir {titulo}</Text>
      <Text style={styles.subtitulo}>Adicione ou remova itens da lista</Text>

      {/* Caixa de Adição */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Novo(a) ${titulo}...`}
          placeholderTextColor="#888"
          value={novoNome}
          onChangeText={setNovoNome}
        />
        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarItem} disabled={salvando}>
          <Text style={styles.textoBotaoAdicionar}>{salvando ? '...' : '+ Adicionar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Itens */}
      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <Text style={styles.textoItem}>{item.nome}</Text>
              <TouchableOpacity onPress={() => excluirItem(item.id)}>
                <Text style={styles.botaoExcluir}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum registo encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  botaoVoltar: { marginBottom: 15, paddingVertical: 10, marginTop: 20 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  titulo: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 20 },
  
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1E1E1E', color: '#FFFFFF', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#333', marginRight: 10 },
  botaoAdicionar: { backgroundColor: '#B8860B', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
  textoBotaoAdicionar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  textoItem: { color: '#FFFFFF', fontSize: 16, flex: 1 },
  botaoExcluir: { color: '#FF453A', fontWeight: 'bold', fontSize: 14 },
  vazio: { textAlign: 'center', color: '#777', marginTop: 30, fontSize: 16 }
});