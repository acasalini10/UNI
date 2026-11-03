// AI-assisted (Claude Code): screen 1b, password for a new account; Continue stays disabled until the rules in src/lib/password.ts pass and both fields match.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { authErrorMessage } from "@/components/authErrorMessage";
import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { NewPasswordFields } from "@/components/NewPasswordFields";
import { TextLink } from "@/components/TextLink";
import { type AuthError, signUp } from "@/data/auth";
import { t } from "@/i18n";
import { isPasswordValid } from "@/lib/password";
import { colors, spacing, typography } from "@/theme";

export default function SetPassword() {
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = isPasswordValid(password) && confirm === password;

  // On success the session changes and the root layout leaves the auth screens.
  async function onContinue() {
    setError(null);
    setLoading(true);
    const result = await signUp(email, password);
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
    }
  }

  return (
    <AuthLayout
      showBack
      footer={
        <>
          {error && <FormError text={authErrorMessage(error)} />}
          <Button label={t("auth.setPassword.continue")} onPress={onContinue} disabled={!canContinue} loading={loading} />
          <Text style={styles.note}>{t("auth.setPassword.next")}</Text>
        </>
      }
    >
      <View style={styles.intro}>
        <Text style={styles.title}>{t("auth.setPassword.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.setPassword.subtitle")}</Text>
        <View style={styles.emailRow}>
          <Text style={styles.email}>{email} · </Text>
          <TextLink label={t("common.change")} onPress={() => router.back()} underline />
        </View>
      </View>
      <NewPasswordFields
        label={t("auth.password.label")}
        password={password}
        confirm={confirm}
        onChangePassword={setPassword}
        onChangeConfirm={setConfirm}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  emailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  email: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
});
