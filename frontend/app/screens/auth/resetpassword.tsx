import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    // Simulation de requête de réinitialisation
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.push('/screens/auth/login'),
          },
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1A202C', '#2D3748']}
        style={styles.gradient}
      >
        {/* Bouton de retour */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#A0AEC0" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginContainer}>
            {/* Logo/Titre */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="lock-closed" size={40} color="#667eea" />
              </View>
              <Text style={styles.title}>Réinitialisation</Text>
              <Text style={styles.subtitle}>
                Créez un nouveau mot de passe sécurisé
              </Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Nouveau mot de passe */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#718096"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirmation mot de passe */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#718096"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* Bouton de réinitialisation */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'En cours...' : 'Réinitialiser le mot de passe'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    borderRadius: 20,
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  loginContainer: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F7FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#F7FAFC',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});