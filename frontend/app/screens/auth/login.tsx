import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../../services/auth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'

  const handleLogin = async () => {
    // Validation des champs
    const identifier = loginMethod === 'email' ? email.trim() : phone.trim();
    
    if (!identifier || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Validation email basique
    if (loginMethod === 'email' && !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    // Validation téléphone basique
    if (loginMethod === 'phone' && phone.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await login(identifier, password);
      
      // Vérifier la structure de la réponse
      if (response && response.access_token) {
        // Stocker le token et les informations utilisateur
        await AsyncStorage.setItem('userToken', response.access_token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user || {}));
        
        // Afficher un message de succès
        Alert.alert(
          'Connexion réussie', 
          'Bienvenue !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirection vers l'écran d'accueil après connexion réussie
                router.replace('/screens/social/home');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Réponse du serveur invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gestion spécifique des différents types d'erreurs
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.status === 401) {
        // Erreur d'authentification (identifiants incorrects)
        errorMessage = error.message || 'Identifiant ou mot de passe incorrect';
      } else if (error.status === 0) {
        // Erreur réseau
        errorMessage = error.message || 'Vérifiez votre connexion internet';
      } else if (error.status === 500) {
        // Erreur serveur
        errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
      } else if (error.message) {
        // Autres erreurs avec message
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    Alert.alert(
      'Connexion sociale',
      `La connexion via ${platform} sera bientôt disponible`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
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
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={styles.loginContainer}>
            {/* Logo/Titre */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="lock-closed" size={40} color="#667eea" />
              </View>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>Heureux de vous revoir</Text>
            </View>

            {/* Sélecteur de méthode de connexion */}
            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'email' && styles.methodButtonActive
                ]}
                onPress={() => {
                  setLoginMethod('email');
                  setPhone(''); // Clear phone when switching
                }}
              >
                <Ionicons name="mail" size={20} color={loginMethod === 'email' ? '#667eea' : '#A0AEC0'} />
                <Text style={[
                  styles.methodButtonText,
                  loginMethod === 'email' && styles.methodButtonTextActive
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'phone' && styles.methodButtonActive
                ]}
                onPress={() => {
                  setLoginMethod('phone');
                  setEmail(''); // Clear email when switching
                }}
              >
                <Ionicons name="phone-portrait" size={20} color={loginMethod === 'phone' ? '#667eea' : '#A0AEC0'} />
                <Text style={[
                  styles.methodButtonText,
                  loginMethod === 'phone' && styles.methodButtonTextActive
                ]}>
                  Téléphone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Champ Email ou Téléphone */}
              {loginMethod === 'email' ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse email"
                    placeholderTextColor="#718096"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Ionicons name="phone-portrait" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone"
                    placeholderTextColor="#718096"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              )}

              {/* Champ Mot de passe */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#718096"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>

              {/* Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/screens/auth/forgotpassword')}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              {/* Bouton de connexion */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#4A5568', '#4A5568'] : ['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loginButtonText}>Connexion en cours...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OU</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Boutons sociaux */}
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
                  onPress={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
                  onPress={() => handleSocialLogin('Facebook')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Pas encore de compte ? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/screens/auth/signup')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.signupLink,
                    isLoading && styles.signupLinkDisabled
                  ]}>
                    S'inscrire
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
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
    // Styles optionnels si besoin
  },
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
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    padding: 5,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#4A5568',
  },
  methodButtonText: {
    marginLeft: 8,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: '#F7FAFC',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    marginBottom: 14,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '500',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4A5568',
  },
  separatorText: {
    marginHorizontal: 14,
    color: '#A0AEC0',
    fontSize: 13,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#F7FAFC',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  signupLinkDisabled: {
    opacity: 0.6,
  },
});