import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, StorageKey } from '../constants/storageKeys';

// ✅ Stocker un élément dans AsyncStorage
export const setItem = async (
  key: StorageKey,
  value: string | object
): Promise<void> => {
  try {
    if (!key || !(key in STORAGE_KEYS)) {
      console.error(`❌ Clé invalide ou non définie: "${key}"`);
      return;
    }

    const storageKey = STORAGE_KEYS[key];

    if (value === undefined || value === null) {
      console.warn(`⚠️ Valeur vide ignorée pour "${storageKey}"`);
      return;
    }

    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(storageKey, valueToStore);
    console.log(`✅ Donnée stockée: ${storageKey}`);
  } catch (error) {
    console.error(`❌ Erreur de stockage pour la clé "${key}":`, error);
  }
};

// ✅ Récupérer un élément depuis AsyncStorage
export const getItem = async (key: StorageKey): Promise<any> => {
  try {
    if (!key || !(key in STORAGE_KEYS)) {
      console.error(`❌ Clé invalide ou non définie: "${key}"`);
      return null;
    }

    const storageKey = STORAGE_KEYS[key];
    const value = await AsyncStorage.getItem(storageKey);

    if (value === null) {
      console.warn(`⚠️ Aucune donnée trouvée pour la clé "${storageKey}"`);
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`❌ Erreur de lecture pour la clé "${key}":`, error);
    return null;
  }
};

// ✅ Supprimer un élément dans AsyncStorage
export const removeItem = async (key: StorageKey): Promise<void> => {
  try {
    if (!key || !(key in STORAGE_KEYS)) {
      console.error(`❌ Clé invalide ou non définie: "${key}"`);
      return;
    }

    const storageKey = STORAGE_KEYS[key];
    await AsyncStorage.removeItem(storageKey);
    console.log(`✅ Donnée supprimée: ${storageKey}`);
  } catch (error) {
    console.error(`❌ Erreur de suppression pour la clé "${key}":`, error);
  }
};
