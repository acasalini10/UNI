// AI-assisted (Claude Code): app mark (SF Symbol graduation cap) with the optional "UNI" word next to it.
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, sizes, spacing, typography } from "@/theme";

export function Logo({ withName = false }: { withName?: boolean }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel={t("app.name")}>
      <SymbolView name="graduationcap.fill" tintColor={colors.accent} size={sizes.logo} />
      {withName && <Text style={styles.name}>{t("app.name")}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  name: {
    ...typography.brand,
    color: colors.text,
  },
});
