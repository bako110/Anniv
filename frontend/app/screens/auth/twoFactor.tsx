import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function TwoFactorScreen(): JSX.Element {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = () => {
    if (code.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code à 6 chiffres.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Succès', 'Code vérifié avec succès.');
      router.push('/(tabs)'); // Change '/(tabs)' selon ta route d'accueil
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.gradient}>
        <View style={styles.innerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#667eea" />
          </View>

          <Text style={styles.title}>Vérification à deux facteurs</Text>
          <Text style={styles.subtitle}>
            Entrez le code à 6 chiffres envoyé à votre adresse email.
          </Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="123456"
            placeholderTextColor="#A0AEC0"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Vérification...' : 'Vérifier'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  iconCircle: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E0',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#2D3748',
    borderColor: '#4A5568',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
