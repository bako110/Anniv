import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { API_BASE_URL } from '../../constants/config';


class CommentService {
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  async getComments(eventId) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/comments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commentaires');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('getComments error:', error);
      return { success: false, error: error.message };
    }
  }

  async postComment(eventId, commentData) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi du commentaire');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('postComment error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CommentService();
