import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { updateUserStatus } from '@/services/status';

export default function useTrackUserOnlineStatus(userId, token) {
  const pingIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const sendStatus = async (isOnline) => {
    if (!userId || !token) return;
    try {
      await updateUserStatus(userId, token, isOnline);
      console.log(`[Status Hook] ${isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}`);
    } catch (err) {
      console.warn('[Status Hook] Erreur update status:', err.message);
    }
  };

  useEffect(() => {
    if (!userId || !token) return;

    const handleAppStateChange = (nextAppState) => {
      console.log('[AppState] Changement :', appStateRef.current, '→', nextAppState);

      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        sendStatus(true);
      } else if (nextAppState.match(/inactive|background/)) {
        sendStatus(false);
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Au montage → connecté
    sendStatus(true);

    // Ping régulier pour confirmer activité
    pingIntervalRef.current = setInterval(() => {
      sendStatus(true);
    }, 30000); // toutes les 30 secondes

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      subscription.remove(); // ✅ C’est ici la vraie méthode à utiliser
      sendStatus(false); // Hors ligne au démontage
    };
  }, [userId, token]);

  return null;
}
