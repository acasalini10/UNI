// AI-assisted (Claude Code): screen 1, email entry (new email → 1b, existing → 1c) and Sign in with Apple, Terms and Privacy links. Google is added in a later branch.
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { authErrorMessage } from "@/components/authErrorMessage";
import { Button } from "@/components/Button";
import { FormError } from "@/components/Message";
import { TextField } from "@/components/TextField";
import { type AuthError, emailExists, signInWithApple } from "@/data/auth";
import { t } from "@/i18n";
import { openLegalPage } from "@/legal";
import { isValidEmail } from "@/lib/email";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<AuthError | "invalidEmail" | null>(null);
  const [loading, setLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Hidden where Apple sign-in is not supported (e.g. web), so the button never does nothing.
  useEffect(() => {
    void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  async function onApple() {
    if (loading || appleLoading) return;
    setError(null);
    setAppleLoading(true);
    const result = await signInWithApple();
    setAppleLoading(false);
    // On success the session guard in app/_layout.tsx opens the tabs.
    if (!result.ok && result.error !== "cancelled") setError(result.error);
  }

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
        <>
          <Button
            label={t("auth.signIn.continueWithEmail")}
            onPress={onContinue}
            disabled={email.trim().length === 0 || appleLoading}
            loading={loading}
          />
          {appleAvailable && (
            <>
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.or}>{t("auth.signIn.or")}</Text>
                <View style={styles.line} />
              </View>
              {/* Apple's own button (required look, label translated by iOS); the wrapper adds the canvas border. */}
              <View style={[styles.appleWrap, appleLoading && styles.busy]}>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={radius.lg}
                  style={styles.apple}
                  onPress={onApple}
                />
              </View>
            </>
          )}
          <Text style={styles.legal}>
            {t("legal.agreeStart")}
            <Text accessibilityRole="link" style={styles.legalLink} onPress={() => void openLegalPage("terms")}>
              {t("legal.terms")}
            </Text>
            {t("legal.and")}
            <Text accessibilityRole="link" style={styles.legalLink} onPress={() => void openLegalPage("privacy")}>
              {t("legal.privacy")}
            </Text>
            {t("legal.agreeEnd")}
          </Text>
        </>
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: layout.borderWidth,
    backgroundColor: colors.border,
  },
  or: {
    ...typography.small,
    color: colors.textMuted,
  },
  appleWrap: {
    borderWidth: layout.borderWidth,
    borderColor: colors.appleBorder,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  apple: {
    height: sizes.button,
  },
  busy: {
    opacity: 0.6,
  },
  legal: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: "center",
  },
  legalLink: {
    color: colors.link,
    textDecorationLine: "underline",
  },
});
