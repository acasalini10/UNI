// AI-assisted (Copilot): added the title-only Programs tab screen.
import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, typography } from "@/theme";

export default function Programs() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("tabs.programs")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
});
