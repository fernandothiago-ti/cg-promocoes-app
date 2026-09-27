import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);

  useEffect(() => {
    verificarBiometria();
  }, []);

  async function verificarBiometria() {
    const compativel = await LocalAuthentication.hasHardwareAsync();
    const cadastradas = await LocalAuthentication.isEnrolledAsync();
    if (compativel && cadastradas) {
      setBiometriaDisponivel(true);
    }
  }

  async function entrarComBiometria() {
    // Valida se o utilizador digitou o ecrã antes de usar a biometria
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o seu email antes de usar a biometria.');
      return;
    }

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: `Autenticar ${email}`,
      fallbackLabel: 'Usar palavra-passe',
    });

    if (resultado.success) {
      // Como o Supabase precisa da sessão ativa, se a biometria passar, 
      // podemos redirecionar diretamente para a Home se já tiver logado antes,
      // ou pedir a palavra-passe caso seja o primeiro acesso.
      router.replace('/home' as any);
    } else {
      Alert.alert('Erro', 'Autenticação biométrica falhou.');
    }
  }

  async function fazerLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o email e a palavra-passe.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no Login', error.message);
      setLoading(false);
    } else {
      router.replace('/home' as any);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CG Promoções</Text>
      <Text style={styles.subtitulo}>Aceda para gerir as suas degustações</Text>

      <TextInput
        style={styles.input}
        placeholder="O seu Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.botoesContainer}>
          <TouchableOpacity style={styles.botaoEntrar} onPress={fazerLogin}>
            <Text style={styles.textoBotaoEntrar}>Entrar</Text>
          </TouchableOpacity>

          {/* Só mostra o botão de biometria se houver hardware e o email estiver preenchido */}
          {biometriaDisponivel && email.trim().length > 0 && (
            <TouchableOpacity style={styles.botaoBiometria} onPress={entrarComBiometria}>
              <Text style={styles.textoBotaoBiometria}>🔐 Entrar com Biometria</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botaoNovaConta} onPress={() => router.push('/cadastro' as any)}>
            <Text style={styles.textoNovaConta}>Não tem conta? Criar agora</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20, justifyContent: 'center' },
  titulo: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1E1E1E', color: '#FFFFFF', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  botoesContainer: { marginTop: 10 },
  botaoEntrar: { backgroundColor: '#B8860B', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  textoBotaoEntrar: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botaoBiometria: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#D4AF37' },
  textoBotaoBiometria: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  botaoNovaConta: { padding: 10, alignItems: 'center' },
  textoNovaConta: { color: '#D4AF37', fontSize: 16 },
});