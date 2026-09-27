import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function CadastroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function criarConta() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } else {
      Alert.alert('Sucesso!', 'Conta criada com sucesso. Já pode entrar!');
      router.replace('/' as any); 
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>
      <Text style={styles.subtitulo}>Preencha os dados para se registar</Text>

      <TextInput style={styles.input} placeholder="O seu Email" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Palavra-passe (mínimo 6 caracteres)" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirmar Palavra-passe" placeholderTextColor="#888" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.botoesContainer}>
          <TouchableOpacity style={styles.botaoCriar} onPress={criarConta}>
            <Text style={styles.textoBotaoCriar}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
            <Text style={styles.textoBotaoVoltar}>← Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20, justifyContent: 'center' },
  titulo: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#1E1E1E', color: '#FFFFFF', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  botoesContainer: { marginTop: 10 },
  botaoCriar: { backgroundColor: '#B8860B', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  textoBotaoCriar: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botaoVoltar: { padding: 10, alignItems: 'center' },
  textoBotaoVoltar: { color: '#D4AF37', fontSize: 16 },
});