// AI-assisted (Claude Code): fit label chip; the label key comes from fit.ts, the text from i18n.
import { StyleSheet, Text, View } from "react-native";

import type { FitLabel } from "@/lib/fit";
import { t } from "@/i18n";
import { colors, fitColors, radius, sizes, spacing, typography } from "@/theme";

export const fitChipColors: Record<FitLabel, { bg: string; fg: string }> = {
  safety: fitColors.Safety,
  match: fitColors.Match,
  reach: fitColors.Reach,
  not_yet_eligible: fitColors["Not yet eligible"],
  not_rated: { bg: colors.neutralTint, fg: colors.textMuted },
};

export function FitChip({ label, count }: { label: FitLabel; count?: number }) {
  const { bg, fg } = fitChipColors[label];
  const text = t(`fit.labels.${label}`);
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{count === undefined ? text : `${count} ${text}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.tag,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  text: typography.fitLabel,
});
