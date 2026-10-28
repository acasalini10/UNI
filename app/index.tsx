// AI-assisted (Claude Code): first screen, only checks that the app runs in Expo Go; text through i18n
import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("app.name")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
});
