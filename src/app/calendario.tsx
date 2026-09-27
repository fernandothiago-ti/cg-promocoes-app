import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { supabase } from '../supabase';

// Configuração para deixar o calendário em Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function CalendarioScreen() {
  const [marcacoes, setMarcacoes] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDatasDosEventos();
  }, []);

  async function buscarDatasDosEventos() {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('data_evento');

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do calendário.');
    } else if (data) {
      const novasMarcacoes: any = {};
      
      data.forEach((item) => {
        if (item.data_evento) {
          // CORREÇÃO DO FUSO HORÁRIO
          // Transforma o texto do banco de dados numa data real
          const dataObjeto = new Date(item.data_evento);
          
          // Extrai o ano, mês e dia com base no fuso horário local (Brasil)
          const ano = dataObjeto.getFullYear();
          const mes = String(dataObjeto.getMonth() + 1).padStart(2, '0');
          const dia = String(dataObjeto.getDate()).padStart(2, '0');
          
          // Remonta a data no formato exato que o calendário exige: YYYY-MM-DD
          const dataFormatada = `${ano}-${mes}-${dia}`;
          
          novasMarcacoes[dataFormatada] = { 
            customStyles: {
              container: {
                borderWidth: 2,
                borderColor: '#D4AF37', // Contorno Dourado
                borderRadius: 20, 
                backgroundColor: 'transparent' 
              },
              text: {
                color: '#D4AF37', // Texto Dourado
                fontWeight: 'bold'
              }
            }
          };
        }
      });
      
      setMarcacoes(novasMarcacoes);
    }
    setLoading(false);
  }

  const aoClicarNoDia = (day: any) => {
    if (marcacoes[day.dateString]) {
      router.push('/agenda' as any);
    } else {
      Alert.alert('Dia Livre', 'Não existem degustações agendadas para este dia.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/home' as any)}>
        <Text style={styles.textoBotaoVoltar}>← Voltar ao Painel</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Meu Calendário</Text>
      <Text style={styles.subtitulo}>Dias com círculo têm degustações</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.calendarioContainer}>
          <Calendar
            markingType={'custom'}
            markedDates={marcacoes}
            onDayPress={aoClicarNoDia}
            
            theme={{
              calendarBackground: '#1E1E1E',
              textSectionTitleColor: '#D4AF37',
              todayTextColor: '#FFFFFF',
              todayBackgroundColor: '#333333',
              dayTextColor: '#FFFFFF',
              textDisabledColor: '#555555',
              arrowColor: '#D4AF37',
              monthTextColor: '#D4AF37',
              indicatorColor: '#D4AF37',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  botaoVoltar: { marginBottom: 15, paddingVertical: 10, marginTop: 20 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  titulo: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 30 },
  calendarioContainer: {
    borderRadius: 10,
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: '#333333',
  }
});