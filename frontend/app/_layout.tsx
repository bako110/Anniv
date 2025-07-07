import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';
import useTrackUserOnlineStatus from './hooks/useTrackUserOnlineStatus';
import { STORAGE_KEYS } from '../constants/storageKeys';

// Fonction utilitaire simple pour décoder le JWT (payload)
// Note: dans React Native, atob peut ne pas être défini, 
// il faudra peut-être utiliser un polyfill comme 'react-native-quick-base64' ou 'buffer'.
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Erreur parseJwt:', e);
    return null;
  }
}

export default function Layout() {
  const colorScheme = useColorScheme();

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userInfoJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);

        if (storedToken && userInfoJson) {
          const userInfo = JSON.parse(userInfoJson);
          const extractedUserId = userInfo?.id || userInfo?.userId || null;

          // Pas de validation ici, on accepte si token présent
          setToken(storedToken);
          setUserId(String(extractedUserId));
        } else {
          setToken(null);
          setUserId(null);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des infos utilisateur :', error);
        setToken(null);
        setUserId(null);
      }
    }

    loadUserData();
  }, []);

  // Hook qui gère la mise à jour du statut en ligne/offline via appels HTTP
  useTrackUserOnlineStatus(userId, token);

  // Fonction de déconnexion à appeler depuis ton UI
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setToken(null);
      setUserId(null);
      // Par exemple, rediriger vers écran login ici
      // router.replace('/screens/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LinearGradient colors={['#4FD1C5', '#3182CE']} style={styles.gradientBackground}>
          <View style={styles.container}>
            <Slot />
          </View>
        </LinearGradient>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
