import { API_BASE_URL } from '@/constants/config';
import { io } from 'socket.io-client';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

let socket = null;

export const chatService = {
  // 1. Initialisation WebSocket
  connect: (token, userId) => {
    socket = io(API_BASE_URL.replace('/api', ''), {
      query: { token, userId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
    });
  },

  // 2. Déconnexion
  disconnect: () => {
    if (socket) socket.disconnect();
  },

  // 3. Envoyer un message
  sendMessage: (conversationId, message) => {
    if (socket) {
      socket.emit('message', { conversationId, message });
    }
  },

  // 4. Envoyer une notification de typing
  sendTyping: (conversationId) => {
    if (socket) {
      socket.emit('typing', { conversationId });
    }
  },

  // 5. Marquer les messages comme lus
  markAsRead: (conversationId) => {
    if (socket) {
      socket.emit('seen', { conversationId });
    }
  },

  // 6. Écouter les nouveaux messages
  onMessage: (callback) => {
    if (socket) {
      socket.on('message', callback);
    }
  },

  // 7. Charger les anciens messages
  fetchMessages: async (conversationId, token) => {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // 8. Charger les infos utilisateur
  fetchUser: async (userId, token) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // 9. Envoyer un message vocal
  uploadVoice: async (uri, token) => {
    const form = new FormData();
    form.append('file', {
      uri,
      type: 'audio/mpeg',
      name: 'voice.mp3',
    });

    const res = await fetch(`${API_BASE_URL}/upload/audio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: form,
    });

    return res.json(); // { url: 'https://...' }
  },

  // 10. Sélectionner un document
  pickDocument: async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      return result.assets[0]; // { uri, name, size, mimeType }
    }
    return null;
  },

  // 11. Sélectionner une image
  pickImage: async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  },

  // 12. Prendre une photo
  takePhoto: async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  },

  // 13. Envoyer un fichier image/document
  uploadFile: async (file, token) => {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      type: file.mimeType || 'application/octet-stream',
      name: file.name || 'upload',
    });

    const res = await fetch(`${API_BASE_URL}/upload/file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: form,
    });

    return res.json(); // { url: ... }
  },
};
