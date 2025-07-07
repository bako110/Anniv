import { API_BASE_URL } from '@/constants/config';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeoutMs: 8000, // 8 seconds
};

// HTTP status codes that should not be retried
const NON_RETRYABLE_STATUS_CODES = new Set([
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  422, // Unprocessable Entity
]);

// Exponential backoff delay calculation
const getRetryDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// React Native compatible fetch with timeout
const fetchWithTimeout = (resource, options = {}, timeout = RETRY_CONFIG.timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return fetch(resource, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Check if error should be retried
const shouldRetry = (error, response) => {
  // Don't retry on AbortError (timeout)
  if (error.name === 'AbortError') {
    return false;
  }

  // Don't retry on client errors (4xx)
  if (response && NON_RETRYABLE_STATUS_CODES.has(response.status)) {
    return false;
  }

  // Don't retry on network errors that are likely permanent
  if (error.message.includes('Network request failed') || 
      error.message.includes('TypeError: Failed to fetch')) {
    return false;
  }

  return true;
};

// Generic retry wrapper with improved error handling
const withRetry = async (operation, context = '') => {
  let lastError;
  let lastResponse;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Extract response from error if available
      if (error.response) {
        lastResponse = error.response;
      }

      // Check if we should retry
      if (!shouldRetry(error, lastResponse)) {
        console.warn(`[${context}] Erreur non-retriable détectée:`, error.message);
        throw error;
      }

      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[${context}] Échec après ${RETRY_CONFIG.maxRetries} tentatives:`, error.message);
        throw error;
      }

      const delay = getRetryDelay(attempt);
      console.warn(`[${context}] Tentative ${attempt + 1} échouée, retry dans ${Math.round(delay)}ms:`, error.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Validate required parameters
const validateParams = (userId, token, context) => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    const error = new Error("Token manquant ou invalide");
    console.warn(`[${context}] Erreur: Token manquant ou invalide`);
    throw error;
  }

  if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
    const error = new Error("UserId manquant ou invalide");
    console.warn(`[${context}] Erreur: UserId manquant ou invalide - reçu: ${userId}`);
    throw error;
  }
};

// Get user status with improved error handling
export async function getUserStatus(userId, token) {
  const context = 'getUserStatus';
  console.log(`[${context}] Début - userId: ${userId}, token: ${token ? 'présent' : 'absent'}`);

  try {
    validateParams(userId, token, context);
  } catch (error) {
    return Promise.reject(error);
  }

  return withRetry(async () => {
    const url = `${API_BASE_URL}/users/${userId}/status`;
    console.log(`[${context}] Appel API vers ${url}`);
    const startTime = Date.now();

    let response;
    try {
      response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }, RETRY_CONFIG.timeoutMs);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`[${context}] Timeout après ${RETRY_CONFIG.timeoutMs}ms`);
        throw new Error(`Timeout: La requête a pris plus de ${RETRY_CONFIG.timeoutMs}ms`);
      }
      throw error;
    }

    const responseTime = Date.now() - startTime;
    console.log(`[${context}] Réponse reçue en ${responseTime}ms - Status: ${response.status}`);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = response.statusText || 'Erreur inconnue';
      }
      
      console.error(`[${context}] Erreur HTTP ${response.status}: ${errorText}`);
      
      const error = new Error(`Erreur récupération status: ${response.status} - ${errorText}`);
      error.response = response;
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(`[${context}] Erreur parsing JSON:`, jsonError);
      throw new Error('Réponse invalide du serveur');
    }

    console.log(`[${context}] Données reçues:`, JSON.stringify(data, null, 2));

    // CORRECTION: Gérer le cas où data est un tableau
    let statusData;
    if (Array.isArray(data)) {
      // Si c'est un tableau, prendre le premier élément qui contient les données de statut
      statusData = data[0];
      console.log(`[${context}] Données extraites du tableau:`, statusData);
    } else {
      statusData = data;
    }

    // Validate response structure
    if (typeof statusData !== 'object' || statusData === null) {
      throw new Error('Structure de réponse invalide');
    }

    return {
      online_status: statusData.online_status ?? false,
      last_seen: statusData.last_seen ?? null,
      computed_at: statusData.computed_at ?? null,
      is_realtime: statusData.is_realtime ?? false,
    };
  }, context);
}

// Update user status with improved error handling
export async function updateUserStatus(userId, token, onlineStatus) {
  const context = 'updateUserStatus';
  console.log(`[${context}] Début - userId: ${userId}, status: ${onlineStatus}`);

  try {
    validateParams(userId, token, context);
  } catch (error) {
    return Promise.reject(error);
  }

  // Validate onlineStatus parameter
  if (typeof onlineStatus !== 'boolean') {
    const error = new Error("onlineStatus doit être un booléen");
    console.warn(`[${context}] Erreur: onlineStatus invalide - reçu: ${onlineStatus}`);
    return Promise.reject(error);
  }

  return withRetry(async () => {
    const url = `${API_BASE_URL}/users/${userId}/status`;
    const body = JSON.stringify({ online_status: onlineStatus });
    console.log(`[${context}] Appel API vers ${url}`, body);

    let response;
    try {
      response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      }, RETRY_CONFIG.timeoutMs);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`[${context}] Timeout après ${RETRY_CONFIG.timeoutMs}ms`);
        throw new Error(`Timeout: La requête a pris plus de ${RETRY_CONFIG.timeoutMs}ms`);
      }
      throw error;
    }

    console.log(`[${context}] Réponse - Status: ${response.status}`);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = response.statusText || 'Erreur inconnue';
      }
      
      console.error(`[${context}] Erreur HTTP ${response.status}: ${errorText}`);
      
      const error = new Error(`Erreur mise à jour status: ${response.status} - ${errorText}`);
      error.response = response;
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(`[${context}] Erreur parsing JSON:`, jsonError);
      throw new Error('Réponse invalide du serveur');
    }

    console.log(`[${context}] Réponse réussie:`, data);
    
    // CORRECTION: Gérer le cas où data est un tableau pour updateUserStatus aussi
    if (Array.isArray(data)) {
      return data[0];
    }
    
    return data;
  }, context);
}
