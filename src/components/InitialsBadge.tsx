// AI-assisted (Claude Code): university initials badge (no logos, data.md); brand color when the data has one.
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, sizes, typography } from "@/theme";

// Light brand colors need dark text: pick by perceived brightness.
function textOn(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? colors.onPrimary : colors.white;
}

export function InitialsBadge({ initials, color }: { initials: string; color: string | null }) {
  const bg = color ?? colors.surfaceRaised;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.text, { color: color ? textOn(color) : colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: sizes.programLogo,
    height: sizes.programLogo,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  text: { ...typography.fitLabel, fontSize: 15 },
});
