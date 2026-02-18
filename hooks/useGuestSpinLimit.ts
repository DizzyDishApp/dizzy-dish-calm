import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

const GUEST_SPIN_LIMIT = 3;
const STORAGE_KEY = "dizzy:guestSpins";

interface GuestSpinData {
  count: number;
  date: string; // YYYY-MM-DD
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Tracks spin count for unauthenticated users.
 *
 * Persists to AsyncStorage so a hard reload doesn't reset the limit.
 * Resets daily — the date is stored alongside the count.
 *
 * Authenticated users are never limited.
 */
export function useGuestSpinLimit() {
  const { state: auth } = useAuth();
  const [spinsUsed, setSpinsUsed] = useState(0);

  // Load from AsyncStorage on mount
  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data: GuestSpinData = JSON.parse(raw);
        // Reset if it's a new day
        if (data.date !== todayStr()) {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ count: 0, date: todayStr() })
          );
          setSpinsUsed(0);
        } else {
          setSpinsUsed(data.count);
        }
      } catch {
        // Silently fail — storage errors are non-critical
      }
    }
    load();
  }, []);

  const incrementSpinCount = useCallback(async () => {
    const next = spinsUsed + 1;
    setSpinsUsed(next);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ count: next, date: todayStr() })
      );
    } catch {
      // Silently fail
    }
  }, [spinsUsed]);

  const isLimitReached =
    !auth.isAuthenticated && spinsUsed >= GUEST_SPIN_LIMIT;
  const spinsRemaining = Math.max(0, GUEST_SPIN_LIMIT - spinsUsed);

  return {
    spinsUsed,
    isLimitReached,
    spinsRemaining,
    incrementSpinCount,
  };
}
