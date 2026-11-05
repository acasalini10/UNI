// AI-assisted (Claude Code): stack for profile setup 2 and 2b, open to signed-in users (first setup and later edits).
import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="profile-funding" />
    </Stack>
  );
}
