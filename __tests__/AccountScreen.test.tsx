import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// ── Mock context hooks ──

const mockSignUp = jest.fn().mockResolvedValue({ error: null });
const mockSignIn = jest.fn().mockResolvedValue({ error: null });
const mockSignInWithGoogle = jest.fn().mockResolvedValue({ error: null });
const mockSignOut = jest.fn().mockResolvedValue(undefined);

const defaultAuthState = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
};

let mockCurrentAuthState = { ...defaultAuthState };

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    state: mockCurrentAuthState,
    signUp: mockSignUp,
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
  }),
}));

const mockConsumeSnapshot = jest.fn().mockResolvedValue(null);
jest.mock("@/context/AuthRedirectContext", () => ({
  useAuthRedirect: () => ({
    setSnapshot: jest.fn(),
    consumeSnapshot: mockConsumeSnapshot,
  }),
}));

const mockShowToast = jest.fn();
jest.mock("@/context/UIContext", () => ({
  useUI: () => ({
    state: { isSpinning: false, toastMessage: null, toastVisible: false },
    setSpinning: jest.fn(),
    showToast: mockShowToast,
    hideToast: jest.fn(),
  }),
}));

jest.mock("@/hooks/useUserProfile", () => ({
  useSubscription: () => ({ data: { name: "Free Plan", price: "$0/month" } }),
  useUserProfile: () => ({ data: null }),
  useRevenueCatInfo: () => ({
    customerInfo: null,
    isPro: false,
    packages: [],
    isLoading: false,
    purchase: { mutate: jest.fn(), isPending: false },
    restore: { mutate: jest.fn(), isPending: false },
  }),
}));

jest.mock("@/hooks/useSavedRecipes", () => ({
  useSaveRecipe: () => ({ mutate: jest.fn() }),
  useUnsaveRecipe: () => ({ mutate: jest.fn() }),
  useSavedRecipes: () => ({ data: [] }),
}));

const mockCheckEmailExists = jest.fn();
jest.mock("@/lib/api", () => ({
  checkEmailExists: (...args: unknown[]) => mockCheckEmailExists(...args),
}));

// ── Import the screen after mocks ──
import AccountScreen from "@/app/(modal)/account";

describe("AccountScreen — unauthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentAuthState = { ...defaultAuthState };
  });

  it("renders social buttons", () => {
    const { getByText } = render(<AccountScreen />);
    expect(getByText("GOOGLE")).toBeTruthy();
    expect(getByText("FACEBOOK")).toBeTruthy();
    expect(getByText("APPLE")).toBeTruthy();
  });

  it("renders email input and GET STARTED button", () => {
    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    expect(getByPlaceholderText("you@email.com")).toBeTruthy();
    expect(getByText("GET STARTED")).toBeTruthy();
  });

  it("shows error for empty email", () => {
    const { getByText } = render(<AccountScreen />);
    fireEvent.press(getByText("GET STARTED"));
    expect(getByText("Please enter your email address.")).toBeTruthy();
  });

  it("shows error for invalid email format", () => {
    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "notanemail");
    fireEvent.press(getByText("GET STARTED"));
    expect(getByText("Please enter a valid email address.")).toBeTruthy();
  });

  it("transitions to 'Create Account' for new user", async () => {
    mockCheckEmailExists.mockResolvedValue(false);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "new@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => {
      expect(getByText("Create Account")).toBeTruthy();
    });
    // Should show confirm password field
    expect(getByPlaceholderText("Re-enter your password")).toBeTruthy();
  });

  it("transitions to 'Welcome Back' for existing user", async () => {
    mockCheckEmailExists.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "exists@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => {
      expect(getByText("Welcome Back")).toBeTruthy();
    });
  });

  it("shows error for empty password on submit", async () => {
    mockCheckEmailExists.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Welcome Back")).toBeTruthy());

    fireEvent.press(getByText("SIGN IN"));
    expect(getByText("Please enter a password.")).toBeTruthy();
  });

  it("shows error for short password", async () => {
    mockCheckEmailExists.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Welcome Back")).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText("Enter your password"),
      "12345"
    );
    fireEvent.press(getByText("SIGN IN"));
    expect(getByText("Password must be at least 6 characters.")).toBeTruthy();
  });

  it("shows error for mismatched passwords (new user)", async () => {
    mockCheckEmailExists.mockResolvedValue(false);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "new@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Create Account")).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText("At least 6 characters"),
      "password123"
    );
    fireEvent.changeText(
      getByPlaceholderText("Re-enter your password"),
      "different456"
    );
    fireEvent.press(getByText("SIGN UP"));
    expect(getByText("Passwords don't match.")).toBeTruthy();
  });

  it("calls signIn for existing user", async () => {
    mockCheckEmailExists.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Welcome Back")).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText("Enter your password"),
      "password123"
    );
    fireEvent.press(getByText("SIGN IN"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@test.com", "password123");
    });
  });

  it("calls signUp for new user", async () => {
    mockCheckEmailExists.mockResolvedValue(false);

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "new@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Create Account")).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText("At least 6 characters"),
      "password123"
    );
    fireEvent.changeText(
      getByPlaceholderText("Re-enter your password"),
      "password123"
    );
    fireEvent.press(getByText("SIGN UP"));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith("new@test.com", "password123");
    });
  });

  it("maps 'Invalid login credentials' to friendly error", async () => {
    mockCheckEmailExists.mockResolvedValue(true);
    mockSignIn.mockResolvedValue({ error: "Invalid login credentials" });

    const { getByPlaceholderText, getByText } = render(<AccountScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.press(getByText("GET STARTED"));

    await waitFor(() => expect(getByText("Welcome Back")).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText("Enter your password"),
      "wrongpassword"
    );
    fireEvent.press(getByText("SIGN IN"));

    await waitFor(() => {
      expect(
        getByText("Incorrect password. Please try again.")
      ).toBeTruthy();
    });
  });

  it("google button calls signInWithGoogle", () => {
    const { getByLabelText } = render(<AccountScreen />);
    fireEvent.press(getByLabelText("Sign in with GOOGLE"));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });
});

describe("AccountScreen — authenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentAuthState = {
      user: {
        id: "user-1",
        email: "test@example.com",
        displayName: "Test User",
        isPro: false,
        instacartConnected: false,
      },
      session: {} as never,
      isLoading: false,
      isAuthenticated: true,
    };
  });

  it("renders displayName and email", () => {
    const { getByText } = render(<AccountScreen />);
    expect(getByText("Test User")).toBeTruthy();
    expect(getByText("test@example.com")).toBeTruthy();
  });

  it("renders Connect Instacart button", () => {
    const { getByText } = render(<AccountScreen />);
    expect(getByText("Connect Instacart")).toBeTruthy();
  });

  it("renders Sign Out button and calls signOut", async () => {
    const { getByText } = render(<AccountScreen />);
    const signOutButton = getByText("Sign Out");
    expect(signOutButton).toBeTruthy();
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
