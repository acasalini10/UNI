// AI-assisted (Copilot): added the title-only Feedback tab screen.
import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, typography } from "@/theme";

export default function Feedback() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("tabs.feedback")}</Text>
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
