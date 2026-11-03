// AI-assisted (Claude Code): root layout with custom fonts, themed screen background, and session guard (signed out → (auth), signed in → app)
// AI-assisted (Copilot): wired the authenticated route to the four-tab navigation.
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useSession } from "@/data/session";
import { colors } from "@/theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const { session, loading } = useSession();
  const ready = fontsLoaded && !loading;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Without redirectTo, a guarded index falls back to itself and shows "Unmatched route". */}
        <Stack.Protected guard={session !== null} redirectTo="/sign-in">
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={session === null} redirectTo="/programs">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
