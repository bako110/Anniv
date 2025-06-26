
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signup } from '../../../services/auth';
import { StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const countryCodes = [
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
];

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[2]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupMethod, setSignupMethod] = useState('all'); // 'email', 'phone', 'all'

  const handleSignUp = async () => {
    // Validation des champs obligatoires
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom et nom');
      return;
    }

    // Validation selon la méthode d'inscription
    if (signupMethod === 'email' && !email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }

    if (signupMethod === 'phone' && !phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (signupMethod === 'all' && !email.trim() && !phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer au moins un email ou un numéro de téléphone');
      return;
    }

    // Validation du mot de passe
    if (!password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez entrer et confirmer votre mot de passe');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation email format (basique)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Erreur', 'Format d\'email invalide');
      return;
    }

    // Validation des conditions
    if (!acceptTerms) {
      Alert.alert('Erreur', "Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données utilisateur
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password,
      };

      // Ajouter email si fourni et pas uniquement téléphone
      if (signupMethod !== 'phone' && email.trim()) {
        userData.email = email.trim().toLowerCase();
      }

      // Ajouter téléphone si fourni et pas uniquement email
      if (signupMethod !== 'email' && phone.trim()) {
        // Nettoyer le numéro de téléphone
        const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
        userData.phone = `${selectedCountry.code}${cleanPhone}`;
      }

      console.log('Données envoyées:', userData); // Pour le debug

      const response = await signup(userData);

      setIsLoading(false);
      
      Alert.alert(
        'Succès', 
        'Compte créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => router.push('/screens/auth/login')
          }
        ]
      );

    } catch (error) {
      setIsLoading(false);
      console.error('Erreur inscription:', error);
      
      Alert.alert(
        'Erreur', 
        error?.message || "Une erreur est survenue lors de l'inscription"
      );
    }
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.gradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#A0AEC0" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="person-add" size={40} color="#667eea" />
              </View>
              <Text style={styles.title}>Inscription</Text>
              <Text style={styles.subtitle}>Créez votre compte</Text>
            </View>

            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  signupMethod === 'email' && styles.methodButtonActive
                ]}
                onPress={() => setSignupMethod('email')}
              >
                <Ionicons name="mail-outline" size={20} color={signupMethod === 'email' ? '#fff' : '#A0AEC0'} />
                <Text style={[
                  styles.methodButtonText,
                  signupMethod === 'email' && styles.methodButtonTextActive
                ]}>
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  signupMethod === 'phone' && styles.methodButtonActive
                ]}
                onPress={() => setSignupMethod('phone')}
              >
                <Ionicons name="call-outline" size={20} color={signupMethod === 'phone' ? '#fff' : '#A0AEC0'} />
                <Text style={[
                  styles.methodButtonText,
                  signupMethod === 'phone' && styles.methodButtonTextActive
                ]}>
                  Téléphone
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  signupMethod === 'all' && styles.methodButtonActive
                ]}
                onPress={() => setSignupMethod('all')}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={signupMethod === 'all' ? '#fff' : '#A0AEC0'} />
                <Text style={[
                  styles.methodButtonText,
                  signupMethod === 'all' && styles.methodButtonTextActive
                ]}>
                  Les deux
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  placeholderTextColor="#718096"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom"
                  placeholderTextColor="#718096"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              {(signupMethod === 'email' || signupMethod === 'all') && (
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#718096"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {(signupMethod === 'phone' || signupMethod === 'all') && (
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(true)}
                    style={styles.countryCodeButton}
                  >
                    <Text style={styles.countryCodeText}>{selectedCountry.flag} {selectedCountry.code}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="12345678"
                    placeholderTextColor="#718096"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe (min. 6 caractères)"
                  placeholderTextColor="#718096"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmez le mot de passe"
                  placeholderTextColor="#718096"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                style={styles.termsContainer}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  J'accepte les{' '}
                  <Text style={styles.termsLink}>conditions d'utilisation</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Inscription...' : "S'inscrire"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OU</Text>
                <View style={styles.separatorLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#fff" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Déjà inscrit ? </Text>
                <TouchableOpacity onPress={() => router.push('/screens/auth/login')}>
                  <Text style={styles.signupLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          visible={showCountryPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choisir un pays</Text>
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#A0AEC0" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={countryCodes}
                renderItem={renderCountryItem}
                keyExtractor={(item) => item.code}
                style={styles.countryList}
              />
            </View>
          </View>
        </Modal>
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
  keyboardContainer: {
    flex: 1,
    paddingTop: 80,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    padding: 5,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
  },
  methodButtonActive: {
    backgroundColor: '#4A5568',
  },
  methodButtonText: {
    marginLeft: 6,
    color: '#A0AEC0',
    fontSize: 14,
  },
  methodButtonTextActive: {
    color: '#F7FAFC',
    fontWeight: '600',
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
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#F7FAFC',
    marginLeft: 10,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#4A5568',
  },
  countryCodeText: {
    color: '#F7FAFC',
    fontSize: 15,
    marginLeft: 5,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#4A5568',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D3748',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  termsText: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  termsLink: {
    color: '#667eea',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2D3748',
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: height * 0.6,
  },
  countryList: {
    padding: 10,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: '#F7FAFC',
    fontSize: 16,
  },
  countryCode: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  closeButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});