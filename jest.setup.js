/* eslint-disable no-undef */

// ── react-native-reanimated mock ──
require("react-native-reanimated").setUpTests();

// ── expo-haptics mock ──
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// ── @react-native-async-storage/async-storage mock ──
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// ── expo-router mock ──
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: "Link",
}));

// ── expo-web-browser mock ──
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(),
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

// ── expo-linking mock ──
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path) => `dizzydish://${path}`),
  openURL: jest.fn(),
}));

// ── @expo/vector-icons mock ──
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Ionicons = React.forwardRef((props, ref) =>
    React.createElement(Text, { ...props, ref }, props.name)
  );
  Ionicons.displayName = "Ionicons";
  return { Ionicons };
});

// ── Supabase client mock ──
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      setSession: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// ── react-native-css-interop mock ──
jest.mock("react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context", () => ({
  maybeHijackSafeAreaProvider: (type) => type,
}));

jest.mock("react-native-css-interop", () => ({
  cssInterop: jest.fn((component) => component),
  remapProps: jest.fn(),
  createInteropElement: jest.fn(),
}));

// ── nativewind mock ──
jest.mock("nativewind", () => ({
  styled: (component) => component,
  useColorScheme: () => ({ colorScheme: "light", setColorScheme: jest.fn() }),
}));

// ── react-native-safe-area-context mock ──
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");

  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };

  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: {
      Consumer: ({ children }) => children(insets),
      Provider: ({ children }) => React.createElement(View, null, children),
    },
    SafeAreaFrameContext: {
      Consumer: ({ children }) => children(frame),
      Provider: ({ children }) => React.createElement(View, null, children),
    },
    initialWindowMetrics: { frame, insets },
  };
});

// ── Haptics helper mock ──
jest.mock("@/lib/haptics", () => ({
  haptic: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    select: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));
