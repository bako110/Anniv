import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const API_BASE_URL = 'http://192.168.11.120:8000';

let authTokenCache = null;

class EventService {
  // ✅ Stocke le token en cache + dans AsyncStorage
  async setAuthToken(token) {
    authTokenCache = token;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // ✅ Efface le token de partout
  async clearAuthToken() {
    authTokenCache = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // ✅ Récupère le token, avec possibilité de forcer une mise à jour
  async getAuthToken(forceRefresh = false) {
    if (authTokenCache && !forceRefresh) return authTokenCache;

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      authTokenCache = token;
      return token;
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  // ✅ Requête générique sécurisée
  async makeRequest(url, method = 'GET', body = null, contentType = 'application/json') {
    const token = await this.getAuthToken();
    const headers = { 'Content-Type': contentType };
    
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const config = { method, headers };
    if (body) {
      config.body = contentType === 'application/json' ? JSON.stringify(body) : body;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur ${response.status}`);
    }

    return response.json();
  }

  // ✅ Crée un événement (multipart/form-data)
  async createEvent(eventData) {
    try {
      const token = await this.getAuthToken(true); // force refresh du token

      if (!token) throw new Error("Token d'authentification manquant");

      const formData = new FormData();
      const eventJson = JSON.stringify({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category: eventData.category,
        price: eventData.price,
        is_public: eventData.is_public,
        allow_comments: eventData.allow_comments,
        allow_sharing: eventData.allow_sharing,
        max_attendees: eventData.max_attendees,
      });

      formData.append('event_data', eventJson);

      if (eventData.image) {
        const imageUri = eventData.image;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la création de l'événement");
      }

      const result = await response.json();
      return { success: true, data: result, message: "Événement créé avec succès" };

    } catch (error) {
      console.error('Erreur création événement:', error);

      if (error.message.includes('Network request failed')) {
        await this.saveEventOffline(eventData);
        return {
          success: false,
          offline: true,
          message: "Événement sauvegardé localement. Il sera publié dès que la connexion sera rétablie."
        };
      }

      return { success: false, error: error.message, message: "Erreur lors de la création de l'événement" };
    }
  }

  // ✅ Enregistre en local (hors ligne)
  async saveEventOffline(eventData) {
    try {
      const offlineEvents = await AsyncStorage.getItem('offline_events');
      const events = offlineEvents ? JSON.parse(offlineEvents) : [];
      events.push({
        ...eventData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        offline: true
      });
      await AsyncStorage.setItem('offline_events', JSON.stringify(events));
    } catch (error) {
      console.error('Erreur sauvegarde hors ligne:', error);
    }
  }

  // ✅ Liste des événements avec filtres
  async getEvents(page = 1, perPage = 20, filters = {}) {
    try {
      if (filters.date_from instanceof Date) filters.date_from = filters.date_from.toISOString();
      if (filters.date_to instanceof Date) filters.date_to = filters.date_to.toISOString();

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filters,
      });

      for (const [key, value] of params.entries()) {
        if (!value || value === 'undefined' || value === 'null') {
          params.delete(key);
        }
      }

      const result = await this.makeRequest(`/events?${params.toString()}`);

      const eventsWithFullData = (result.events || []).map(event => ({
        ...event,
        image: this.processImageUri(event.image),
        organizer_name: event.organizer_name || event.organizer?.full_name,
        organizer: event.organizer || {
          full_name: event.organizer_name,
          id: event.organizer_id
        },
        is_full: event.participant_count >= event.max_attendees
      }));

      return {
        success: true,
        data: {
          events: eventsWithFullData,
          total: result.total || 0,
          pages: result.pages || 0,
          page: result.page || page,
          per_page: result.per_page || perPage,
        }
      };
    } catch (error) {
      console.error('Erreur récupération événements:', error);
      return { success: false, error: error.message };
    }
  }

  processImageUri(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/static/${imagePath}`;
  }

  async joinEvent(eventId) {
    try {
      const result = await this.makeRequest(`/events/${eventId}/join`, 'POST');
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur inscription événement:', error);
      return { success: false, error: error.message };
    }
  }

  async leaveEvent(eventId) {
    try {
      const result = await this.makeRequest(`/events/${eventId}/leave`, 'POST');
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur désistement événement:', error);
      return { success: false, error: error.message };
    }
  }

  async getEventComments(eventId) {
    try {
      const result = await this.makeRequest(`/events/${eventId}/comments`);
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur récupération commentaires:', error);
      return { success: false, error: error.message };
    }
  }

  async addComment(eventId, commentData) {
    try {
      const result = await this.makeRequest(
        `/events/${eventId}/comments`, 
        'POST', 
        commentData
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      return { success: false, error: error.message };
    }
  }

  async syncOfflineEvents() {
    try {
      const offlineEvents = await AsyncStorage.getItem('offline_events');
      if (!offlineEvents) return;

      const events = JSON.parse(offlineEvents);
      const syncedEvents = [];

      for (const event of events) {
        const result = await this.createEvent(event);
        if (result.success) syncedEvents.push(event);
      }

      if (syncedEvents.length > 0) {
        const remainingEvents = events.filter(
          event => !syncedEvents.some(synced => synced.id === event.id)
        );
        await AsyncStorage.setItem('offline_events', JSON.stringify(remainingEvents));
      }
    } catch (error) {
      console.error('Erreur synchronisation événements:', error);
    }
  }
}

export default new EventService();
