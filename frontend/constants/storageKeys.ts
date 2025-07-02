export const STORAGE_KEYS = {
  AUTH_TOKEN: 'userToken',
  USER_INFO: 'userInfo',             
  LOGIN_METHOD: 'loginMethod',      
  USER_PROFILE: 'userProfile',
  USER_IDENTIFIER: 'userIdentifier',
  USER_EMAIL: 'userEmail',
  USER_PHONE: 'userPhone',
  PENDING_EVENTS: '@pending_events',
  CACHED_EVENTS: '@cached_events',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;