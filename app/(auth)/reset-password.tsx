// AI-assisted (Claude Code): screen 1d, code from the reset email plus a new password; on success the user is signed in.
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { authErrorMessage } from "@/components/authErrorMessage";
import { Button } from "@/components/Button";
import { Banner, FormError } from "@/components/Message";
import { NewPasswordFields } from "@/components/NewPasswordFields";
import { TextField } from "@/components/TextField";
import { TextLink } from "@/components/TextLink";
import { type AuthError, resetPassword, sendResetCode } from "@/data/auth";
import { t } from "@/i18n";
import { isPasswordValid } from "@/lib/password";
import { colors, spacing, typography } from "@/theme";

export default function ResetPassword() {
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState<"save" | "resend" | null>(null);

  const canSave = code.trim().length > 0 && isPasswordValid(password) && confirm === password;

  // On success the session changes and the root layout leaves the auth screens.
  async function onSave() {
    setError(null);
    setLoading("save");
    const result = await resetPassword(email, code, password);
    if (!result.ok) {
      setLoading(null);
      setError(result.error);
    }
  }

  async function onResend() {
    setError(null);
    setLoading("resend");
    const result = await sendResetCode(email);
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCode("");
    setResent(true);
  }

  return (
    <AuthLayout
      showBack
      footer={
        <>
          {error && error !== "invalidCode" && <FormError text={authErrorMessage(error)} />}
          <Button
            label={t("auth.reset.save")}
            onPress={onSave}
            disabled={!canSave || loading === "resend"}
            loading={loading === "save"}
          />
        </>
      }
    >
      <View style={styles.intro}>
        <Text style={styles.title}>{t("auth.reset.title")}</Text>
        <Banner text={t(resent ? "auth.reset.resent" : "auth.reset.sent", { email })} />
      </View>
      <View style={styles.codeBlock}>
        <TextField
          label={t("auth.reset.codeLabel")}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            if (error === "invalidCode") setError(null);
          }}
          invalid={error === "invalidCode"}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={8}
        />
        {error === "invalidCode" && <FormError text={authErrorMessage(error)} />}
        <View style={styles.resend}>
          <TextLink label={t("auth.reset.resend")} onPress={onResend} disabled={loading !== null} />
        </View>
      </View>
      <NewPasswordFields
        label={t("auth.reset.newPasswordLabel")}
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
    gap: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  codeBlock: {
    gap: spacing.sm,
  },
  resend: {
    alignSelf: "flex-start",
  },
});
