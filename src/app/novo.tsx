import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { supabase } from '../supabase';

export default function NovoAgendamento() {
  const [cliente, setCliente] = useState('');
  const [mercado, setMercado] = useState('');
  const [colaborador, setColaborador] = useState(''); 
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [documento, setDocumento] = useState('Nenhum');

  const [listaClientes, setListaClientes] = useState([]);
  const [listaMercados, setListaMercados] = useState([]);
  const [listaPromotores, setListaPromotores] = useState([]);
  const [listaTipos, setListaTipos] = useState([]);

  const [dataEvento, setDataEvento] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [tipoPicker, setTipoPicker] = useState<'data' | 'inicio' | 'fim'>('data');

  useEffect(() => {
    carregarListasBase();
  }, []);

  async function carregarListasBase() {
    const [resClientes, resMercados, resPromotores, resTipos] = await Promise.all([
      supabase.from('clientes').select('nome'),
      supabase.from('mercados').select('nome'),
      supabase.from('promotores').select('nome'),
      supabase.from('tipos_servico').select('nome'),
    ]);

    if (resClientes.data) {
      const formatados = resClientes.data.map((item: { nome: string }) => ({
        label: item.nome,
        value: item.nome,
      }));
      setListaClientes(formatados as never);
    }

    if (resMercados.data) {
      const formatados = resMercados.data.map((item: { nome: string }) => ({
        label: item.nome,
        value: item.nome,
      }));
      setListaMercados(formatados as never);
    }

    if (resPromotores.data) {
      const formatados = resPromotores.data.map((item: { nome: string }) => ({
        label: item.nome,
        value: item.nome,
      }));
      setListaPromotores(formatados as never);
    }

    if (resTipos.data) {
      const formatados = resTipos.data.map((item: { nome: string }) => ({
        label: item.nome,
        value: item.nome,
      }));
      setListaTipos(formatados as never);
    }
  }

  const abrirPicker = (tipo: 'data' | 'inicio' | 'fim') => { 
    setTipoPicker(tipo); 
    setShowPicker(true); 
  };
  
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

  const salvarAgendamento = async () => {
    if (!cliente || !mercado) {
      Alert.alert('Atenção', 'Selecione pelo menos o Cliente e o Mercado.'); 
      return;
    }
    const { error } = await supabase.from('agendamentos').insert([
      { 
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
      }
    ]);
    
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso!', 'Degustação agendada com sucesso.');
      router.replace('/home' as any); 
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.titulo}>Nova Degustação</Text>
      <View style={styles.form}>
        
        <Text style={styles.label}>Data do Evento</Text>
        <TouchableOpacity style={styles.btnDataHoraUnico} onPress={() => abrirPicker('data')}>
          <Text style={styles.txtDataHora}>📅 {formatarData(dataEvento)}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Horário (Início e Término)</Text>
        <View style={styles.botoesDataHora}>
          <TouchableOpacity style={styles.btnDataHora} onPress={() => abrirPicker('inicio')}>
            <Text style={styles.txtDataHora}>🟢 {formatarHora(horaInicio)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDataHora} onPress={() => abrirPicker('fim')}>
            <Text style={styles.txtDataHora}>🔴 {formatarHora(horaFim)}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker 
            value={getPickerValue()} 
            mode={tipoPicker === 'data' ? 'date' : 'time'} 
            is24Hour={true} 
            display="default" 
            onValueChange={onChangePicker} 
            onDismiss={() => setShowPicker(false)}
          />
        )}

        <Text style={styles.label}>Cliente (Marca)</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={listaClientes}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Selecione ou busque o cliente..."
          searchPlaceholder="🔍 Pesquisar cliente..."
          value={cliente}
          onChange={item => setCliente(item.value)}
        />

        <Text style={styles.label}>Local (Mercado)</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={listaMercados}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Selecione ou busque o mercado..."
          searchPlaceholder="🔍 Pesquisar mercado..."
          value={mercado}
          onChange={item => setMercado(item.value)}
        />

        <Text style={styles.label}>Promotor(a) / Colaborador(a)</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={listaPromotores}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Selecione ou busque o promotor..."
          searchPlaceholder="🔍 Pesquisar promotor..."
          value={colaborador}
          onChange={item => setColaborador(item.value)}
        />

        <Text style={styles.label}>Tipo de Degustação</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={listaTipos}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Selecione ou busque o tipo..."
          searchPlaceholder="🔍 Pesquisar tipo..."
          value={tipo}
          onChange={item => setTipo(item.value)}
        />

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
          <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.replace('/home' as any)}><Text style={styles.textoBotaoCancelar}>Cancelar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAgendamento}><Text style={styles.textoBotaoSalvar}>Salvar</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginTop: 40, marginBottom: 20, textAlign: 'center' },
  form: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  label: { fontSize: 16, fontWeight: '600', color: '#CCCCCC', marginBottom: 5, marginTop: 10 },
  botoesDataHora: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  btnDataHoraUnico: { backgroundColor: '#2C2C2C', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444', marginBottom: 10 },
  btnDataHora: { flex: 1, backgroundColor: '#2C2C2C', padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  txtDataHora: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#2C2C2C', color: '#FFF' },
  dropdown: { height: 50, borderColor: '#444', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#2C2C2C' },
  placeholderStyle: { fontSize: 16, color: '#888' },
  selectedTextStyle: { fontSize: 16, color: '#FFF' },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 16, backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 8, paddingHorizontal: 10 },
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