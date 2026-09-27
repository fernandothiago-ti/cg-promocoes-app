import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    carregarTemaGlobal();
  }, []);

  async function carregarTemaGlobal() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.isDarkMode !== undefined) {
      setIsDarkMode(user.user_metadata.isDarkMode);
    }
  }

  const temaFundo = isDarkMode ? '#000000' : '#F5F5F5';
  const textoCor = isDarkMode ? '#FFFFFF' : '#111111';
  const cardBackground = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: temaFundo }]}>
      
      <View style={styles.topBar}>
        <Link href="/cadastros" asChild>
          <TouchableOpacity style={StyleSheet.flatten([styles.botaoCadastrosTop, { backgroundColor: cardBackground }])}>
            <Text style={styles.textoCadastrosTop}>📋 Cadastros</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/perfil" asChild>
          <TouchableOpacity style={styles.botaoPerfilTop}>
            <Text style={styles.textoPerfilTop}>👤</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.content}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        
        <Text style={[styles.subtitulo, { color: isDarkMode ? '#AAAAAA' : '#555555' }]}>O que deseja fazer hoje?</Text>

        <Link href="/novo" asChild>
          <TouchableOpacity style={styles.botaoPrimario}>
            <Text style={styles.textoBotao}>+ Agendar Degustação</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/calendario" asChild>
          <TouchableOpacity style={StyleSheet.flatten([styles.botaoCalendario, { backgroundColor: cardBackground }])}>
            <Text style={[styles.textoBotaoCalendario, { color: textoCor }]}>📅 Calendário Mensal</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/agenda" asChild>
          <TouchableOpacity style={StyleSheet.flatten([styles.botaoSecundario, { backgroundColor: cardBackground }])}>
            <Text style={styles.textoBotaoSecundario}>Ver Lista de Agenda</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/estatisticas" asChild>
          <TouchableOpacity style={styles.botaoEstatisticas}>
            <Text style={styles.textoBotaoEstatisticas}>📊 Estatísticas e Relatórios</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 10 },
  botaoCadastrosTop: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37' },
  textoCadastrosTop: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  botaoPerfilTop: { padding: 5 },
  textoPerfilTop: { fontSize: 32 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  logo: { width: 240, height: 110, marginBottom: 10 },
  subtitulo: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  botaoPrimario: { width: '100%', backgroundColor: '#B8860B', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  botaoCalendario: { width: '100%', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#444' },
  textoBotaoCalendario: { fontSize: 18, fontWeight: 'bold' },
  botaoSecundario: { width: '100%', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#B8860B' },
  textoBotaoSecundario: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  botaoEstatisticas: { width: '100%', backgroundColor: '#001A33', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#0066CC' },
  textoBotaoEstatisticas: { color: '#4DA6FF', fontSize: 18, fontWeight: 'bold' },
  textoBotao: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});