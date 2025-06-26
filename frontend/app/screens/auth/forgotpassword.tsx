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
import { forgotPassword } from '../../../services/auth';

const { width, height } = Dimensions.get('window');

// Types d'identifiants
const IDENTIFIER_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
};

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState(IDENTIFIER_TYPES.EMAIL);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!identifier.trim()) {
      Alert.alert('Erreur', `Veuillez entrer votre ${identifierType === IDENTIFIER_TYPES.EMAIL ? 'adresse email' : 'numéro de téléphone'}.`);
      return;
    }

    // Validation selon le type
    let isValid = false;
    let errorMessage = '';

    if (identifierType === IDENTIFIER_TYPES.EMAIL) {
      // Regex email simple mais efficace
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(identifier.trim());
      errorMessage = 'Veuillez entrer une adresse email valide.';
    } else {
      // Regex téléphone (accepte +, espaces et chiffres)
      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      isValid = phoneRegex.test(identifier.trim());
      errorMessage = 'Veuillez entrer un numéro de téléphone valide (ex: +1234567890).';
    }

    if (!isValid) {
      Alert.alert('Erreur', errorMessage);
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(identifier.trim());
      
      Alert.alert(
        'Code envoyé',
        `Un code de vérification a été envoyé à votre ${identifierType === IDENTIFIER_TYPES.EMAIL ? 'adresse email' : 'numéro de téléphone'}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/screens/auth/verifycode',
                params: { 
                  identifier: identifier.trim(),
                  identifierType 
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur forgot password:', error);
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      
      if (error.status === 404) {
        errorMessage = `Aucun compte trouvé avec ce ${identifierType === IDENTIFIER_TYPES.EMAIL ? 'email' : 'numéro de téléphone'}.`;
      } else if (error.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
      } else if (error.status === 0) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleIdentifierType = () => {
    setIdentifierType(prev => 
      prev === IDENTIFIER_TYPES.EMAIL 
        ? IDENTIFIER_TYPES.PHONE 
        : IDENTIFIER_TYPES.EMAIL
    );
    setIdentifier(''); // Réinitialiser le champ quand on change de type
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
          onPress={() => router.push('/screens/auth/login')}
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
              <Text style={styles.title}>Mot de passe oublié</Text>
              <Text style={styles.subtitle}>
                Entrez votre {identifierType === IDENTIFIER_TYPES.EMAIL ? 'adresse email' : 'numéro de téléphone'} pour recevoir un code de vérification.
              </Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Sélecteur Email/Téléphone */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={toggleIdentifierType}
                disabled={loading}
              >
                <Text style={styles.toggleButtonText}>
                  Utiliser {identifierType === IDENTIFIER_TYPES.EMAIL ? 'un numéro de téléphone' : 'un email'} à la place
                </Text>
              </TouchableOpacity>

              {/* Champ Email/Téléphone */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name={identifierType === IDENTIFIER_TYPES.EMAIL ? 'mail' : 'phone-portrait'} 
                  size={20} 
                  color="#A0AEC0" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder={
                    identifierType === IDENTIFIER_TYPES.EMAIL 
                      ? 'exemple@domaine.com' 
                      : '+1234567890'
                  }
                  placeholderTextColor="#718096"
                  keyboardType={
                    identifierType === IDENTIFIER_TYPES.EMAIL 
                      ? 'email-address' 
                      : 'phone-pad'
                  }
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                  editable={!loading}
                />
              </View>

              {/* Bouton d'envoi */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#4A5568', '#4A5568'] : ['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={[styles.loginButtonText, loading && styles.loginButtonTextDisabled]}>
                    {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Retour à la connexion */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Vous souvenez-vous de votre mot de passe ? </Text>
                <TouchableOpacity onPress={() => router.push('/screens/auth/login')}>
                  <Text style={styles.signupLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
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
  loginContainer: {},
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  toggleButton: {
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '600',
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
  loginButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#A0AEC0',
    fontSize: 13,
  },
  signupLink: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '600',
  },
});