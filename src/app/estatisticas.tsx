import * as Print from 'expo-print';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function EstatisticasScreen() {
  const [loading, setLoading] = useState(true);
  
  const [totalFaturado, setTotalFaturado] = useState(0);
  const [totalEventos, setTotalEventos] = useState(0);
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [eventosMes, setEventosMes] = useState(0);
  const [topClientes, setTopClientes] = useState<any[]>([]);

  useEffect(() => {
    calcularEstatisticas();
  }, []);

  async function calcularEstatisticas() {
    const { data, error } = await supabase.from('agendamentos').select('*');

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar as estatísticas.');
      setLoading(false);
      return;
    }

    if (data) {
      let tFaturado = 0;
      let fMes = 0;
      let eMes = 0;
      
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth();
      const anoAtual = dataAtual.getFullYear();

      const clientesAgrupados: any = {};

      data.forEach((item) => {
        const valor = Number(item.valor_trabalho) || 0;
        tFaturado += valor;

        if (item.data_evento) {
          const dataEvento = new Date(item.data_evento);
          if (dataEvento.getMonth() === mesAtual && dataEvento.getFullYear() === anoAtual) {
            fMes += valor;
            eMes += 1;
          }
        }

        const nomeCliente = item.cliente_nome || 'Desconhecido';
        if (!clientesAgrupados[nomeCliente]) {
          clientesAgrupados[nomeCliente] = { nome: nomeCliente, valorTotal: 0, quantidade: 0 };
        }
        clientesAgrupados[nomeCliente].valorTotal += valor;
        clientesAgrupados[nomeCliente].quantidade += 1;
      });

      const listaClientes = Object.values(clientesAgrupados)
        .sort((a: any, b: any) => b.valorTotal - a.valorTotal)
        .slice(0, 3);

      setTotalEventos(data.length);
      setTotalFaturado(tFaturado);
      setFaturamentoMes(fMes);
      setEventosMes(eMes);
      setTopClientes(listaClientes);
    }
    
    setLoading(false);
  }

  // Função para Gerar Relatório em PDF
  async function gerarRelatorioPDF() {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial; padding: 30px; background-color: #fff; color: #333;">
            <h1 style="color: #B8860B; text-align: center;">CG Promoções</h1>
            <h3 style="text-align: center; color: #666;">Relatório de Desempenho e Faturação</h3>
            <hr style="border: 1px solid #B8860B; margin: 20px 0;" />
            <p style="font-size: 16px;"><b>Faturação do Mês Atual:</b> R$ ${faturamentoMes.toFixed(2)}</p>
            <p style="font-size: 16px;"><b>Eventos no Mês:</b> ${eventosMes}</p>
            <p style="font-size: 16px;"><b>Faturação Histórica Total:</b> R$ ${totalFaturado.toFixed(2)}</p>
            <p style="font-size: 16px;"><b>Total Geral de Eventos:</b> ${totalEventos}</p>
            <br/><br/>
            <p style="text-align: center; color: #888; font-size: 12px;">Gerado automaticamente pela aplicação PEX App - Gestão de Degustações.</p>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  }

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const mesNome = nomesMeses[new Date().getMonth()];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.textoBotaoVoltar}>← Voltar</Text>
        </TouchableOpacity>

        {/* Botão de Exportar PDF */}
        <TouchableOpacity style={styles.botaoPdf} onPress={gerarRelatorioPDF}>
          <Text style={styles.textoBotaoPdf}>📄 Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Dashboard</Text>
      <Text style={styles.subtitulo}>O seu desempenho em números</Text>

      <Text style={styles.sectionTitle}>📅 Resumo de {mesNome}</Text>
      <View style={styles.rowCards}>
        <View style={styles.cardDestaque}>
          <Text style={styles.cardLabel}>Faturação do Mês</Text>
          <Text style={styles.cardValorDestaque}>R$ {faturamentoMes.toFixed(2)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Eventos</Text>
          <Text style={styles.cardValor}>{eventosMes}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🌎 Histórico Global</Text>
      <View style={styles.rowCards}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Faturação Total</Text>
          <Text style={styles.cardValor}>R$ {totalFaturado.toFixed(2)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Total Eventos</Text>
          <Text style={styles.cardValor}>{totalEventos}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🏆 Top 3 Clientes (Receita)</Text>
      <View style={styles.cardLista}>
        {topClientes.length > 0 ? (
          topClientes.map((cliente, index) => (
            <View key={index} style={styles.linhaCliente}>
              <View style={styles.clienteInfo}>
                <Text style={styles.posicao}>{index + 1}º</Text>
                <View>
                  <Text style={styles.nomeCliente}>{cliente.nome}</Text>
                  <Text style={styles.detalheCliente}>{cliente.quantidade} degustações</Text>
                </View>
              </View>
              <Text style={styles.valorCliente}>R$ {cliente.valorTotal.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.textoVazio}>Ainda não há dados suficientes.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 15 },
  botaoVoltar: { paddingVertical: 10 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  botaoPdf: { backgroundColor: '#1E1E1E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37' },
  textoBotaoPdf: { color: '#D4AF37', fontWeight: 'bold', fontSize: 14 },
  
  titulo: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 30 },
  sectionTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },
  rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardInfo: { flex: 1, backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginHorizontal: 5, alignItems: 'center' },
  cardDestaque: { flex: 1.2, backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#B8860B', marginHorizontal: 5, alignItems: 'center' },
  cardLabel: { color: '#AAAAAA', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  cardValor: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  cardValorDestaque: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  cardLista: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  linhaCliente: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  clienteInfo: { flexDirection: 'row', alignItems: 'center' },
  posicao: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginRight: 15, width: 25 },
  nomeCliente: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  detalheCliente: { color: '#888888', fontSize: 13, marginTop: 2 },
  valorCliente: { color: '#4DA6FF', fontSize: 16, fontWeight: 'bold' },
  textoVazio: { color: '#888', textAlign: 'center', padding: 20, fontStyle: 'italic' }
});