// AI-assisted (Copilot): added the title-only Profile tab and moved the dev sign-out control here.
import { StyleSheet, Text, View } from "react-native";

import { TextLink } from "@/components/TextLink";
import { signOut } from "@/data/auth";
import { t } from "@/i18n";
import { colors, spacing, typography } from "@/theme";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("tabs.profile")}</Text>
      {__DEV__ && <TextLink label={t("common.signOut")} onPress={() => void signOut()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
});
