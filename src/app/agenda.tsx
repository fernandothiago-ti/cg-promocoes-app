import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function AgendaScreen() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.isDarkMode !== undefined) {
      setIsDarkMode(user.user_metadata.isDarkMode);
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data_evento', { ascending: true });

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar a agenda.');
    } else {
      setAgendamentos(data || []);
      setAgendamentosFiltrados(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let resultado = agendamentos;
    if (busca.trim() !== '') {
      resultado = resultado.filter(item => 
        (item.cliente_nome && item.cliente_nome.toLowerCase().includes(busca.toLowerCase())) ||
        (item.local_mercado && item.local_mercado.toLowerCase().includes(busca.toLowerCase())) ||
        (item.colaborador && item.colaborador.toLowerCase().includes(busca.toLowerCase()))
      );
    }
    if (filtroAtivo === 'mes') {
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      resultado = resultado.filter(item => {
        const dataEv = new Date(item.data_evento);
        return dataEv.getMonth() === mesAtual && dataEv.getFullYear() === anoAtual;
      });
    }
    setAgendamentosFiltrados(resultado);
  }, [busca, filtroAtivo, agendamentos]);

  const temaFundo = isDarkMode ? '#000000' : '#F5F5F5';
  const textoCor = isDarkMode ? '#FFFFFF' : '#111111';
  const cardFundo = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: temaFundo }]}>
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/home' as any)}>
        <Text style={styles.textoBotaoVoltar}>← Voltar ao Painel</Text>
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: textoCor }]}>Lista de Agenda</Text>
      <Text style={styles.subtitulo}>Consulte e filtre os seus eventos</Text>

      <TextInput
        style={[styles.inputBusca, isDarkMode ? styles.inputDark : styles.inputLight]}
        placeholder="🔍 Pesquisar por cliente, mercado ou promotor..."
        placeholderTextColor="#888"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.filtrosRow}>
        <TouchableOpacity 
          style={[styles.btnFiltro, filtroAtivo === 'todos' && styles.btnFiltroAtivo, isDarkMode ? styles.cardDark : styles.cardLight]} 
          onPress={() => setFiltroAtivo('todos')}
        >
          <Text style={[styles.txtFiltro, filtroAtivo === 'todos' && { color: '#FFF' }]}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnFiltro, filtroAtivo === 'mes' && styles.btnFiltroAtivo, isDarkMode ? styles.cardDark : styles.cardLight]} 
          onPress={() => setFiltroAtivo('mes')}
        >
          <Text style={[styles.txtFiltro, filtroAtivo === 'mes' && { color: '#FFF' }]}>Este Mês</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={agendamentosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: cardFundo }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardCliente}>{item.cliente_nome}</Text>
                {item.tipo_degustacao ? (
                  <Text style={styles.cardTipoBadge}>{item.tipo_degustacao}</Text>
                ) : null}
              </View>

              <Text style={[styles.cardLocal, { color: textoCor }]}>🏪 {item.local_mercado}</Text>
              
              {item.colaborador && item.colaborador !== 'Não informado' && (
                <Text style={styles.cardDetalhe}>👤 Promotor(a): {item.colaborador}</Text>
              )}

              <Text style={styles.cardInfo}>
                📅 {new Date(item.data_evento).toLocaleDateString('pt-BR')} | ⏰ {item.hora_inicio} - {item.hora_fim}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardDoc}>📄 {item.documento_fiscal || 'Nenhum'}</Text>
                <Text style={styles.cardValor}>R$ {Number(item.valor_trabalho || 0).toFixed(2)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum evento encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  botaoVoltar: { marginBottom: 15, paddingVertical: 10, marginTop: 20 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 20 },
  inputBusca: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 15, fontSize: 16 },
  inputDark: { backgroundColor: '#1E1E1E', color: '#FFFFFF', borderColor: '#333' },
  inputLight: { backgroundColor: '#FFFFFF', color: '#111111', borderColor: '#CCC' },
  filtrosRow: { flexDirection: 'row', marginBottom: 20 },
  btnFiltro: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#333' },
  btnFiltroAtivo: { backgroundColor: '#B8860B', borderColor: '#B8860B' },
  txtFiltro: { color: '#888', fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardCliente: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  cardTipoBadge: { backgroundColor: '#2A2000', color: '#D4AF37', fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#B8860B' },
  cardLocal: { fontSize: 15, marginBottom: 4 },
  cardDetalhe: { color: '#888', fontSize: 14, marginBottom: 4 },
  cardInfo: { color: '#888', fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 8 },
  cardDoc: { color: '#888', fontSize: 13 },
  cardValor: { color: '#4DA6FF', fontSize: 16, fontWeight: 'bold' },
  vazio: { textAlign: 'center', color: '#777', marginTop: 40, fontSize: 16 },
  cardDark: { backgroundColor: '#1E1E1E' },
  cardLight: { backgroundColor: '#FFFFFF' }
});