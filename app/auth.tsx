import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { useUI } from "@/context/UIContext";

// Signals to Chrome Custom Tabs that the auth session is complete so the tab closes.
WebBrowser.maybeCompleteAuthSession();

/**
 * OAuth callback screen for Android.
 *
 * On Android, Chrome Custom Tabs fire dizzydish://auth as a system deep link
 * which opens the app here. WebBrowser.openAuthSessionAsync resolves without
 * a URL in this case, so we exchange the tokens from the deep link URL directly.
 *
 * On iOS, ASWebAuthenticationSession intercepts the redirect and resolves
 * openAuthSessionAsync inline — this screen is never reached.
 */
export default function Auth() {
  const router = useRouter();
  const { showToast } = useUI();

  useEffect(() => {
    const exchange = async (url: string) => {
      try {
        // PKCE flow — one-time code in the query string (?code=…)
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/");
          return;
        }

        // Implicit flow — tokens in the URL fragment (#access_token=…)
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

        // No auth params — session was already established by signInWithGoogle().
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
