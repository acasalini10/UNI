// AI-assisted (Claude Code): signed-in placeholder until Profile and Programs exist; text through i18n; dev-only sign-out to test the sign-in screens again
import { StyleSheet, Text, View } from "react-native";

import { TextLink } from "@/components/TextLink";
import { signOut } from "@/data/auth";
import { t } from "@/i18n";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("app.name")}</Text>
      {/* __DEV__ is false in EAS builds, so this never reaches TestFlight. */}
      {__DEV__ && <TextLink label={t("common.signOut")} onPress={() => void signOut()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
});
