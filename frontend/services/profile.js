import {API_BASE_URL} from '../constants/config'

const defaultHeaders = {
  'Accept': 'application/json',
};


const normalizeIdentifier = (identifier) => {
  return encodeURIComponent((identifier || '').trim());
};

// Fonction robuste pour détecter un FormData (compatible React Native)
const isFormData = (body) => {
  if (!body) return false;
  return typeof body === 'object' && typeof body.append === 'function';
};

const apiRequest = async (url, options = {}) => {
  try {
    const formDataDetected = isFormData(options.body);

    const headers = {
      ...defaultHeaders,
      ...options.headers,
      ...(formDataDetected ? {} : { 'Content-Type': 'application/json' }),
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({
      detail: 'Réponse du serveur invalide'
    }));

    if (!response.ok) {
      const error = new Error(data.detail || data.message || `Erreur ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw Object.assign(new Error('Vérifiez votre connexion internet'), { status: 0 });
    }
    if (error.name === 'AbortError') {
      throw Object.assign(new Error('Connexion timeout'), { status: 0 });
    }
    throw error;
  }
};

// 🔍 Récupérer le profil complet
export const getProfile = async (identifier) => {
  return apiRequest(`/users/profile/${normalizeIdentifier(identifier)}`, {
    method: 'GET',
  });
};



// ✏️ Mettre à jour un profil

export const updateProfile = async (identifier, updates) => {
  console.log('Envoi updateProfile avec identifier:', identifier);
  console.log('Données envoyées:', updates);

  return apiRequest(`/users/profile/${normalizeIdentifier(identifier)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};


// 🗑️ Supprimer un profil
export const deleteProfile = async (identifier) => {
  return apiRequest(`/users/profile/${normalizeIdentifier(identifier)}`, {
    method: 'DELETE',
  });
};

// ✅ Uploader l'avatar (photo de profil)
export const uploadAvatar = async (identifier, file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'avatar.jpg',
    type: file.type || 'image/jpeg',
  });

  const result = await apiRequest(`/users/avatar/change/${normalizeIdentifier(identifier)}`, {
    method: 'POST',
    body: formData,
  });

  return result; // ✅ On récupère avatar_url dans le composant appelant
};

// ✅ Uploader la photo de couverture
export const uploadCoverPhoto = async (identifier, file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'cover.jpg',
    type: file.type || 'image/jpeg',
  });

  return apiRequest(`/users/cover/change/${normalizeIdentifier(identifier)}`, {
    method: 'POST',
    body: formData,
  });
};

// 🔁 Export regroupé
export const profileService = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  uploadCoverPhoto,
};

