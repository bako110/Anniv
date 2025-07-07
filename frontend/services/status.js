import { API_BASE_URL } from '@/constants/config';

export async function getUserStatus(userId, token) {
  console.log(`[getUserStatus] Début - userId: ${userId}, token: ${token ? 'présent' : 'absent'}`);
  
  if (!token || !userId) {
    console.warn('[getUserStatus] Erreur: Token ou userId manquant');
    throw new Error("Token ou userId manquant");
  }

  try {
    console.log(`[getUserStatus] Appel API vers ${API_BASE_URL}/users/${userId}/status`);
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseTime = Date.now() - startTime;
    console.log(`[getUserStatus] Réponse reçue en ${responseTime}ms - Status: ${response.status}`);

    if (!response.ok) {
      const err = await response.text();
      console.error(`[getUserStatus] Erreur HTTP ${response.status}: ${err}`);
      throw new Error(`Erreur récupération status: ${response.status} - ${err}`);
    }

    const data = await response.json();
    console.log('[getUserStatus] Données reçues:', JSON.stringify(data, null, 2));
    
    const result = {
      online_status: data.online_status ?? false,
      last_seen: data.last_seen ?? null,
    };
    
    console.log('[getUserStatus] Résultat final:', result);
    return result;

  } catch (error) {
    console.error('[getUserStatus] Erreur:', error.message, error.stack);
    throw error;
  }
}

export async function updateUserStatus(userId, token, onlineStatus) {
  console.log(`[updateUserStatus] Début - userId: ${userId}, status: ${onlineStatus}`);
  
  if (!token || !userId) {
    console.warn('[updateUserStatus] Erreur: Token ou userId manquant');
    throw new Error("Token ou userId manquant");
  }

  try {
    const body = JSON.stringify({ online_status: onlineStatus });
    console.log(`[updateUserStatus] Appel API vers ${API_BASE_URL}/users/${userId}/status`, body);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    console.log(`[updateUserStatus] Réponse - Status: ${response.status}`);

    if (!response.ok) {
      const err = await response.text();
      console.error(`[updateUserStatus] Erreur HTTP ${response.status}: ${err}`);
      throw new Error(`Erreur mise à jour status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[updateUserStatus] Réponse réussie:', data);
    return data;

  } catch (error) {
    console.error('[updateUserStatus] Erreur:', error.message, error.stack);
    throw error;
  }
}