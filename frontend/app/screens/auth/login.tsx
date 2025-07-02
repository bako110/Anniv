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
import { getProfile } from '../../../services/profile';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { setItem } from '../../../utils/storage';


const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'

  // Fonction de validation email renforcée
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction de validation téléphone renforcée
  const validatePhone = (phone) => {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Vérifier format international ou local (8-15 chiffres)
    const phoneRegex = /^(\+?[1-9]\d{7,14})$/;
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 8;
  };

  // Fonction de nettoyage et formatage des données
  const sanitizeInput = (input) => {
    return input.trim().toLowerCase();
  };

  const formatPhoneNumber = (phone) => {
    // Nettoyer et formater le numéro de téléphone
    return phone.replace(/[\s\-\(\)]/g, '');
  };

  // Méthode de debug pour vérifier le token
  const debugToken = async () => {
    try {
      console.log('🔍 Clé utilisée:', STORAGE_KEYS.AUTH_TOKEN);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('🔍 Token trouvé:', token ? 'OUI' : 'NON');
      console.log('🔍 Token length:', token ? token.length : 0);
      console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    } catch (error) {
      console.error('🔍 Erreur debug token:', error);
      return null;
    }
  };


  
const handleLogin = async () => {
  const identifier = loginMethod === 'email' 
    ? sanitizeInput(email) 
    : formatPhoneNumber(phone.trim());

  if (!identifier || !password) {
    Alert.alert('Erreur de validation', 'Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Erreur de validation', 'Le mot de passe doit contenir au moins 6 caractères');
    return;
  }

  if (loginMethod === 'email' && !validateEmail(identifier)) {
    Alert.alert('Erreur de validation', 'Veuillez entrer une adresse email valide');
    return;
  }

  if (loginMethod === 'phone' && !validatePhone(identifier)) {
    Alert.alert('Erreur de validation', 'Veuillez entrer un numéro de téléphone valide');
    return;
  }

  setIsLoading(true);
  let loginSuccessful = false;

  try {
    const loginData = {
      identifier,
      password,
      loginType: loginMethod,
      ...(loginMethod === 'email' ? { email: identifier } : { phone: identifier }),
    };

    const response = await login(loginData.identifier, loginData.password, loginData.loginType);

    if (!response || !response.access_token || !response.user) {
      throw new Error('Réponse du serveur invalide ou incomplète');
    }

    const userFromResponse = response.user;
    let identifierMatch = false;

    if (loginMethod === 'email') {
      identifierMatch = userFromResponse.email && sanitizeInput(userFromResponse.email) === identifier;
    } else {
      identifierMatch = formatPhoneNumber(userFromResponse.phone || '') === identifier;
    }

    if (!identifierMatch) {
      throw new Error('Erreur de sécurité: les informations de connexion ne correspondent pas');
    }

    loginSuccessful = true;

    try {
      await setItem('AUTH_TOKEN', response.access_token);
      await setItem('USER_INFO', userFromResponse);
      await setItem('LOGIN_METHOD', loginMethod);
      await setItem('USER_IDENTIFIER', identifier);

      if (userFromResponse.email) await setItem('USER_EMAIL', sanitizeInput(userFromResponse.email));
      if (userFromResponse.phone) await setItem('USER_PHONE', formatPhoneNumber(userFromResponse.phone));
    } catch (storageError) {
      console.warn('⚠️ Problème lors du stockage des données utilisateur', storageError);
    }

    console.log('Authentification réussie, récupération du profil...');
    await debugToken();

    try {
      const profileIdentifier = loginMethod === 'email' ? userFromResponse.email : userFromResponse.phone;
      if (!profileIdentifier) throw new Error(`Identifiant ${loginMethod} non disponible`);

      const encodedIdentifier = encodeURIComponent(profileIdentifier);
      const userProfile = await getProfile(encodedIdentifier, loginMethod);

      if (userProfile) {
        await setItem('USER_PROFILE', userProfile);
        console.log('Profil utilisateur récupéré avec succès');
      }

    } catch (profileError) {
      console.log('Erreur lors de la récupération du profil:', profileError.message || profileError);
    }

    Alert.alert(
      'Connexion réussie',
      userFromResponse.name ? `Bienvenue ${userFromResponse.name} !` : 'Bienvenue !',
      [{ text: 'OK', onPress: () => router.replace('/screens/social/home') }]
    );

  } catch (error: any) {
    console.error('Erreur de connexion:', error);

    if (!loginSuccessful) {
      const keysToRemove: StorageKey[] = [
        'AUTH_TOKEN', 'USER_INFO', 'USER_PROFILE',
        'USER_IDENTIFIER', 'USER_EMAIL', 'USER_PHONE', 'LOGIN_METHOD'
      ];

      try {
        await AsyncStorage.multiRemove(keysToRemove.map(k => STORAGE_KEYS[k]));
      } catch (cleanupError) {
        console.warn('Erreur nettoyage stockage:', cleanupError);
      }
    }

    let errorMessage = 'Une erreur est survenue lors de la connexion';

    const status = error.status || error.response?.status;

    if (error.message?.includes('sécurité')) {
      errorMessage = 'Erreur de sécurité détectée. Veuillez réessayer.';
    } else if (status === 401) {
      errorMessage = loginMethod === 'email' 
        ? 'Email ou mot de passe incorrect' 
        : 'Numéro de téléphone ou mot de passe incorrect';
    } else if (status === 404) {
      errorMessage = loginMethod === 'email'
        ? 'Aucun compte associé à cette adresse email'
        : 'Aucun compte associé à ce numéro de téléphone';
    } else if (status === 422) {
      errorMessage = 'Données invalides. Vérifiez vos informations.';
    } else if (status === 0 || error.code === 'NETWORK_ERROR') {
      errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
    } else if (status === 500) {
      errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
    } else if (status === 429) {
      errorMessage = 'Trop de tentatives. Patientez avant de réessayer.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    Alert.alert('Erreur de connexion', errorMessage);

  } finally {
    await setIsLoading(false);
  }
};


  // Gestionnaire de changement de méthode de connexion avec nettoyage
  const handleMethodChange = (method) => {
    setLoginMethod(method);
    if (method === 'email') {
      setPhone(''); // Vider le téléphone quand on passe à email
    } else {
      setEmail(''); // Vider l'email quand on passe au téléphone
    }
    // Réinitialiser les erreurs
    console.log(`Méthode de connexion changée vers: ${method}`);
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
                onPress={() => handleMethodChange('email')}
                disabled={isLoading}
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
                onPress={() => handleMethodChange('phone')}
                disabled={isLoading}
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
                    placeholder="Adresse email (ex: user@domain.com)"
                    placeholderTextColor="#718096"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    maxLength={255}
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Ionicons name="phone-portrait" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone (+226XXXXXXXX)"
                    placeholderTextColor="#718096"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    maxLength={20}
                  />
                </View>
              )}

              {/* Champ Mot de passe */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe (min. 6 caractères)"
                  placeholderTextColor="#718096"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  maxLength={255}
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
                    <Text style={styles.loginButtonText}>
                      Se connecter par {loginMethod === 'email' ? 'email' : 'téléphone'}
                    </Text>
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