// AI-assisted (Claude Code): screen 1c, password for an existing account; "Forgot password?" emails a reset code and opens 1d.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { authErrorMessage } from "@/components/authErrorMessage";
import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { TextField } from "@/components/TextField";
import { TextLink } from "@/components/TextLink";
import { type AuthError, sendResetCode, signIn } from "@/data/auth";
import { t } from "@/i18n";
import { colors, spacing, typography } from "@/theme";

export default function Password() {
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState<"signIn" | "reset" | null>(null);

  // On success the session changes and the root layout leaves the auth screens.
  async function onSignIn() {
    setError(null);
    setLoading("signIn");
    const result = await signIn(email, password);
    if (!result.ok) {
      setLoading(null);
      setError(result.error);
    }
  }

  async function onForgot() {
    setError(null);
    setLoading("reset");
    const result = await sendResetCode(email);
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push({ pathname: "/reset-password", params: { email } });
  }

  return (
    <AuthLayout
      showBack
      footer={
        <>
          <Button
            label={t("auth.existing.signIn")}
            onPress={onSignIn}
            disabled={password.length === 0 || loading === "reset"}
            loading={loading === "signIn"}
          />
          <Text style={styles.note}>{t("auth.existing.newHint")}</Text>
        </>
      }
    >
      <View style={styles.intro}>
        <Text style={styles.title}>{t("auth.existing.title")}</Text>
        <View style={styles.emailRow}>
          <Text style={styles.subtitle}>
            {t("auth.existing.signInAs")}
            <Text style={styles.email}>{email}</Text> ·{" "}
          </Text>
          <TextLink label={t("common.change")} onPress={() => router.back()} underline />
        </View>
      </View>
      <View style={styles.form}>
        <TextField
          label={t("auth.password.label")}
          labelAccessory={
            <TextLink label={t("auth.existing.forgot")} onPress={onForgot} disabled={loading !== null} />
          }
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (error) setError(null);
          }}
          password
          invalid={error === "wrongPassword"}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={() => password.length > 0 && onSignIn()}
        />
        {error && <FormError text={authErrorMessage(error)} />}
      </View>
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
  emailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  email: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  form: {
    gap: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
});
