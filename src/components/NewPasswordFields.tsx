// AI-assisted (Claude Code): password + confirm fields with the live rule list, shared by 1b (new account) and 1d (reset). Rules come from src/lib/password.ts.
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { FormError } from "@/components/Message";
import { TextField } from "@/components/TextField";
import { t } from "@/i18n";
import { checkPassword } from "@/lib/password";
import { colors, radius, spacing, typography } from "@/theme";

type Props = {
  label: string;
  password: string;
  confirm: string;
  onChangePassword: (value: string) => void;
  onChangeConfirm: (value: string) => void;
};

export function NewPasswordFields({ label, password, confirm, onChangePassword, onChangeConfirm }: Props) {
  const checks = checkPassword(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <View style={styles.group}>
      <View style={styles.passwordBlock}>
        <TextField
          label={label}
          value={password}
          onChangeText={onChangePassword}
          password
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <View style={styles.rules}>
          <Rule met={checks.minLength} text={t("auth.password.ruleLength")} />
          <Rule met={checks.hasDigit} text={t("auth.password.ruleDigit")} />
          <Rule met={checks.hasUppercase} text={t("auth.password.ruleUppercase")} />
        </View>
      </View>
      <View style={styles.passwordBlock}>
        <TextField
          label={t("auth.password.confirmLabel")}
          value={confirm}
          onChangeText={onChangeConfirm}
          password
          invalid={mismatch}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />
        {mismatch && <FormError text={t("auth.password.mismatch")} />}
      </View>
    </View>
  );
}

function Rule({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.rule} accessibilityState={{ checked: met }}>
      <View style={[styles.dot, met && styles.dotMet]}>
        {met && <SymbolView name="checkmark" tintColor={colors.successText} size={12} weight="bold" />}
      </View>
      <Text style={[styles.ruleText, met && styles.ruleTextMet]}>{text}</Text>
    </View>
  );
}

const DOT = 20;

const styles = StyleSheet.create({
  group: {
    gap: spacing.xl,
  },
  passwordBlock: {
    gap: spacing.md,
  },
  rules: {
    gap: spacing.sm,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.control,
    alignItems: "center",
    justifyContent: "center",
  },
  dotMet: {
    borderWidth: 0,
    backgroundColor: colors.successTint,
  },
  ruleText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  ruleTextMet: {
    ...typography.label,
    color: colors.successText,
  },
});
