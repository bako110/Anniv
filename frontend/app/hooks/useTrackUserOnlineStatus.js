import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { updateUserStatus } from '@/services/status';

export default function useTrackUserOnlineStatus(userId, token) {
  const pingIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const isUnmountedRef = useRef(false);
  const lastStatusRef = useRef(null);

  // Debounced status update to avoid rapid consecutive calls
  const sendStatus = useCallback(async (isOnline) => {
    if (!userId || !token || isUnmountedRef.current) return;
    
    // Avoid sending duplicate status updates
    if (lastStatusRef.current === isOnline) return;
    
    try {
      await updateUserStatus(userId, token, isOnline);
      lastStatusRef.current = isOnline;
      console.log(`[Status Hook] ${isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}`);
    } catch (err) {
      console.warn('[Status Hook] Erreur update status:', err.message);
      // Don't update lastStatusRef on error to allow retry
    }
  }, [userId, token]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!userId || !token) return;
    
    isUnmountedRef.current = false;

    const handleAppStateChange = (nextAppState) => {
      console.log('[AppState] Changement :', appStateRef.current, '→', nextAppState);

      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        sendStatus(true);
        // Restart ping interval when app becomes active
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          sendStatus(true);
        }, 30000);
      } else if (nextAppState.match(/inactive|background/)) {
        sendStatus(false);
        // Stop ping interval when app goes to background
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial status update
    sendStatus(true);

    // Start ping interval
    pingIntervalRef.current = setInterval(() => {
      sendStatus(true);
    }, 30000);

    return () => {
      isUnmountedRef.current = true;
      cleanup();
      subscription.remove();
      // Send offline status on unmount with a slight delay to ensure it's sent
      setTimeout(() => {
        if (userId && token) {
          updateUserStatus(userId, token, false).catch(err => 
            console.warn('[Status Hook] Erreur lors du démontage:', err.message)
          );
        }
      }, 100);
    };
  }, [userId, token, sendStatus, cleanup]);

  return null;
}