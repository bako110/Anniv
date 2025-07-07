import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Récupère le profil d’un utilisateur par son ID
 * Nécessite que l’utilisateur soit authentifié (token dans AsyncStorage)
 * @param {string} userId - ID de l’utilisateur à récupérer
 * @returns {Promise<object>} données du profil
 */
export async function getUserProfile(userId) {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Utilisateur non authentifié');

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du profil: ${response.status}`);
    }

    // Lire la réponse brute textuelle
    const rawText = await response.text();

    // Puis parser en JSON
    const data = JSON.parse(rawText);
    return data;

  } catch (error) {
    console.error('❌ getUserProfile error:', error);
    throw error;
  }
}


/**
 * Suit un utilisateur
 * Nécessite authentification
 * @param {string} targetId - ID de l’utilisateur à suivre
 * @returns {Promise<object>} réponse du serveur
 */
export async function followUser(targetId) {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Utilisateur non authentifié');

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(targetId)}/follow`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Erreur lors du follow: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ followUser error:', error);
    throw error;
  }
}

/**
 * Ne suit plus un utilisateur
 * Nécessite authentification
 * @param {string} targetId - ID de l’utilisateur à unfollow
 * @returns {Promise<object>} réponse du serveur
 */
export async function unfollowUser(targetId) {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Utilisateur non authentifié');

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(targetId)}/unfollow`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Erreur lors du unfollow: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ unfollowUser error:', error);
    throw error;
  }
}
