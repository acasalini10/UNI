// AI-assisted (Claude Code): stack for the signed-out screens 1, 1b, 1c and 1d.
import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="set-password" />
      <Stack.Screen name="password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
