import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function EditarAgendamento() {
  // Recebe o ID do agendamento que clicámos na agenda
  const { id } = useLocalSearchParams();

  const [cliente, setCliente] = useState('');
  const [mercado, setMercado] = useState('');
  const [colaborador, setColaborador] = useState(''); 
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [documento, setDocumento] = useState('Nenhum');
  const [dataEvento, setDataEvento] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [tipoPicker, setTipoPicker] = useState<'data' | 'inicio' | 'fim'>('data');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  // Vai buscar os dados atuais para preencher o formulário
  async function carregarDados() {
    const { data, error } = await supabase.from('agendamentos').select('*').eq('id', id).single();
    
    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar o agendamento.');
      router.back();
    } else if (data) {
      setCliente(data.cliente_nome);
      setMercado(data.local_mercado);
      setColaborador(data.colaborador === 'Não informado' ? '' : data.colaborador);
      setTipo(data.tipo_degustacao);
      setValor(data.valor_trabalho.toString());
      setObservacoes(data.observacoes || '');
      setDocumento(data.documento_fiscal || 'Nenhum');
      
      if (data.data_evento) setDataEvento(new Date(data.data_evento));
      
      // Converte as horas guardadas como texto ("14:30") de volta para formato de Relógio
      const converterHora = (horaTexto: string) => {
        if (!horaTexto) return new Date();
        const [horas, minutos] = horaTexto.split(':');
        const dataTemp = new Date();
        dataTemp.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
        return dataTemp;
      };
      
      if (data.hora_inicio) setHoraInicio(converterHora(data.hora_inicio));
      if (data.hora_fim) setHoraFim(converterHora(data.hora_fim));
    }
    setLoading(false);
  }

  const abrirPicker = (tipo: 'data' | 'inicio' | 'fim') => { setTipoPicker(tipo); setShowPicker(true); };
  
  const onChangePicker = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      if (tipoPicker === 'data') setDataEvento(selectedDate);
      if (tipoPicker === 'inicio') setHoraInicio(selectedDate);
      if (tipoPicker === 'fim') setHoraFim(selectedDate);
    }
  };
  
  const getPickerValue = () => {
    if (tipoPicker === 'data') return dataEvento;
    if (tipoPicker === 'inicio') return horaInicio;
    return horaFim;
  };
  
  const formatarData = (data: Date) => data.toLocaleDateString('pt-BR');
  const formatarHora = (data: Date) => data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Salva as alterações (faz UPDATE em vez de INSERT)
  const atualizarAgendamento = async () => {
    if (!cliente || !mercado) {
      Alert.alert('Atenção', 'Preencha pelo menos o nome do Cliente e o Mercado.'); return;
    }
    
    const { error } = await supabase.from('agendamentos').update({ 
        cliente_nome: cliente, 
        local_mercado: mercado, 
        colaborador: colaborador || 'Não informado', 
        tipo_degustacao: tipo, 
        valor_trabalho: parseFloat(valor) || 0, 
        observacoes: observacoes, 
        documento_fiscal: documento, 
        data_evento: dataEvento.toISOString(), 
        hora_inicio: formatarHora(horaInicio), 
        hora_fim: formatarHora(horaFim) 
    }).eq('id', id);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso!', 'Agendamento atualizado com sucesso.');
      router.replace('/agenda' as any); 
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.titulo}>Editar Degustação</Text>
      <View style={styles.form}>
        
        <Text style={styles.label}>Data do Evento</Text>
        <TouchableOpacity style={styles.btnDataHoraUnico} onPress={() => abrirPicker('data')}><Text style={styles.txtDataHora}>📅 {formatarData(dataEvento)}</Text></TouchableOpacity>

        <Text style={styles.label}>Horário (Início e Término)</Text>
        <View style={styles.botoesDataHora}>
          <TouchableOpacity style={styles.btnDataHora} onPress={() => abrirPicker('inicio')}><Text style={styles.txtDataHora}>🟢 {formatarHora(horaInicio)}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnDataHora} onPress={() => abrirPicker('fim')}><Text style={styles.txtDataHora}>🔴 {formatarHora(horaFim)}</Text></TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker 
            value={getPickerValue()} mode={tipoPicker === 'data' ? 'date' : 'time'} is24Hour={true} display="default" 
            onValueChange={onChangePicker} onDismiss={() => setShowPicker(false)}
          />
        )}

        <Text style={styles.label}>Cliente (Marca)</Text>
        <TextInput style={styles.input} value={cliente} onChangeText={setCliente} placeholder="Ex: Nestlé, Sadia..." placeholderTextColor="#888" />
        <Text style={styles.label}>Local (Mercado)</Text>
        <TextInput style={styles.input} value={mercado} onChangeText={setMercado} placeholder="Ex: Carrefour, Assaí..." placeholderTextColor="#888" />
        <Text style={styles.label}>Promotor(a) / Colaborador(a)</Text>
        <TextInput style={styles.input} value={colaborador} onChangeText={setColaborador} placeholder="Nome de quem fará o evento..." placeholderTextColor="#888" />
        <Text style={styles.label}>Tipo de Degustação</Text>
        <TextInput style={styles.input} value={tipo} onChangeText={setTipo} placeholder="Ex: Queijos, Bebidas..." placeholderTextColor="#888" />
        <Text style={styles.label}>Valor do Trabalho (R$)</Text>
        <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="Ex: 150.00" keyboardType="numeric" placeholderTextColor="#888" />

        <Text style={styles.label}>Emissão de Documento</Text>
        <View style={styles.botoesDocumento}>
          <TouchableOpacity style={documento === 'Nenhum' ? styles.btnDocAtivo : styles.btnDoc} onPress={() => setDocumento('Nenhum')}><Text style={documento === 'Nenhum' ? styles.txtDocAtivo : styles.txtDoc}>Nenhum</Text></TouchableOpacity>
          <TouchableOpacity style={documento === 'Recibo' ? styles.btnDocAtivo : styles.btnDoc} onPress={() => setDocumento('Recibo')}><Text style={documento === 'Recibo' ? styles.txtDocAtivo : styles.txtDoc}>Recibo</Text></TouchableOpacity>
          <TouchableOpacity style={documento === 'Nota Fiscal' ? styles.btnDocAtivo : styles.btnDoc} onPress={() => setDocumento('Nota Fiscal')}><Text style={documento === 'Nota Fiscal' ? styles.txtDocAtivo : styles.txtDoc}>Nota Fiscal</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Observações</Text>
        <TextInput style={[styles.input, styles.textArea]} value={observacoes} onChangeText={setObservacoes} placeholder="Detalhes..." multiline={true} placeholderTextColor="#888" />

        <View style={styles.botoesAcao}>
          <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()}><Text style={styles.textoBotaoCancelar}>Cancelar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.botaoSalvar} onPress={atualizarAgendamento}><Text style={styles.textoBotaoSalvar}>Atualizar</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#D4AF37', marginTop: 40, marginBottom: 20, textAlign: 'center' }, // Destaquei o título a dourado para diferenciar do "Novo"
  form: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  label: { fontSize: 16, fontWeight: '600', color: '#CCCCCC', marginBottom: 5, marginTop: 10 },
  botoesDataHora: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  btnDataHoraUnico: { backgroundColor: '#2C2C2C', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444', marginBottom: 10 },
  btnDataHora: { flex: 1, backgroundColor: '#2C2C2C', padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  txtDataHora: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#2C2C2C', color: '#FFF' },
  botoesDocumento: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 5 },
  btnDoc: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#444', borderRadius: 8, marginHorizontal: 2, alignItems: 'center', backgroundColor: '#2C2C2C' },
  btnDocAtivo: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#B8860B', borderRadius: 8, marginHorizontal: 2, alignItems: 'center', backgroundColor: '#2A2000' }, 
  txtDoc: { color: '#CCCCCC', fontWeight: '600', fontSize: 13 },
  txtDocAtivo: { color: '#D4AF37', fontWeight: 'bold', fontSize: 13 },
  textArea: { height: 100, textAlignVertical: 'top' },
  botoesAcao: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 40 },
  botaoCancelar: { flex: 1, backgroundColor: 'transparent', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FF4444', marginRight: 10 },
  textoBotaoCancelar: { color: '#FF4444', fontSize: 16, fontWeight: 'bold' },
  botaoSalvar: { flex: 1, backgroundColor: '#B8860B', padding: 15, borderRadius: 8, alignItems: 'center' },
  textoBotaoSalvar: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' } 
});