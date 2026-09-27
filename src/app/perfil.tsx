import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function PerfilScreen() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [instagram, setInstagram] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } else if (user) {
      setEmail(user.email || '');
      const meta = user.user_metadata;
      if (meta) {
        setNome(meta.nome || '');
        setNascimento(meta.nascimento || '');
        setTelefone(meta.telefone || '');
        setEndereco(meta.endereco || '');
        setInstagram(meta.instagram || '');
        setAvatar(meta.avatar || null);
        if (meta.isDarkMode !== undefined) setIsDarkMode(meta.isDarkMode);
      }
    }
    setLoading(false);
  }

  const escolherFoto = async () => {
    if (!isEditing) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  async function salvarPerfil() {
    setSalvando(true);
    
    // Grava tudo no Supabase, incluindo a preferência do tema
    const { error } = await supabase.auth.updateUser({
      data: {
        nome,
        nascimento,
        telefone,
        endereco,
        instagram,
        avatar,
        isDarkMode
      }
    });

    setSalvando(false);

    if (error) {
      Alert.alert('Erro', 'Não foi possível guardar as alterações: ' + error.message);
    } else {
      Alert.alert('Sucesso', 'O seu perfil e as preferências foram guardados!');
      setIsEditing(false);
    }
  }

  async function fazerLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
    } else {
      router.replace('/' as any);
    }
  }

  const temaAtual = isDarkMode ? styles.dark : styles.light;

  if (loading) {
    return (
      <View style={[styles.container, styles.dark, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, temaAtual]} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.textoBotaoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        
        {!isEditing ? (
          <TouchableOpacity style={styles.botaoEditar} onPress={() => setIsEditing(true)}>
            <Text style={styles.textoBotaoEditar}>✏️ Editar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarPerfil} disabled={salvando}>
            <Text style={styles.textoBotaoSalvar}>{salvando ? 'A guardar...' : '💾 Salvar'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.conteudo}>
        <TouchableOpacity 
          style={[styles.avatarContainer, isEditing && styles.avatarEditando]} 
          onPress={escolherFoto}
          disabled={!isEditing}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImagem} />
          ) : (
            <Text style={styles.avatarTexto}>
              {nome ? nome.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U')}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.nomeUsuario, isDarkMode ? {color: '#FFF'} : {color: '#111'}]}>{nome || 'Nome não definido'}</Text>
        <Text style={styles.emailUsuario}>{email}</Text>

        <View style={[styles.cardInfo, isDarkMode ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.labelInput}>Nome Completo</Text>
          {isEditing ? (
            <TextInput style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]} value={nome} onChangeText={setNome} placeholder="O seu nome..." placeholderTextColor="#666" />
          ) : (
            <Text style={[styles.textoVisualizacao, isDarkMode ? {color: '#FFF'} : {color: '#333'}]}>{nome || '---'}</Text>
          )}

          <Text style={styles.labelInput}>Data de Nascimento</Text>
          {isEditing ? (
            <TextInput style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]} value={nascimento} onChangeText={setNascimento} placeholder="DD/MM/AAAA" placeholderTextColor="#666" />
          ) : (
            <Text style={[styles.textoVisualizacao, isDarkMode ? {color: '#FFF'} : {color: '#333'}]}>{nascimento || '---'}</Text>
          )}

          <Text style={styles.labelInput}>Telefone / WhatsApp</Text>
          {isEditing ? (
            <TextInput style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" placeholderTextColor="#666" />
          ) : (
            <Text style={[styles.textoVisualizacao, isDarkMode ? {color: '#FFF'} : {color: '#333'}]}>{telefone || '---'}</Text>
          )}

          <Text style={styles.labelInput}>Endereço Completo</Text>
          {isEditing ? (
            <TextInput style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]} value={endereco} onChangeText={setEndereco} placeholder="Rua, Número, Bairro, Cidade..." placeholderTextColor="#666" />
          ) : (
            <Text style={[styles.textoVisualizacao, isDarkMode ? {color: '#FFF'} : {color: '#333'}]}>{endereco || '---'}</Text>
          )}

          <Text style={styles.labelInput}>Instagram</Text>
          {isEditing ? (
            <TextInput style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]} value={instagram} onChangeText={setInstagram} placeholder="@seu.perfil" autoCapitalize="none" placeholderTextColor="#666" />
          ) : (
            <Text style={[styles.textoVisualizacao, isDarkMode ? {color: '#FFF'} : {color: '#333'}]}>{instagram || '---'}</Text>
          )}

          {/* Interruptor de Tema */}
          <View style={styles.linhaTema}>
            <Text style={styles.labelInput}>Ativar Modo Escuro</Text>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => setIsDarkMode(val)}
              trackColor={{ false: '#767577', true: '#B8860B' }}
            />
          </View>
        </View>

        {!isEditing && (
          <TouchableOpacity style={styles.botaoSair} onPress={fazerLogout}>
            <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  dark: { backgroundColor: '#000000' },
  light: { backgroundColor: '#F5F5F5' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  botaoVoltar: { paddingVertical: 10 },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  botaoEditar: { backgroundColor: '#1E1E1E', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37' },
  textoBotaoEditar: { color: '#D4AF37', fontWeight: 'bold' },
  botaoSalvar: { backgroundColor: '#B8860B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  textoBotaoSalvar: { color: '#FFFFFF', fontWeight: 'bold' },
  conteudo: { alignItems: 'center' },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D4AF37', marginBottom: 15 },
  avatarEditando: { borderStyle: 'dashed', borderColor: '#4DA6FF' },
  avatarImagem: { width: 116, height: 116, borderRadius: 58 },
  avatarTexto: { color: '#D4AF37', fontSize: 48, fontWeight: 'bold' },
  nomeUsuario: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  emailUsuario: { color: '#AAAAAA', fontSize: 16, marginBottom: 30 },
  cardInfo: { width: '100%', borderRadius: 10, padding: 20, marginBottom: 30, borderWidth: 1 },
  cardDark: { backgroundColor: '#1E1E1E', borderColor: '#333333' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD' },
  labelInput: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
  input: { borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1 },
  inputDark: { backgroundColor: '#2C2C2C', color: '#FFFFFF', borderColor: '#444' },
  inputLight: { backgroundColor: '#F9F9F9', color: '#111111', borderColor: '#CCC' },
  textoVisualizacao: { fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 5, marginBottom: 5 },
  linhaTema: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  botaoSair: { width: '100%', backgroundColor: 'transparent', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FF4444' },
  textoBotaoSair: { color: '#FF4444', fontSize: 16, fontWeight: 'bold' },
});