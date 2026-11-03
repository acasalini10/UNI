// AI-assisted (Claude Code): screen 1, email entry; a new email goes to 1b, an existing one to 1c. Apple, Google, Terms and Privacy are added in later branches.
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { authErrorMessage } from "@/components/authErrorMessage";
import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { TextField } from "@/components/TextField";
import { type AuthError, emailExists } from "@/data/auth";
import { t } from "@/i18n";
import { isValidEmail } from "@/lib/email";
import { colors, spacing, typography } from "@/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<AuthError | "invalidEmail" | null>(null);
  const [loading, setLoading] = useState(false);

  async function onContinue() {
    if (!isValidEmail(email)) {
      setError("invalidEmail");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await emailExists(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const pathname = result.exists ? "/password" : "/set-password";
    router.push({ pathname, params: { email: email.trim() } });
  }

  return (
    <AuthLayout
      footer={
        <Button
          label={t("auth.signIn.continueWithEmail")}
          onPress={onContinue}
          disabled={email.trim().length === 0}
          loading={loading}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.headline}>
          {t("auth.signIn.headlineStart")}
          <Text style={styles.highlight}>{t("auth.signIn.headlineHighlight")}</Text>
        </Text>
        <Text style={styles.subtitle}>{t("auth.signIn.subtitle")}</Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.form}>
        <TextField
          label={t("auth.signIn.emailLabel")}
          placeholder={t("auth.signIn.emailPlaceholder")}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError(null);
          }}
          invalid={error === "invalidEmail"}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={onContinue}
        />
        {error && (
          <FormError text={error === "invalidEmail" ? t("auth.signIn.invalidEmail") : authErrorMessage(error)} />
        )}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.lg,
  },
  headline: {
    ...typography.hero,
    color: colors.text,
  },
  highlight: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  spacer: {
    flex: 1,
  },
  form: {
    gap: spacing.sm,
  },
});
