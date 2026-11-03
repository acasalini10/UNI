// AI-assisted (Claude Code): inline form error and info banner used by the sign-in screens.
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { colors, layout, radius, spacing, typography } from "@/theme";

export function FormError({ text }: { text: string }) {
  return (
    <View style={styles.errorRow} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <SymbolView name="exclamationmark.circle" tintColor={colors.errorText} size={18} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

export function Banner({ text }: { text: string }) {
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <SymbolView name="envelope" tintColor={colors.link} size={18} />
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    flex: 1,
    color: colors.errorText,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: layout.borderWidth,
    borderColor: colors.infoBannerBorder,
    backgroundColor: colors.infoBannerBg,
  },
  bannerText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.infoBannerText,
  },
});
