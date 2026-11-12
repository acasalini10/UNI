// AI-assisted (Claude Code): root layout with custom fonts, themed screen background, guards (signed out → (auth); signed in without profile step 1 → (setup); otherwise tabs, Settings, Program detail, Careers, Add a university, University's master's and Checklist), and deadline reminders synced on launch and sign-in, cleared on sign out
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
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useSetupStep } from "@/data/profile";
import { clearReminders, syncReminders } from "@/data/reminders";
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
  const { step, loading: stepLoading } = useSetupStep(session?.user.id ?? null);
  const ready = fontsLoaded && !loading && !stepLoading;
  // After the first launch the Stack stays mounted (unmounting it would reset navigation);
  // a later reload of setup_step, e.g. right after sign-in, is covered by a spinner instead.
  const [started, setStarted] = useState(false);
  if (ready && !started) {
    setStarted(true);
  }

  useEffect(() => {
    if (started) {
      void SplashScreen.hideAsync();
    }
  }, [started]);

  // Deadline reminders: rescheduled at launch and on sign-in (deadlines may have changed); cleared on sign out.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (loading) return;
    void (userId ? syncReminders() : clearReminders());
  }, [loading, userId]);

  if (!ready && !started) {
    return null;
  }

  const signedIn = session !== null;
  // step null = profile could not be read (offline): open the tabs instead of trapping the user in setup.
  const setupDone = step === null || step >= 1;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Without redirectTo, a guarded index falls back to itself and shows "Unmatched route". */}
        <Stack.Protected guard={signedIn && setupDone} redirectTo={signedIn ? "/profile-setup" : "/sign-in"}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="program/[id]" />
          <Stack.Screen name="careers/[id]" />
          <Stack.Screen name="add-university" />
          <Stack.Screen name="university/[id]" />
          <Stack.Screen name="checklist/[id]" />
        </Stack.Protected>
        {/* Open to every signed-in user: first setup now, "Edit" from My Profile later. */}
        <Stack.Protected guard={signedIn} redirectTo="/sign-in">
          <Stack.Screen name="(setup)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo={setupDone ? "/programs" : "/profile-setup"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {!ready && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.text} />
        </View>
      )}
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
