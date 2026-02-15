import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Typed AsyncStorage helpers for persistent data.
 * All keys are prefixed with "dizzy:" to avoid collisions.
 */

const PREFIX = "dizzy:";

function prefixKey(key: string): string {
  return `${PREFIX}${key}`;
}

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(prefixKey(key));
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(prefixKey(key), JSON.stringify(value));
  } catch {
    // Silently fail — storage write failure is non-critical
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(prefixKey(key));
  } catch {
    // Silently fail
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefixedKeys = keys.filter((k) => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(prefixedKeys);
  } catch {
    // Silently fail
  }
}

// ── Storage Keys ──

export const StorageKeys = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  THEME: "theme",
  PREFERENCES: "preferences",
} as const;
