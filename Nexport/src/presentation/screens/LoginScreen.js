
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await onLogin(email.trim(), password);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>NEXPORT</Text>
          <Text style={styles.logoSubtitle}>
            SISTEMA DE GESTIÓN DE EXPORTACIONES
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.description}>
            Inicia sesión para acceder al sistema.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@ejemplo.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Nexport · Sistema de exportaciones
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 3,
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 30,
  },
});