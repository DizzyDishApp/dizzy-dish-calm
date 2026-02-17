import { authReducer, mapSupabaseUser } from "@/context/AuthContext";
import type { Session } from "@supabase/supabase-js";

const initialState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

const mockSession = {
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: {
    id: "user-123",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { full_name: "Test User", avatar_url: "https://example.com/avatar.png" },
    created_at: "2024-01-01T00:00:00Z",
  },
} as unknown as Session;

describe("authReducer", () => {
  it("SET_SESSION sets user, session, isAuthenticated=true, isLoading=false", () => {
    const user = mapSupabaseUser(mockSession);
    const result = authReducer(initialState, {
      type: "SET_SESSION",
      payload: { user, session: mockSession },
    });

    expect(result.user).toEqual(user);
    expect(result.session).toBe(mockSession);
    expect(result.isAuthenticated).toBe(true);
    expect(result.isLoading).toBe(false);
  });

  it("CLEAR_SESSION clears user/session and sets isAuthenticated=false", () => {
    const user = mapSupabaseUser(mockSession);
    const authedState = {
      user,
      session: mockSession,
      isLoading: false,
      isAuthenticated: true,
    };

    const result = authReducer(authedState, { type: "CLEAR_SESSION" });

    expect(result.user).toBeNull();
    expect(result.session).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(result.isLoading).toBe(false);
  });

  it("SET_LOADING toggles isLoading", () => {
    const result = authReducer(initialState, {
      type: "SET_LOADING",
      payload: false,
    });
    expect(result.isLoading).toBe(false);

    const result2 = authReducer(result, {
      type: "SET_LOADING",
      payload: true,
    });
    expect(result2.isLoading).toBe(true);
  });

  it("unknown action returns unchanged state", () => {
    const result = authReducer(initialState, { type: "UNKNOWN" } as never);
    expect(result).toBe(initialState);
  });
});

describe("mapSupabaseUser", () => {
  it("maps session user to app User type", () => {
    const user = mapSupabaseUser(mockSession);
    expect(user.id).toBe("user-123");
    expect(user.email).toBe("test@example.com");
    expect(user.displayName).toBe("Test User");
    expect(user.avatarUrl).toBe("https://example.com/avatar.png");
    expect(user.isPro).toBe(false);
    expect(user.instacartConnected).toBe(false);
  });

  it("falls back to email prefix when no display name metadata", () => {
    const sessionNoName = {
      ...mockSession,
      user: {
        ...mockSession.user,
        user_metadata: {},
      },
    } as unknown as Session;

    const user = mapSupabaseUser(sessionNoName);
    expect(user.displayName).toBe("test");
  });
});
