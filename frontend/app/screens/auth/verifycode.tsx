import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { verifyResetCode, forgotPassword } from '@/services/auth';

const { width, height } = Dimensions.get('window');

export default function VerificationCodeScreen() {
  const { identifier } = useLocalSearchParams(); // récupère l'identifiant passé en navigation
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (text && index === 5) {
      handleVerifyCode();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyResetCode(verificationCode);
      const detectedIdentifier = response.identifier || identifier;

      router.push({
        pathname: '/screens/auth/resetpassword',
        params: { identifier: detectedIdentifier },
      });
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Échec de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!identifier) {
      Alert.alert('Erreur', 'Impossible de déterminer l’identifiant.');
      return;
    }

    setResending(true);
    try {
      await forgotPassword(identifier);
      Alert.alert('Code renvoyé', `Un nouveau code a été envoyé à ${identifier}`);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Échec de renvoi du code');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.gradient}>
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
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="lock-closed" size={40} color="#667eea" />
              </View>
              <Text style={styles.title}>Vérification du code</Text>
              <Text style={styles.subtitle}>
                Entrez le code à 6 chiffres envoyé à votre adresse email
              </Text>
            </View>

            <View style={styles.codeContainer}>
              {Array(6).fill(null).map((_, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputs.current[index] = ref)}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={code[index]}
                  onChangeText={text => handleChangeText(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.signupText}>Vous n'avez pas reçu de code ? </Text>
              <TouchableOpacity onPress={handleResendCode} disabled={resending}>
                <Text style={styles.signupLink}>
                  {resending ? 'Renvoi...' : 'Renvoyer le code'}
                </Text>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
  },
  codeInput: {
    width: 45,
    height: 60,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A5568',
    color: '#F7FAFC',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
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
  resendContainer: {
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