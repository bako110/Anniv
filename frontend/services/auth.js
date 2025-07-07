// services/auth.js
import {API_BASE_URL} from '../constants/config'

// Configuration par défaut pour les requêtes
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Fonction pour faire les requêtes HTTP avec gestion d'erreurs améliorée
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: defaultHeaders,
      ...options,
    });

    // Récupérer le contenu de la réponse
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Si la réponse n'est pas du JSON valide
      data = { detail: 'Réponse du serveur invalide' };
    }

    // Vérifier si la réponse est un succès
    if (!response.ok) {
      // Extraire le message d'erreur selon la structure de votre backend
      const errorMessage = data.detail || data.message || `Erreur ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Gestion des erreurs réseau
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      const networkError = new Error('Vérifiez votre connexion internet');
      networkError.status = 0;
      throw networkError;
    }
    
    // Gestion des erreurs de timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Connexion timeout');
      timeoutError.status = 0;
      throw timeoutError;
    }

    // Relancer l'erreur si elle a déjà été traitée
    throw error;
  }
};

// Inscription
export const signup = async (userData) => {
  try {
    // Adapter les données pour correspondre au schéma backend
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      password: userData.password,
      password_confirm: userData.password, // Ajout de la confirmation
    };

    // Ajouter email si fourni
    if (userData.email) {
      payload.email = userData.email;
    }

    // Ajouter téléphone si fourni
    if (userData.phone) {
      payload.phone = userData.phone;
    }

    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Connexion
export const login = async (identifier, password) => {
  try {
    const payload = {
      identifier: identifier, 
      password: password,
    };

    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Déconnexion
export const logout = async (token) => {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Authorization': `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Mot de passe oublié
export const forgotPassword = async (identifier) => {
  try {
    const payload = {
      identifier: identifier, // email ou téléphone
    };

    const response = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Vérifier le code de réinitialisation
// Vérifier le code de réinitialisation (SANS identifier)
export const verifyResetCode = async (code) => {
  const payload = { code }; // juste le code
  const response = await apiRequest('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response;
};


// Réinitialiser le mot de passe
export const resetPassword = async (identifier, newPassword) => {
  try {
    const payload = {
      identifier: identifier,
      new_password: newPassword,
    };

    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Obtenir les informations du profil
export const getCurrentUser = async (token) => {
  try {
    const response = await apiRequest('/auth/me', {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        'Authorization': `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const socialLogin = async (platform, accessToken) => {
  try {
    const payload = {
      platform: platform,
      access_token: accessToken,
    };

    const response = await apiRequest('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    throw error;
  }
};