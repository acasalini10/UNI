// AI-assisted (Claude Code): labelled text input with error border and an optional show/hide toggle for passwords.
import { SymbolView } from "expo-symbols";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { t } from "@/i18n";
import { colors, layout, radius, sizes, spacing, typography } from "@/theme";

type Props = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  // Shown at the right of the label, e.g. "Forgot password?" on 1c.
  labelAccessory?: ReactNode;
  password?: boolean;
  invalid?: boolean;
};

export function TextField({ label, labelAccessory, password = false, invalid = false, ...input }: Props) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelAccessory}
      </View>
      <View style={[styles.field, invalid && styles.fieldInvalid]}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          secureTextEntry={password && hidden}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.accent}
          style={styles.input}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(hidden ? "common.showPassword" : "common.hidePassword")}
            onPress={() => setHidden((h) => !h)}
            hitSlop={spacing.sm}
            style={styles.toggle}
          >
            <SymbolView name={hidden ? "eye" : "eye.slash"} tintColor={colors.textMuted} size={sizes.icon} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  field: {
    height: sizes.input,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
  },
  fieldInvalid: {
    borderColor: colors.error,
    borderWidth: layout.borderWidthSelected,
  },
  input: {
    ...typography.input,
    flex: 1,
    height: "100%",
    color: colors.text,
    paddingRight: spacing.lg,
  },
  toggle: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
});
