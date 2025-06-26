import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const handleLogin = () => {
    router.push('/screens/auth/login');
  };

  const handleSignup = () => {
    router.push('/screens/auth/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A202C', '#2D3748']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo et Branding */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo-anniv.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.description}>
              L'application qui rend vos anniversaires {'\n'}
              inoubliables 🎂
            </Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Créer un compte</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
              <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En continuant, vous acceptez nos{' '}
              <Text style={styles.link}>Conditions d'utilisation</Text>
              {'\n'}et notre <Text style={styles.link}>Politique de confidentialité</Text>
            </Text>
          </View>
          <View style={styles.versionFooter}>
            <Text style={styles.versionText}>
              {Platform.OS.toUpperCase()} {Platform.Version} | v{Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
    top: 70,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  descriptionSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  buttonSection: {
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    bottom: 10
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#667eea',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  versionFooter: {
    marginTop: 16,
    alignItems: 'center',
    bottom: 40,
    left: 100,
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default WelcomeScreen;