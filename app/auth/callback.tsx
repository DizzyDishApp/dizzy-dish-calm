import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { useUI } from "@/context/UIContext";

// On Android, signals to Chrome Custom Tabs that the auth session is complete.
// On iOS (ASWebAuthenticationSession) this is a no-op.
WebBrowser.maybeCompleteAuthSession();

/**
 * OAuth callback screen — only reached on Android.
 *
 * On iOS, WebBrowser.openAuthSessionAsync intercepts the redirect via
 * ASWebAuthenticationSession and resolves inline in signInWithGoogle() before
 * Expo Router ever sees the URL. On Android, Chrome Custom Tabs fire the deep
 * link to the OS, which opens this screen, so we exchange the tokens here.
 *
 * Handles both:
 *  - PKCE flow:     dizzydish://auth/callback?code=…
 *  - Implicit flow: dizzydish://auth/callback#access_token=…&refresh_token=…
 *
 * onAuthStateChange in AuthContext picks up the session automatically after
 * exchangeCodeForSession / setSession resolves.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { showToast } = useUI();

  useEffect(() => {
    const exchange = async (url: string) => {
      try {
        // PKCE flow — one-time code in the query string
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/");
          return;
        }

        // Implicit flow — tokens in the URL fragment
        const fragment = url.includes("#") ? url.split("#")[1] : "";
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          router.replace("/");
          return;
        }

        // No recognisable auth params — bail to home silently
        router.replace("/");
      } catch {
        showToast("Sign-in failed. Please try again.", "error");
        router.replace("/");
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) exchange(url);
      else router.replace("/");
    });
  }, [router, showToast]);

  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator color="#C65D3D" />
    </View>
  );
}
