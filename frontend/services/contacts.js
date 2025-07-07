import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Récupère la liste des amis d'un utilisateur et les trie par prénom
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des amis
 */
export async function fetchUserFriends(userId) {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Utilisateur non authentifié');

    const response = await fetch(`${API_BASE_URL}/friends/${encodeURIComponent(userId)}/friends`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur API fetchUserFriends : ${response.status} - ${errorText}`);
      throw new Error('Erreur de chargement des amis');
    }

    const data = await response.json();

    // ✅ Tri sécurisé des amis par prénom (first_name)
    const sortedData = data.sort((a, b) => {
      const nameA = (a.first_name || '').toLowerCase();
      const nameB = (b.first_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    console.log('✅ Liste triée des amis :', sortedData.map(u => `${u.first_name || ''} ${u.last_name || ''}`));
    return sortedData;

  } catch (error) {
    console.error('❌ Erreur fetchUserFriends:', error);
    throw error;
  }
}

/**
 * Recherche des utilisateurs par mot clé
 * @param {string} query - terme de recherche
 * @returns {Promise<Array>} Liste des utilisateurs trouvés
 */
export async function searchUsers(query) {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) throw new Error('Utilisateur non authentifié');

    const response = await fetch(`${API_BASE_URL}/friends/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur API searchUsers : ${response.status} - ${errorText}`);
      throw new Error('Erreur de recherche');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Erreur searchUsers:', error);
    throw error;
  }
}
