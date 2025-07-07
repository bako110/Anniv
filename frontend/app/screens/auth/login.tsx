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
import { decode as atob } from 'base-64';

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


// Méthode de debug pour vérifier le token - VERSION AMÉLIORÉE
    const debugToken = async () => {
    try {
      console.log('🔍 === DÉBUT DEBUG TOKEN ===');
      let token = null;
      const directToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('🔍 Token direct AsyncStorage:', directToken ? 'TROUVÉ' : 'INTROUVABLE');
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 Toutes les clés disponibles:', allKeys);
      const authKeys = allKeys.filter(key => key.includes('AUTH') || key.includes('token'));
      console.log('🔍 Clés liées à AUTH/token:', authKeys);
      console.log('🔍 Clé STORAGE_KEYS.AUTH_TOKEN:', STORAGE_KEYS.AUTH_TOKEN);

      if (directToken) {
        token = directToken;
        console.log('🔍 Token trouvé - Longueur:', token.length);
        console.log('🔍 Token preview:', token.substring(0, 50) + '...');
        const parts = token.split('.');
        console.log('🔍 Parties JWT:', parts.length);

        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('🔍 Payload JWT:', {
              sub: payload.sub,
              exp: payload.exp,
              iat: payload.iat,
              user_id: payload.user_id,
              role: payload.role
            });
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < now;
            console.log('🔍 Token expiré:', isExpired);
            if (isExpired) {
              console.warn('🔍 ⚠️  TOKEN EXPIRÉ!');
            }
          } catch (parseError) {
            console.error('🔍 Erreur décodage payload:', parseError);
          }
        }
      } else {
        console.log('🔍 ❌ AUCUN TOKEN TROUVÉ');
      }

      console.log('🔍 === FIN DEBUG TOKEN ===');
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

    // Validation des champs
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

    try {
      // Nettoyage préalable du stockage
      await cleanupStorage();

      // Prépare les données login
      const loginData = {
        identifier,
        password,
        loginType: loginMethod,
        ...(loginMethod === 'email' ? { email: identifier } : { phone: identifier }),
      };

      console.log('[LOGIN] Tentative de connexion avec:', {
        identifier,
        loginType: loginMethod,
        timestamp: new Date().toISOString()
      });

      // Appel API login
      const response = await login(loginData.identifier, loginData.password, loginData.loginType);

      console.log('[LOGIN] Réponse serveur:', {
        hasToken: !!response?.access_token,
        tokenLength: response?.access_token?.length || 0,
        tokenPreview: response?.access_token?.substring(0, 20) + '...' || 'N/A',
        hasUser: !!response?.user,
        userId: response?.user?.id || 'N/A'
      });

      // Validation stricte de la réponse
      if (!response) {
        throw new Error('Aucune réponse du serveur');
      }
      if (!response.access_token) {
        throw new Error('Token d\'accès manquant dans la réponse');
      }
      if (!response.user) {
        throw new Error('Informations utilisateur manquantes dans la réponse');
      }
      if (!response.user.id) {
        throw new Error('ID utilisateur manquant dans la réponse');
      }

      // Validation du token (format JWT basique)
      const tokenParts = response.access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Format de token invalide');
      }

      // Vérifie que l'identifiant reçu correspond bien à celui envoyé
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

      // Stockage sécurisé et cohérent
      console.log('[LOGIN] Début du stockage des données...');
      
      // Stockage du token - PRIORITÉ ABSOLUE
      await setItem('AUTH_TOKEN', response.access_token);
      console.log('[LOGIN] Token stocké avec succès');

      // Vérification immédiate du stockage du token
      const storedToken = await debugToken();
      if (!storedToken || storedToken !== response.access_token) {
        throw new Error('Échec du stockage du token');
      }

      // Stockage des autres données utilisateur
      await setItem('USER_INFO', JSON.stringify(userFromResponse));
      await setItem('LOGIN_METHOD', loginMethod);
      await setItem('USER_IDENTIFIER', identifier);
      const userId = userFromResponse.id || userFromResponse.user_id;
      if (!userId) {
        console.error('❌ Aucun ID utilisateur trouvé dans la réponse');
      } else {
        await setItem('USER_ID', userId.toString());
      }


      if (userFromResponse.email) {
        await setItem('USER_EMAIL', sanitizeInput(userFromResponse.email));
      }
      if (userFromResponse.phone) {
        await setItem('USER_PHONE', formatPhoneNumber(userFromResponse.phone));
      }

      console.log('[LOGIN] Toutes les données utilisateur stockées avec succès');

      // Récupération du profil utilisateur
      const profileIdentifier = loginMethod === 'email' ? userFromResponse.email : userFromResponse.phone;
      if (!profileIdentifier) {
        throw new Error(`Identifiant ${loginMethod} non disponible pour récupérer le profil`);
      }

      const encodedIdentifier = encodeURIComponent(profileIdentifier);
      console.log('[LOGIN] Récupération du profil pour:', encodedIdentifier);
      
      const userProfile = await getProfile(encodedIdentifier, loginMethod);

      if (!userProfile) {
        Alert.alert(
          'Profil introuvable',
          'Votre profil utilisateur est introuvable. Veuillez contacter l\'administration.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      await setItem('USER_PROFILE', JSON.stringify(userProfile));
      console.log('[LOGIN] Profil utilisateur récupéré et stocké avec succès');

      // Vérification finale complète
      const finalToken = await debugToken();
      console.log('[LOGIN] Vérification finale - Token présent:', !!finalToken);

      Alert.alert(
        'Connexion réussie',
        userFromResponse.name ? `Bienvenue ${userFromResponse.name} !` : 'Bienvenue !',
        [{ 
          text: 'OK', 
          onPress: () => {
            console.log('[LOGIN] Redirection vers home');
            router.replace('/screens/social/home');
          }
        }]
      );

    } catch (error) {
      console.error('[LOGIN] Erreur de connexion:', error);

      // Nettoyage du stockage en cas d'échec
      await cleanupStorage();

      // Messages d'erreur user-friendly
      let errorMessage = 'Une erreur est survenue lors de la connexion';

      const status = error.status || error.response?.status;

      if (error.message?.includes('sécurité')) {
        errorMessage = 'Erreur de sécurité détectée. Veuillez réessayer.';
      } else if (error.message?.includes('Token')) {
        errorMessage = 'Erreur de token. Veuillez réessayer.';
      } else if (error.message?.includes('stockage')) {
        errorMessage = 'Erreur de stockage. Veuillez réessayer.';
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
      setIsLoading(false);
    }
  };

  // Fonction de nettoyage du stockage
  const cleanupStorage = async () => {
    try {
      const keysToRemove = [
        'AUTH_TOKEN', 'USER_INFO', 'USER_PROFILE',
        'USER_IDENTIFIER', 'USER_EMAIL', 'USER_PHONE', 
        'LOGIN_METHOD', 'USER_ID'
      ];
      
      // Utilise ta fonction setItem pour supprimer (avec null)
      for (const key of keysToRemove) {
        await setItem(key, null);
      }
      
      console.log('[LOGIN] Stockage nettoyé avec succès');
    } catch (cleanupError) {
      console.warn('[LOGIN] Erreur nettoyage stockage:', cleanupError);
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