import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Helper to build a mock session
function makeMockSession(overrides = {}) {
  return {
    access_token: "test-token",
    refresh_token: "test-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "user-1",
      email: "test@example.com",
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { full_name: "Test User" },
      created_at: "2024-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no existing session
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    (mockAuth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it("calls getSession on mount", async () => {
    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockAuth.getSession).toHaveBeenCalledTimes(1);
    });
  });

  it("sets isLoading to false after getSession resolves with no session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });
    expect(result.current.state.isAuthenticated).toBe(false);
  });

  it("signUp calls supabase.auth.signUp", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signUp("test@example.com", "password123");
    });

    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(response?.error).toBeNull();
  });

  it("signUp returns error message on failure", async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: "User already registered" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signUp("test@example.com", "pass");
    });

    expect(response?.error).toBe("User already registered");
  });

  it("signIn calls supabase.auth.signInWithPassword", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn("test@example.com", "password123");
    });

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(response?.error).toBeNull();
  });

  it("signIn returns error message on failure", async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn("test@example.com", "wrong");
    });

    expect(response?.error).toBe("Invalid login credentials");
  });

  it("signInWithGoogle calls supabase.auth.signInWithOAuth with google provider", async () => {
    (mockAuth.signInWithOAuth as jest.Mock).mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/auth" },
      error: null,
    });

    const WebBrowser = require("expo-web-browser");
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "dizzydish://auth/callback#access_token=tok&refresh_token=rtok",
    });
    (mockAuth.setSession as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: expect.objectContaining({ skipBrowserRedirect: true }),
    });
  });

  it("signOut calls supabase.auth.signOut", async () => {
    (mockAuth.signOut as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
  });
});
