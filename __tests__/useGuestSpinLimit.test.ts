/**
 * Unit tests for hooks/useGuestSpinLimit.ts
 *
 * Tests the guest spin counter, limit enforcement, AsyncStorage persistence,
 * and daily reset logic.
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mutable auth mock state
let mockIsAuthenticated = false;

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: mockIsAuthenticated },
  }),
}));

const STORAGE_KEY = "dizzy:guestSpins";

describe("useGuestSpinLimit", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockIsAuthenticated = false;
    await AsyncStorage.clear();
  });

  it("isLimitReached is false for authenticated user regardless of spin count", async () => {
    mockIsAuthenticated = true;

    // Pre-populate storage with 10 spins
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 10, date: today })
    );

    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => {
      // Authenticated users are never limited
      expect(result.current.isLimitReached).toBe(false);
    });
  });

  it("isLimitReached is false for guest with 0 spins", async () => {
    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => {
      expect(result.current.isLimitReached).toBe(false);
      expect(result.current.spinsRemaining).toBe(3);
    });
  });

  it("isLimitReached is true for guest after 3 spins", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 3, date: today })
    );

    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => {
      expect(result.current.isLimitReached).toBe(true);
      expect(result.current.spinsRemaining).toBe(0);
    });
  });

  it("incrementSpinCount increments count", async () => {
    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => expect(result.current.spinsUsed).toBe(0));

    await act(async () => {
      await result.current.incrementSpinCount();
    });

    expect(result.current.spinsUsed).toBe(1);
    expect(result.current.spinsRemaining).toBe(2);
  });

  it("spinsRemaining decrements correctly", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 2, date: today })
    );

    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => {
      expect(result.current.spinsUsed).toBe(2);
      expect(result.current.spinsRemaining).toBe(1);
    });
  });

  it("resets count when stored date is not today", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 3, date: yesterday })
    );

    const { useGuestSpinLimit } = require("@/hooks/useGuestSpinLimit");
    const { result } = renderHook(() => useGuestSpinLimit());

    await waitFor(() => {
      // Count should reset since it's a new day
      expect(result.current.spinsUsed).toBe(0);
      expect(result.current.isLimitReached).toBe(false);
    });
  });
});
