// AI-assisted (Copilot): added the title-only Profile tab.
// AI-assisted (Claude Code): replaced the dev-only sign out with a gear that opens Settings 13.
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { t } from "@/i18n";
import { colors, layout, sizes, spacing, typography } from "@/theme";

export default function Profile() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("settings.title")}
          onPress={() => router.push("/settings")}
          style={styles.gear}
        >
          <SymbolView name="gearshape" tintColor={colors.text} size={sizes.icon} />
        </Pressable>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>{t("tabs.profile")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.sm,
  },
  gear: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
});
